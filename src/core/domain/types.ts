/** Core domain types for Kaizen. Only Goal + Entry are persisted as truth; all
 * progress (completion, streaks, rollups) is derived from them. */

export type GoalType = 'checkbox' | 'numeric';

export type Period =
	'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'yearly';

/** How the entries within a period are reduced to a single number. */
export type Aggregation =
	'sum' | 'mean' | 'median' | 'mode' | 'min' | 'max' | 'count';

/** How the aggregated value is judged against the target. */
export type Comparator = 'at_least' | 'at_most';

export type EntryState = 'logged' | 'skip';

/** A daily reminder time for a goal (local time, 24h). */
export interface Reminder {
	hour: number;
	minute: number;
}

export interface Goal {
	id: string;
	name: string;
	type: GoalType;
	/** Unit label for numeric goals (e.g. "steps", "ml"). null for checkbox. */
	unit: string | null;
	period: Period;
	/** Numeric goals only; checkbox goals always aggregate as a count of done days. */
	aggregation: Aggregation;
	comparator: Comparator;
	/** Target the aggregate is compared against. */
	targetValue: number | null;
	/** Feather icon name. */
	icon: string;
	/** Accent color (kept near-monochrome by the picker palette). */
	color: string;
	/** Daily reminder times. */
	reminders: Reminder[];
	sortOrder: number;
	archived: boolean;
	/** ISO timestamp. */
	createdAt: string;
}

export interface Entry {
	id: string;
	goalId: string;
	/** Local civil date, YYYY-MM-DD. */
	date: string;
	/** Numeric: the measured value. Checkbox: 1 (done) / 0 (not). */
	value: number;
	state: EntryState;
	/** ISO timestamp of when it was logged. */
	loggedAt: string;
}

export type NewGoal = Omit<Goal, 'id' | 'sortOrder' | 'archived' | 'createdAt'>;

// ── Display metadata ────────────────────────────────────────────────────────

export const PERIOD_LABELS: Record<Period, string> = {
	daily: 'Daily',
	weekly: 'Weekly',
	monthly: 'Monthly',
	quarterly: 'Quarterly',
	semiannual: '6 months',
	yearly: 'Yearly',
};

/** Short suffix used in progress labels, e.g. "/ day". */
export const PERIOD_SUFFIX: Record<Period, string> = {
	daily: 'day',
	weekly: 'week',
	monthly: 'month',
	quarterly: 'quarter',
	semiannual: '6mo',
	yearly: 'year',
};

export const AGGREGATION_LABELS: Record<Aggregation, string> = {
	sum: 'Total',
	mean: 'Average',
	median: 'Median',
	mode: 'Most common',
	min: 'Minimum',
	max: 'Maximum',
	count: 'Count',
};

export const COMPARATOR_LABELS: Record<Comparator, string> = {
	at_least: 'At least',
	at_most: 'At most',
};

export const PERIODS: Period[] = [
	'daily',
	'weekly',
	'monthly',
	'quarterly',
	'semiannual',
	'yearly',
];

export const NUMERIC_AGGREGATIONS: Aggregation[] = [
	'sum',
	'mean',
	'median',
	'mode',
	'min',
	'max',
];

/** Accent palette for goal icons — graphite plus a range of muted tones. */
export const GOAL_COLORS: string[] = [
	'#0A0A0A',
	'#475569',
	'#0F766E',
	'#1E6091',
	'#4338CA',
	'#7C3AED',
	'#BE185D',
	'#B91C1C',
	'#C2410C',
	'#B45309',
	'#15803D',
	'#0E7490',
];

/** Icon names. Most are Feather; a few (e.g. 'pill') resolve to other sets via Glyph. */
export const GOAL_ICONS: string[] = [
	'check-circle',
	'pill',
	'activity',
	'heart',
	'droplet',
	'book-open',
	'coffee',
	'sun',
	'moon',
	'zap',
	'feather',
	'dollar-sign',
	'trending-up',
	'edit-3',
	'navigation',
	'smile',
	'target',
	'dumbbell',
];
