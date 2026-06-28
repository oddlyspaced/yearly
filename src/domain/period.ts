import {
	differenceInCalendarDays,
	endOfMonth,
	endOfWeek,
	endOfYear,
	format,
	parseISO,
	startOfMonth,
	startOfWeek,
	startOfYear,
} from 'date-fns';

import { Period } from './types';

/** Week starts on Monday throughout the app. */
const WEEK_OPTS = { weekStartsOn: 1 as const };

/** Format a Date as a local civil date string (YYYY-MM-DD). */
export function toDateKey(date: Date): string {
	return format(date, 'yyyy-MM-dd');
}

/** Today's local date key. */
export function todayKey(): string {
	return toDateKey(new Date());
}

/** Parse a YYYY-MM-DD key into a local Date (midnight). */
export function fromDateKey(key: string): Date {
	return parseISO(key);
}

export interface PeriodRange {
	start: Date;
	end: Date;
	/** Stable identifier for the period bucket. */
	key: string;
}

/** Calendar-aligned range containing `date` for the given period. */
export function periodRange(period: Period, date: Date): PeriodRange {
	switch (period) {
		case 'daily': {
			const start = startOfDay(date);
			return { start, end: endOfDay(date), key: `d:${toDateKey(start)}` };
		}
		case 'weekly': {
			const start = startOfWeek(date, WEEK_OPTS);
			return {
				start,
				end: endOfWeek(date, WEEK_OPTS),
				key: `w:${toDateKey(start)}`,
			};
		}
		case 'monthly': {
			const start = startOfMonth(date);
			return {
				start,
				end: endOfMonth(date),
				key: `m:${toDateKey(start)}`,
			};
		}
		case 'quarterly': {
			const q = Math.floor(date.getMonth() / 3);
			const start = new Date(date.getFullYear(), q * 3, 1);
			const end = endOfMonth(new Date(date.getFullYear(), q * 3 + 2, 1));
			return { start, end, key: `q:${date.getFullYear()}-${q}` };
		}
		case 'semiannual': {
			const h = date.getMonth() < 6 ? 0 : 1;
			const start = new Date(date.getFullYear(), h * 6, 1);
			const end = endOfMonth(new Date(date.getFullYear(), h * 6 + 5, 1));
			return { start, end, key: `s:${date.getFullYear()}-${h}` };
		}
		case 'yearly': {
			return {
				start: startOfYear(date),
				end: endOfYear(date),
				key: `y:${date.getFullYear()}`,
			};
		}
	}
}

export function startOfDay(date: Date): Date {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

export function endOfDay(date: Date): Date {
	const d = new Date(date);
	d.setHours(23, 59, 59, 999);
	return d;
}

/** Total number of days in a period range (inclusive). */
export function periodLengthDays(range: PeriodRange): number {
	return differenceInCalendarDays(range.end, range.start) + 1;
}

/**
 * Days that have actually elapsed within the period, bounded by `today`.
 * Used as the denominator for average/mean targets so a missing day counts as 0.
 */
export function elapsedDays(range: PeriodRange, today: Date): number {
	const cap = today < range.end ? today : range.end;
	if (cap < range.start) return 0;
	return differenceInCalendarDays(cap, range.start) + 1;
}
