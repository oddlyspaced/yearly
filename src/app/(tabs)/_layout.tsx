import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, shadow, spacing } from '@/core/theme';
import { haptics } from '@/core/lib/haptics';

const TABS: {
	name: string;
	icon: keyof typeof Ionicons.glyphMap;
	iconOutline: keyof typeof Ionicons.glyphMap;
}[] = [
	{ name: 'index', icon: 'home', iconOutline: 'home-outline' },
	{ name: 'calendar', icon: 'grid', iconOutline: 'grid-outline' },
];

const SLOT_W = 60;
const SLOT_H = 48;
const GAP = spacing.sm;
const PAD = spacing.sm;
const TIMING = { duration: 220, easing: Easing.out(Easing.cubic) };

export default function TabsLayout() {
	const insets = useSafeAreaInsets();

	return (
		<Tabs
			screenOptions={{ headerShown: false }}
			tabBar={({ state, navigation }) => {
				const visible = state.routes.filter((r) =>
					TABS.some((t) => t.name === r.name),
				);
				const activeIndex = visible.findIndex(
					(r) => state.routes[state.index]?.name === r.name,
				);
				return (
					<View
						style={{
							position: 'absolute',
							bottom: insets.bottom + spacing.sm,
							left: 0,
							right: 0,
							alignItems: 'center',
						}}
						pointerEvents='box-none'
					>
						<View
							style={[
								{
									flexDirection: 'row',
									gap: GAP,
									backgroundColor: colors.surface,
									borderRadius: radii.pill,
									paddingHorizontal: PAD,
									paddingVertical: PAD,
								},
								shadow.float,
							]}
						>
							<TabHighlight index={activeIndex} />
							{visible.map((route) => {
								const tab = TABS.find(
									(t) => t.name === route.name,
								)!;
								const focused =
									state.routes[state.index]?.name ===
									route.name;
								return (
									<Pressable
										key={route.key}
										onPress={() => {
											if (!focused) haptics.selection();
											navigation.navigate(route.name);
										}}
										style={{
											width: SLOT_W,
											height: SLOT_H,
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<Ionicons
											name={
												focused
													? tab.icon
													: tab.iconOutline
											}
											size={24}
											color={
												focused
													? colors.ink
													: colors.inkFaint
											}
										/>
									</Pressable>
								);
							})}
						</View>
					</View>
				);
			}}
		>
			<Tabs.Screen name='index' />
			<Tabs.Screen name='calendar' />
		</Tabs>
	);
}

function TabHighlight({ index }: { index: number }) {
	const x = useSharedValue(index * (SLOT_W + GAP));
	useEffect(() => {
		x.value = withTiming(index * (SLOT_W + GAP), TIMING);
	}, [index, x]);
	const style = useAnimatedStyle(() => ({
		transform: [{ translateX: x.value }],
	}));
	return (
		<Animated.View
			pointerEvents='none'
			style={[
				{
					position: 'absolute',
					left: PAD,
					top: PAD,
					width: SLOT_W,
					height: SLOT_H,
					borderRadius: radii.pill,
					backgroundColor: colors.surfaceStrong,
				},
				style,
			]}
		/>
	);
}
