import { View, ViewStyle } from 'react-native';

import { colors } from '@/core/theme';
import { Glyph } from '@/core/ui/Glyph';

interface IconBadgeProps {
	name: string;
	size?: number;
	iconSize?: number;
	color?: string;
	background?: string;
	style?: ViewStyle;
}

/** Circular icon container used for goals and stats. */
export function IconBadge({
	name,
	size = 40,
	iconSize,
	color = colors.ink,
	background = colors.surfaceStrong,
	style,
}: IconBadgeProps) {
	return (
		<View
			style={[
				{
					width: size,
					height: size,
					borderRadius: size / 2,
					backgroundColor: background,
					alignItems: 'center',
					justifyContent: 'center',
				},
				style,
			]}
		>
			<Glyph name={name} size={iconSize ?? size * 0.46} color={color} />
		</View>
	);
}
