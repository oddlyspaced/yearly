import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, {
	Easing,
	FadeIn,
	FadeOut,
	LinearTransition,
} from 'react-native-reanimated';
import DateTimePicker, {
	DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';

import { GoalType, Reminder } from '@/core/domain/types';
import { haptics } from '@/core/lib/haptics';
import { colors, radii, spacing } from '@/core/theme';
import { Button, Text } from '@/core/ui';

interface RemindersFieldProps {
	value: Reminder[];
	onChange: (reminders: Reminder[]) => void;
	goalName: string;
	goalType: GoalType;
}

const pad = (n: number): string => String(n).padStart(2, '0');
const formatTime = (r: Reminder): string => `${pad(r.hour)}:${pad(r.minute)}`;
const keyOf = (r: Reminder): number => r.hour * 60 + r.minute;

function defaultPickerDate(): Date {
	const d = new Date();
	d.setHours(9, 0, 0, 0);
	return d;
}

export function RemindersField({
	value,
	onChange,
	goalName,
	goalType,
}: RemindersFieldProps) {
	const [picking, setPicking] = useState(false);
	const [temp, setTemp] = useState<Date>(defaultPickerDate);

	const sorted = [...value].sort((a, b) => keyOf(a) - keyOf(b));

	const message =
		goalType === 'checkbox'
			? `Time to check off ${goalName}`
			: `Time to log your ${goalName}`;

	const commit = (date: Date) => {
		const next: Reminder = {
			hour: date.getHours(),
			minute: date.getMinutes(),
		};
		if (value.some((r) => keyOf(r) === keyOf(next))) return; // de-dupe
		haptics.selection();
		onChange([...value, next].sort((a, b) => keyOf(a) - keyOf(b)));
	};

	const remove = (r: Reminder) => {
		haptics.light();
		onChange(value.filter((x) => keyOf(x) !== keyOf(r)));
	};

	const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
		if (Platform.OS === 'android') {
			setPicking(false);
			if (event.type === 'set' && date) commit(date);
		} else if (date) {
			setTemp(date);
		}
	};

	return (
		<View style={{ gap: spacing.md }}>
			<Text variant='caption' faint>
				{value.length > 0
					? `Sends “${message}” at each time.`
					: 'Add a time to get a daily notification.'}
			</Text>
			<View
				style={{
					flexDirection: 'row',
					flexWrap: 'wrap',
					gap: spacing.sm,
				}}
			>
				{sorted.map((r) => (
					<Animated.View
						key={keyOf(r)}
						entering={FadeIn.duration(180)}
						exiting={FadeOut.duration(140)}
						layout={LinearTransition.duration(200).easing(
							Easing.out(Easing.cubic),
						)}
					>
						<Pressable
							onPress={() => remove(r)}
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								gap: spacing.xs,
								paddingLeft: spacing.md,
								paddingRight: spacing.sm,
								paddingVertical: spacing.sm,
								borderRadius: radii.pill,
								backgroundColor: colors.surfaceStrong,
							}}
						>
							<Text variant='small' weight='bold' mono>
								{formatTime(r)}
							</Text>
							<Feather
								name='x'
								size={13}
								color={colors.inkMuted}
							/>
						</Pressable>
					</Animated.View>
				))}

				{!picking ? (
					<Pressable
						onPress={() => {
							haptics.selection();
							setTemp(defaultPickerDate());
							setPicking(true);
						}}
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: spacing.xs,
							paddingHorizontal: spacing.md,
							paddingVertical: spacing.sm,
							borderRadius: radii.pill,
							borderWidth: 1,
							borderColor: colors.lineStrong,
						}}
					>
						<Feather name='plus' size={14} color={colors.ink} />
						<Text variant='small' weight='semibold'>
							Add reminder
						</Text>
					</Pressable>
				) : null}
			</View>

			{picking ? (
				<Animated.View
					entering={FadeIn.duration(180)}
					style={{ alignItems: 'center', gap: spacing.sm }}
				>
					<DateTimePicker
						value={temp}
						mode='time'
						display={Platform.OS === 'ios' ? 'spinner' : 'default'}
						onChange={onPickerChange}
					/>
					{Platform.OS === 'ios' ? (
						<View style={{ flexDirection: 'row', gap: spacing.sm }}>
							<Button
								label='Cancel'
								variant='secondary'
								size='md'
								onPress={() => setPicking(false)}
								style={{ flex: 1 }}
							/>
							<Button
								label='Add time'
								size='md'
								onPress={() => {
									commit(temp);
									setPicking(false);
								}}
								style={{ flex: 1 }}
							/>
						</View>
					) : null}
				</Animated.View>
			) : null}
		</View>
	);
}
