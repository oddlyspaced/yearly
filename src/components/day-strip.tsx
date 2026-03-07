import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Text, View, ViewStyle } from 'react-native';

interface IDayStripUnitProps {
	day: string;
	date: number;
	isActive?: boolean;
}

const DayStripUnit = ({ day, date, isActive }: IDayStripUnitProps) => {
	return (
		<View
			style={{
				alignItems: 'center',
				opacity: isActive ? 1 : 0.5,
			}}
		>
			<Text
				style={{
					color: 'black',
					fontWeight: '400',
					fontSize: 10,
				}}
			>
				{day}
			</Text>

			<Text
				style={{
					color: 'black',
					fontWeight: '600',
					fontSize: 16,
					marginTop: 10,
				}}
			>
				{date}
			</Text>
		</View>
	);
};

interface IDayStripProps {
	containerStyle?: ViewStyle;
}

export const DayStrip = ({ containerStyle }: IDayStripProps) => {
	const today = dayjs();

	const stripItems = useMemo(() => {
		const items: IDayStripUnitProps[] = [];
		for (let i = -3; i <= 3; i++) {
			const curDate = today.add(i, 'day');
			items.push({
				day: curDate.format('dd'),
				date: curDate.date(),
				isActive: i == 0,
			});
		}
		return items;
	}, [today]);

	return (
		<View
			style={[
				containerStyle,
				{
					flexDirection: 'row',
					justifyContent: 'space-between',
				},
			]}
		>
			{stripItems.map((item) => {
				return <DayStripUnit {...item} />;
			})}
		</View>
	);
};
