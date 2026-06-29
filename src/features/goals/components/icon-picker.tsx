import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
	Easing,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import Svg, {
	Defs,
	LinearGradient as SvgGradient,
	Rect,
	Stop,
} from 'react-native-svg';

import { haptics } from '@/core/lib/haptics';
import { colors, spacing } from '@/core/theme';
import { Glyph } from '@/core/ui';

const EASE = Easing.out(Easing.cubic);
const SELECT_DURATION = 220;
const PRESS_DURATION = 110;
const FADE_W = 44;
const ROW_H = 64; // 48 badge + 8 vertical padding each side

const AnimatedScrollView = Animated.ScrollView;

interface EdgeFadeProps {
	side: 'left' | 'right';
	opacity: Record<string, unknown>;
}

/** Fades the canvas over a scroll edge that still has hidden icons. */
function EdgeFade({ side, opacity }: EdgeFadeProps) {
	const fromLeft = side === 'left';
	return (
		<Animated.View
			pointerEvents='none'
			style={[
				{
					position: 'absolute',
					top: 0,
					height: ROW_H,
					width: FADE_W,
					[side]: 0,
				},
				opacity,
			]}
		>
			<Svg width={FADE_W} height={ROW_H}>
				<Defs>
					<SvgGradient
						id={`icon-fade-${side}`}
						x1='0'
						y1='0'
						x2='1'
						y2='0'
					>
						<Stop
							offset='0'
							stopColor={colors.bg}
							stopOpacity={fromLeft ? 1 : 0}
						/>
						<Stop
							offset='1'
							stopColor={colors.bg}
							stopOpacity={fromLeft ? 0 : 1}
						/>
					</SvgGradient>
				</Defs>
				<Rect
					width={FADE_W}
					height={ROW_H}
					fill={`url(#icon-fade-${side})`}
				/>
			</Svg>
		</Animated.View>
	);
}

interface IconPickerProps {
	options: string[];
	value: string;
	onChange: (icon: string) => void;
}

/** Horizontal scroll of circular selectable icon badges with edge fades. */
export function IconPicker({ options, value, onChange }: IconPickerProps) {
	const leftOp = useSharedValue(0);
	const rightOp = useSharedValue(1);
	const layoutW = useSharedValue(0);
	const contentW = useSharedValue(0);

	const onScroll = useAnimatedScrollHandler((e) => {
		const x = e.contentOffset.x;
		const maxX = Math.max(0, contentW.value - layoutW.value);
		leftOp.value = withTiming(x > 4 ? 1 : 0, { duration: 160 });
		rightOp.value = withTiming(x < maxX - 4 ? 1 : 0, { duration: 160 });
	});

	const leftStyle = useAnimatedStyle(() => ({ opacity: leftOp.value }));
	const rightStyle = useAnimatedStyle(() => ({ opacity: rightOp.value }));

	return (
		<View
			style={{ position: 'relative' }}
			onLayout={(e) => {
				layoutW.value = e.nativeEvent.layout.width;
			}}
		>
			<AnimatedScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				onScroll={onScroll}
				scrollEventThrottle={16}
				onContentSizeChange={(w) => {
					contentW.value = w;
				}}
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
			</AnimatedScrollView>
			<EdgeFade side='left' opacity={leftStyle} />
			<EdgeFade side='right' opacity={rightStyle} />
		</View>
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
