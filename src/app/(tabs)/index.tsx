import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoalCard } from '@/components/goal-card';
import { IconButton, ProgressRing, Text } from '@/components/ui';
import { evaluatePeriod, isDayComplete } from '@/domain/aggregation';
import { greeting } from '@/domain/format';
import { periodRange, todayKey } from '@/domain/period';
import { Goal } from '@/domain/types';
import { entryFor, useStore } from '@/store/useStore';
import { colors, spacing } from '@/theme';

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

export default function TodayScreen() {
	const router = useRouter();
	const goals = useStore((s) => s.goals);
	const entries = useStore((s) => s.entries);
	const setValue = useStore((s) => s.setValue);
	const toggleDone = useStore((s) => s.toggleDone);

	const active = useMemo(() => goals.filter((g) => !g.archived), [goals]);

	const { incomplete, completed, doneCount } = useMemo(() => {
		const inc: Goal[] = [];
		const done: Goal[] = [];
		for (const g of active) {
			if (isCompleteToday(g, entries)) done.push(g);
			else inc.push(g);
		}
		return { incomplete: inc, completed: done, doneCount: done.length };
	}, [active, entries]);

	const ratio = active.length ? doneCount / active.length : 0;

	const handleStep = (goal: Goal, delta: number) => {
		const cur = entryFor(entries, goal.id);
		const base = cur?.state === 'logged' ? cur.value : 0;
		setValue(goal.id, todayKey(), Math.max(0, base + delta));
	};

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: colors.bg }}
			edges={['top']}
		>
			<ScrollView
				contentContainerStyle={{
					paddingHorizontal: spacing.lg,
					paddingTop: spacing.sm,
					paddingBottom: spacing.xxxl,
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
						<Text variant='title' style={{ marginTop: 2 }}>
							{greeting()}
						</Text>
					</View>
					<IconButton
						name='plus'
						filled
						onPress={() => router.push('/create')}
						style={{ width: 44, height: 44, borderRadius: 14 }}
					/>
				</View>

				{/* Summary */}
				{active.length > 0 && (
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: spacing.base,
							marginTop: spacing.lg,
							padding: spacing.base,
							backgroundColor: colors.surface,
							borderRadius: 20,
							borderWidth: 1,
							borderColor: colors.line,
						}}
					>
						<ProgressRing progress={ratio} size={56} stroke={5}>
							<Text variant='small' weight='bold'>
								{Math.round(ratio * 100)}
							</Text>
						</ProgressRing>
						<View style={{ flex: 1 }}>
							<Text variant='label' weight='semibold'>
								{doneCount} of {active.length} complete
							</Text>
							<Text
								variant='small'
								muted
								style={{ marginTop: 1 }}
							>
								{ratio >= 1
									? 'Every goal done today — nice.'
									: 'Keep going, you’ve got this.'}
							</Text>
						</View>
					</View>
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
						<View
							style={{
								width: 64,
								height: 64,
								borderRadius: 20,
								backgroundColor: colors.surfaceStrong,
								alignItems: 'center',
								justifyContent: 'center',
								marginBottom: spacing.base,
							}}
						>
							<Feather
								name='target'
								size={28}
								color={colors.inkMuted}
							/>
						</View>
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
						<View style={{ marginTop: spacing.lg }}>
							<Text
								onPress={() => router.push('/create')}
								variant='label'
								weight='semibold'
								color={colors.accent}
							>
								+ Create your first goal
							</Text>
						</View>
					</View>
				)}

				{/* Incomplete */}
				{incomplete.length > 0 && (
					<View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
						{incomplete.map((g) => (
							<GoalCard
								key={g.id}
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
								onToggle={() => toggleDone(g.id, todayKey())}
								onStep={(d) => handleStep(g, d)}
							/>
						))}
					</View>
				)}

				{/* Completed */}
				{completed.length > 0 && (
					<View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
						<Text
							variant='caption'
							muted
							style={{
								textTransform: 'uppercase',
								marginLeft: spacing.xs,
							}}
						>
							Completed · {completed.length}
						</Text>
						<View style={{ gap: spacing.sm, opacity: 0.6 }}>
							{completed.map((g) => (
								<GoalCard
									key={g.id}
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
							))}
						</View>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
