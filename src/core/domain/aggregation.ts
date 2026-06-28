import { Aggregation, Comparator, Entry, Goal } from './types';
import {
	PeriodRange,
	elapsedDays,
	fromDateKey,
	periodLengthDays,
	periodRange,
	startOfDay,
} from './period';

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Reduce a list of values to a single number per the aggregation function. */
export function aggregate(values: number[], agg: Aggregation): number {
	if (values.length === 0) return 0;
	switch (agg) {
		case 'sum':
			return values.reduce((a, b) => a + b, 0);
		case 'mean':
			return values.reduce((a, b) => a + b, 0) / values.length;
		case 'count':
			return values.length;
		case 'min':
			return Math.min(...values);
		case 'max':
			return Math.max(...values);
		case 'median': {
			const s = [...values].sort((a, b) => a - b);
			const mid = Math.floor(s.length / 2);
			return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
		}
		case 'mode': {
			const counts = new Map<number, number>();
			let best = values[0];
			let bestN = 0;
			for (const v of values) {
				const n = (counts.get(v) ?? 0) + 1;
				counts.set(v, n);
				if (n > bestN || (n === bestN && v < best)) {
					best = v;
					bestN = n;
				}
			}
			return best;
		}
	}
}

function compare(actual: number, target: number, cmp: Comparator): boolean {
	return cmp === 'at_least' ? actual >= target : actual <= target;
}

/** Logged (non-skip) entries whose date falls within the range. */
export function entriesInRange(entries: Entry[], range: PeriodRange): Entry[] {
	return entries.filter((e) => {
		if (e.state === 'skip') return false;
		const d = fromDateKey(e.date);
		return d >= range.start && d <= range.end;
	});
}

export interface PeriodResult {
	actual: number;
	target: number;
	met: boolean;
	/** Normalized completion in [0,1]. */
	pct: number;
	sampleCount: number;
}

/**
 * Evaluate one period for a numeric goal: aggregate logged values, compare to
 * target, and normalize to a completion percentage.
 *
 * For `mean`, the denominator is the elapsed days in the period (a missing day
 * counts as 0) so averages reflect the whole window, not just logged days.
 */
export function evaluatePeriod(
	goal: Goal,
	entries: Entry[],
	range: PeriodRange,
	today: Date,
): PeriodResult {
	const inRange = entriesInRange(entries, range);
	const target = goal.targetValue ?? 0;

	if (goal.type === 'checkbox') {
		// Count of done days vs target occurrences (target defaults to period length-agnostic 1).
		const done = inRange.filter((e) => e.value >= 1).length;
		const t = target || 1;
		const met = done >= t;
		return {
			actual: done,
			target: t,
			met,
			pct: clamp01(done / t),
			sampleCount: inRange.length,
		};
	}

	const values = inRange.map((e) => e.value);
	let actual: number;
	if (goal.aggregation === 'mean') {
		const denom = Math.max(1, elapsedDays(range, today));
		actual = values.reduce((a, b) => a + b, 0) / denom;
	} else {
		actual = aggregate(values, goal.aggregation);
	}

	const met = target > 0 ? compare(actual, target, goal.comparator) : false;
	let pct: number;
	if (target <= 0) {
		pct = values.length > 0 ? 1 : 0;
	} else if (goal.comparator === 'at_least') {
		pct = clamp01(actual / target);
	} else {
		// at_most: full credit at/under target, decaying as it's exceeded.
		pct = actual <= target ? 1 : clamp01(2 - actual / target);
	}

	return { actual, target, met, pct, sampleCount: values.length };
}

/** Per-day target used for the day-level shading in the heatmap / today ratio. */
export function dailyTarget(goal: Goal): number {
	const target = goal.targetValue ?? 0;
	if (goal.type === 'checkbox') return 1;
	if (target <= 0) return 0;
	if (goal.period === 'daily') return target;
	// sum spreads across the period; average/min/max/median are per-day comparable.
	if (goal.aggregation === 'sum' || goal.aggregation === 'count') {
		const len = periodLengthDays(periodRange(goal.period, new Date()));
		return target / len;
	}
	return target;
}

/**
 * Single-day completion in [0,1] for a goal — used by the Today ratio and the
 * cross-goal calendar heatmap. Independent of period rollups.
 */
export function dayCompletion(goal: Goal, entry: Entry | undefined): number {
	if (!entry || entry.state === 'skip') return 0;
	if (goal.type === 'checkbox') return entry.value >= 1 ? 1 : 0;
	const dt = dailyTarget(goal);
	if (dt <= 0) return entry.value > 0 ? 1 : 0;
	if (goal.comparator === 'at_least') return clamp01(entry.value / dt);
	return entry.value <= dt ? 1 : clamp01(2 - entry.value / dt);
}

export function isDayComplete(goal: Goal, entry: Entry | undefined): boolean {
	return dayCompletion(goal, entry) >= 1;
}

/** Whether the goal existed on the given day. */
export function isGoalActiveOn(goal: Goal, date: Date): boolean {
	return (
		!goal.archived &&
		startOfDay(fromDateKey(goal.createdAt.slice(0, 10))) <= startOfDay(date)
	);
}

export interface Streaks {
	current: number;
	best: number;
}

/**
 * Streaks measured in *met periods*. The in-progress current period extends the
 * streak only if it is already met (so it is never counted as a failure yet).
 */
export function calculateStreaks(
	goal: Goal,
	entries: Entry[],
	today: Date,
): Streaks {
	const created = fromDateKey(goal.createdAt.slice(0, 10));
	const currentRange = periodRange(goal.period, today);

	// Walk back period by period collecting met/not for completed periods.
	const completedMet: boolean[] = []; // most-recent first
	let cursor = new Date(currentRange.start);
	cursor.setDate(cursor.getDate() - 1); // step into previous period
	let guard = 0;
	while (cursor >= created && guard < 2000) {
		const r = periodRange(goal.period, cursor);
		completedMet.push(evaluatePeriod(goal, entries, r, today).met);
		cursor = new Date(r.start);
		cursor.setDate(cursor.getDate() - 1);
		guard++;
	}

	let current = 0;
	for (const met of completedMet) {
		if (met) current++;
		else break;
	}
	// Extend with the in-progress period if already met.
	if (evaluatePeriod(goal, entries, currentRange, today).met) current++;

	let best = 0;
	let run = 0;
	const all = [
		...completedMet.slice().reverse(),
		evaluatePeriod(goal, entries, currentRange, today).met,
	];
	for (const met of all) {
		if (met) {
			run++;
			best = Math.max(best, run);
		} else {
			run = 0;
		}
	}

	return { current, best };
}
