import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarCard } from '../components/CalendarCard';

export const CalendarListScreen = () => {
	const { top } = useSafeAreaInsets();

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: 'black',
			}}
		>
			<ScrollView
				style={{
					flex: 1,
					paddingHorizontal: 16,
					paddingTop: top,
				}}
			>
				<CalendarCard month={1} />
				<CalendarCard
					month={2}
					containerStyle={{
						marginTop: 8,
					}}
				/>
				<CalendarCard
					month={3}
					containerStyle={{
						marginTop: 8,
					}}
				/>
				<CalendarCard
					month={4}
					containerStyle={{
						marginTop: 8,
					}}
				/>
				<CalendarCard
					month={5}
					containerStyle={{
						marginTop: 8,
					}}
				/>
				<CalendarCard
					month={6}
					containerStyle={{
						marginTop: 8,
					}}
				/>
			</ScrollView>
		</View>
	);
};
