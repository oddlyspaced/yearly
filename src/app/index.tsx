import { DayStrip } from '@/components/day-strip';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, Text, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
	const router = useRouter();

	return (
		<SafeAreaView
			style={{
				flex: 1,
				backgroundColor: 'white',
			}}
		>
			<View
				style={{
					flex: 1,
					paddingTop: 32,
					paddingHorizontal: 24,
				}}
			>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Text
						style={{
							fontSize: 30,
							fontWeight: 'bold',
							marginTop: 4,
						}}
					>
						Dashboard
					</Text>

					<View
						style={{
							backgroundColor: 'black',
							padding: 8,
							borderRadius: 12,
						}}
					>
						<Feather name='plus' size={24} color='white' />
					</View>
				</View>

				<DayStrip
					containerStyle={{
						marginTop: 24,
					}}
				/>

				<View
					style={{
						marginTop: 16,
						opacity: 0.2,
						height: 1,
						width: Dimensions.get('screen').width,
						marginHorizontal: -24,
						backgroundColor: 'black',
					}}
				/>
			</View>
		</SafeAreaView>
	);
}
