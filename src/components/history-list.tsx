import { Fragment, useMemo } from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format, isThisYear } from 'date-fns';

import { Card, Divider, Text } from '@/components/ui';
import { formatPrecise } from '@/domain/format';
import { fromDateKey } from '@/domain/period';
import { Entry, Goal } from '@/domain/types';
import { colors, spacing } from '@/theme';

interface HistoryListProps {
	goal: Goal;
	entries: Entry[];
}

function HistoryRow({ goal, entry }: { goal: Goal; entry: Entry }) {
	const date = fromDateKey(entry.date);
	const dateLabel = format(
		date,
		isThisYear(date) ? 'EEE, MMM d' : 'MMM d, yyyy',
	);

	let trailing: React.ReactNode;
	if (entry.state === 'skip') {
		trailing = (
			<Text variant='small' faint weight='medium'>
				Skipped
			</Text>
		);
	} else if (goal.type === 'checkbox') {
		trailing = <Feather name='check' size={18} color={colors.ink} />;
	} else {
		trailing = (
			<Text variant='label' weight='semibold'>
				{formatPrecise(entry.value)}
				{goal.unit ? (
					<Text variant='small' muted>
						{' '}
						{goal.unit}
					</Text>
				) : null}
			</Text>
		);
	}

	return (
		<View
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				paddingVertical: spacing.md,
				gap: spacing.md,
			}}
		>
			<Text variant='body' weight='medium'>
				{dateLabel}
			</Text>
			{trailing}
		</View>
	);
}

export function HistoryList({ goal, entries }: HistoryListProps) {
	const sorted = useMemo(
		() => [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)),
		[entries],
	);

	return (
		<View>
			<Text
				variant='caption'
				muted
				weight='semibold'
				style={{ textTransform: 'uppercase', marginBottom: spacing.sm }}
			>
				History
			</Text>
			{sorted.length === 0 ? (
				<Card
					style={{
						paddingVertical: spacing.xl,
						alignItems: 'center',
					}}
				>
					<Text variant='small' faint>
						No entries yet
					</Text>
				</Card>
			) : (
				<Card style={{ paddingVertical: 0 }}>
					{sorted.map((entry, i) => (
						<Fragment key={entry.id}>
							{i > 0 ? <Divider /> : null}
							<View style={{ paddingHorizontal: spacing.base }}>
								<HistoryRow goal={goal} entry={entry} />
							</View>
						</Fragment>
					))}
				</Card>
			)}
		</View>
	);
}
