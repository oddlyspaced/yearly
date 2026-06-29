import { ReactNode } from 'react';
import { View } from 'react-native';

import { spacing } from '@/core/theme';
import { Text } from '@/core/ui/Text';

interface ScreenHeaderProps {
	title: string;
	subtitle?: string;
	right?: ReactNode;
}

/** Big bold screen title with an optional uppercase subtitle and right actions. */
export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
	return (
		<View
			style={{
				flexDirection: 'row',
				alignItems: 'flex-start',
				justifyContent: 'space-between',
				gap: spacing.sm,
			}}
		>
			<View style={{ flex: 1 }}>
				{subtitle ? (
					<Text
						variant='caption'
						muted
						style={{ textTransform: 'uppercase', marginBottom: 4 }}
					>
						{subtitle}
					</Text>
				) : null}
				<Text variant='display'>{title}</Text>
			</View>
			{right ? (
				<View
					style={{
						flexDirection: 'row',
						gap: spacing.sm,
						alignItems: 'center',
					}}
				>
					{right}
				</View>
			) : null}
		</View>
	);
}
