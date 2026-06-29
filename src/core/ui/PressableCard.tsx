import { ReactNode } from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';

import { colors, radii, shadow } from '@/core/theme';

interface PressableCardProps extends Omit<PressableProps, 'style'> {
	style?: ViewStyle;
	flat?: boolean;
	children: ReactNode;
}

/** Card with press feedback (scale + dim). */
export function PressableCard({
	style,
	flat,
	children,
	...rest
}: PressableCardProps) {
	return (
		<Pressable
			{...rest}
			style={({ pressed }) => [
				{
					backgroundColor: colors.surface,
					borderRadius: radii.card,
					opacity: pressed ? 0.96 : 1,
					transform: [{ scale: pressed ? 0.99 : 1 }],
				},
				flat ? null : shadow.card,
				style,
			]}
		>
			{children}
		</Pressable>
	);
}
