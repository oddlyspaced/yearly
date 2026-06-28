import { Linking, Pressable, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore } from '@/core/store/useStore';
import { colors, spacing } from '@/core/theme';
import { Text } from '@/core/ui/Text';

/**
 * Persistent top strip shown whenever notification permission isn't granted.
 * Tapping requests permission, or opens Settings if already denied.
 */
export function NotificationBanner() {
	const status = useStore((s) => s.notifPermission);
	const request = useStore((s) => s.requestNotifPermission);
	const insets = useSafeAreaInsets();

	if (status === 'granted') return null;

	const onPress = () => {
		if (status === 'denied') Linking.openSettings();
		else request();
	};

	return (
		// Light padding above keeps the status bar readable; ink strip below it.
		<View style={{ backgroundColor: colors.bg, paddingTop: insets.top }}>
			<Animated.View entering={FadeInUp.duration(260)}>
				<Pressable
					onPress={onPress}
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						gap: spacing.sm,
						backgroundColor: colors.ink,
						paddingHorizontal: spacing.lg,
						paddingVertical: spacing.md,
					}}
				>
					<Feather
						name='bell-off'
						size={16}
						color={colors.onAccent}
					/>
					<Text
						variant='small'
						weight='medium'
						color={colors.onAccent}
						style={{ flex: 1 }}
					>
						Notifications are off — tap to enable reminders
					</Text>
					<Feather
						name='chevron-right'
						size={16}
						color={colors.onAccent}
					/>
				</Pressable>
			</Animated.View>
		</View>
	);
}
