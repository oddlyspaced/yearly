import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, {
	Easing,
	FadeIn,
	FadeInDown,
	SlideInLeft,
	SlideInRight,
	SlideOutLeft,
	SlideOutRight,
} from 'react-native-reanimated';
import { addMonths, format, startOfMonth, subMonths } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckboxLogger } from '@/features/goals/components/checkbox-logger';
import { DetailStats } from '@/features/goals/components/detail-stats';
import { DisplayMode, MonthGrid } from '@/features/goals/components/month-grid';
import { NumericLogger } from '@/features/goals/components/numeric-logger';
import { Card, Glyph, IconButton, SegmentedControl, Text } from '@/core/ui';
import { fromDateKey, startOfDay } from '@/core/domain/period';
import { entriesForGoal, entryFor, useStore } from '@/core/store/useStore';
import { haptics } from '@/core/lib/haptics';
import { colors, radii, spacing } from '@/core/theme';

export default function DetailsScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const goal = useStore((s) => s.goals.find((g) => g.id === id));
	const allEntries = useStore((s) => s.entries);
	const [displayMode, setDisplayMode] = useState<DisplayMode>('value');
	const [month, setMonth] = useState(() => startOfMonth(new Date()));
	const [dir, setDir] = useState(1);

	if (!goal) {
		return (
			<SafeAreaView
				style={{ flex: 1, backgroundColor: colors.bg }}
				edges={['top']}
			>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						paddingHorizontal: spacing.lg,
						paddingTop: spacing.xs,
					}}
				>
					<IconButton
						name='chevron-left'
						onPress={() => router.back()}
					/>
				</View>
				<View
					style={{
						flex: 1,
						alignItems: 'center',
						justifyContent: 'center',
						padding: spacing.xl,
					}}
				>
					<Text variant='heading' weight='semibold'>
						Goal not found
					</Text>
					<Text
						variant='small'
						muted
						center
						style={{ marginTop: spacing.sm }}
					>
						This goal may have been deleted.
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	const goalEntries = entriesForGoal(allEntries, goal.id);
	const todayEntry = entryFor(allEntries, goal.id);

	const createdMonth = startOfMonth(
		startOfDay(fromDateKey(goal.createdAt.slice(0, 10))),
	);
	const currentMonth = startOfMonth(new Date());
	const canPrev = month > createdMonth;
	const canNext = month < currentMonth;

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: colors.bg }}
			edges={['top']}
		>
			{/* Header */}
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					paddingHorizontal: spacing.lg,
					paddingTop: spacing.xs,
				}}
			>
				<IconButton name='chevron-left' onPress={() => router.back()} />
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						gap: spacing.sm,
						flex: 1,
						justifyContent: 'center',
					}}
				>
					<Glyph name={goal.icon} size={16} color={goal.color} />
					<Text variant='label' weight='semibold' numberOfLines={1}>
						{goal.name}
					</Text>
				</View>
				<IconButton
					name='edit-3'
					onPress={() =>
						router.push({
							pathname: '/edit',
							params: { id: goal.id },
						})
					}
				/>
			</View>

			<ScrollView
				contentContainerStyle={{
					padding: spacing.lg,
					paddingBottom: spacing.xxxl,
					gap: spacing.xl,
				}}
				showsVerticalScrollIndicator={false}
			>
				{/* Logging hero */}
				<Animated.View entering={FadeInDown.duration(340)}>
					<Card style={{ paddingVertical: spacing.xxl }}>
						{goal.type === 'numeric' ? (
							<NumericLogger
								goal={goal}
								todayEntry={todayEntry}
							/>
						) : (
							<CheckboxLogger
								goal={goal}
								todayEntry={todayEntry}
							/>
						)}
					</Card>
				</Animated.View>

				{/* Stats: streak tiles + period progress */}
				<Animated.View entering={FadeInDown.duration(340).delay(70)}>
					<DetailStats goal={goal} entries={goalEntries} />
				</Animated.View>

				{/* Month calendar */}
				<Animated.View entering={FadeInDown.duration(340).delay(140)}>
					<Card style={{ overflow: 'hidden' }}>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-between',
								marginBottom: spacing.base,
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
								}}
							>
								<IconButton
									name='chevron-left'
									size={20}
									color={
										canPrev ? colors.ink : colors.inkGhost
									}
									onPress={() => {
										if (!canPrev) return;
										haptics.selection();
										setDir(-1);
										setMonth(subMonths(month, 1));
									}}
									style={{ width: 34, height: 34 }}
								/>
								<View
									style={{
										minWidth: 92,
										alignItems: 'center',
									}}
								>
									<Animated.View
										key={format(month, 'yyyy-MM')}
										entering={FadeIn.duration(220)}
									>
										<Text variant='label' weight='semibold'>
											{format(month, 'MMM yyyy')}
										</Text>
									</Animated.View>
								</View>
								<IconButton
									name='chevron-right'
									size={20}
									color={
										canNext ? colors.ink : colors.inkGhost
									}
									onPress={() => {
										if (!canNext) return;
										haptics.selection();
										setDir(1);
										setMonth(addMonths(month, 1));
									}}
									style={{ width: 34, height: 34 }}
								/>
							</View>
							<SegmentedControl<DisplayMode>
								options={[
									{ label: 'Value', value: 'value' },
									{ label: 'Date', value: 'date' },
								]}
								value={displayMode}
								onChange={setDisplayMode}
								style={{ width: 132 }}
							/>
						</View>
						<Animated.View
							key={format(month, 'yyyy-MM')}
							entering={(dir > 0 ? SlideInRight : SlideInLeft)
								.duration(260)
								.easing(Easing.out(Easing.cubic))}
							exiting={(dir > 0 ? SlideOutLeft : SlideOutRight)
								.duration(220)
								.easing(Easing.out(Easing.cubic))}
						>
							<MonthGrid
								goal={goal}
								entries={goalEntries}
								displayMode={displayMode}
								month={month}
							/>
						</Animated.View>
					</Card>
				</Animated.View>
			</ScrollView>
		</SafeAreaView>
	);
}
