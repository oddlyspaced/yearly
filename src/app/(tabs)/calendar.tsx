import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { eachDayOfInterval, format, startOfMonth } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OverviewDayPanel } from '@/components/overview-day-panel';
import { OverviewStats, StatItem } from '@/components/overview-stats';
import { Card, ScreenHeader, Text } from '@/components/ui';
import {
	buildHeatmapWeeks,
	DayStat,
	YearHeatmap,
} from '@/components/year-heatmap';
import {
	dayCompletion,
	isDayComplete,
	isGoalActiveOn,
} from '@/domain/aggregation';
import { startOfDay, toDateKey, todayKey } from '@/domain/period';
import { Entry } from '@/domain/types';
import { useStore } from '@/store/useStore';
import { colors, spacing } from '@/theme';

export default function CalendarScreen() {
	const goals = useStore((s) => s.goals);
	const entries = useStore((s) => s.entries);
	const tKey = todayKey();
	const [selectedKey, setSelectedKey] = useState<string>(tKey);

	const active = useMemo(() => goals.filter((g) => !g.archived), [goals]);

	// entries grouped by goalId → dateKey for O(1) lookup.
	const entriesByGoal = useMemo(() => {
		const map = new Map<string, Map<string, Entry>>();
		for (const e of entries) {
			let inner = map.get(e.goalId);
			if (!inner) {
				inner = new Map();
				map.set(e.goalId, inner);
			}
			inner.set(e.date, e);
		}
		return map;
	}, [entries]);

	// Per-day cross-goal stats across the heatmap range.
	const stats = useMemo(() => {
		const map = new Map<string, DayStat>();
		const weeks = buildHeatmapWeeks();
		const today = startOfDay(new Date());
		for (const week of weeks) {
			for (const day of week) {
				if (day > today) continue;
				const key = toDateKey(day);
				let total = 0;
				let met = 0;
				let sum = 0;
				for (const g of goals) {
					if (!isGoalActiveOn(g, day)) continue;
					total++;
					const entry = entriesByGoal.get(g.id)?.get(key);
					sum += dayCompletion(g, entry);
					if (isDayComplete(g, entry)) met++;
				}
				if (total > 0) map.set(key, { total, met, ratio: sum / total });
			}
		}
		return map;
	}, [goals, entriesByGoal]);

	// Summary stats for the current month (up to today).
	const monthStats: StatItem[] = useMemo(() => {
		const today = startOfDay(new Date());
		const days = eachDayOfInterval({
			start: startOfMonth(today),
			end: today,
		});
		let perfect = 0;
		let tracked = 0;
		let ratioSum = 0;
		let activeDays = 0;
		for (const day of days) {
			const stat = stats.get(toDateKey(day));
			if (!stat) continue;
			activeDays++;
			ratioSum += stat.ratio;
			if (stat.ratio >= 1) perfect++;
			if (stat.met > 0) tracked++;
		}
		const avg = activeDays ? Math.round((ratioSum / activeDays) * 100) : 0;
		return [
			{ label: 'Perfect days', value: String(perfect) },
			{ label: 'Tracked days', value: String(tracked) },
			{ label: 'Avg complete', value: `${avg}%` },
		];
	}, [stats]);

	const rangeLabel = useMemo(() => {
		const weeks = buildHeatmapWeeks();
		const first = weeks[0][0];
		return `${format(first, 'MMM yyyy')} – ${format(new Date(), 'MMM yyyy')}`;
	}, []);

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
				<ScreenHeader title='Calendar' subtitle={rangeLabel} />

				{active.length === 0 ? (
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
								name='calendar'
								size={28}
								color={colors.inkMuted}
							/>
						</View>
						<Text variant='heading' center>
							Nothing to show yet
						</Text>
						<Text
							variant='body'
							muted
							center
							style={{ marginTop: spacing.xs, maxWidth: 260 }}
						>
							Create goals to see your calendar fill up.
						</Text>
					</View>
				) : (
					<>
						<View style={{ marginTop: spacing.base }}>
							<OverviewStats items={monthStats} />
						</View>

						<Card style={{ marginTop: spacing.base }}>
							<Text
								variant='caption'
								muted
								style={{
									textTransform: 'uppercase',
									marginBottom: spacing.md,
								}}
							>
								Daily completion
							</Text>
							<YearHeatmap
								stats={stats}
								todayKey={tKey}
								selectedKey={selectedKey}
								onSelectDay={setSelectedKey}
							/>
						</Card>

						<OverviewDayPanel
							dateKey={selectedKey}
							goals={goals}
							entriesByGoal={entriesByGoal}
						/>
					</>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
