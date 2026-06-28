import { useMemo, useState } from 'react';
import { LayoutAnimation, Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

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
} from '@/domain/types';
import { colors, radii, spacing } from '@/theme';
import { Button, Divider, SegmentedControl, Text } from '@/components/ui';
import { ChipSelector, ColorPicker, IconPicker } from '@/components/pickers';
import { Field, Input } from '@/components/ui-input';

interface GoalFormProps {
	initial?: Partial<NewGoal>;
	submitLabel: string;
	onSubmit: (goal: NewGoal, typeChanged: boolean) => void;
	onDelete?: () => void;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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

	const toggleAdvanced = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setAdvanced((a) => !a);
	};

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
		<View style={{ gap: spacing.xl }}>
			{/* Name */}
			<Input
				bare
				value={name}
				onChangeText={setName}
				placeholder='Goal name'
				autoFocus={initialType == null}
				returnKeyType='done'
			/>

			<Divider />

			{/* Type */}
			<Field label='Type'>
				<SegmentedControl<GoalType>
					options={[
						{ label: 'Checkbox', value: 'checkbox' },
						{ label: 'Numeric', value: 'numeric' },
					]}
					value={type}
					onChange={onTypeChange}
				/>
			</Field>

			{/* Numeric: unit + target */}
			{type === 'numeric' ? (
				<View style={{ flexDirection: 'row', gap: spacing.base }}>
					<Field label='Unit' style={{ flex: 1.4 }}>
						<Input
							value={unit}
							onChangeText={setUnit}
							placeholder='steps, ml, pages…'
							autoCapitalize='none'
						/>
					</Field>
					<Field label='Target' style={{ flex: 1 }}>
						<Input
							value={target}
							onChangeText={setTarget}
							placeholder='Optional'
							keyboardType='numeric'
						/>
					</Field>
				</View>
			) : checkboxHasTarget ? (
				<Field
					label='Target'
					hint={`How many times per ${PERIOD_SUFFIX[period]}`}
				>
					<Input
						value={target}
						onChangeText={setTarget}
						placeholder='1'
						keyboardType='numeric'
					/>
				</Field>
			) : null}

			{/* Period */}
			<Field label='Period'>
				<ChipSelector<Period>
					options={PERIODS.map((p) => ({
						label: PERIOD_LABELS[p],
						value: p,
					}))}
					value={period}
					onChange={setPeriod}
				/>
			</Field>

			{/* Icon */}
			<Field label='Icon'>
				<IconPicker
					options={GOAL_ICONS}
					value={icon}
					onChange={setIcon}
				/>
			</Field>

			{/* Color */}
			<Field label='Color'>
				<ColorPicker
					options={GOAL_COLORS}
					value={color}
					onChange={setColor}
				/>
			</Field>

			<Divider />

			{/* Advanced */}
			<View style={{ gap: advanced ? spacing.xl : 0 }}>
				<Pressable
					onPress={toggleAdvanced}
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
						paddingVertical: spacing.xs,
					}}
				>
					<View style={{ gap: 2 }}>
						<Text variant='label' weight='semibold'>
							Advanced
						</Text>
						<Text variant='caption' faint>
							{summary}
						</Text>
					</View>
					<Feather
						name={advanced ? 'chevron-up' : 'chevron-down'}
						size={20}
						color={colors.inkFaint}
					/>
				</Pressable>

				{advanced ? (
					<View style={{ gap: spacing.xl }}>
						{type === 'numeric' ? (
							<>
								<Field
									label='Aggregation'
									hint='How daily entries combine over the period — e.g. average is the mean across the period.'
								>
									<ChipSelector<Aggregation>
										options={NUMERIC_AGGREGATIONS.map(
											(a) => ({
												label: AGGREGATION_LABELS[a],
												value: a,
											}),
										)}
										value={aggregation}
										onChange={setAggregation}
									/>
								</Field>

								<Field label='Comparator'>
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
								</Field>
							</>
						) : (
							<Text variant='small' muted>
								{cap(summary)}
							</Text>
						)}

						<View
							style={{
								backgroundColor: colors.surface,
								borderRadius: radii.md,
								borderWidth: 1,
								borderColor: colors.line,
								padding: spacing.base,
							}}
						>
							<Text
								variant='caption'
								muted
								style={{ textTransform: 'uppercase' }}
							>
								Rule
							</Text>
							<Text
								variant='body'
								weight='medium'
								style={{ marginTop: 2 }}
							>
								{summary}
							</Text>
						</View>
					</View>
				) : null}
			</View>

			<Divider />

			{/* Actions */}
			<View style={{ gap: spacing.md }}>
				<Button
					label={submitLabel}
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
			</View>
		</View>
	);
}
