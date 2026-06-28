import { useMemo } from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';

import { Card, ProgressRing, Text } from '@/components/ui';
import {
	dayCompletion,
	isDayComplete,
	isGoalActiveOn,
} from '@/domain/aggregation';
import { fromDateKey } from '@/domain/period';
import { Entry, Goal } from '@/domain/types';
import { colors, radii, spacing } from '@/theme';

interface OverviewDayPanelProps {
	dateKey: string;
	goals: Goal[];
	entriesByGoal: Map<string, Map<string, Entry>>;
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
				<Text variant='label' weight='semibold'>
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
				<View style={{ marginTop: spacing.md, gap: spacing.md }}>
					{rows.map(({ goal, progress, complete }) => (
						<View
							key={goal.id}
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
									<Feather
										name='check'
										size={14}
										color={colors.onAccent}
									/>
								) : null}
							</ProgressRing>
							<View
								style={{
									width: 30,
									height: 30,
									borderRadius: radii.sm,
									backgroundColor: colors.surfaceStrong,
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<Feather
									name={
										goal.icon as keyof typeof Feather.glyphMap
									}
									size={15}
									color={colors.ink}
								/>
							</View>
							<Text
								variant='small'
								weight='medium'
								numberOfLines={1}
								style={{ flex: 1 }}
								muted={!complete}
							>
								{goal.name}
							</Text>
						</View>
					))}
				</View>
			)}
		</Card>
	);
}
