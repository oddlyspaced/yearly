import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, {
	Easing,
	FadeIn,
	FadeInDown,
	LinearTransition,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { addDays, eachDayOfInterval, format, subDays } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoalCard } from '@/features/goals/components/goal-card';
import { DateStepper } from '@/features/goals/components/date-stepper';
import { Button, Card, Divider, IconBadge, IconButton, Text } from '@/core/ui';
import { haptics } from '@/core/lib/haptics';
import {
	dayCompletion,
	evaluatePeriod,
	isDayComplete,
	isGoalActiveOn,
} from '@/core/domain/aggregation';
import { greeting } from '@/core/domain/format';
import {
	fromDateKey,
	periodRange,
	startOfDay,
	toDateKey,
	todayKey,
} from '@/core/domain/period';
import { Entry, Goal } from '@/core/domain/types';
import { entryFor, useStore } from '@/core/store/useStore';
import { colors, radii, spacing } from '@/core/theme';

function isCompleteOn(
	goal: Goal,
	entries: Entry[],
	dateKey: string,
	date: Date,
): boolean {
	if (goal.period === 'daily')
		return isDayComplete(goal, entryFor(entries, goal.id, dateKey));
	return evaluatePeriod(
		goal,
		entries.filter((e) => e.goalId === goal.id),
		periodRange(goal.period, date),
		date,
	).met;
}

/** Mean single-day completion across goals active on `date`, in [0,1]. */
function dayRatio(goals: Goal[], entries: Entry[], date: Date): number {
	const key = toDateKey(date);
	const activeThatDay = goals.filter((g) => isGoalActiveOn(g, date));
	if (activeThatDay.length === 0) return 0;
	const sum = activeThatDay.reduce(
		(acc, g) => acc + dayCompletion(g, entryFor(entries, g.id, key)),
		0,
	);
	return sum / activeThatDay.length;
}

export default function TodayScreen() {
	const router = useRouter();
	const goals = useStore((s) => s.goals);
	const entries = useStore((s) => s.entries);
	const setValue = useStore((s) => s.setValue);
	const toggleDone = useStore((s) => s.toggleDone);

	const [selectedKey, setSelectedKey] = useState(todayKey());
	const selectedDate = useMemo(() => fromDateKey(selectedKey), [selectedKey]);
	const isToday = selectedKey === todayKey();

	const active = useMemo(
		() => goals.filter((g) => isGoalActiveOn(g, selectedDate)),
		[goals, selectedDate],
	);

	const { ordered, completedIds, doneCount } = useMemo(() => {
		const inc: Goal[] = [];
		const done: Goal[] = [];
		for (const g of active) {
			if (isCompleteOn(g, entries, selectedKey, selectedDate))
				done.push(g);
			else inc.push(g);
		}
		return {
			ordered: [...inc, ...done],
			completedIds: new Set(done.map((g) => g.id)),
			doneCount: done.length,
		};
	}, [active, entries, selectedKey, selectedDate]);

	const stats = useMemo(() => {
		const total = active.length;
		const dayPct = total
			? Math.round(dayRatio(active, entries, selectedDate) * 100)
			: 0;

		const week = periodRange('weekly', selectedDate);
		const end = startOfDay(selectedDate);
		const elapsed = eachDayOfInterval({
			start: week.start,
			end: end < week.end ? end : week.end,
		});
		const weekRatios = elapsed.map((d) => dayRatio(active, entries, d));
		const weekAvgPct = weekRatios.length
			? Math.round(
					(weekRatios.reduce((a, b) => a + b, 0) /
						weekRatios.length) *
						100,
				)
			: 0;

		return { total, dayPct, weekAvgPct };
	}, [active, entries, selectedDate]);

	const handleStep = (goal: Goal, delta: number) => {
		const cur = entryFor(entries, goal.id, selectedKey);
		const base = cur?.state === 'logged' ? cur.value : 0;
		setValue(goal.id, selectedKey, Math.max(0, base + delta));
	};

	const statRow: { value: string; label: string }[] = [
		{ value: `${doneCount}/${stats.total}`, label: 'Done' },
		{ value: `${stats.weekAvgPct}%`, label: 'This week' },
		{ value: `${stats.total}`, label: 'Goals' },
	];

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: colors.bg }}
			edges={['top']}
		>
			<ScrollView
				contentContainerStyle={{
					paddingHorizontal: spacing.lg,
					paddingTop: spacing.sm,
					paddingBottom: 120,
				}}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'flex-start',
						justifyContent: 'space-between',
					}}
				>
					<View style={{ flex: 1 }}>
						<Text
							variant='caption'
							muted
							style={{ textTransform: 'uppercase' }}
						>
							{format(new Date(), 'EEEE, MMM d')}
						</Text>
						<Text variant='display' style={{ marginTop: 2 }}>
							{greeting()}
						</Text>
					</View>
					<IconButton
						name='plus'
						variant='outline'
						onPress={() => router.push('/create')}
					/>
				</View>

				{/* Hero summary with date stepper */}
				{active.length > 0 && (
					<Animated.View entering={FadeInDown.duration(360)}>
						<Card style={{ marginTop: spacing.lg }}>
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'space-between',
								}}
							>
								<DateStepper
									dateKey={selectedKey}
									onChange={setSelectedKey}
								/>
								<Text
									mono
									weight='extrabold'
									style={{ fontSize: 44, lineHeight: 50 }}
								>
									{stats.dayPct}%
								</Text>
							</View>

							<Divider style={{ marginVertical: spacing.lg }} />

							{/* Stat row */}
							<View style={{ flexDirection: 'row' }}>
								{statRow.map((s, i) => (
									<View
										key={s.label}
										style={{
											flex: 1,
											flexDirection: 'row',
											alignItems: 'center',
										}}
									>
										<View
											style={{
												flex: 1,
												alignItems: 'center',
											}}
										>
											<Text
												variant='heading'
												weight='bold'
												mono
											>
												{s.value}
											</Text>
											<Text
												variant='caption'
												muted
												style={{
													textTransform: 'uppercase',
													marginTop: 2,
												}}
											>
												{s.label}
											</Text>
										</View>
										{i < statRow.length - 1 && (
											<View
												style={{
													width: 1,
													height: 32,
													backgroundColor:
														colors.line,
												}}
											/>
										)}
									</View>
								))}
							</View>
						</Card>
					</Animated.View>
				)}

				{/* Empty state */}
				{active.length === 0 && (
					<View
						style={{
							alignItems: 'center',
							marginTop: spacing.xxxl * 2,
							paddingHorizontal: spacing.lg,
						}}
					>
						<IconBadge
							name='target'
							size={64}
							style={{ marginBottom: spacing.base }}
						/>
						{isToday ? (
							<>
								<Text variant='heading' center>
									Start with one goal
								</Text>
								<Text
									variant='body'
									muted
									center
									style={{
										marginTop: spacing.xs,
										maxWidth: 260,
									}}
								>
									Track anything — a checkbox or a number with
									your own unit.
								</Text>
								<Button
									icon='plus'
									label='Create your first goal'
									onPress={() => router.push('/create')}
									style={{ marginTop: spacing.lg }}
								/>
							</>
						) : (
							<Text variant='body' muted center>
								No goals were tracked on this day.
							</Text>
						)}
					</View>
				)}

				{/* Goals — single list; completed items glide to the bottom */}
				{ordered.length > 0 && (
					<View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
						{ordered.map((g) => {
							const done = completedIds.has(g.id);
							return (
								<Animated.View
									key={g.id}
									layout={LinearTransition.duration(
										340,
									).easing(Easing.bezier(0.22, 1, 0.36, 1))}
									entering={FadeIn.duration(220)}
								>
									<GoalCard
										goal={g}
										entries={entries.filter(
											(e) => e.goalId === g.id,
										)}
										entry={entryFor(
											entries,
											g.id,
											selectedKey,
										)}
										refDate={selectedDate}
										dimmed={done}
										onPress={() =>
											router.push({
												pathname: '/details',
												params: { id: g.id },
											})
										}
										onToggle={() =>
											toggleDone(g.id, selectedKey)
										}
										onStep={(d) => handleStep(g, d)}
									/>
								</Animated.View>
							);
						})}
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
