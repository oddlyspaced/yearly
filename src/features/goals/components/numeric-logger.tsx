import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { IconButton, Text } from '@/core/ui';
import { formatCount, formatTargetLine, quickStep } from '@/core/domain/format';
import { todayKey } from '@/core/domain/period';
import { Entry, Goal } from '@/core/domain/types';
import { useStore } from '@/core/store/useStore';
import { haptics } from '@/core/lib/haptics';
import { colors, fontFamily, fontSize, radii, spacing } from '@/core/theme';

interface NumericLoggerProps {
	goal: Goal;
	todayEntry?: Entry;
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
		haptics.light();
		const next = Math.max(0, value + delta);
		setValue(goal.id, todayKey(), next > 0 ? next : null);
	};

	const stepStyle = {
		width: 60,
		height: 60,
		borderRadius: radii.pill,
		backgroundColor: colors.surfaceStrong,
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
				<IconButton
					name='minus'
					size={24}
					onPress={() => bump(-step)}
					disabled={value <= 0}
					style={{
						...stepStyle,
						opacity: value <= 0 ? 0.4 : 1,
					}}
				/>

				<Pressable
					onPress={() => setEditing(true)}
					style={{
						flex: 1,
						alignItems: 'center',
						justifyContent: 'center',
						minHeight: 72,
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
								fontFamily: fontFamily.monoBold,
								fontSize: fontSize.mega,
								lineHeight: 58,
								letterSpacing: -0.5,
								color: colors.ink,
								textAlign: 'center',
								minWidth: 120,
								padding: 0,
							}}
						/>
					) : (
						<Text
							variant='mega'
							mono
							weight='extrabold'
							color={value > 0 ? colors.ink : colors.inkGhost}
							style={{ minWidth: 120, textAlign: 'center' }}
						>
							{formatCount(value)}
						</Text>
					)}
				</Pressable>

				<IconButton
					name='plus'
					size={24}
					onPress={() => bump(step)}
					style={stepStyle}
				/>
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

			<Text
				variant='small'
				muted
				center
				style={{ marginTop: spacing.md }}
			>
				{formatTargetLine(goal)}
			</Text>
		</View>
	);
}
