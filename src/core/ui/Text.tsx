import { Text as RNText, TextProps as RNTextProps } from 'react-native';

import { colors, fontFamily, fontSize } from '@/core/theme';

type Variant =
	| 'mega'
	| 'display'
	| 'title'
	| 'heading'
	| 'body'
	| 'label'
	| 'small'
	| 'caption';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

interface TextProps extends RNTextProps {
	variant?: Variant;
	weight?: Weight;
	color?: string;
	muted?: boolean;
	faint?: boolean;
	center?: boolean;
	/** Render in Space Mono (defaults on for the `caption` subheading variant). */
	mono?: boolean;
}

const HEAVY: Weight[] = ['semibold', 'bold', 'extrabold'];

function resolveFamily(weight: Weight, useMono: boolean): string {
	if (useMono) {
		return HEAVY.includes(weight) ? fontFamily.monoBold : fontFamily.mono;
	}
	return fontFamily[weight];
}

const SIZES: Record<Variant, number> = {
	mega: fontSize.mega,
	display: fontSize.display,
	title: fontSize.title,
	heading: fontSize.heading,
	body: fontSize.body,
	label: fontSize.label,
	small: fontSize.small,
	caption: fontSize.caption,
};

const DEFAULT_WEIGHT: Record<Variant, Weight> = {
	mega: 'extrabold',
	display: 'extrabold',
	title: 'bold',
	heading: 'bold',
	body: 'regular',
	label: 'medium',
	small: 'regular',
	caption: 'semibold',
};

const LINE_HEIGHT: Partial<Record<Variant, number>> = {
	mega: 56,
	display: 40,
	title: 34,
	heading: 26,
	body: 22,
	label: 22,
	small: 18,
	caption: 14,
};

export function Text({
	variant = 'body',
	weight,
	color,
	muted,
	faint,
	center,
	mono,
	style,
	...rest
}: TextProps) {
	const w = weight ?? DEFAULT_WEIGHT[variant];
	const useMono = mono ?? variant === 'caption';
	const resolvedColor =
		color ??
		(faint ? colors.inkFaint : muted ? colors.inkMuted : colors.ink);
	return (
		<RNText
			{...rest}
			style={[
				{
					fontFamily: resolveFamily(w, useMono),
					fontSize: SIZES[variant],
					lineHeight: LINE_HEIGHT[variant],
					color: resolvedColor,
					textAlign: center ? 'center' : undefined,
					letterSpacing:
						variant === 'caption'
							? 0.4
							: variant === 'mega' || variant === 'display'
								? -0.5
								: 0,
				},
				style,
			]}
		/>
	);
}
