import { Pressable, View } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import { ProgressRing, Text } from '@/core/ui';
import { isDayComplete } from '@/core/domain/aggregation';
import { formatTargetLine } from '@/core/domain/format';
import { todayKey } from '@/core/domain/period';
import { Entry, Goal } from '@/core/domain/types';
import { colors, spacing } from '@/core/theme';
import { haptics } from '@/core/lib/haptics';
import { useStore } from '@/core/store/useStore';

const TIMING = { duration: 160, easing: Easing.out(Easing.cubic) };

interface CheckboxLoggerProps {
	goal: Goal;
	todayEntry?: Entry;
}

export function CheckboxLogger({ goal, todayEntry }: CheckboxLoggerProps) {
	const toggleDone = useStore((s) => s.toggleDone);
	const done = isDayComplete(goal, todayEntry);

	const scale = useSharedValue(1);
	const ringStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<View style={{ alignItems: 'center' }}>
			<Pressable
				onPress={() => {
					if (done) haptics.light();
					else haptics.success();
					toggleDone(goal.id, todayKey());
				}}
				onPressIn={() => {
					scale.value = withTiming(0.92, TIMING);
				}}
				onPressOut={() => {
					scale.value = withTiming(1, TIMING);
				}}
				hitSlop={16}
			>
				<Animated.View style={ringStyle}>
					<ProgressRing
						progress={done ? 1 : 0}
						size={132}
						stroke={6}
						fillWhenComplete
						trackColor={colors.surfaceStrong}
					>
						<Feather
							name='check'
							size={50}
							color={done ? colors.onAccent : colors.inkGhost}
						/>
					</ProgressRing>
				</Animated.View>
			</Pressable>

			<Text
				variant='heading'
				weight='bold'
				center
				style={{ marginTop: spacing.lg }}
			>
				{done ? 'Done for today' : 'Mark as done'}
			</Text>

			<Text
				variant='small'
				muted
				center
				style={{ marginTop: spacing.xs }}
			>
				{done
					? 'Tap to undo'
					: `Tap the circle · ${formatTargetLine(goal)}`}
			</Text>
		</View>
	);
}
