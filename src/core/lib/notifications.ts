import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { Goal } from '@/core/domain/types';

export type NotificationPermission = 'granted' | 'denied' | 'undetermined';

// Foreground presentation: show a quiet banner, no sound/badge.
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
});

/** Android requires a channel before notifications can be shown. */
export async function configureNotifications(): Promise<void> {
	if (Platform.OS === 'android') {
		await Notifications.setNotificationChannelAsync('reminders', {
			name: 'Reminders',
			importance: Notifications.AndroidImportance.DEFAULT,
		});
	}
}

export async function getNotificationPermission(): Promise<NotificationPermission> {
	const { status } = await Notifications.getPermissionsAsync();
	return status as NotificationPermission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
	const { status } = await Notifications.requestPermissionsAsync();
	return status as NotificationPermission;
}

/**
 * Cancel and re-schedule every goal's daily reminders. Called whenever goals or
 * reminders change. No-op (after clearing) if permission isn't granted.
 */
export async function rescheduleAllReminders(goals: Goal[]): Promise<void> {
	try {
		await Notifications.cancelAllScheduledNotificationsAsync();
		if ((await getNotificationPermission()) !== 'granted') return;

		for (const goal of goals) {
			if (goal.archived || goal.reminders.length === 0) continue;
			for (const r of goal.reminders) {
				await Notifications.scheduleNotificationAsync({
					content: {
						title: goal.name,
						body:
							goal.type === 'checkbox'
								? `Time to check off ${goal.name}`
								: `Time to log your ${goal.name}`,
						data: { goalId: goal.id },
					},
					trigger: {
						type: Notifications.SchedulableTriggerInputTypes.DAILY,
						hour: r.hour,
						minute: r.minute,
					},
				});
			}
		}
	} catch {
		// Scheduling failures (e.g. permission revoked mid-session) are non-fatal.
	}
}
