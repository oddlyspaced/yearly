import { TextStyle } from 'react-native';

import { colors, spacing } from '@/core/theme';
import { Text } from '@/core/ui/Text';

interface SectionLabelProps {
	children: string;
	style?: TextStyle;
}

/** Small uppercase mono subheading above a group of controls. */
export function SectionLabel({ children, style }: SectionLabelProps) {
	return (
		<Text
			variant='small'
			weight='bold'
			mono
			color={colors.inkMuted}
			style={[
				{
					marginBottom: spacing.md,
					marginLeft: spacing.xs,
					textTransform: 'uppercase',
					letterSpacing: 0.5,
				},
				style,
			]}
		>
			{children}
		</Text>
	);
}
