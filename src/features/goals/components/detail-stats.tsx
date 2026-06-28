import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

import { Card, Pill, StatTile, Text } from '@/core/ui';
import { calculateStreaks, evaluatePeriod } from '@/core/domain/aggregation';
import { formatPrecise } from '@/core/domain/format';
import { periodRange } from '@/core/domain/period';
import { Entry, Goal, PERIOD_SUFFIX, Period } from '@/core/domain/types';
import { colors, radii, spacing } from '@/core/theme';

/** Horizontal progress bar whose fill width animates on mount and on change. */
function ProgressBar({ pct }: { pct: number }) {
	const [trackW, setTrackW] = useState(0);
	const p = useSharedValue(0);

	useEffect(() => {
		p.value = withTiming(Math.max(0, Math.min(1, pct)), {
			duration: 600,
			easing: Easing.out(Easing.cubic),
		});
	}, [pct, p]);

	const fillStyle = useAnimatedStyle(() => ({ width: trackW * p.value }));

	return (
		<View
			onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
			style={{
				height: 8,
				borderRadius: radii.pill,
				backgroundColor: colors.surfaceStrong,
				overflow: 'hidden',
			}}
		>
			<Animated.View
				style={[
					{
						height: 8,
						borderRadius: radii.pill,
						backgroundColor: colors.ink,
					},
					fillStyle,
				]}
			/>
		</View>
	);
}

interface DetailStatsProps {
	goal: Goal;
	entries: Entry[];
}

const PERIOD_PHRASE: Record<Period, string> = {
	daily: 'Today',
	weekly: 'This week',
	monthly: 'This month',
	quarterly: 'This quarter',
	semiannual: 'This half-year',
	yearly: 'This year',
};

export function DetailStats({ goal, entries }: DetailStatsProps) {
	const today = new Date();
	const streaks = calculateStreaks(goal, entries, today);
	const range = periodRange(goal.period, today);
	const result = evaluatePeriod(goal, entries, range, today);

	const actualLabel =
		goal.type === 'checkbox'
			? `${result.actual} of ${result.target}`
			: `${formatPrecise(result.actual)}${
					result.target > 0
						? ` / ${formatPrecise(result.target)}`
						: ''
				}${goal.unit ? ` ${goal.unit}` : ''}`;

	return (
		<View style={{ gap: spacing.base }}>
			<View style={{ flexDirection: 'row', gap: spacing.base }}>
				<StatTile
					icon='zap'
					value={String(streaks.current)}
					label={`${PERIOD_SUFFIX[goal.period]} streak`}
				/>
				<StatTile
					icon='award'
					value={String(streaks.best)}
					label='best streak'
				/>
			</View>

			<Card style={{ gap: spacing.md }}>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<Text variant='caption' muted>
						{PERIOD_PHRASE[goal.period]}
					</Text>
					{result.met ? (
						<Pill label='Met' tone='solid' icon='check' />
					) : (
						<Text variant='caption' muted>
							{Math.round(result.pct * 100)}%
						</Text>
					)}
				</View>

				<Text variant='heading' weight='bold'>
					{actualLabel}
				</Text>

				{/* Progress bar */}
				<ProgressBar pct={result.pct} />
			</Card>
		</View>
	);
}
