import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/theme';

const TABS: {
	name: string;
	label: string;
	icon: keyof typeof Feather.glyphMap;
}[] = [
	{ name: 'index', label: 'Today', icon: 'check-square' },
	{ name: 'calendar', label: 'Calendar', icon: 'grid' },
];

export default function TabsLayout() {
	const insets = useSafeAreaInsets();

	return (
		<Tabs
			screenOptions={{ headerShown: false }}
			tabBar={({ state, navigation }) => (
				<View
					style={{
						flexDirection: 'row',
						borderTopWidth: 1,
						borderTopColor: colors.line,
						backgroundColor: colors.bg,
						paddingTop: spacing.sm,
						paddingBottom: insets.bottom + spacing.xs,
						paddingHorizontal: spacing.lg,
					}}
				>
					{state.routes
						.filter((r) => TABS.some((t) => t.name === r.name))
						.map((route) => {
							const tab = TABS.find(
								(t) => t.name === route.name,
							)!;
							const index = state.routes.findIndex(
								(r) => r.key === route.key,
							);
							const focused = state.index === index;
							return (
								<View
									key={route.key}
									style={{ flex: 1, alignItems: 'center' }}
									onTouchEnd={() =>
										navigation.navigate(route.name)
									}
								>
									<Feather
										name={tab.icon}
										size={22}
										color={
											focused
												? colors.ink
												: colors.inkFaint
										}
									/>
									<Text
										variant='caption'
										weight={focused ? 'semibold' : 'medium'}
										color={
											focused
												? colors.ink
												: colors.inkFaint
										}
										style={{ marginTop: 4 }}
									>
										{tab.label}
									</Text>
								</View>
							);
						})}
				</View>
			)}
		>
			<Tabs.Screen name='index' />
			<Tabs.Screen name='calendar' />
		</Tabs>
	);
}
