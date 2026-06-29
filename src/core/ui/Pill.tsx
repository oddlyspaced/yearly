import { View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, radii, spacing } from '@/core/theme';
import { Text } from '@/core/ui/Text';

type FeatherIconName = keyof typeof Feather.glyphMap;
type PillTone = 'muted' | 'solid' | 'outline';

interface PillProps {
	label: string;
	icon?: FeatherIconName;
	tone?: PillTone;
	uppercase?: boolean;
	style?: ViewStyle;
}

export function Pill({
	label,
	icon,
	tone = 'muted',
	uppercase,
	style,
}: PillProps) {
	const bg =
		tone === 'solid'
			? colors.accent
			: tone === 'outline'
				? 'transparent'
				: colors.surfaceStrong;
	const fg = tone === 'solid' ? colors.onAccent : colors.ink;
	return (
		<View
			style={[
				{
					flexDirection: 'row',
					alignItems: 'center',
					gap: spacing.xs,
					paddingHorizontal: spacing.md,
					paddingVertical: 6,
					borderRadius: radii.pill,
					backgroundColor: bg,
					borderWidth: tone === 'outline' ? 1 : 0,
					borderColor: colors.lineStrong,
					alignSelf: 'flex-start',
				},
				style,
			]}
		>
			{icon ? <Feather name={icon} size={13} color={fg} /> : null}
			<Text
				variant='caption'
				weight='bold'
				color={fg}
				style={{ letterSpacing: uppercase ? 0.6 : 0.2 }}
			>
				{uppercase ? label.toUpperCase() : label}
			</Text>
		</View>
	);
}
