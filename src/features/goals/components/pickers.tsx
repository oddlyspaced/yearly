import { useEffect } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

import { colors, radii, spacing } from '@/core/theme';
import { haptics } from '@/core/lib/haptics';
import { Glyph, Text } from '@/core/ui';

const EASE = Easing.out(Easing.cubic);
const SELECT_DURATION = 220;
const PRESS_DURATION = 110;

// ── ChipSelector ──────────────────────────────────────────────────────────────

interface ChipSelectorProps<T extends string> {
	options: { label: string; value: T }[];
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

function Chip({
	label,
	active,
	onPress,
}: {
	label: string;
	active: boolean;
	onPress: () => void;
}) {
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

// ── IconPicker ────────────────────────────────────────────────────────────────

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

function IconBadgeItem({
	icon,
	active,
	onPress,
}: {
	icon: string;
	active: boolean;
	onPress: () => void;
}) {
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

// ── ColorPicker ───────────────────────────────────────────────────────────────

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

function Swatch({
	color,
	active,
	onPress,
}: {
	color: string;
	active: boolean;
	onPress: () => void;
}) {
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
