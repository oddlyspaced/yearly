import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
	useAnimatedProps,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/core/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
	/** 0..1 */
	progress: number;
	size?: number;
	stroke?: number;
	/** When true, a fully-complete ring renders as a solid filled disc. */
	fillWhenComplete?: boolean;
	color?: string;
	trackColor?: string;
	children?: React.ReactNode;
}

/**
 * Minimal monochrome progress ring with an animated sweep. At 100% (with
 * `fillWhenComplete`) it becomes a solid disc to read as "done" at a glance.
 */
export function ProgressRing({
	progress,
	size = 44,
	stroke = 3,
	fillWhenComplete = false,
	color = colors.ink,
	trackColor = colors.lineStrong,
	children,
}: ProgressRingProps) {
	const p = Math.max(0, Math.min(1, progress));
	const complete = p >= 1;
	const r = (size - stroke) / 2;
	const c = 2 * Math.PI * r;
	const center = size / 2;

	const sv = useSharedValue(p);
	useEffect(() => {
		sv.value = withTiming(p, { duration: 420 });
	}, [p, sv]);

	const animatedProps = useAnimatedProps(() => ({
		strokeDashoffset: c * (1 - sv.value),
	}));

	if (complete && fillWhenComplete) {
		return (
			<View
				style={{
					width: size,
					height: size,
					borderRadius: size / 2,
					backgroundColor: color,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{children}
			</View>
		);
	}

	return (
		<View style={{ width: size, height: size }}>
			<Svg width={size} height={size}>
				<Circle
					cx={center}
					cy={center}
					r={r}
					stroke={trackColor}
					strokeWidth={stroke}
					fill='none'
				/>
				<AnimatedCircle
					cx={center}
					cy={center}
					r={r}
					stroke={color}
					strokeWidth={stroke}
					fill='none'
					strokeLinecap='round'
					strokeDasharray={c}
					animatedProps={animatedProps}
					transform={`rotate(-90 ${center} ${center})`}
				/>
			</Svg>
			{children ? (
				<View
					style={{
						position: 'absolute',
						width: size,
						height: size,
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{children}
				</View>
			) : null}
		</View>
	);
}
