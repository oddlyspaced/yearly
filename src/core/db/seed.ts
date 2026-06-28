import { randomUUID } from 'expo-crypto';
import { subDays } from 'date-fns';

import { insertGoal, selectGoals, upsertEntry } from '@/core/db';
import { toDateKey } from '@/core/domain/period';
import { Goal } from '@/core/domain/types';

/**
 * DEV ONLY — seeds sample goals + ~10 weeks of backdated entries so populated
 * screens can be reviewed. Gated by SEED_DEV in the store; flip off for release.
 */
export function seedDevData(): void {
	if (selectGoals().length > 0) return;

	const now = new Date();
	const make = (
		g: Omit<Goal, 'id' | 'sortOrder' | 'archived' | 'createdAt'>,
		i: number,
	): Goal => ({
		...g,
		id: randomUUID(),
		sortOrder: i,
		archived: false,
		createdAt: subDays(now, 80).toISOString(),
	});

	const goals: Goal[] = [
		make(
			{
				name: 'Walk',
				type: 'numeric',
				unit: 'steps',
				period: 'weekly',
				aggregation: 'mean',
				comparator: 'at_least',
				targetValue: 10000,
				icon: 'navigation',
				color: '#0A0A0A',
			},
			0,
		),
		make(
			{
				name: 'Magnesium',
				type: 'checkbox',
				unit: null,
				period: 'daily',
				aggregation: 'count',
				comparator: 'at_least',
				targetValue: 1,
				icon: 'check-circle',
				color: '#0A0A0A',
			},
			1,
		),
		make(
			{
				name: 'Read',
				type: 'numeric',
				unit: 'pages',
				period: 'daily',
				aggregation: 'sum',
				comparator: 'at_least',
				targetValue: 20,
				icon: 'book-open',
				color: '#0A0A0A',
			},
			2,
		),
		make(
			{
				name: 'Water',
				type: 'numeric',
				unit: 'glasses',
				period: 'daily',
				aggregation: 'sum',
				comparator: 'at_least',
				targetValue: 8,
				icon: 'droplet',
				color: '#0A0A0A',
			},
			3,
		),
		make(
			{
				name: 'Workout',
				type: 'checkbox',
				unit: null,
				period: 'weekly',
				aggregation: 'count',
				comparator: 'at_least',
				targetValue: 4,
				icon: 'activity',
				color: '#0A0A0A',
			},
			4,
		),
	];

	for (const g of goals) insertGoal(g);

	// Backfill ~75 days of plausible entries.
	for (let d = 75; d >= 0; d--) {
		const date = toDateKey(subDays(now, d));
		const put = (goalId: string, value: number) =>
			upsertEntry({
				id: randomUUID(),
				goalId,
				date,
				value,
				state: 'logged',
				loggedAt: new Date().toISOString(),
			});

		// Walk: 6k–13k steps most days
		if (Math.random() > 0.1)
			put(goals[0].id, 6000 + Math.round(Math.random() * 7000));
		// Magnesium: ~80% adherence
		if (Math.random() > 0.2) put(goals[1].id, 1);
		// Read: 0–35 pages, sometimes skipped
		if (Math.random() > 0.25)
			put(goals[2].id, Math.round(Math.random() * 35));
		// Water: 4–9 glasses
		if (Math.random() > 0.1)
			put(goals[3].id, 4 + Math.round(Math.random() * 5));
		// Workout: ~half the days
		if (Math.random() > 0.5) put(goals[4].id, 1);
	}
}
