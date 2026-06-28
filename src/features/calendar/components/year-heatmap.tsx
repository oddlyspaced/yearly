import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, {
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import Svg, {
	Defs,
	LinearGradient as SvgGradient,
	Rect,
	Stop,
} from 'react-native-svg';
import {
	eachDayOfInterval,
	endOfWeek,
	format,
	startOfWeek,
	subDays,
} from 'date-fns';

import { Text } from '@/core/ui';
import { startOfDay, toDateKey } from '@/core/domain/period';
import { colors, spacing } from '@/core/theme';

/** Aggregated cross-goal completion for a single calendar day. */
export interface DayStat {
	/** Goals active that day. */
	total: number;
	/** Goals fully complete that day. */
	met: number;
	/** Average per-goal dayCompletion across active goals, 0..1. */
	ratio: number;
}

const WEEK_OPTS = { weekStartsOn: 1 as const };

/** Weeks rendered in the grid (~1 year). Visible window is narrower and scrolls. */
export const HEATMAP_WEEKS = 53;

const CELL = 14;
const GAP = 4;
const COL = CELL + GAP;
const MONTH_H = 18;
const SIDE_W = 26;
/** Width of the soft fade applied at a scroll edge that has hidden content. */
const FADE_W = 26;
/** Height the edge fades cover (month labels + 7 day rows). */
const GRID_H = MONTH_H + 7 * COL;

const AnimatedScrollView = Animated.ScrollView;

/**
 * A horizontal fade from the card surface to transparent at a scroll edge.
 * Only shown (via animated opacity) when there is hidden content on that side,
 * so the anchored "today" edge stays crisp.
 */
function EdgeFade({
	side,
	opacity,
}: {
	side: 'left' | 'right';
	// Animated style from useAnimatedStyle (opacity driver).
	opacity: Record<string, unknown>;
}) {
	const fromLeft = side === 'left';
	return (
		<Animated.View
			pointerEvents='none'
			style={[
				{
					position: 'absolute',
					top: 0,
					height: GRID_H,
					width: FADE_W,
					[side]: 0,
				},
				opacity,
			]}
		>
			<Svg width={FADE_W} height={GRID_H}>
				<Defs>
					<SvgGradient
						id={`fade-${side}`}
						x1='0'
						y1='0'
						x2='1'
						y2='0'
					>
						<Stop
							offset='0'
							stopColor={colors.surface}
							stopOpacity={fromLeft ? 1 : 0}
						/>
						<Stop
							offset='1'
							stopColor={colors.surface}
							stopOpacity={fromLeft ? 0 : 1}
						/>
					</SvgGradient>
				</Defs>
				<Rect
					width={FADE_W}
					height={GRID_H}
					fill={`url(#fade-${side})`}
				/>
			</Svg>
		</Animated.View>
	);
}

const ink = (a: number) => `rgba(10,10,10,${a})`;

/** Ordered light → dark swatches used by the cells and the legend. */
const SCALE = [
	colors.surfaceStrong,
	ink(0.22),
	ink(0.42),
	ink(0.62),
	ink(0.82),
	colors.ink,
];

function shade(ratio: number): string {
	if (ratio <= 0) return SCALE[0];
	if (ratio < 0.25) return SCALE[1];
	if (ratio < 0.5) return SCALE[2];
	if (ratio < 0.75) return SCALE[3];
	if (ratio < 1) return SCALE[4];
	return SCALE[5];
}

/** Build the trailing grid of weeks (each a Mon→Sun array of dates). */
export function buildHeatmapWeeks(today: Date = new Date()): Date[][] {
	const base = startOfDay(today);
	const gridStart = startOfWeek(
		subDays(base, (HEATMAP_WEEKS - 1) * 7),
		WEEK_OPTS,
	);
	const gridEnd = endOfWeek(base, WEEK_OPTS);
	const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
	const weeks: Date[][] = [];
	for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
	return weeks;
}

interface YearHeatmapProps {
	stats: Map<string, DayStat>;
	todayKey: string;
	selectedKey: string | null;
	onSelectDay: (key: string) => void;
}

const WEEKDAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

export function YearHeatmap({
	stats,
	todayKey,
	selectedKey,
	onSelectDay,
}: YearHeatmapProps) {
	const scrollRef = useRef<ScrollView>(null);
	const today = startOfDay(new Date());
	const weeks = buildHeatmapWeeks(today);
	const contentW = weeks.length * COL;

	// Edge-fade opacities, driven by scroll position. Start at the end (today),
	// so the left (history) edge fades and the right edge is crisp.
	const leftOp = useSharedValue(1);
	const rightOp = useSharedValue(0);
	const layoutW = useSharedValue(0);

	const onScroll = useAnimatedScrollHandler((e) => {
		const x = e.contentOffset.x;
		const maxX = Math.max(0, contentW - layoutW.value);
		leftOp.value = withTiming(x > 4 ? 1 : 0, { duration: 160 });
		rightOp.value = withTiming(x < maxX - 4 ? 1 : 0, { duration: 160 });
	});

	const leftStyle = useAnimatedStyle(() => ({ opacity: leftOp.value }));
	const rightStyle = useAnimatedStyle(() => ({ opacity: rightOp.value }));

	// Default the viewport to the most recent weeks.
	useEffect(() => {
		const id = setTimeout(
			() => scrollRef.current?.scrollToEnd({ animated: false }),
			0,
		);
		return () => clearTimeout(id);
	}, []);

	// Month labels: mark the first column of each new month.
	let lastMonth = -1;
	const monthLabels = weeks.map((week) => {
		const m = week[0].getMonth();
		if (m !== lastMonth) {
			lastMonth = m;
			return format(week[0], 'MMM');
		}
		return '';
	});

	return (
		<View>
			<View style={{ flexDirection: 'row' }}>
				{/* Weekday labels */}
				<View style={{ width: SIDE_W, paddingTop: MONTH_H }}>
					{WEEKDAY_LABELS.map((d, i) => (
						<View
							key={i}
							style={{
								height: CELL,
								marginBottom: GAP,
								justifyContent: 'center',
							}}
						>
							{d ? (
								<Text
									variant='caption'
									faint
									style={{ fontSize: 9, lineHeight: 10 }}
								>
									{d}
								</Text>
							) : null}
						</View>
					))}
				</View>

				<View
					style={{ flex: 1, position: 'relative' }}
					onLayout={(e) => {
						layoutW.value = e.nativeEvent.layout.width;
					}}
				>
					<AnimatedScrollView
						ref={scrollRef as never}
						horizontal
						showsHorizontalScrollIndicator={false}
						onScroll={onScroll}
						scrollEventThrottle={16}
					>
						<View>
							{/* Month labels */}
							<View
								style={{
									flexDirection: 'row',
									height: MONTH_H,
								}}
							>
								{monthLabels.map((label, i) => (
									<View
										key={i}
										style={{
											width: COL,
											overflow: 'visible',
										}}
									>
										{label ? (
											<Text
												variant='caption'
												faint
												numberOfLines={1}
												style={{
													fontSize: 10,
													lineHeight: 12,
													width: 40,
													position: 'absolute',
												}}
											>
												{label}
											</Text>
										) : null}
									</View>
								))}
							</View>

							{/* Grid */}
							<View style={{ flexDirection: 'row' }}>
								{weeks.map((week, wi) => (
									<View key={wi} style={{ width: COL }}>
										{week.map((day) => {
											const key = toDateKey(day);
											const isFuture = day > today;
											const isToday = key === todayKey;
											const isSelected =
												key === selectedKey;
											const stat = stats.get(key);
											const ratio = stat?.ratio ?? 0;

											const bg = isFuture
												? colors.surface
												: shade(ratio);
											const isDark =
												!isFuture && ratio >= 0.75;
											const markColor = isDark
												? colors.bg
												: colors.ink;

											return (
												<Pressable
													key={key}
													disabled={isFuture}
													onPress={() =>
														onSelectDay(key)
													}
													hitSlop={2}
													style={{
														width: CELL,
														height: CELL,
														marginBottom: GAP,
														borderRadius: 3,
														backgroundColor: bg,
														borderWidth: isSelected
															? 2
															: isToday
																? 1.5
																: 1,
														borderColor: isSelected
															? markColor
															: isToday
																? colors.inkFaint
																: colors.line,
													}}
												/>
											);
										})}
									</View>
								))}
							</View>
						</View>
					</AnimatedScrollView>
					<EdgeFade side='left' opacity={leftStyle} />
					<EdgeFade side='right' opacity={rightStyle} />
				</View>
			</View>

			{/* Legend */}
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					alignSelf: 'flex-end',
					gap: 6,
					marginTop: spacing.md,
				}}
			>
				<Text variant='caption' faint>
					Less
				</Text>
				<View style={{ flexDirection: 'row', gap: 3 }}>
					{SCALE.map((c, i) => (
						<View
							key={i}
							style={{
								width: 11,
								height: 11,
								borderRadius: 3,
								backgroundColor: c,
								borderWidth: 1,
								borderColor: colors.line,
							}}
						/>
					))}
				</View>
				<Text variant='caption' faint>
					More
				</Text>
			</View>
		</View>
	);
}
