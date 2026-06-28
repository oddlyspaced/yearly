import { View } from 'react-native';

import { Card, ProgressRing, Text } from '@/components/ui';
import { calculateStreaks, evaluatePeriod } from '@/domain/aggregation';
import { formatValue } from '@/domain/format';
import { periodRange } from '@/domain/period';
import { Entry, Goal, PERIOD_SUFFIX } from '@/domain/types';
import { colors, spacing } from '@/theme';

interface DetailStatsProps {
	goal: Goal;
	entries: Entry[];
}

function StatTile({ value, label }: { value: number; label: string }) {
	return (
		<Card style={{ flex: 1, paddingVertical: spacing.base }}>
			<Text weight='bold' style={{ fontSize: 40, lineHeight: 44 }}>
				{value}
			</Text>
			<Text variant='small' muted style={{ marginTop: 2 }}>
				{label}
			</Text>
		</Card>
	);
}

export function DetailStats({ goal, entries }: DetailStatsProps) {
	const today = new Date();
	const streaks = calculateStreaks(goal, entries, today);
	const range = periodRange(goal.period, today);
	const result = evaluatePeriod(goal, entries, range, today);
	const unit = PERIOD_SUFFIX[goal.period];
	const periodPhrase =
		goal.period === 'daily'
			? 'Today'
			: goal.period === 'semiannual'
				? 'This half-year'
				: `This ${PERIOD_SUFFIX[goal.period]}`;

	const actualLabel =
		goal.type === 'checkbox'
			? `${result.actual} of ${result.target}`
			: `${formatValue(result.actual)}${
					result.target > 0 ? ` / ${formatValue(result.target)}` : ''
				}${goal.unit ? ` ${goal.unit}` : ''}`;

	return (
		<View style={{ gap: spacing.md }}>
			<View style={{ flexDirection: 'row', gap: spacing.md }}>
				<StatTile value={streaks.current} label={`${unit} streak`} />
				<StatTile value={streaks.best} label='best streak' />
			</View>

			<Card
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					gap: spacing.base,
					paddingVertical: spacing.base,
				}}
			>
				<ProgressRing
					progress={result.pct}
					size={56}
					stroke={4}
					fillWhenComplete
				>
					{result.met ? null : (
						<Text variant='caption' weight='semibold'>
							{Math.round(result.pct * 100)}%
						</Text>
					)}
				</ProgressRing>
				<View style={{ flex: 1 }}>
					<Text
						variant='caption'
						muted
						style={{ textTransform: 'uppercase' }}
					>
						{periodPhrase}
					</Text>
					<Text
						variant='label'
						weight='semibold'
						style={{ marginTop: 2 }}
					>
						{actualLabel}
					</Text>
				</View>
				{result.met ? (
					<View
						style={{
							paddingHorizontal: spacing.md,
							paddingVertical: spacing.xs,
							borderRadius: 999,
							backgroundColor: colors.ink,
						}}
					>
						<Text
							variant='caption'
							weight='semibold'
							color={colors.onAccent}
						>
							MET
						</Text>
					</View>
				) : null}
			</Card>
		</View>
	);
}
