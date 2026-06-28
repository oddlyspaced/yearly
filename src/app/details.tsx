import { ScrollView, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckboxLogger } from '@/components/checkbox-logger';
import { DetailStats } from '@/components/detail-stats';
import { HistoryList } from '@/components/history-list';
import { MonthGrid } from '@/components/month-grid';
import { NumericLogger } from '@/components/numeric-logger';
import { Card, Divider, IconButton, Text } from '@/components/ui';
import { entriesForGoal, entryFor, useStore } from '@/store/useStore';
import { colors, radii, spacing } from '@/theme';

export default function DetailsScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const goal = useStore((s) => s.goals.find((g) => g.id === id));
	const allEntries = useStore((s) => s.entries);

	if (!goal) {
		return (
			<SafeAreaView
				style={{ flex: 1, backgroundColor: colors.bg }}
				edges={['top']}
			>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						paddingHorizontal: spacing.sm,
						paddingTop: spacing.xs,
					}}
				>
					<IconButton
						name='chevron-left'
						onPress={() => router.back()}
					/>
				</View>
				<View
					style={{
						flex: 1,
						alignItems: 'center',
						justifyContent: 'center',
						padding: spacing.xl,
					}}
				>
					<Text variant='heading' weight='semibold'>
						Goal not found
					</Text>
					<Text
						variant='small'
						muted
						center
						style={{ marginTop: spacing.sm }}
					>
						This goal may have been deleted.
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	const goalEntries = entriesForGoal(allEntries, goal.id);
	const todayEntry = entryFor(allEntries, goal.id);

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: colors.bg }}
			edges={['top']}
		>
			{/* Header */}
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					paddingHorizontal: spacing.sm,
					paddingTop: spacing.xs,
				}}
			>
				<IconButton name='chevron-left' onPress={() => router.back()} />
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						gap: spacing.sm,
						flex: 1,
						justifyContent: 'center',
					}}
				>
					<Feather
						name={goal.icon as keyof typeof Feather.glyphMap}
						size={16}
						color={colors.inkMuted}
					/>
					<Text variant='label' weight='semibold' numberOfLines={1}>
						{goal.name}
					</Text>
				</View>
				<IconButton
					name='settings'
					onPress={() =>
						router.push({
							pathname: '/edit',
							params: { id: goal.id },
						})
					}
				/>
			</View>

			<ScrollView
				contentContainerStyle={{
					paddingHorizontal: spacing.lg,
					paddingTop: spacing.lg,
					paddingBottom: spacing.xxxl,
					gap: spacing.xl,
				}}
				showsVerticalScrollIndicator={false}
			>
				{/* Logging hero */}
				<Card
					style={{
						paddingVertical: spacing.xxl,
						paddingHorizontal: spacing.lg,
						borderRadius: radii.xl,
					}}
				>
					{goal.type === 'numeric' ? (
						<NumericLogger goal={goal} todayEntry={todayEntry} />
					) : (
						<CheckboxLogger goal={goal} todayEntry={todayEntry} />
					)}
				</Card>

				{/* Stats */}
				<DetailStats goal={goal} entries={goalEntries} />

				<Divider />

				{/* Month calendar */}
				<MonthGrid goal={goal} entries={goalEntries} />

				<Divider />

				{/* History */}
				<HistoryList goal={goal} entries={goalEntries} />
			</ScrollView>
		</SafeAreaView>
	);
}
