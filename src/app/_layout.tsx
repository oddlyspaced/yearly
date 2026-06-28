import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { useStore } from '@/core/store/useStore';
import { useAppFonts } from '@/core/theme/fonts';
import { colors } from '@/core/theme';
import { NotificationBanner } from '@/core/ui/notification-banner';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
	const fontsLoaded = useAppFonts();
	const init = useStore((s) => s.init);
	const ready = useStore((s) => s.ready);

	useEffect(() => {
		init();
	}, [init]);

	useEffect(() => {
		if (fontsLoaded && ready) SplashScreen.hideAsync().catch(() => {});
	}, [fontsLoaded, ready]);

	if (!fontsLoaded || !ready) {
		return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<StatusBar style='dark' />
				<View style={{ flex: 1, backgroundColor: colors.bg }}>
					<NotificationBanner />
					<View style={{ flex: 1 }}>
						<Stack
							screenOptions={{
								headerShown: false,
								contentStyle: { backgroundColor: colors.bg },
							}}
						>
							<Stack.Screen name='(tabs)' />
							<Stack.Screen
								name='create'
								options={{ presentation: 'modal' }}
							/>
							<Stack.Screen
								name='edit'
								options={{ presentation: 'modal' }}
							/>
							<Stack.Screen name='details' />
						</Stack>
					</View>
				</View>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
