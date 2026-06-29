import { ReactNode } from 'react';
import { Pressable, PressableProps, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, radii, shadow, spacing } from '@/core/theme';
import { IconBadge } from '@/core/ui/IconBadge';
import { Text } from '@/core/ui/Text';

type FeatherIconName = keyof typeof Feather.glyphMap;

interface RowProps extends Omit<PressableProps, 'style'> {
	icon?: FeatherIconName;
	title: string;
	subtitle?: string;
	right?: ReactNode;
	style?: ViewStyle;
}

/** White list-row card: leading icon badge, title/subtitle, trailing slot. */
export function Row({
	icon,
	title,
	subtitle,
	right,
	style,
	...rest
}: RowProps) {
	return (
		<Pressable
			style={({ pressed }) => [
				{
					flexDirection: 'row',
					alignItems: 'center',
					gap: spacing.md,
					paddingVertical: spacing.md,
					paddingHorizontal: spacing.base,
					backgroundColor: colors.surface,
					borderRadius: radii.lg,
					opacity: pressed ? 0.96 : 1,
				},
				shadow.card,
				style,
			]}
			{...rest}
		>
			{icon ? <IconBadge name={icon} size={38} /> : null}
			<View style={{ flex: 1 }}>
				<Text variant='label' weight='semibold' numberOfLines={1}>
					{title}
				</Text>
				{subtitle ? (
					<Text
						variant='small'
						muted
						numberOfLines={1}
						style={{ marginTop: 1 }}
					>
						{subtitle}
					</Text>
				) : null}
			</View>
			{right}
		</Pressable>
	);
}
