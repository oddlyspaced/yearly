import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TNavigationRouterProps } from './NavigationRouterProps';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { CalendarListScreen } from '../../features/calendar/screens/CalendarListScreen';

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
			<AppNavigator.Screen
				component={CalendarListScreen}
				name='CalendarListScreen'
			/>
		</AppNavigator.Navigator>
	);
};
