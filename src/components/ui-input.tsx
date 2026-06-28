import { ReactNode, forwardRef } from 'react';
import {
	TextInput,
	TextInputProps,
	TextStyle,
	View,
	ViewStyle,
} from 'react-native';

import { colors, fontFamily, fontSize, radii, spacing } from '@/theme';
import { Text } from '@/components/ui';

interface InputProps extends Omit<TextInputProps, 'style'> {
	/** Larger, borderless title-style input (used for the goal name). */
	bare?: boolean;
	style?: TextStyle;
}

/**
 * Inter-styled TextInput matching the Kaizen surfaces. The foundation ships no
 * Input, so this lives in the form module.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
	{ bare, style, ...rest },
	ref,
) {
	if (bare) {
		return (
			<TextInput
				ref={ref}
				placeholderTextColor={colors.inkGhost}
				selectionColor={colors.ink}
				style={[
					{
						fontFamily: fontFamily.semibold,
						fontSize: fontSize.title,
						lineHeight: 32,
						color: colors.ink,
						paddingVertical: spacing.xs,
					},
					style,
				]}
				{...rest}
			/>
		);
	}

	return (
		<TextInput
			ref={ref}
			placeholderTextColor={colors.inkFaint}
			selectionColor={colors.ink}
			style={[
				{
					height: 52,
					backgroundColor: colors.surface,
					borderRadius: radii.md,
					borderWidth: 1,
					borderColor: colors.line,
					paddingHorizontal: spacing.base,
					fontFamily: fontFamily.regular,
					fontSize: fontSize.body,
					color: colors.ink,
				},
				style,
			]}
			{...rest}
		/>
	);
});

interface FieldProps {
	label: string;
	hint?: string;
	children: ReactNode;
	style?: ViewStyle;
}

/** Label + optional hint wrapper around a control. */
export function Field({ label, hint, children, style }: FieldProps) {
	return (
		<View style={[{ gap: spacing.sm }, style]}>
			<View style={{ gap: 2 }}>
				<Text variant='small' weight='semibold' color={colors.inkMuted}>
					{label}
				</Text>
				{hint ? (
					<Text variant='caption' faint>
						{hint}
					</Text>
				) : null}
			</View>
			{children}
		</View>
	);
}
