import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';

import {
	deleteEntriesForGoal,
	deleteEntryFor,
	deleteGoalRow,
	getMeta,
	initDb,
	insertGoal,
	selectEntries,
	selectGoals,
	setMeta,
	updateGoalRow,
	upsertEntry,
} from '@/core/db';
import { todayKey } from '@/core/domain/period';
import { Entry, Goal, NewGoal } from '@/core/domain/types';
import { seedDevData } from '@/core/db/seed';
import {
	configureNotifications,
	getNotificationPermission,
	NotificationPermission,
	requestNotificationPermission,
	rescheduleAllReminders,
} from '@/core/lib/notifications';

/** DEV: seed sample data on first launch. Set to false before release builds. */
const SEED_DEV = false;

interface AppState {
	ready: boolean;
	goals: Goal[];
	entries: Entry[];
	userName: string;
	notifPermission: NotificationPermission;

	init: () => void;
	reload: () => void;
	setUserName: (name: string) => void;
	refreshNotifPermission: () => void;
	requestNotifPermission: () => void;

	addGoal: (input: NewGoal) => Goal;
	editGoal: (id: string, input: NewGoal, clearEntries?: boolean) => void;
	removeGoal: (id: string) => void;

	/** Set a numeric value for a day (null clears the entry). */
	setValue: (goalId: string, date: string, value: number | null) => void;
	/** Toggle a checkbox goal done/undone for a day. */
	toggleDone: (goalId: string, date: string) => void;
	/** Mark a day as skipped (N/A). */
	skipDay: (goalId: string, date: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
	ready: false,
	goals: [],
	entries: [],
	userName: 'Hardik',
	notifPermission: 'undetermined',

	init: () => {
		initDb();
		if (SEED_DEV) seedDevData();
		const goals = selectGoals();
		set({
			goals,
			entries: selectEntries(),
			userName: getMeta('userName') ?? 'Hardik',
			ready: true,
		});
		// Notifications: configure, request once on launch, sync schedule.
		(async () => {
			await configureNotifications();
			let status = await getNotificationPermission();
			if (status === 'undetermined') {
				status = await requestNotificationPermission();
			}
			set({ notifPermission: status });
			await rescheduleAllReminders(get().goals);
		})();
	},

	reload: () => set({ goals: selectGoals(), entries: selectEntries() }),

	setUserName: (name) => {
		const clean = name.trim() || 'Hardik';
		setMeta('userName', clean);
		set({ userName: clean });
	},

	refreshNotifPermission: () => {
		(async () => {
			const status = await getNotificationPermission();
			set({ notifPermission: status });
			if (status === 'granted') await rescheduleAllReminders(get().goals);
		})();
	},

	requestNotifPermission: () => {
		(async () => {
			const status = await requestNotificationPermission();
			set({ notifPermission: status });
			if (status === 'granted') await rescheduleAllReminders(get().goals);
		})();
	},

	addGoal: (input) => {
		const goal: Goal = {
			...input,
			id: randomUUID(),
			sortOrder: get().goals.length,
			archived: false,
			createdAt: new Date().toISOString(),
		};
		insertGoal(goal);
		set({ goals: selectGoals() });
		void rescheduleAllReminders(get().goals);
		return goal;
	},

	editGoal: (id, input, clearEntries) => {
		const existing = get().goals.find((g) => g.id === id);
		if (!existing) return;
		updateGoalRow({ ...existing, ...input });
		if (clearEntries) deleteEntriesForGoal(id);
		set({ goals: selectGoals(), entries: selectEntries() });
		void rescheduleAllReminders(get().goals);
	},

	removeGoal: (id) => {
		deleteGoalRow(id);
		set({ goals: selectGoals(), entries: selectEntries() });
		void rescheduleAllReminders(get().goals);
	},

	setValue: (goalId, date, value) => {
		if (value === null || value <= 0) {
			deleteEntryFor(goalId, date);
		} else {
			upsertEntry({
				id: randomUUID(),
				goalId,
				date,
				value,
				state: 'logged',
				loggedAt: new Date().toISOString(),
			});
		}
		set({ entries: selectEntries() });
	},

	toggleDone: (goalId, date) => {
		const current = get().entries.find(
			(e) => e.goalId === goalId && e.date === date,
		);
		if (current && current.state === 'logged' && current.value >= 1) {
			deleteEntryFor(goalId, date);
		} else {
			upsertEntry({
				id: current?.id ?? randomUUID(),
				goalId,
				date,
				value: 1,
				state: 'logged',
				loggedAt: new Date().toISOString(),
			});
		}
		set({ entries: selectEntries() });
	},

	skipDay: (goalId, date) => {
		upsertEntry({
			id: randomUUID(),
			goalId,
			date,
			value: 0,
			state: 'skip',
			loggedAt: new Date().toISOString(),
		});
		set({ entries: selectEntries() });
	},
}));

// ── Selectors / helpers ─────────────────────────────────────────────────────

export function entriesForGoal(entries: Entry[], goalId: string): Entry[] {
	return entries.filter((e) => e.goalId === goalId);
}

export function entryFor(
	entries: Entry[],
	goalId: string,
	date: string = todayKey(),
): Entry | undefined {
	return entries.find((e) => e.goalId === goalId && e.date === date);
}
