import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
	Easing,
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';

import { Card, IconBadge, ProgressRing, Text } from '@/core/ui';
import {
	dayCompletion,
	isDayComplete,
	isGoalActiveOn,
} from '@/core/domain/aggregation';
import { fromDateKey } from '@/core/domain/period';
import { Entry, Goal } from '@/core/domain/types';
import { colors, fontFamily, fontSize, spacing } from '@/core/theme';

interface OverviewDayPanelProps {
	dateKey: string;
	goals: Goal[];
	entriesByGoal: Map<string, Map<string, Entry>>;
}

const EASE = Easing.out(Easing.cubic);

function DayGoalRow({
	goal,
	progress,
	complete,
}: {
	goal: Goal;
	progress: number;
	complete: boolean;
}) {
	const c = useSharedValue(complete ? 1 : 0);
	useEffect(() => {
		c.value = withTiming(complete ? 1 : 0, { duration: 300, easing: EASE });
	}, [complete, c]);

	const nameStyle = useAnimatedStyle(() => ({
		color: interpolateColor(c.value, [0, 1], [colors.inkMuted, colors.ink]),
	}));

	return (
		<View
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				gap: spacing.md,
			}}
		>
			<ProgressRing
				progress={progress}
				size={28}
				stroke={2.5}
				fillWhenComplete
			>
				{complete ? (
					<Feather name='check' size={14} color={colors.onAccent} />
				) : null}
			</ProgressRing>
			<IconBadge
				name={goal.icon}
				size={28}
				color={goal.color}
				background={`${goal.color}1A`}
			/>
			<Animated.Text
				numberOfLines={1}
				style={[
					{
						flex: 1,
						fontFamily: fontFamily.medium,
						fontSize: fontSize.label,
						lineHeight: 22,
					},
					nameStyle,
				]}
			>
				{goal.name}
			</Animated.Text>
		</View>
	);
}

export function OverviewDayPanel({
	dateKey,
	goals,
	entriesByGoal,
}: OverviewDayPanelProps) {
	const date = fromDateKey(dateKey);

	const rows = useMemo(() => {
		return goals
			.filter((g) => isGoalActiveOn(g, date))
			.map((g) => {
				const entry = entriesByGoal.get(g.id)?.get(dateKey);
				return {
					goal: g,
					progress: dayCompletion(g, entry),
					complete: isDayComplete(g, entry),
				};
			});
	}, [goals, entriesByGoal, dateKey, date]);

	const met = rows.filter((r) => r.complete).length;

	return (
		<Card style={{ marginTop: spacing.base }}>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'baseline',
					justifyContent: 'space-between',
				}}
			>
				<Text variant='label' weight='bold'>
					{format(date, 'EEE, MMM d')}
				</Text>
				{rows.length > 0 ? (
					<Text variant='small' muted>
						{met} of {rows.length} goals
					</Text>
				) : null}
			</View>

			{rows.length === 0 ? (
				<Text variant='small' muted style={{ marginTop: spacing.sm }}>
					No goals tracked on this day.
				</Text>
			) : (
				<View style={{ marginTop: spacing.lg, gap: spacing.base }}>
					{rows.map(({ goal, progress, complete }) => (
						<DayGoalRow
							key={goal.id}
							goal={goal}
							progress={progress}
							complete={complete}
						/>
					))}
				</View>
			)}
		</Card>
	);
}
