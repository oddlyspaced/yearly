import { ReactNode, useEffect, useState } from 'react';
import {
	Pressable,
	PressableProps,
	TextStyle,
	View,
	ViewProps,
	ViewStyle,
} from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, radii, shadow, spacing } from '@/core/theme';
import { haptics } from '@/core/lib/haptics';
import { Text } from './Text';

const SEG_TIMING = { duration: 220, easing: Easing.out(Easing.cubic) };

type FeatherName = keyof typeof Feather.glyphMap;

/** Icon names that live in MaterialCommunityIcons rather than Feather. */
const MCI_ICONS = new Set(['pill', 'dumbbell']);

/** Renders a goal/ui glyph from the right icon set based on its name. */
export function Glyph({
	name,
	size,
	color,
}: {
	name: string;
	size: number;
	color: string;
}) {
	if (MCI_ICONS.has(name)) {
		return (
			<MaterialCommunityIcons
				name={name as keyof typeof MaterialCommunityIcons.glyphMap}
				size={size}
				color={color}
			/>
		);
	}
	return <Feather name={name as FeatherName} size={size} color={color} />;
}

// ── Card ────────────────────────────────────────────────────────────────────

interface CardProps extends ViewProps {
	padded?: boolean;
	/** Drop the soft shadow (e.g. for nested/inset cards). */
	flat?: boolean;
}

export function Card({ padded = true, flat, style, ...rest }: CardProps) {
	return (
		<View
			{...rest}
			style={[
				{
					backgroundColor: colors.surface,
					borderRadius: radii.card,
					padding: padded ? spacing.lg : 0,
				},
				flat ? null : shadow.card,
				style,
			]}
		/>
	);
}

// ── PressableCard ────────────────────────────────────────────────────────────

interface PressableCardProps extends Omit<PressableProps, 'style'> {
	style?: ViewStyle;
	flat?: boolean;
	children: ReactNode;
}

export function PressableCard({
	style,
	flat,
	children,
	...rest
}: PressableCardProps) {
	return (
		<Pressable
			{...rest}
			style={({ pressed }) => [
				{
					backgroundColor: colors.surface,
					borderRadius: radii.card,
					opacity: pressed ? 0.96 : 1,
					transform: [{ scale: pressed ? 0.99 : 1 }],
				},
				flat ? null : shadow.card,
				style,
			]}
		>
			{children}
		</Pressable>
	);
}

// ── IconBadge (circular icon container) ──────────────────────────────────────

interface IconBadgeProps {
	name: string;
	size?: number;
	iconSize?: number;
	color?: string;
	background?: string;
	style?: ViewStyle;
}

export function IconBadge({
	name,
	size = 40,
	iconSize,
	color = colors.ink,
	background = colors.surfaceStrong,
	style,
}: IconBadgeProps) {
	return (
		<View
			style={[
				{
					width: size,
					height: size,
					borderRadius: size / 2,
					backgroundColor: background,
					alignItems: 'center',
					justifyContent: 'center',
				},
				style,
			]}
		>
			<Glyph name={name} size={iconSize ?? size * 0.46} color={color} />
		</View>
	);
}

// ── IconButton ───────────────────────────────────────────────────────────────

interface IconButtonProps extends Omit<PressableProps, 'style'> {
	name: FeatherName;
	size?: number;
	color?: string;
	/** plain = no chrome, outline = bordered square, filled = ink square. */
	variant?: 'plain' | 'outline' | 'filled';
	/** Back-compat: same as variant='filled'. */
	filled?: boolean;
	style?: ViewStyle;
}

export function IconButton({
	name,
	size = 22,
	color,
	variant = 'plain',
	filled,
	style,
	...rest
}: IconButtonProps) {
	const v = filled ? 'filled' : variant;
	const fg = color ?? (v === 'filled' ? colors.onAccent : colors.ink);
	return (
		<Pressable
			hitSlop={8}
			style={({ pressed }) => [
				{
					width: 44,
					height: 44,
					borderRadius: radii.lg,
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor:
						v === 'filled' ? colors.accent : colors.surface,
					borderWidth: v === 'outline' ? 1 : 0,
					borderColor: colors.lineStrong,
					opacity: pressed ? 0.7 : 1,
					transform: [{ scale: pressed ? 0.9 : 1 }],
				},
				v !== 'plain' ? shadow.card : null,
				style,
			]}
			{...rest}
		>
			<Feather name={name} size={size} color={fg} />
		</Pressable>
	);
}

// ── Divider ──────────────────────────────────────────────────────────────────

export function Divider({ style }: { style?: ViewStyle }) {
	return (
		<View
			style={[
				{ height: 1, backgroundColor: colors.line, width: '100%' },
				style,
			]}
		/>
	);
}

// ── SectionLabel ─────────────────────────────────────────────────────────────

export function SectionLabel({
	children,
	style,
}: {
	children: string;
	style?: TextStyle;
}) {
	return (
		<Text
			variant='small'
			weight='bold'
			mono
			color={colors.inkMuted}
			style={[
				{
					marginBottom: spacing.md,
					marginLeft: spacing.xs,
					textTransform: 'uppercase',
					letterSpacing: 0.5,
				},
				style,
			]}
		>
			{children}
		</Text>
	);
}

// ── Pill / Chip ──────────────────────────────────────────────────────────────

interface PillProps {
	label: string;
	icon?: FeatherName;
	/** muted = grey chip, solid = ink chip, outline = bordered. */
	tone?: 'muted' | 'solid' | 'outline';
	uppercase?: boolean;
	style?: ViewStyle;
}

export function Pill({
	label,
	icon,
	tone = 'muted',
	uppercase,
	style,
}: PillProps) {
	const bg =
		tone === 'solid'
			? colors.accent
			: tone === 'outline'
				? 'transparent'
				: colors.surfaceStrong;
	const fg = tone === 'solid' ? colors.onAccent : colors.ink;
	return (
		<View
			style={[
				{
					flexDirection: 'row',
					alignItems: 'center',
					gap: spacing.xs,
					paddingHorizontal: spacing.md,
					paddingVertical: 6,
					borderRadius: radii.pill,
					backgroundColor: bg,
					borderWidth: tone === 'outline' ? 1 : 0,
					borderColor: colors.lineStrong,
					alignSelf: 'flex-start',
				},
				style,
			]}
		>
			{icon ? <Feather name={icon} size={13} color={fg} /> : null}
			<Text
				variant='caption'
				weight='bold'
				color={fg}
				style={{ letterSpacing: uppercase ? 0.6 : 0.2 }}
			>
				{uppercase ? label.toUpperCase() : label}
			</Text>
		</View>
	);
}

// ── SegmentedControl ─────────────────────────────────────────────────────────

interface SegmentedControlProps<T extends string> {
	options: { label: string; value: T }[];
	value: T;
	onChange: (value: T) => void;
	style?: ViewStyle;
}

export function SegmentedControl<T extends string>({
	options,
	value,
	onChange,
	style,
}: SegmentedControlProps<T>) {
	const [w, setW] = useState(0);
	const n = options.length;
	const seg = w > 0 ? (w - 8) / n : 0;
	const idx = Math.max(
		0,
		options.findIndex((o) => o.value === value),
	);

	const x = useSharedValue(0);
	useEffect(() => {
		x.value = withTiming(idx * seg, SEG_TIMING);
	}, [idx, seg, x]);
	const indicatorStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: x.value }],
	}));

	return (
		<View
			onLayout={(e) => setW(e.nativeEvent.layout.width)}
			style={[
				{
					flexDirection: 'row',
					backgroundColor: colors.surfaceStrong,
					borderRadius: radii.pill,
					padding: 4,
				},
				style,
			]}
		>
			{seg > 0 ? (
				<Animated.View
					style={[
						{
							position: 'absolute',
							left: 4,
							top: 4,
							height: 38,
							width: seg,
							borderRadius: radii.pill,
							backgroundColor: colors.surface,
						},
						shadow.card,
						indicatorStyle,
					]}
				/>
			) : null}
			{options.map((opt) => {
				const active = opt.value === value;
				return (
					<Pressable
						key={opt.value}
						onPress={() => {
							if (opt.value !== value) haptics.selection();
							onChange(opt.value);
						}}
						style={{
							flex: 1,
							height: 38,
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Text
							variant='small'
							weight={active ? 'bold' : 'medium'}
							color={active ? colors.ink : colors.inkMuted}
						>
							{opt.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

// ── ScreenHeader ─────────────────────────────────────────────────────────────

interface ScreenHeaderProps {
	title: string;
	subtitle?: string;
	right?: ReactNode;
}

export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
	return (
		<View
			style={{
				flexDirection: 'row',
				alignItems: 'flex-start',
				justifyContent: 'space-between',
				gap: spacing.sm,
			}}
		>
			<View style={{ flex: 1 }}>
				{subtitle ? (
					<Text
						variant='caption'
						muted
						style={{ textTransform: 'uppercase', marginBottom: 4 }}
					>
						{subtitle}
					</Text>
				) : null}
				<Text variant='display'>{title}</Text>
			</View>
			{right ? (
				<View
					style={{
						flexDirection: 'row',
						gap: spacing.sm,
						alignItems: 'center',
					}}
				>
					{right}
				</View>
			) : null}
		</View>
	);
}

// ── StatTile ─────────────────────────────────────────────────────────────────

interface StatTileProps {
	icon: FeatherName;
	value: string;
	label: string;
	style?: ViewStyle;
}

export function StatTile({ icon, value, label, style }: StatTileProps) {
	return (
		<Card style={[{ flex: 1 }, style]}>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<IconBadge name={icon} size={36} />
				<Text variant='display' mono style={{ fontSize: 30 }}>
					{value}
				</Text>
			</View>
			<Text variant='small' muted style={{ marginTop: spacing.md }}>
				{label}
			</Text>
		</Card>
	);
}

// ── Row (white list-row card) ────────────────────────────────────────────────

interface RowProps extends Omit<PressableProps, 'style'> {
	icon?: FeatherName;
	title: string;
	subtitle?: string;
	right?: ReactNode;
	style?: ViewStyle;
}

export function Row({
	icon,
	title,
	subtitle,
	right,
	style,
	...rest
}: RowProps) {
	return (
		<Pressable
			style={({ pressed }) => [
				{
					flexDirection: 'row',
					alignItems: 'center',
					gap: spacing.md,
					paddingVertical: spacing.md,
					paddingHorizontal: spacing.base,
					backgroundColor: colors.surface,
					borderRadius: radii.lg,
					opacity: pressed ? 0.96 : 1,
				},
				shadow.card,
				style,
			]}
			{...rest}
		>
			{icon ? <IconBadge name={icon} size={38} /> : null}
			<View style={{ flex: 1 }}>
				<Text variant='label' weight='semibold' numberOfLines={1}>
					{title}
				</Text>
				{subtitle ? (
					<Text
						variant='small'
						muted
						numberOfLines={1}
						style={{ marginTop: 1 }}
					>
						{subtitle}
					</Text>
				) : null}
			</View>
			{right}
		</Pressable>
	);
}
