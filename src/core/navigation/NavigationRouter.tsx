import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TNavigationRouterProps } from './NavigationRouterProps';
import { HomeScreen } from '../../features/home/screens/HomeScreen';

const AppNavigator = createNativeStackNavigator<TNavigationRouterProps>();

export const NavigationRouter = () => {
	return (
		<AppNavigator.Navigator
			initialRouteName='HomeScreen'
			screenOptions={{
				headerShown: false,
			}}
		>
			<AppNavigator.Screen component={HomeScreen} name='HomeScreen' />
		</AppNavigator.Navigator>
	);
};
