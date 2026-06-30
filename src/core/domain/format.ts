import { AGGREGATION_LABELS, Goal, PERIOD_SUFFIX } from './types';

/** Compact number formatting: 10500 → "10.5K", 8000 → "8K", 30 → "30". */
export function formatValue(n: number): string {
	if (!isFinite(n)) return '0';
	const abs = Math.abs(n);
	if (abs >= 1000) {
		const k = n / 1000;
		const s = k.toFixed(k % 1 === 0 ? 0 : 1);
		return `${s.replace(/\.0$/, '')}K`;
	}
	return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** A precise (non-compact) display, e.g. for the large logger number. */
export function formatPrecise(n: number): string {
	if (Number.isInteger(n)) return n.toLocaleString('en-US');
	return n.toFixed(1);
}

/** Comma-grouped value (10500 → "10,500", 9.5 → "9.5") for inline labels. */
export function formatCount(n: number): string {
	if (!isFinite(n)) return '0';
	return n.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

/** "of 10K steps / week · avg" style descriptor for a goal's target. */
export function formatTargetLine(goal: Goal): string {
	if (goal.type === 'checkbox') {
		const t = goal.targetValue ?? 1;
		return goal.period === 'daily'
			? 'every day'
			: `${t}× / ${PERIOD_SUFFIX[goal.period]}`;
	}
	if (!goal.targetValue) return goal.unit ?? '';
	const aggNote =
		goal.aggregation === 'mean'
			? ' avg'
			: goal.aggregation === 'sum'
				? ''
				: ` ${AGGREGATION_LABELS[goal.aggregation].toLowerCase()}`;
	const unit = goal.unit ? `${goal.unit} ` : '';
	return `${formatCount(goal.targetValue)} ${unit}/ ${PERIOD_SUFFIX[goal.period]}${aggNote}`.trim();
}

/** Sensible inline increment for a numeric goal — capped at 100. */
export function quickStep(goal: Goal): number {
	const t = goal.targetValue ?? 0;
	if (t <= 20) return 1;
	if (t <= 200) return 10;
	return 100;
}

export function greeting(d: Date = new Date()): string {
	const h = d.getHours();
	if (h < 12) return 'Good morning';
	if (h < 18) return 'Good afternoon';
	return 'Good evening';
}
