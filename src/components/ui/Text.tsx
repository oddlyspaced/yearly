import { Text as RNText, TextProps as RNTextProps } from 'react-native';

import { colors, fontFamily, fontSize } from '@/theme';

type Variant =
	'display' | 'title' | 'heading' | 'body' | 'label' | 'small' | 'caption';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

interface TextProps extends RNTextProps {
	variant?: Variant;
	weight?: Weight;
	color?: string;
	muted?: boolean;
	faint?: boolean;
	center?: boolean;
}

const SIZES: Record<Variant, number> = {
	display: fontSize.display,
	title: fontSize.title,
	heading: fontSize.heading,
	body: fontSize.body,
	label: fontSize.label,
	small: fontSize.small,
	caption: fontSize.caption,
};

const DEFAULT_WEIGHT: Record<Variant, Weight> = {
	display: 'bold',
	title: 'bold',
	heading: 'semibold',
	body: 'regular',
	label: 'medium',
	small: 'regular',
	caption: 'medium',
};

const LINE_HEIGHT: Partial<Record<Variant, number>> = {
	display: 40,
	title: 32,
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
	style,
	...rest
}: TextProps) {
	const w = weight ?? DEFAULT_WEIGHT[variant];
	const resolvedColor =
		color ??
		(faint ? colors.inkFaint : muted ? colors.inkMuted : colors.ink);
	return (
		<RNText
			{...rest}
			style={[
				{
					fontFamily: fontFamily[w],
					fontSize: SIZES[variant],
					lineHeight: LINE_HEIGHT[variant],
					color: resolvedColor,
					textAlign: center ? 'center' : undefined,
					letterSpacing: variant === 'caption' ? 0.3 : 0,
				},
				style,
			]}
		/>
	);
}
