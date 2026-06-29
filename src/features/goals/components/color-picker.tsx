import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

import { haptics } from '@/core/lib/haptics';
import { colors, spacing } from '@/core/theme';

const EASE = Easing.out(Easing.cubic);
const SELECT_DURATION = 220;
const PRESS_DURATION = 110;

interface ColorPickerProps {
	options: string[];
	value: string;
	onChange: (color: string) => void;
}

/** Wrapping row of color swatches; selected gets an animated ring. */
export function ColorPicker({ options, value, onChange }: ColorPickerProps) {
	return (
		<View
			style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' }}
		>
			{options.map((color) => (
				<Swatch
					key={color}
					color={color}
					active={color === value}
					onPress={() => {
						if (color !== value) haptics.selection();
						onChange(color);
					}}
				/>
			))}
		</View>
	);
}

interface SwatchProps {
	color: string;
	active: boolean;
	onPress: () => void;
}

function Swatch({ color, active, onPress }: SwatchProps) {
	const press = useSharedValue(1);
	const select = useSharedValue(active ? 1 : 0);

	useEffect(() => {
		select.value = withTiming(active ? 1 : 0, {
			duration: SELECT_DURATION,
			easing: EASE,
		});
	}, [active, select]);

	const containerStyle = useAnimatedStyle(() => ({
		transform: [{ scale: press.value }],
	}));

	const ringStyle = useAnimatedStyle(() => ({
		opacity: select.value,
		transform: [{ scale: 0.7 + select.value * 0.3 }],
	}));

	return (
		<Pressable
			onPressIn={() => {
				press.value = withTiming(0.9, {
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
						width: 40,
						height: 40,
						borderRadius: 20,
						alignItems: 'center',
						justifyContent: 'center',
					},
					containerStyle,
				]}
			>
				<Animated.View
					pointerEvents='none'
					style={[
						{
							position: 'absolute',
							width: 40,
							height: 40,
							borderRadius: 20,
							borderWidth: 2,
							borderColor: colors.ink,
						},
						ringStyle,
					]}
				/>
				<View
					style={{
						width: 28,
						height: 28,
						borderRadius: 14,
						backgroundColor: color,
					}}
				/>
			</Animated.View>
		</Pressable>
	);
}
