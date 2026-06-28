import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, {
	Easing,
	FadeIn,
	FadeInDown,
	LinearTransition,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { eachDayOfInterval, format } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoalCard } from '@/features/goals/components/goal-card';
import { Button, Card, Divider, IconBadge, IconButton, Text } from '@/core/ui';
import {
	dayCompletion,
	evaluatePeriod,
	isDayComplete,
	isGoalActiveOn,
} from '@/core/domain/aggregation';
import { greeting } from '@/core/domain/format';
import {
	periodRange,
	startOfDay,
	toDateKey,
	todayKey,
} from '@/core/domain/period';
import { Goal } from '@/core/domain/types';
import { entryFor, useStore } from '@/core/store/useStore';
import { colors, spacing } from '@/core/theme';

function isCompleteToday(
	goal: Goal,
	entries: ReturnType<typeof useStore.getState>['entries'],
): boolean {
	const today = entryFor(entries, goal.id);
	if (goal.period === 'daily') return isDayComplete(goal, today);
	return evaluatePeriod(
		goal,
		entries.filter((e) => e.goalId === goal.id),
		periodRange(goal.period, new Date()),
		new Date(),
	).met;
}

/** Mean single-day completion across goals active on `date`, in [0,1]. */
function dayRatio(
	goals: Goal[],
	entries: ReturnType<typeof useStore.getState>['entries'],
	date: Date,
): number {
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
	const active = useMemo(() => goals.filter((g) => !g.archived), [goals]);

	const { ordered, completedIds, doneCount } = useMemo(() => {
		const inc: Goal[] = [];
		const done: Goal[] = [];
		for (const g of active) {
			if (isCompleteToday(g, entries)) done.push(g);
			else inc.push(g);
		}
		return {
			ordered: [...inc, ...done],
			completedIds: new Set(done.map((g) => g.id)),
			doneCount: done.length,
		};
	}, [active, entries]);

	const stats = useMemo(() => {
		const today = new Date();
		const total = active.length;
		const todayPct = total
			? Math.round(
					(active.reduce(
						(acc, g) =>
							acc + dayCompletion(g, entryFor(entries, g.id)),
						0,
					) /
						total) *
						100,
				)
			: 0;

		const week = periodRange('weekly', today);
		const elapsed = eachDayOfInterval({
			start: week.start,
			end: startOfDay(today),
		});
		const weekRatios = elapsed.map((d) => dayRatio(active, entries, d));
		const weekAvgPct = weekRatios.length
			? Math.round(
					(weekRatios.reduce((a, b) => a + b, 0) /
						weekRatios.length) *
						100,
				)
			: 0;

		return { total, todayPct, weekAvgPct };
	}, [active, entries]);

	const handleStep = (goal: Goal, delta: number) => {
		const cur = entryFor(entries, goal.id);
		const base = cur?.state === 'logged' ? cur.value : 0;
		setValue(goal.id, todayKey(), Math.max(0, base + delta));
	};

	const statRow: { value: string; label: string }[] = [
		{ value: `${doneCount}/${stats.total}`, label: 'Today' },
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

				{/* Hero summary */}
				{active.length > 0 && (
					<Animated.View entering={FadeInDown.duration(360)}>
						<Card style={{ marginTop: spacing.lg }}>
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'flex-start',
									justifyContent: 'space-between',
								}}
							>
								<View>
									<Text variant='label' weight='bold'>
										Today
									</Text>
									<Text
										variant='small'
										muted
										style={{ marginTop: 2 }}
									>
										{format(new Date(), 'MMMM d, yyyy')}
									</Text>
								</View>
								<View
									style={{
										flexDirection: 'row',
										alignItems: 'flex-end',
									}}
								>
									<Text
										mono
										weight='extrabold'
										style={{ fontSize: 46, lineHeight: 52 }}
									>
										{stats.todayPct}%
									</Text>
								</View>
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
						<Text variant='heading' center>
							Start with one goal
						</Text>
						<Text
							variant='body'
							muted
							center
							style={{ marginTop: spacing.xs, maxWidth: 260 }}
						>
							Track anything — a checkbox or a number with your
							own unit.
						</Text>
						<Button
							icon='plus'
							label='Create your first goal'
							onPress={() => router.push('/create')}
							style={{ marginTop: spacing.lg }}
						/>
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
									style={{ opacity: done ? 0.5 : 1 }}
								>
									<GoalCard
										goal={g}
										entries={entries.filter(
											(e) => e.goalId === g.id,
										)}
										todayEntry={entryFor(entries, g.id)}
										onPress={() =>
											router.push({
												pathname: '/details',
												params: { id: g.id },
											})
										}
										onToggle={() =>
											toggleDone(g.id, todayKey())
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
