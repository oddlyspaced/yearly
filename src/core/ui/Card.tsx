import { View, ViewProps } from 'react-native';

import { colors, radii, shadow, spacing } from '@/core/theme';

interface CardProps extends ViewProps {
	padded?: boolean;
	/** Drop the soft shadow (e.g. for nested/inset cards). */
	flat?: boolean;
}

/** White rounded surface that floats on the grey canvas. */
export function Card({ padded = true, flat, style, ...rest }: CardProps) {
	return (
		<View
			{...rest}
			style={[
				{
					backgroundColor: colors.surface,
					borderRadius: radii.card,
					padding: padded ? spacing.lg : 0,
				},
				flat ? null : shadow.card,
				style,
			]}
		/>
	);
}
