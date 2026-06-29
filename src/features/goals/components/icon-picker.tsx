import { useEffect } from 'react';
import { Pressable, ScrollView } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

import { haptics } from '@/core/lib/haptics';
import { colors, spacing } from '@/core/theme';
import { Glyph } from '@/core/ui';

const EASE = Easing.out(Easing.cubic);
const SELECT_DURATION = 220;
const PRESS_DURATION = 110;

interface IconPickerProps {
	options: string[];
	value: string;
	onChange: (icon: string) => void;
}

/** Horizontal scroll of circular selectable icon badges (rendered via Glyph). */
export function IconPicker({ options, value, onChange }: IconPickerProps) {
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{
				gap: spacing.sm,
				paddingHorizontal: spacing.xs,
				paddingVertical: spacing.sm,
			}}
		>
			{options.map((icon) => (
				<IconBadgeItem
					key={icon}
					icon={icon}
					active={icon === value}
					onPress={() => {
						if (icon !== value) haptics.selection();
						onChange(icon);
					}}
				/>
			))}
		</ScrollView>
	);
}

interface IconBadgeItemProps {
	icon: string;
	active: boolean;
	onPress: () => void;
}

function IconBadgeItem({ icon, active, onPress }: IconBadgeItemProps) {
	const press = useSharedValue(1);
	const select = useSharedValue(active ? 1.08 : 1);

	useEffect(() => {
		select.value = withTiming(active ? 1.08 : 1, {
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
				press.value = withTiming(0.92, {
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
						width: 48,
						height: 48,
						borderRadius: 24,
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: active
							? colors.ink
							: colors.surfaceStrong,
					},
					animatedStyle,
				]}
			>
				<Glyph
					name={icon}
					size={20}
					color={active ? colors.onAccent : colors.ink}
				/>
			</Animated.View>
		</Pressable>
	);
}
