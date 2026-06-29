import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

import { haptics } from '@/core/lib/haptics';
import { colors, radii, spacing } from '@/core/theme';
import { Text } from '@/core/ui';

const EASE = Easing.out(Easing.cubic);
const SELECT_DURATION = 220;
const PRESS_DURATION = 110;

interface ChipOption<T extends string> {
	label: string;
	value: T;
}

interface ChipSelectorProps<T extends string> {
	options: ChipOption<T>[];
	value: T;
	onChange: (value: T) => void;
}

/** Wrapping row of pill chips; selected = solid ink, unselected = grey. */
export function ChipSelector<T extends string>({
	options,
	value,
	onChange,
}: ChipSelectorProps<T>) {
	return (
		<View
			style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}
		>
			{options.map((opt) => (
				<Chip
					key={opt.value}
					label={opt.label}
					active={opt.value === value}
					onPress={() => {
						if (opt.value !== value) haptics.selection();
						onChange(opt.value);
					}}
				/>
			))}
		</View>
	);
}

interface ChipProps {
	label: string;
	active: boolean;
	onPress: () => void;
}

function Chip({ label, active, onPress }: ChipProps) {
	const press = useSharedValue(1);
	const select = useSharedValue(active ? 1.04 : 1);

	useEffect(() => {
		select.value = withTiming(active ? 1.04 : 1, {
			duration: SELECT_DURATION,
			easing: EASE,
		});
	}, [active, select]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: press.value * select.value }],
	}));

	return (
		<Pressable
			onPressIn={() => {
				press.value = withTiming(0.94, {
					duration: PRESS_DURATION,
					easing: EASE,
				});
			}}
			onPressOut={() => {
				press.value = withTiming(1, {
					duration: PRESS_DURATION,
					easing: EASE,
				});
			}}
			onPress={onPress}
		>
			<Animated.View
				style={[
					{
						paddingHorizontal: spacing.md,
						paddingVertical: spacing.sm,
						borderRadius: radii.pill,
						backgroundColor: active
							? colors.ink
							: colors.surfaceStrong,
					},
					animatedStyle,
				]}
			>
				<Text
					variant='small'
					weight={active ? 'semibold' : 'medium'}
					color={active ? colors.onAccent : colors.ink}
				>
					{label}
				</Text>
			</Animated.View>
		</Pressable>
	);
}
