import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';

import {
	deleteEntriesForGoal,
	deleteEntryFor,
	deleteGoalRow,
	initDb,
	insertGoal,
	selectEntries,
	selectGoals,
	updateGoalRow,
	upsertEntry,
} from '@/db';
import { todayKey } from '@/domain/period';
import { Entry, Goal, NewGoal } from '@/domain/types';
import { seedDevData } from '@/db/seed';

/** DEV: seed sample data on first launch. Set to false before release builds. */
const SEED_DEV = false;

interface AppState {
	ready: boolean;
	goals: Goal[];
	entries: Entry[];

	init: () => void;
	reload: () => void;

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

	init: () => {
		initDb();
		if (SEED_DEV) seedDevData();
		set({ goals: selectGoals(), entries: selectEntries(), ready: true });
	},

	reload: () => set({ goals: selectGoals(), entries: selectEntries() }),

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
		return goal;
	},

	editGoal: (id, input, clearEntries) => {
		const existing = get().goals.find((g) => g.id === id);
		if (!existing) return;
		updateGoalRow({ ...existing, ...input });
		if (clearEntries) deleteEntriesForGoal(id);
		set({ goals: selectGoals(), entries: selectEntries() });
	},

	removeGoal: (id) => {
		deleteGoalRow(id);
		set({ goals: selectGoals(), entries: selectEntries() });
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
