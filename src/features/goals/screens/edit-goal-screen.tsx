import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NewGoal } from '@/core/domain/types';
import { useStore } from '@/core/store/useStore';
import { haptics } from '@/core/lib/haptics';
import { colors, spacing } from '@/core/theme';
import { IconButton, Text } from '@/core/ui';
import { GoalForm } from '@/features/goals/components/goal-form';

export default function EditScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const goal = useStore((s) => s.goals.find((g) => g.id === id));
	const editGoal = useStore((s) => s.editGoal);
	const removeGoal = useStore((s) => s.removeGoal);

	const handleSubmit = (next: NewGoal, typeChanged: boolean) => {
		if (!goal) return;
		if (typeChanged) {
			Alert.alert(
				'Change goal type?',
				'Changing the type clears existing logs for this goal. This cannot be undone.',
				[
					{ text: 'Cancel', style: 'cancel' },
					{
						text: 'Change & clear',
						style: 'destructive',
						onPress: () => {
							editGoal(goal.id, next, true);
							router.back();
						},
					},
				],
			);
			return;
		}
		editGoal(goal.id, next, false);
		router.back();
	};

	const handleDelete = () => {
		if (!goal) return;
		Alert.alert(
			'Delete goal?',
			`"${goal.name}" and all its logs will be permanently removed.`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: () => {
						haptics.medium();
						removeGoal(goal.id);
						router.dismissAll();
					},
				},
			],
		);
	};

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: colors.bg }}
			edges={['top']}
		>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
						paddingHorizontal: spacing.lg,
						paddingTop: spacing.base,
						paddingBottom: spacing.md,
					}}
				>
					<IconButton
						name='x'
						variant='outline'
						onPress={() => router.back()}
					/>
					<Text variant='heading'>Edit goal</Text>
					<View style={{ width: 44 }} />
				</View>
				<ScrollView
					contentContainerStyle={{
						paddingHorizontal: spacing.lg,
						paddingTop: spacing.sm,
						paddingBottom: spacing.xxxl,
					}}
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
				>
					{goal ? (
						<GoalForm
							initial={goal}
							submitLabel='Save changes'
							onSubmit={handleSubmit}
							onDelete={handleDelete}
						/>
					) : (
						<Text muted>Goal not found.</Text>
					)}
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
