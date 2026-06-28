import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NewGoal } from '@/domain/types';
import { useStore } from '@/store/useStore';
import { colors, spacing } from '@/theme';
import { IconButton, Text } from '@/components/ui';
import { GoalForm } from '@/components/goal-form';

export default function CreateScreen() {
	const router = useRouter();
	const addGoal = useStore((s) => s.addGoal);

	const handleSubmit = (goal: NewGoal) => {
		addGoal(goal);
		router.back();
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
						justifyContent: 'space-between',
						alignItems: 'center',
						paddingHorizontal: spacing.lg,
						paddingTop: spacing.sm,
						paddingBottom: spacing.md,
					}}
				>
					<Text variant='title'>New goal</Text>
					<IconButton name='x' onPress={() => router.back()} />
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
					<GoalForm
						submitLabel='Create goal'
						onSubmit={handleSubmit}
					/>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
