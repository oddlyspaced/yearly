import { memo } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { Easing, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import { IconBadge, IconButton, ProgressRing, Text } from '@/core/ui';
import { haptics } from '@/core/lib/haptics';
import {
	dayCompletion,
	evaluatePeriod,
	isDayComplete,
} from '@/core/domain/aggregation';
import { formatAggregate, formatCount, quickStep } from '@/core/domain/format';
import { periodRange } from '@/core/domain/period';
import { Entry, Goal, PERIOD_SUFFIX } from '@/core/domain/types';
import { colors, radii, shadow, spacing } from '@/core/theme';

interface GoalCardProps {
	goal: Goal;
	/** All entries for this goal. */
	entries: Entry[];
	/** Entry for the day being shown. */
	entry?: Entry;
	/** The day this card represents (defaults to today). */
	refDate?: Date;
	/** Completed goals are dimmed and flattened (no shadow). */
	dimmed?: boolean;
	onPress: () => void;
	onToggle: () => void;
	onStep: (delta: number) => void;
}

function progressLabel(
	goal: Goal,
	entries: Entry[],
	refDate: Date,
	entry?: Entry,
): string {
	const val = entry?.state === 'logged' ? entry.value : 0;
	if (goal.type === 'checkbox') {
		if (goal.period === 'daily')
			return isDayComplete(goal, entry) ? 'Done' : 'Not yet';
		const res = evaluatePeriod(
			goal,
			entries,
			periodRange(goal.period, refDate),
			refDate,
		);
		return `${res.actual} / ${res.target} this ${PERIOD_SUFFIX[goal.period]}`;
	}
	const unit = goal.unit ?? '';
	if (goal.period === 'daily') {
		const t = goal.targetValue ? ` / ${formatCount(goal.targetValue)}` : '';
		return `${formatCount(val)}${t} ${unit}`.trim();
	}
	const res = evaluatePeriod(
		goal,
		entries,
		periodRange(goal.period, refDate),
		refDate,
	);
	const t = goal.targetValue ? ` / ${formatCount(goal.targetValue)}` : '';
	return `${formatAggregate(res.actual)}${t} ${unit} · ${PERIOD_SUFFIX[goal.period]}`.trim();
}

export const GoalCard = memo(function GoalCard({
	goal,
	entries,
	entry,
	refDate = new Date(),
	dimmed,
	onPress,
	onToggle,
	onStep,
}: GoalCardProps) {
	// The ring shows progress toward the goal: a longer period shows accumulated
	// period progress; a daily goal shows that day's completion.
	const ringProgress =
		goal.period === 'daily'
			? dayCompletion(goal, entry)
			: evaluatePeriod(
					goal,
					entries,
					periodRange(goal.period, refDate),
					refDate,
				).pct;
	const periodComplete = ringProgress >= 1;
	// A checkbox marks a single day; that day's done state shows as a centered
	// check inside the ring, so both the day-check and the period progress read.
	const dayDone = isDayComplete(goal, entry);

	const stepStyle = {
		width: 36,
		height: 36,
		borderRadius: radii.pill,
		backgroundColor: colors.surfaceStrong,
	} as const;

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				{
					flexDirection: 'row',
					alignItems: 'center',
					gap: spacing.md,
					padding: spacing.base,
					backgroundColor: colors.surface,
					borderRadius: radii.lg,
					opacity: dimmed ? 0.55 : pressed ? 0.96 : 1,
				},
				dimmed ? null : shadow.card,
			]}
		>
			<IconBadge
				name={goal.icon}
				size={42}
				color={goal.color}
				background={`${goal.color}1A`}
			/>

			<View style={{ flex: 1 }}>
				<Text variant='label' weight='semibold' numberOfLines={1}>
					{goal.name}
				</Text>
				<Text
					variant='small'
					muted
					style={{ marginTop: 1 }}
					numberOfLines={1}
				>
					{progressLabel(goal, entries, refDate, entry)}
				</Text>
			</View>

			{goal.type === 'checkbox' ? (
				<Pressable
					onPress={() => {
						if (dayDone) haptics.light();
						else haptics.success();
						onToggle();
					}}
					hitSlop={10}
				>
					<ProgressRing
						progress={ringProgress}
						size={32}
						stroke={2.5}
					>
						{dayDone ? (
							<Animated.View
								entering={ZoomIn.duration(200).easing(
									Easing.out(Easing.cubic),
								)}
								exiting={ZoomOut.duration(150).easing(
									Easing.out(Easing.cubic),
								)}
								style={{
									width: 22,
									height: 22,
									borderRadius: 11,
									backgroundColor: colors.ink,
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<Feather
									name='check'
									size={13}
									color={colors.onAccent}
								/>
							</Animated.View>
						) : null}
					</ProgressRing>
				</Pressable>
			) : (
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						gap: spacing.sm,
					}}
				>
					<IconButton
						name='minus'
						size={16}
						onPress={() => {
							haptics.light();
							onStep(-quickStep(goal));
						}}
						style={stepStyle}
					/>
					<ProgressRing
						progress={ringProgress}
						size={34}
						stroke={2.5}
						fillWhenComplete
					>
						{periodComplete ? (
							<Feather
								name='check'
								size={16}
								color={colors.onAccent}
							/>
						) : null}
					</ProgressRing>
					<IconButton
						name='plus'
						size={16}
						onPress={() => {
							haptics.light();
							onStep(quickStep(goal));
						}}
						style={stepStyle}
					/>
				</View>
			)}
		</Pressable>
	);
});
