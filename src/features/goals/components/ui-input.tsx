import { ReactNode, forwardRef } from 'react';
import {
	TextInput,
	TextInputProps,
	TextStyle,
	View,
	ViewStyle,
} from 'react-native';

import {
	colors,
	fontFamily,
	fontSize,
	radii,
	shadow,
	spacing,
} from '@/core/theme';
import { Text } from '@/core/ui';

interface InputProps extends Omit<TextInputProps, 'style'> {
	/** Larger, borderless title-style input (used for the goal name). */
	bare?: boolean;
	style?: TextStyle;
}

/**
 * Inter-styled TextInput in the Fold language: a white, softly-shadowed pill
 * surface floating on the grey canvas. The `bare` variant drops the chrome for
 * the large goal-name field. The foundation ships no Input, so it lives here.
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
						fontFamily: fontFamily.bold,
						fontSize: fontSize.title,
						lineHeight: 36,
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
					height: 54,
					backgroundColor: colors.surface,
					borderRadius: radii.lg,
					paddingHorizontal: spacing.base,
					fontFamily: fontFamily.regular,
					fontSize: fontSize.body,
					color: colors.ink,
				},
				shadow.card,
				style,
			]}
			{...rest}
		/>
	);
});

interface FieldProps {
	/** Optional label rendered above the control. */
	label?: string;
	hint?: string;
	children: ReactNode;
	style?: ViewStyle;
}

/** Optional-label wrapper around a control. */
export function Field({ label, hint, children, style }: FieldProps) {
	return (
		<View style={[{ gap: spacing.sm }, style]}>
			{label ? (
				<View style={{ gap: 2 }}>
					<Text
						variant='small'
						weight='semibold'
						color={colors.inkMuted}
					>
						{label}
					</Text>
					{hint ? (
						<Text variant='caption' faint>
							{hint}
						</Text>
					) : null}
				</View>
			) : null}
			{children}
		</View>
	);
}
