import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarCard } from '../components/CalendarCard';

export const CalendarListScreen = () => {
	return (
		<SafeAreaView
			style={{
				flex: 1,
				backgroundColor: 'black',
			}}
		>
			<View
				style={{
					flex: 1,
					paddingHorizontal: 24,
					gap: 8,
				}}
			>
				<CalendarCard />
				<CalendarCard />
			</View>
		</SafeAreaView>
	);
};
