import { Pressable, PressableProps, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, radii, shadow } from '@/core/theme';

type FeatherIconName = keyof typeof Feather.glyphMap;
type IconButtonVariant = 'plain' | 'outline' | 'filled';

interface IconButtonProps extends Omit<PressableProps, 'style'> {
	name: FeatherIconName;
	size?: number;
	color?: string;
	/** plain = no chrome, outline = bordered square, filled = ink square. */
	variant?: IconButtonVariant;
	/** Back-compat alias for variant='filled'. */
	filled?: boolean;
	style?: ViewStyle;
}

export function IconButton({
	name,
	size = 22,
	color,
	variant = 'plain',
	filled,
	style,
	...rest
}: IconButtonProps) {
	const resolved: IconButtonVariant = filled ? 'filled' : variant;
	const fg = color ?? (resolved === 'filled' ? colors.onAccent : colors.ink);
	return (
		<Pressable
			hitSlop={8}
			style={({ pressed }) => [
				{
					width: 44,
					height: 44,
					borderRadius: radii.lg,
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor:
						resolved === 'filled' ? colors.accent : colors.surface,
					borderWidth: resolved === 'outline' ? 1 : 0,
					borderColor: colors.lineStrong,
					opacity: pressed ? 0.7 : 1,
					transform: [{ scale: pressed ? 0.9 : 1 }],
				},
				resolved !== 'plain' ? shadow.card : null,
				style,
			]}
			{...rest}
		>
			<Feather name={name} size={size} color={fg} />
		</Pressable>
	);
}
