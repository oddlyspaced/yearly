import { View, ViewStyle } from 'react-native';

import { colors } from '@/core/theme';

interface DividerProps {
	style?: ViewStyle;
}

export function Divider({ style }: DividerProps) {
	return (
		<View
			style={[
				{ height: 1, backgroundColor: colors.line, width: '100%' },
				style,
			]}
		/>
	);
}
