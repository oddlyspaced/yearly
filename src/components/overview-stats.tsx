import { View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { colors, spacing } from '@/theme';

export interface StatItem {
	label: string;
	value: string;
}

export function OverviewStats({ items }: { items: StatItem[] }) {
	return (
		<Card style={{ flexDirection: 'row', alignItems: 'stretch' }}>
			{items.map((item, i) => (
				<View
					key={item.label}
					style={{
						flex: 1,
						paddingLeft: i === 0 ? 0 : spacing.base,
						borderLeftWidth: i === 0 ? 0 : 1,
						borderLeftColor: colors.line,
					}}
				>
					<Text variant='title' weight='bold'>
						{item.value}
					</Text>
					<Text
						variant='caption'
						muted
						numberOfLines={1}
						style={{ textTransform: 'uppercase', marginTop: 2 }}
					>
						{item.label}
					</Text>
				</View>
			))}
		</Card>
	);
}
