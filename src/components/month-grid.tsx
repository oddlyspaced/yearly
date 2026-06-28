import { useState } from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
	eachDayOfInterval,
	endOfMonth,
	format,
	getDay,
	isSameDay,
	startOfMonth,
} from 'date-fns';

import { ProgressRing, SegmentedControl, Text } from '@/components/ui';
import { dayCompletion } from '@/domain/aggregation';
import { formatValue } from '@/domain/format';
import { fromDateKey, startOfDay, toDateKey } from '@/domain/period';
import { Entry, Goal } from '@/domain/types';
import { colors, spacing } from '@/theme';

interface MonthGridProps {
	goal: Goal;
	entries: Entry[];
}

type Mode = 'value' | 'date';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const CIRCLE = 36;

/** Monday-based weekday index (0 = Mon … 6 = Sun). */
function mondayIndex(date: Date): number {
	return (getDay(date) + 6) % 7;
}

function DayCell({
	date,
	goal,
	entry,
	mode,
	today,
	createdDay,
}: {
	date: Date;
	goal: Goal;
	entry: Entry | undefined;
	mode: Mode;
	today: Date;
	createdDay: Date;
}) {
	const dayNum = date.getDate();
	const isToday = isSameDay(date, today);
	const isFuture = startOfDay(date) > today;
	const beforeStart = startOfDay(date) < createdDay;

	const ring = (children: React.ReactNode, content: React.ReactNode) => (
		<View
			style={{
				width: CIRCLE + 8,
				height: CIRCLE + 8,
				borderRadius: (CIRCLE + 8) / 2,
				alignItems: 'center',
				justifyContent: 'center',
				borderWidth: isToday ? 1.5 : 0,
				borderColor: colors.ink,
			}}
		>
			{children}
			{content}
		</View>
	);

	// Before goal existed — keep the grid slot but render nothing.
	if (beforeStart) {
		return <View style={{ width: CIRCLE + 8, height: CIRCLE + 8 }} />;
	}

	if (isFuture) {
		return ring(
			<View
				style={{
					width: CIRCLE,
					height: CIRCLE,
					borderRadius: CIRCLE / 2,
					borderWidth: 1,
					borderColor: colors.line,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{mode === 'date' ? (
					<Text variant='small' faint>
						{dayNum}
					</Text>
				) : null}
			</View>,
			null,
		);
	}

	const dc = dayCompletion(goal, entry);
	const value = entry?.state === 'logged' ? entry.value : 0;
	const complete = dc >= 1;
	const hasValue = value > 0;

	const label =
		mode === 'date'
			? String(dayNum)
			: goal.type === 'checkbox'
				? ''
				: hasValue
					? formatValue(value)
					: '';

	// Complete — filled disc.
	if (complete) {
		return ring(
			<ProgressRing
				progress={1}
				size={CIRCLE}
				stroke={2.5}
				fillWhenComplete
			>
				{label ? (
					<Text
						variant='caption'
						weight='semibold'
						color={colors.onAccent}
					>
						{label}
					</Text>
				) : (
					<Feather name='check' size={16} color={colors.onAccent} />
				)}
			</ProgressRing>,
			null,
		);
	}

	// Partial — arc stroke proportional to completion.
	if (hasValue && dc > 0) {
		return ring(
			<ProgressRing
				progress={dc}
				size={CIRCLE}
				stroke={2.5}
				trackColor={colors.line}
			>
				{label ? (
					<Text variant='caption' weight='semibold'>
						{label}
					</Text>
				) : null}
			</ProgressRing>,
			null,
		);
	}

	// Empty — outline circle.
	return ring(
		<View
			style={{
				width: CIRCLE,
				height: CIRCLE,
				borderRadius: CIRCLE / 2,
				borderWidth: 1,
				borderColor: colors.line,
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			{mode === 'date' ? (
				<Text variant='small' muted>
					{dayNum}
				</Text>
			) : null}
		</View>,
		null,
	);
}

export function MonthGrid({ goal, entries }: MonthGridProps) {
	const [mode, setMode] = useState<Mode>('value');
	const today = new Date();
	const monthStart = startOfMonth(today);
	const days = eachDayOfInterval({
		start: monthStart,
		end: endOfMonth(today),
	});
	const leadingBlanks = mondayIndex(monthStart);
	const createdDay = startOfDay(fromDateKey(goal.createdAt.slice(0, 10)));

	const byDate = new Map<string, Entry>();
	for (const e of entries) byDate.set(e.date, e);

	return (
		<View>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginBottom: spacing.base,
				}}
			>
				<Text variant='heading' weight='semibold'>
					{format(today, 'MMMM')}
				</Text>
				<SegmentedControl<Mode>
					options={[
						{ label: 'Value', value: 'value' },
						{ label: 'Date', value: 'date' },
					]}
					value={mode}
					onChange={setMode}
					style={{ width: 168 }}
				/>
			</View>

			<View style={{ flexDirection: 'row', marginBottom: spacing.sm }}>
				{WEEKDAYS.map((d, i) => (
					<View key={i} style={{ flex: 1, alignItems: 'center' }}>
						<Text variant='caption' faint weight='semibold'>
							{d}
						</Text>
					</View>
				))}
			</View>

			<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
				{Array.from({ length: leadingBlanks }).map((_, i) => (
					<View
						key={`blank-${i}`}
						style={{
							width: `${100 / 7}%`,
							alignItems: 'center',
							marginVertical: spacing.xs,
							height: CIRCLE + 8,
						}}
					/>
				))}
				{days.map((date) => (
					<View
						key={toDateKey(date)}
						style={{
							width: `${100 / 7}%`,
							alignItems: 'center',
							marginVertical: spacing.xs,
						}}
					>
						<DayCell
							date={date}
							goal={goal}
							entry={byDate.get(toDateKey(date))}
							mode={mode}
							today={today}
							createdDay={createdDay}
						/>
					</View>
				))}
			</View>
		</View>
	);
}
