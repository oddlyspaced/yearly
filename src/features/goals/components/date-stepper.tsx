import { Pressable, View, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { addDays, format, subDays } from 'date-fns';

import { haptics } from '@/core/lib/haptics';
import { fromDateKey, toDateKey, todayKey } from '@/core/domain/period';
import { colors, radii, spacing } from '@/core/theme';
import { Text } from '@/core/ui';

interface DateStepperProps {
	dateKey: string;
	onChange: (key: string) => void;
	style?: ViewStyle;
}

/**
 * Segmented date pill: `‹ Today ›`. Steps day-by-day; can't go past today.
 * Used on the Today screen and the goal detail logger.
 */
export function DateStepper({ dateKey, onChange, style }: DateStepperProps) {
	const date = fromDateKey(dateKey);
	const isToday = dateKey === todayKey();
	const isYesterday = dateKey === toDateKey(subDays(new Date(), 1));
	const label = isToday
		? 'Today'
		: isYesterday
			? 'Yesterday'
			: format(date, 'EEE, MMM d');

	const goPrev = () => {
		haptics.selection();
		onChange(toDateKey(subDays(date, 1)));
	};
	const goNext = () => {
		if (isToday) return;
		haptics.selection();
		onChange(toDateKey(addDays(date, 1)));
	};

	const arrow: ViewStyle = {
		paddingHorizontal: spacing.sm,
		height: 40,
		justifyContent: 'center',
	};

	return (
		<View
			style={[
				{
					flexDirection: 'row',
					alignItems: 'center',
					backgroundColor: colors.surfaceStrong,
					borderRadius: radii.pill,
					paddingHorizontal: 4,
					height: 40,
				},
				style,
			]}
		>
			<Pressable onPress={goPrev} hitSlop={6} style={arrow}>
				<Feather name='chevron-left' size={18} color={colors.ink} />
			</Pressable>
			<Animated.View key={dateKey} entering={FadeIn.duration(200)}>
				<Text
					variant='small'
					weight='bold'
					center
					style={{ minWidth: 76 }}
				>
					{label}
				</Text>
			</Animated.View>
			<Pressable onPress={goNext} hitSlop={6} style={arrow}>
				<Feather
					name='chevron-right'
					size={18}
					color={isToday ? colors.inkGhost : colors.ink}
				/>
			</Pressable>
		</View>
	);
}
