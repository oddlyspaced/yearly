import { useEffect, useState } from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

import { haptics } from '@/core/lib/haptics';
import { colors, radii, shadow } from '@/core/theme';
import { Text } from '@/core/ui/Text';

const TIMING = { duration: 220, easing: Easing.out(Easing.cubic) };

interface SegmentedOption<T extends string> {
	label: string;
	value: T;
}

interface SegmentedControlProps<T extends string> {
	options: SegmentedOption<T>[];
	value: T;
	onChange: (value: T) => void;
	style?: ViewStyle;
}

/** Pill segmented control with an animated sliding indicator. */
export function SegmentedControl<T extends string>({
	options,
	value,
	onChange,
	style,
}: SegmentedControlProps<T>) {
	const [width, setWidth] = useState(0);
	const segWidth = width > 0 ? (width - 8) / options.length : 0;
	const index = Math.max(
		0,
		options.findIndex((o) => o.value === value),
	);

	const x = useSharedValue(0);
	useEffect(() => {
		x.value = withTiming(index * segWidth, TIMING);
	}, [index, segWidth, x]);
	const indicatorStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: x.value }],
	}));

	return (
		<View
			onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
			style={[
				{
					flexDirection: 'row',
					backgroundColor: colors.surfaceStrong,
					borderRadius: radii.pill,
					padding: 4,
				},
				style,
			]}
		>
			{segWidth > 0 ? (
				<Animated.View
					style={[
						{
							position: 'absolute',
							left: 4,
							top: 4,
							height: 38,
							width: segWidth,
							borderRadius: radii.pill,
							backgroundColor: colors.surface,
						},
						shadow.card,
						indicatorStyle,
					]}
				/>
			) : null}
			{options.map((opt) => {
				const active = opt.value === value;
				return (
					<Pressable
						key={opt.value}
						onPress={() => {
							if (opt.value !== value) haptics.selection();
							onChange(opt.value);
						}}
						style={{
							flex: 1,
							height: 38,
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Text
							variant='small'
							weight={active ? 'bold' : 'medium'}
							color={active ? colors.ink : colors.inkMuted}
						>
							{opt.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}
