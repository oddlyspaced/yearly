import {
	ActivityIndicator,
	Pressable,
	PressableProps,
	View,
	ViewStyle,
} from 'react-native';

import { colors, fontFamily, fontSize, radii, spacing } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface ButtonProps extends Omit<PressableProps, 'style'> {
	label: string;
	variant?: Variant;
	loading?: boolean;
	style?: ViewStyle;
}

export function Button({
	label,
	variant = 'primary',
	loading,
	disabled,
	style,
	...rest
}: ButtonProps) {
	const isPrimary = variant === 'primary' || variant === 'destructive';
	const bg =
		variant === 'primary'
			? colors.accent
			: variant === 'destructive'
				? '#B42318'
				: variant === 'secondary'
					? colors.surfaceStrong
					: 'transparent';
	const fg = isPrimary ? colors.onAccent : colors.ink;

	return (
		<Pressable
			disabled={disabled || loading}
			style={({ pressed }) => [
				{
					height: 54,
					borderRadius: radii.lg,
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'row',
					gap: spacing.sm,
					backgroundColor: bg,
					opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
					paddingHorizontal: spacing.lg,
				},
				style,
			]}
			{...rest}
		>
			{loading ? (
				<ActivityIndicator color={fg} />
			) : (
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						gap: spacing.sm,
					}}
				>
					<RNButtonLabel color={fg}>{label}</RNButtonLabel>
				</View>
			)}
		</Pressable>
	);
}

import { Text as RNText } from 'react-native';
function RNButtonLabel({
	children,
	color,
}: {
	children: string;
	color: string;
}) {
	return (
		<RNText
			style={{
				fontFamily: fontFamily.semibold,
				fontSize: fontSize.label,
				color,
			}}
		>
			{children}
		</RNText>
	);
}
