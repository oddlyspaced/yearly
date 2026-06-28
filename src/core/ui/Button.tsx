import { ReactNode } from 'react';
import {
	ActivityIndicator,
	Pressable,
	PressableProps,
	Text as RNText,
	View,
	ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import {
	colors,
	fontFamily,
	fontSize,
	radii,
	shadow,
	spacing,
} from '@/core/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
	label: string;
	variant?: Variant;
	size?: Size;
	loading?: boolean;
	/** Feather icon shown before the label. */
	icon?: keyof typeof Feather.glyphMap;
	/** Fully rounded pill shape. */
	pill?: boolean;
	style?: ViewStyle;
}

export function Button({
	label,
	variant = 'primary',
	size = 'lg',
	loading,
	disabled,
	icon,
	pill,
	style,
	...rest
}: ButtonProps) {
	const isSolid = variant === 'primary' || variant === 'destructive';
	const bg =
		variant === 'primary'
			? colors.accent
			: variant === 'destructive'
				? '#B42318'
				: variant === 'secondary'
					? colors.surfaceStrong
					: 'transparent';
	const fg = isSolid ? colors.onAccent : colors.ink;
	const height = size === 'lg' ? 56 : 46;

	return (
		<Pressable
			disabled={disabled || loading}
			style={({ pressed }) => [
				{
					height,
					borderRadius: pill ? radii.pill : radii.lg,
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'row',
					gap: spacing.sm,
					backgroundColor: bg,
					opacity: disabled ? 0.4 : pressed ? 0.88 : 1,
					paddingHorizontal: spacing.xl,
				},
				isSolid && !disabled ? shadow.card : null,
				style,
			]}
			{...rest}
		>
			{loading ? (
				<ActivityIndicator color={fg} />
			) : (
				<ButtonInner icon={icon} fg={fg}>
					{label}
				</ButtonInner>
			)}
		</Pressable>
	);
}

function ButtonInner({
	children,
	icon,
	fg,
}: {
	children: string;
	icon?: keyof typeof Feather.glyphMap;
	fg: string;
}): ReactNode {
	return (
		<View
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				gap: spacing.sm,
			}}
		>
			{icon ? <Feather name={icon} size={18} color={fg} /> : null}
			<RNText
				style={{
					fontFamily: fontFamily.bold,
					fontSize: fontSize.label,
					color: fg,
				}}
			>
				{children}
			</RNText>
		</View>
	);
}
