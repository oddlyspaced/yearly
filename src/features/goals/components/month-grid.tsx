import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
	eachDayOfInterval,
	endOfMonth,
	getDay,
	isSameDay,
	startOfMonth,
} from 'date-fns';

import { ProgressRing, Text } from '@/core/ui';
import { dayCompletion } from '@/core/domain/aggregation';
import { formatValue } from '@/core/domain/format';
import { fromDateKey, startOfDay, toDateKey } from '@/core/domain/period';
import { Entry, Goal } from '@/core/domain/types';
import { colors, spacing } from '@/core/theme';

export type DisplayMode = 'value' | 'date';

interface MonthGridProps {
	goal: Goal;
	entries: Entry[];
	displayMode: DisplayMode;
	/** Anchor date for the month to render (defaults to current month). */
	month?: Date;
}

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
	mode: DisplayMode;
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
						weight='medium'
						color={colors.onAccent}
						style={{ fontSize: 9.5, letterSpacing: -0.3 }}
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
					<Text
						variant='caption'
						weight='medium'
						style={{ fontSize: 9.5, letterSpacing: -0.3 }}
					>
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

export function MonthGrid({
	goal,
	entries,
	displayMode,
	month,
}: MonthGridProps) {
	const today = new Date();
	const monthStart = startOfMonth(month ?? today);
	const days = eachDayOfInterval({
		start: monthStart,
		end: endOfMonth(monthStart),
	});
	const leadingBlanks = mondayIndex(monthStart);
	const createdDay = startOfDay(fromDateKey(goal.createdAt.slice(0, 10)));

	const byDate = new Map<string, Entry>();
	for (const e of entries) byDate.set(e.date, e);

	return (
		<View>
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
							mode={displayMode}
							today={today}
							createdDay={createdDay}
						/>
					</View>
				))}
			</View>
		</View>
	);
}
