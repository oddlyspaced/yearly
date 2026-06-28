import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { eachDayOfInterval, format, startOfMonth } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OverviewDayPanel } from '@/features/calendar/components/overview-day-panel';
import { Card, IconBadge, ScreenHeader, StatTile, Text } from '@/core/ui';
import {
	buildHeatmapWeeks,
	DayStat,
	YearHeatmap,
} from '@/features/calendar/components/year-heatmap';
import {
	dayCompletion,
	isDayComplete,
	isGoalActiveOn,
} from '@/core/domain/aggregation';
import { startOfDay, toDateKey, todayKey } from '@/core/domain/period';
import { Entry } from '@/core/domain/types';
import { useStore } from '@/core/store/useStore';
import { colors, spacing } from '@/core/theme';

interface Tile {
	icon: keyof typeof import('@expo/vector-icons').Feather.glyphMap;
	value: string;
	label: string;
}

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

	// Summary stat tiles for the current month (up to today).
	const tiles: Tile[] = useMemo(() => {
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
			{ icon: 'award', value: String(perfect), label: 'Perfect days' },
			{
				icon: 'check-circle',
				value: String(tracked),
				label: 'Tracked days',
			},
			{ icon: 'bar-chart-2', value: `${avg}%`, label: 'Avg complete' },
			{
				icon: 'calendar',
				value: String(activeDays),
				label: 'Active days',
			},
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
					padding: spacing.lg,
					paddingBottom: 120,
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
						<IconBadge
							name='grid'
							size={64}
							style={{ marginBottom: spacing.base }}
						/>
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
						<View
							style={{ marginTop: spacing.lg, gap: spacing.base }}
						>
							<View
								style={{
									flexDirection: 'row',
									gap: spacing.base,
								}}
							>
								<StatTile {...tiles[0]} />
								<StatTile {...tiles[1]} />
							</View>
							<View
								style={{
									flexDirection: 'row',
									gap: spacing.base,
								}}
							>
								<StatTile {...tiles[2]} />
								<StatTile {...tiles[3]} />
							</View>
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
