import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
	Easing,
	FadeInDown,
	FadeOut,
	LinearTransition,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

import {
	AGGREGATION_LABELS,
	Aggregation,
	COMPARATOR_LABELS,
	Comparator,
	GOAL_COLORS,
	GOAL_ICONS,
	GoalType,
	NUMERIC_AGGREGATIONS,
	NewGoal,
	PERIODS,
	PERIOD_LABELS,
	PERIOD_SUFFIX,
	Period,
} from '@/core/domain/types';
import { colors, spacing } from '@/core/theme';
import {
	Button,
	Divider,
	Glyph,
	SectionLabel,
	SegmentedControl,
	Text,
} from '@/core/ui';
import {
	ChipSelector,
	ColorPicker,
	IconPicker,
} from '@/features/goals/components/pickers';
import { Input } from '@/features/goals/components/ui-input';

interface GoalFormProps {
	initial?: Partial<NewGoal>;
	submitLabel: string;
	onSubmit: (goal: NewGoal, typeChanged: boolean) => void;
	onDelete?: () => void;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ── Motion ────────────────────────────────────────────────────────────────────
const EASE = Easing.out(Easing.cubic);
const enter = FadeInDown.duration(220).easing(EASE);
const exit = FadeOut.duration(150);
const reflow = LinearTransition.duration(240).easing(EASE);

export function GoalForm({
	initial,
	submitLabel,
	onSubmit,
	onDelete,
}: GoalFormProps) {
	const initialType = initial?.type;

	const [name, setName] = useState(initial?.name ?? '');
	const [type, setType] = useState<GoalType>(initial?.type ?? 'checkbox');
	const [unit, setUnit] = useState(initial?.unit ?? '');
	const [period, setPeriod] = useState<Period>(initial?.period ?? 'daily');
	const [aggregation, setAggregation] = useState<Aggregation>(
		initial?.aggregation ?? 'count',
	);
	const [comparator, setComparator] = useState<Comparator>(
		initial?.comparator ?? 'at_least',
	);
	const [target, setTarget] = useState(
		initial?.targetValue != null
			? String(initial.targetValue)
			: type === 'checkbox'
				? '1'
				: '',
	);
	const [icon, setIcon] = useState(initial?.icon ?? GOAL_ICONS[0]);
	const [color, setColor] = useState(initial?.color ?? GOAL_COLORS[0]);
	const [advanced, setAdvanced] = useState(false);

	const toggleAdvanced = () => setAdvanced((a) => !a);

	const chev = useSharedValue(0);
	useEffect(() => {
		chev.value = withTiming(advanced ? 1 : 0, {
			duration: 220,
			easing: EASE,
		});
	}, [advanced, chev]);
	const chevStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${chev.value * 180}deg` }],
	}));

	const onTypeChange = (next: GoalType) => {
		if (next === type) return;
		setType(next);
		setAggregation(next === 'numeric' ? 'sum' : 'count');
		if (next === 'checkbox') {
			setComparator('at_least');
			setTarget((t) => (t.trim() === '' ? '1' : t));
		}
	};

	// ── Validation ────────────────────────────────────────────────────────────
	const targetNum = target.trim() === '' ? null : Number(target);
	const targetValid =
		target.trim() === '' ||
		(Number.isFinite(targetNum) && (targetNum ?? 0) > 0);

	const checkboxHasTarget = type === 'checkbox' && period !== 'daily';
	const valid =
		name.trim().length > 0 &&
		(type === 'numeric' ? targetValid : !checkboxHasTarget || targetValid);

	// ── Live summary ──────────────────────────────────────────────────────────
	const summary = useMemo(() => {
		const suffix = PERIOD_SUFFIX[period];
		if (type === 'checkbox') {
			if (period === 'daily') return 'Every day.';
			const times = targetNum ?? 1;
			return `${COMPARATOR_LABELS[comparator]} ${times} ${
				times === 1 ? 'time' : 'times'
			} per ${suffix}.`;
		}
		const unitStr = unit.trim() ? ` ${unit.trim()}` : '';
		if (targetNum == null) {
			return `Track${unitStr} per ${suffix}.`;
		}
		return `${AGGREGATION_LABELS[aggregation]} ${COMPARATOR_LABELS[
			comparator
		].toLowerCase()} ${targetNum}${unitStr} per ${suffix}.`;
	}, [type, period, targetNum, comparator, unit, aggregation]);

	const handleSubmit = () => {
		if (!valid) return;
		const goal: NewGoal = {
			name: name.trim(),
			type,
			unit: type === 'numeric' ? unit.trim() || null : null,
			period,
			aggregation,
			comparator,
			targetValue:
				type === 'numeric'
					? targetNum
					: period === 'daily'
						? 1
						: (targetNum ?? 1),
			icon,
			color,
		};
		onSubmit(goal, initialType != null && initialType !== type);
	};

	return (
		<Animated.View layout={reflow} style={{ gap: spacing.lg }}>
			{/* Name */}
			<Animated.View layout={reflow}>
				<Input
					bare
					value={name}
					onChangeText={setName}
					placeholder='Goal name'
					autoFocus={initialType == null}
					returnKeyType='done'
				/>
			</Animated.View>

			<Animated.View layout={reflow}>
				<Divider />
			</Animated.View>

			{/* Type */}
			<Animated.View layout={reflow}>
				<SectionLabel>Type</SectionLabel>
				<SegmentedControl<GoalType>
					options={[
						{ label: 'Checkbox', value: 'checkbox' },
						{ label: 'Numeric', value: 'numeric' },
					]}
					value={type}
					onChange={onTypeChange}
				/>
			</Animated.View>

			{/* Numeric: unit + target */}
			{type === 'numeric' ? (
				<Animated.View
					entering={enter}
					exiting={exit}
					layout={reflow}
					style={{ gap: spacing.lg }}
				>
					<View>
						<SectionLabel>Unit</SectionLabel>
						<Input
							value={unit}
							onChangeText={setUnit}
							placeholder='steps, ml, pages…'
							autoCapitalize='none'
						/>
					</View>
					<View>
						<SectionLabel>Target</SectionLabel>
						<Input
							value={target}
							onChangeText={setTarget}
							placeholder='Optional'
							keyboardType='numeric'
						/>
					</View>
				</Animated.View>
			) : null}

			{/* Period */}
			<Animated.View layout={reflow}>
				<SectionLabel>Period</SectionLabel>
				<ChipSelector<Period>
					options={PERIODS.map((p) => ({
						label: PERIOD_LABELS[p],
						value: p,
					}))}
					value={period}
					onChange={setPeriod}
				/>
			</Animated.View>

			{/* Checkbox: times-per-period — directly below Period */}
			{checkboxHasTarget ? (
				<Animated.View entering={enter} exiting={exit} layout={reflow}>
					<SectionLabel>{`Times per ${PERIOD_SUFFIX[period]}`}</SectionLabel>
					<Input
						value={target}
						onChangeText={setTarget}
						placeholder='1'
						keyboardType='numeric'
					/>
				</Animated.View>
			) : null}

			{/* Icon */}
			<Animated.View layout={reflow}>
				<SectionLabel>Icon</SectionLabel>
				<IconPicker
					options={GOAL_ICONS}
					value={icon}
					onChange={setIcon}
				/>
			</Animated.View>

			{/* Color */}
			<Animated.View layout={reflow}>
				<SectionLabel>Color</SectionLabel>
				<ColorPicker
					options={GOAL_COLORS}
					value={color}
					onChange={setColor}
				/>
			</Animated.View>

			<Animated.View layout={reflow}>
				<Divider />
			</Animated.View>

			{/* Advanced */}
			<Animated.View layout={reflow} style={{ gap: spacing.lg }}>
				<Pressable
					onPress={toggleAdvanced}
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<Text variant='label' weight='semibold'>
						Advanced
					</Text>
					<Animated.View style={chevStyle}>
						<Glyph
							name='chevron-down'
							size={20}
							color={colors.inkMuted}
						/>
					</Animated.View>
				</Pressable>

				{/* Live rule summary — always visible */}
				<Text variant='small' muted>
					{cap(summary)}
				</Text>

				{advanced && type === 'numeric' ? (
					<Animated.View
						entering={enter}
						exiting={exit}
						layout={reflow}
						style={{ gap: spacing.lg }}
					>
						<View>
							<SectionLabel>Aggregation</SectionLabel>
							<ChipSelector<Aggregation>
								options={NUMERIC_AGGREGATIONS.map((a) => ({
									label: AGGREGATION_LABELS[a],
									value: a,
								}))}
								value={aggregation}
								onChange={setAggregation}
							/>
						</View>

						<View>
							<SectionLabel>Goal</SectionLabel>
							<SegmentedControl<Comparator>
								options={[
									{
										label: COMPARATOR_LABELS.at_least,
										value: 'at_least',
									},
									{
										label: COMPARATOR_LABELS.at_most,
										value: 'at_most',
									},
								]}
								value={comparator}
								onChange={setComparator}
							/>
						</View>
					</Animated.View>
				) : null}
			</Animated.View>

			<Animated.View layout={reflow}>
				<Divider />
			</Animated.View>

			{/* Actions */}
			<Animated.View layout={reflow} style={{ gap: spacing.md }}>
				<Button
					label={submitLabel}
					variant='primary'
					size='lg'
					icon='check'
					onPress={handleSubmit}
					disabled={!valid}
				/>
				{onDelete ? (
					<Button
						label='Delete goal'
						variant='destructive'
						onPress={onDelete}
					/>
				) : null}
			</Animated.View>
		</Animated.View>
	);
}
