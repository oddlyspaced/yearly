import { useEffect } from 'react';
import { TextInput, TextStyle } from 'react-native';
import Animated, {
	Easing,
	useAnimatedProps,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

import { colors, fontFamily, fontSize } from '@/core/theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedNumberProps {
	value: number;
	/** Compact K formatting (10500 → 10.5K). */
	compact?: boolean;
	size?: number;
	weight?: keyof typeof fontFamily;
	color?: string;
	suffix?: string;
	style?: TextStyle;
}

/**
 * A number that smoothly counts to its new value when it changes — used for
 * the +/- steppers so the displayed value animates instead of snapping.
 */
export function AnimatedNumber({
	value,
	compact = false,
	size = fontSize.body,
	weight = 'bold',
	color = colors.ink,
	suffix = '',
	style,
}: AnimatedNumberProps) {
	const v = useSharedValue(value);

	useEffect(() => {
		v.value = withTiming(value, {
			duration: 280,
			easing: Easing.out(Easing.cubic),
		});
	}, [value, v]);

	const animatedProps = useAnimatedProps(() => {
		const n = v.value;
		let text: string;
		if (compact && Math.abs(n) >= 1000) {
			const k = n / 1000;
			const r = Math.round(k * 10) / 10;
			text = (r % 1 === 0 ? String(Math.round(r)) : r.toFixed(1)) + 'K';
		} else {
			// Group with commas (worklet-safe).
			const sign = n < 0 ? '-' : '';
			const digits = String(Math.abs(Math.round(n)));
			let grouped = '';
			for (let i = 0; i < digits.length; i++) {
				if (i > 0 && (digits.length - i) % 3 === 0) grouped += ',';
				grouped += digits[i];
			}
			text = sign + grouped;
		}
		return { text: text + suffix } as never;
	});

	const heavy =
		weight === 'bold' || weight === 'extrabold' || weight === 'semibold';
	return (
		<AnimatedTextInput
			editable={false}
			pointerEvents='none'
			underlineColorAndroid='transparent'
			defaultValue={String(Math.round(value)) + suffix}
			animatedProps={animatedProps}
			style={[
				{
					padding: 0,
					margin: 0,
					fontFamily: heavy ? fontFamily.monoBold : fontFamily.mono,
					fontSize: size,
					lineHeight: Math.round(size * 1.18),
					color,
					textAlign: 'center',
					includeFontPadding: false,
				} as TextStyle,
				style,
			]}
		/>
	);
}
