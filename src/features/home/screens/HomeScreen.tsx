import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Pressable, Text, View } from 'react-native';
import {
	SafeAreaView,
	useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { TNavigationRouterProps } from '../../../core/navigation/NavigationRouterProps';
import { CalendarCard } from '../../calendar/components/CalendarCard';
import { WalkingIcon } from '../../../assets/icons/WalkingIcon';
import { ChartIcon } from '../../../assets/icons/ChartIcon';
import { AddIcon } from '../../../assets/icons/AddIcon';

type TNavigationProps = StackNavigationProp<
	TNavigationRouterProps,
	'HomeScreen'
>;
type TRouteProps = RouteProp<TNavigationRouterProps, 'HomeScreen'>;

interface IHomeScreenProps {
	navigation: TNavigationProps;
	route: TRouteProps;
}

export const HomeScreen = ({ navigation, route }: IHomeScreenProps) => {
	const { bottom } = useSafeAreaInsets();
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
					paddingHorizontal: 16,
				}}
			>
				<Text
					style={{
						color: 'white',
						fontWeight: '700',
						fontSize: 32,
						letterSpacing: 1,
					}}
				>
					Yearly
				</Text>
				<CalendarCard
					month={1}
					containerStyle={{
						marginTop: 16,
					}}
				/>
				<View
					style={{
						backgroundColor: 'white',
						borderTopLeftRadius: 32,
						borderTopRightRadius: 32,
						marginTop: 24,
						marginHorizontal: -16,
						height: 500,
					}}
				>
					<View
						style={{
							width: 48,
							height: 4,
							borderRadius: 32,
							backgroundColor: '#EAEAEA',
							marginTop: 8,
							alignSelf: 'center',
						}}
					/>

					<View
						style={{
							marginTop: 16,
						}}
					>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								borderRadius: 24,
								backgroundColor: '#EAF1FF',
								marginHorizontal: 16,
								padding: 16,
							}}
						>
							<View
								style={{
									backgroundColor: '#CFE0FF',
									padding: 8,
									borderRadius: 100,
								}}
							>
								<WalkingIcon
									width={24}
									height={24}
									color={'#3B82F6'}
								/>
							</View>

							<Text
								style={{
									fontWeight: '600',
									fontSize: 18,
									marginLeft: 12,
								}}
							>
								Walking
							</Text>

							<View style={{ flex: 1 }} />

							<View
								style={{
									borderBottomColor: '#CBD5E1',
									borderBottomWidth: 2,
								}}
							>
								<Text
									style={{
										fontSize: 20,
										fontWeight: '700',
										letterSpacing: 0.2,
									}}
								>
									10,000
								</Text>
							</View>
						</View>
					</View>

					<View
						style={{
							marginTop: 8,
						}}
					>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								borderRadius: 24,
								backgroundColor: '#ECF9F2',
								marginHorizontal: 16,
								padding: 16,
							}}
						>
							<View
								style={{
									backgroundColor: '#CFF3E1',
									padding: 8,
									borderRadius: 100,
								}}
							>
								<ChartIcon
									width={24}
									height={24}
									color={'#22C55E'}
								/>
							</View>

							<Text
								style={{
									fontWeight: '600',
									fontSize: 18,
									marginLeft: 12,
								}}
							>
								Investment
							</Text>

							<View style={{ flex: 1 }} />

							<View
								style={{
									borderBottomColor: '#CBD5E1',
									borderBottomWidth: 2,
								}}
							>
								<Text
									style={{
										fontSize: 20,
										fontWeight: '700',
										letterSpacing: 0.2,
									}}
								>
									3,500
								</Text>
							</View>
						</View>
					</View>
				</View>

				{/* add icon */}
				<Pressable
					style={{
						position: 'absolute',
						bottom: 24,
						right: 24,

						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',

						backgroundColor: '#3B82F6', // calm iOS-style blue
						borderRadius: 100,

						paddingHorizontal: 18,
						paddingVertical: 12,
					}}
				>
					<AddIcon width={20} height={20} color={'white'} />
					<Text
						style={{
							fontSize: 18,
							fontWeight: '600',
							color: '#FFFFFF',
							lineHeight: 20,
							marginStart: 4,
						}}
					>
						Add
					</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
};
