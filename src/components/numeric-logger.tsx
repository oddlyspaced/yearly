import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { formatPrecise, formatTargetLine, quickStep } from '@/domain/format';
import { todayKey } from '@/domain/period';
import { Entry, Goal } from '@/domain/types';
import { useStore } from '@/store/useStore';
import { colors, fontFamily, radii, spacing } from '@/theme';

interface NumericLoggerProps {
	goal: Goal;
	todayEntry?: Entry;
}

function StepButton({
	name,
	onPress,
	disabled,
}: {
	name: 'minus' | 'plus';
	onPress: () => void;
	disabled?: boolean;
}) {
	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			hitSlop={8}
			style={({ pressed }) => ({
				width: 64,
				height: 64,
				borderRadius: radii.pill,
				alignItems: 'center',
				justifyContent: 'center',
				borderWidth: 1,
				borderColor: colors.lineStrong,
				backgroundColor: colors.bg,
				opacity: disabled ? 0.3 : pressed ? 0.55 : 1,
			})}
		>
			<Feather name={name} size={26} color={colors.ink} />
		</Pressable>
	);
}

export function NumericLogger({ goal, todayEntry }: NumericLoggerProps) {
	const setValue = useStore((s) => s.setValue);
	const value = todayEntry?.state === 'logged' ? todayEntry.value : 0;

	const step = quickStep(goal);
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState('');
	const inputRef = useRef<TextInput>(null);

	useEffect(() => {
		if (editing) {
			setDraft(value > 0 ? String(value) : '');
			const t = setTimeout(() => inputRef.current?.focus(), 30);
			return () => clearTimeout(t);
		}
	}, [editing]);

	const commit = () => {
		const n = parseFloat(draft.replace(/,/g, ''));
		setValue(goal.id, todayKey(), isFinite(n) ? n : null);
		setEditing(false);
	};

	const bump = (delta: number) => {
		const next = Math.max(0, value + delta);
		setValue(goal.id, todayKey(), next > 0 ? next : null);
	};

	return (
		<View style={{ alignItems: 'center' }}>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
					gap: spacing.lg,
					width: '100%',
				}}
			>
				<StepButton
					name='minus'
					onPress={() => bump(-step)}
					disabled={value <= 0}
				/>

				<Pressable
					onPress={() => setEditing(true)}
					style={{
						flex: 1,
						alignItems: 'center',
						justifyContent: 'center',
						minHeight: 92,
					}}
				>
					{editing ? (
						<TextInput
							ref={inputRef}
							value={draft}
							onChangeText={setDraft}
							onSubmitEditing={commit}
							onBlur={commit}
							keyboardType='numeric'
							returnKeyType='done'
							selectTextOnFocus
							placeholder='0'
							placeholderTextColor={colors.inkGhost}
							style={{
								fontFamily: fontFamily.bold,
								fontSize: 72,
								lineHeight: 80,
								color: colors.ink,
								textAlign: 'center',
								minWidth: 120,
								padding: 0,
							}}
						/>
					) : (
						<Text
							weight='bold'
							style={{
								fontSize: 72,
								lineHeight: 80,
								color: value > 0 ? colors.ink : colors.inkGhost,
							}}
						>
							{formatPrecise(value)}
						</Text>
					)}
				</Pressable>

				<StepButton name='plus' onPress={() => bump(step)} />
			</View>

			{goal.unit ? (
				<Text
					variant='label'
					muted
					weight='medium'
					style={{ marginTop: spacing.xs }}
				>
					{goal.unit}
				</Text>
			) : null}

			<Text variant='small' faint style={{ marginTop: spacing.md }}>
				{formatTargetLine(goal)}
			</Text>
		</View>
	);
}
