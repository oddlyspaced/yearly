import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { IconButton, ProgressRing, Text } from '@/components/ui';
import {
	dayCompletion,
	evaluatePeriod,
	isDayComplete,
} from '@/domain/aggregation';
import { formatValue, quickStep } from '@/domain/format';
import { periodRange, todayKey } from '@/domain/period';
import { Entry, Goal, PERIOD_SUFFIX } from '@/domain/types';
import { colors, radii, spacing } from '@/theme';

interface GoalCardProps {
	goal: Goal;
	entries: Entry[];
	todayEntry?: Entry;
	onPress: () => void;
	onToggle: () => void;
	onStep: (delta: number) => void;
}

function progressLabel(
	goal: Goal,
	entries: Entry[],
	todayEntry?: Entry,
): string {
	const todayVal = todayEntry?.state === 'logged' ? todayEntry.value : 0;
	if (goal.type === 'checkbox') {
		if (goal.period === 'daily')
			return isDayComplete(goal, todayEntry)
				? 'Done for today'
				: 'Not yet';
		const res = evaluatePeriod(
			goal,
			entries,
			periodRange(goal.period, new Date()),
			new Date(),
		);
		return `${res.actual} / ${res.target} this ${PERIOD_SUFFIX[goal.period]}`;
	}
	const unit = goal.unit ?? '';
	if (goal.period === 'daily') {
		const t = goal.targetValue ? ` / ${formatValue(goal.targetValue)}` : '';
		return `${formatValue(todayVal)}${t} ${unit}`.trim();
	}
	const res = evaluatePeriod(
		goal,
		entries,
		periodRange(goal.period, new Date()),
		new Date(),
	);
	const actual =
		goal.aggregation === 'mean'
			? formatValue(res.actual)
			: formatValue(res.actual);
	const t = goal.targetValue ? ` / ${formatValue(goal.targetValue)}` : '';
	return `${actual}${t} ${unit} · ${PERIOD_SUFFIX[goal.period]}`.trim();
}

export const GoalCard = memo(function GoalCard({
	goal,
	entries,
	todayEntry,
	onPress,
	onToggle,
	onStep,
}: GoalCardProps) {
	const ringProgress =
		goal.period === 'daily'
			? dayCompletion(goal, todayEntry)
			: evaluatePeriod(
					goal,
					entries,
					periodRange(goal.period, new Date()),
					new Date(),
				).pct;
	const complete =
		goal.period === 'daily'
			? isDayComplete(goal, todayEntry)
			: ringProgress >= 1;
	const todayVal = todayEntry?.state === 'logged' ? todayEntry.value : 0;

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => ({
				flexDirection: 'row',
				alignItems: 'center',
				gap: spacing.md,
				paddingVertical: spacing.md,
				paddingHorizontal: spacing.base,
				backgroundColor: colors.surface,
				borderRadius: radii.lg,
				borderWidth: 1,
				borderColor: colors.line,
				opacity: pressed ? 0.92 : 1,
			})}
		>
			<View
				style={{
					width: 40,
					height: 40,
					borderRadius: radii.md,
					backgroundColor: colors.surfaceStrong,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Feather
					name={goal.icon as keyof typeof Feather.glyphMap}
					size={19}
					color={colors.ink}
				/>
			</View>

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
					{progressLabel(goal, entries, todayEntry)}
				</Text>
			</View>

			{goal.type === 'checkbox' ? (
				<Pressable onPress={onToggle} hitSlop={10}>
					<ProgressRing
						progress={complete ? 1 : 0}
						size={32}
						stroke={2.5}
						fillWhenComplete
					>
						{complete ? (
							<Feather
								name='check'
								size={18}
								color={colors.onAccent}
							/>
						) : null}
					</ProgressRing>
				</Pressable>
			) : (
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						gap: 2,
					}}
				>
					<IconButton
						name='minus'
						size={18}
						onPress={() => onStep(-quickStep(goal))}
						style={{ width: 36, height: 36 }}
					/>
					<ProgressRing
						progress={ringProgress}
						size={34}
						stroke={2.5}
						fillWhenComplete
					>
						{complete ? (
							<Feather
								name='check'
								size={16}
								color={colors.onAccent}
							/>
						) : (
							<Text variant='caption' weight='semibold'>
								{formatValue(todayVal)}
							</Text>
						)}
					</ProgressRing>
					<IconButton
						name='plus'
						size={18}
						onPress={() => onStep(quickStep(goal))}
						style={{ width: 36, height: 36 }}
					/>
				</View>
			)}
		</Pressable>
	);
});
