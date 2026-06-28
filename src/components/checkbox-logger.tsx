import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { ProgressRing, Text } from '@/components/ui';
import { isDayComplete } from '@/domain/aggregation';
import { formatTargetLine } from '@/domain/format';
import { todayKey } from '@/domain/period';
import { Entry, Goal } from '@/domain/types';
import { useStore } from '@/store/useStore';
import { colors, spacing } from '@/theme';

interface CheckboxLoggerProps {
	goal: Goal;
	todayEntry?: Entry;
}

export function CheckboxLogger({ goal, todayEntry }: CheckboxLoggerProps) {
	const toggleDone = useStore((s) => s.toggleDone);
	const done = isDayComplete(goal, todayEntry);

	return (
		<View style={{ alignItems: 'center' }}>
			<Pressable
				onPress={() => toggleDone(goal.id, todayKey())}
				hitSlop={12}
				style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
			>
				<ProgressRing
					progress={done ? 1 : 0}
					size={132}
					stroke={3}
					fillWhenComplete
					trackColor={colors.lineStrong}
				>
					<Feather
						name='check'
						size={56}
						color={done ? colors.onAccent : colors.inkGhost}
					/>
				</ProgressRing>
			</Pressable>

			<Text
				variant='heading'
				weight='semibold'
				style={{ marginTop: spacing.lg }}
			>
				{done ? 'Done for today' : 'Mark as done'}
			</Text>

			<Text variant='small' faint style={{ marginTop: spacing.xs }}>
				{formatTargetLine(goal)}
			</Text>
		</View>
	);
}
