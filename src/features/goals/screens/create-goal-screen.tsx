import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NewGoal } from '@/core/domain/types';
import { useStore } from '@/core/store/useStore';
import { haptics } from '@/core/lib/haptics';
import { colors, spacing } from '@/core/theme';
import { IconButton, Text } from '@/core/ui';
import { GoalForm } from '@/features/goals/components/goal-form';

export default function CreateScreen() {
	const router = useRouter();
	const addGoal = useStore((s) => s.addGoal);

	const handleSubmit = (goal: NewGoal) => {
		addGoal(goal);
		haptics.success();
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
					<Text variant='heading'>New goal</Text>
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
					<GoalForm
						submitLabel='Create goal'
						onSubmit={handleSubmit}
					/>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
