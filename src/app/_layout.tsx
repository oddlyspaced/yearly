import { Stack } from 'expo-router';

export default function Layout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen
				name='index'
				options={{
					title: 'Home',
				}}
			/>
			<Stack.Screen
				name='create'
				options={{
					title: 'Create',
				}}
			/>
			<Stack.Screen
				name='details'
				options={{
					title: 'Details',
				}}
			/>
			<Stack.Screen
				name='edit'
				options={{
					title: 'Edit',
				}}
			/>
		</Stack>
	);
}
