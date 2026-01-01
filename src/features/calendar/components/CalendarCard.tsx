import dayjs from 'dayjs';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const DAYS: string[] = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

export const CalendarCard = () => {
	const firstOfMonth = dayjs().startOf('month');
	const firstDay = firstOfMonth.day();

	const rows = useMemo(() => {
		let dateCounter = 1;
		const days: number[][] = [];
		for (let week = 0; week < 31 / 7; week++) {
			const row = [];
			for (let i = 0 + week * 7; i <= 6 + week * 7; i++) {
				row.push(i >= firstDay ? dateCounter++ : 0);
			}
			days.push(row);
		}
		return days;
	}, [firstDay]);

	const selected = 14;

	return (
		<View
			style={{
				width: '100%',
				backgroundColor: 'white',
				borderRadius: 28,
				paddingHorizontal: 20,
				paddingTop: 18,
				paddingBottom: 16,
			}}
		>
			<Text
				style={{
					fontSize: 28,
					fontWeight: '700',
					color: '#111111',
				}}
			>
				January
			</Text>
			<View
				style={{
					marginTop: 24,
					flexDirection: 'row',
					justifyContent: 'space-between',
					paddingBottom: 8,
					borderBottomWidth: 1,
					borderBottomColor: '#F5F5F5',
				}}
			>
				{DAYS.map((day) => (
					<Text style={styles.dayHeading}>{day}</Text>
				))}
			</View>
			{/* date items */}
			{rows.map((row, rowIndex) => {
				return (
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						{row.map((date, dateIndex) => {
							return (
								<View
									key={rowIndex + '_' + dateIndex}
									style={[
										{
											height: 54,
											width: 36,
											borderRadius: 8,
											alignItems: 'center',
											justifyContent: 'center',
											borderWidth: 1,
											borderColor: 'white',
										},
										date === selected
											? {
													backgroundColor: '#F2F2F7',
													borderColor: '#EAEAEA',
											  }
											: null,
									]}
								>
									<Text
										key={dateIndex}
										style={[styles.dateLabel]}
									>
										{date === 0 ? '' : date}
									</Text>

									{date &&
									(date === selected || date === 18) ? (
										<View
											style={{
												position: 'absolute',
												bottom: 4,
												paddingHorizontal: 4,
												width: '100%',
												flexDirection: 'row',
												gap: 1,
											}}
										>
											<View
												style={{
													flex: 1,
													height: 3,
													backgroundColor: '#3C65FF',
													borderRadius: 4,
												}}
											/>
											<View
												style={{
													// width: '100%',
													flex: 1,
													height: 3,
													backgroundColor: '#CC53FF',
													borderRadius: 4,
												}}
											/>
											<View
												style={{
													// width: '100%',
													flex: 1,
													height: 3,
													borderRadius: 4,
													backgroundColor: '#FF5C40',
												}}
											/>
										</View>
									) : null}
								</View>
							);
						})}
					</View>
				);
			})}
		</View>
	);
};

export const styles = StyleSheet.create({
	dayHeading: {
		fontSize: 12,
		fontWeight: '500',
		letterSpacing: 0.7,
		color: '#8E8E93',
		width: 36,
		textAlign: 'center',
	},
	dateLabel: {
		fontSize: 16,
		fontWeight: '500',
		color: '#111111',
		textAlign: 'center',
	},
});
