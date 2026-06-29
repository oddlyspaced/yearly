import { View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { spacing } from '@/core/theme';
import { Card } from '@/core/ui/Card';
import { IconBadge } from '@/core/ui/IconBadge';
import { Text } from '@/core/ui/Text';

type FeatherIconName = keyof typeof Feather.glyphMap;

interface StatTileProps {
	icon: FeatherIconName;
	value: string;
	label: string;
	style?: ViewStyle;
}

/** White tile with a circular icon badge, a big mono number, and a label. */
export function StatTile({ icon, value, label, style }: StatTileProps) {
	return (
		<Card style={[{ flex: 1 }, style]}>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<IconBadge name={icon} size={36} />
				<Text variant='display' mono style={{ fontSize: 30 }}>
					{value}
				</Text>
			</View>
			<Text variant='small' muted style={{ marginTop: spacing.md }}>
				{label}
			</Text>
		</Card>
	);
}
