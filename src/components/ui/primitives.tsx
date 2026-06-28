import { ReactNode } from 'react';
import {
	Pressable,
	PressableProps,
	View,
	ViewProps,
	ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, radii, spacing } from '@/theme';
import { Text } from './Text';

// ── Card ────────────────────────────────────────────────────────────────────

interface CardProps extends ViewProps {
	padded?: boolean;
}

export function Card({ padded = true, style, ...rest }: CardProps) {
	return (
		<View
			{...rest}
			style={[
				{
					backgroundColor: colors.surface,
					borderRadius: radii.lg,
					padding: padded ? spacing.base : 0,
					borderWidth: 1,
					borderColor: colors.line,
				},
				style,
			]}
		/>
	);
}

// ── PressableCard (with press feedback) ──────────────────────────────────────

interface PressableCardProps extends Omit<PressableProps, 'style'> {
	style?: ViewStyle;
	children: ReactNode;
}

export function PressableCard({
	style,
	children,
	...rest
}: PressableCardProps) {
	return (
		<Pressable
			{...rest}
			style={({ pressed }) => [
				{
					backgroundColor: colors.surface,
					borderRadius: radii.lg,
					borderWidth: 1,
					borderColor: colors.line,
					opacity: pressed ? 0.9 : 1,
					transform: [{ scale: pressed ? 0.992 : 1 }],
				},
				style,
			]}
		>
			{children}
		</Pressable>
	);
}

// ── IconButton ───────────────────────────────────────────────────────────────

interface IconButtonProps extends Omit<PressableProps, 'style'> {
	name: keyof typeof Feather.glyphMap;
	size?: number;
	color?: string;
	filled?: boolean;
	style?: ViewStyle;
}

export function IconButton({
	name,
	size = 22,
	color,
	filled,
	style,
	...rest
}: IconButtonProps) {
	return (
		<Pressable
			hitSlop={8}
			style={({ pressed }) => [
				{
					width: 44,
					height: 44,
					borderRadius: radii.md,
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: filled ? colors.accent : 'transparent',
					opacity: pressed ? 0.6 : 1,
				},
				style,
			]}
			{...rest}
		>
			<Feather
				name={name}
				size={size}
				color={color ?? (filled ? colors.onAccent : colors.ink)}
			/>
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
	return (
		<View
			style={[
				{
					flexDirection: 'row',
					backgroundColor: colors.surfaceStrong,
					borderRadius: radii.md,
					padding: 3,
					gap: 3,
				},
				style,
			]}
		>
			{options.map((opt) => {
				const active = opt.value === value;
				return (
					<Pressable
						key={opt.value}
						onPress={() => onChange(opt.value)}
						style={{
							flex: 1,
							height: 38,
							borderRadius: radii.sm,
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: active ? colors.bg : 'transparent',
							shadowColor: '#000',
							shadowOpacity: active ? 0.06 : 0,
							shadowRadius: 4,
							shadowOffset: { width: 0, height: 1 },
						}}
					>
						<Text
							variant='small'
							weight={active ? 'semibold' : 'medium'}
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
	left?: ReactNode;
	right?: ReactNode;
}

export function ScreenHeader({
	title,
	subtitle,
	left,
	right,
}: ScreenHeaderProps) {
	return (
		<View
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				minHeight: 44,
				gap: spacing.sm,
			}}
		>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					gap: spacing.sm,
					flex: 1,
				}}
			>
				{left}
				<View style={{ flex: 1 }}>
					{subtitle ? (
						<Text
							variant='caption'
							muted
							style={{ textTransform: 'uppercase' }}
						>
							{subtitle}
						</Text>
					) : null}
					<Text variant='title'>{title}</Text>
				</View>
			</View>
			{right}
		</View>
	);
}
