import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationRouter } from './core/navigation/NavigationRouter';
import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();
const queryClient = new QueryClient({});

const App = () => {
	return (
		<GestureHandlerRootView style={styles.container}>
			<SafeAreaProvider>
				<QueryClientProvider client={queryClient}>
					<NavigationContainer key={'default'}>
						<NavigationRouter />
					</NavigationContainer>
				</QueryClientProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default App;
