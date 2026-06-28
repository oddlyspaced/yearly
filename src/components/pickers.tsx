import { Pressable, ScrollView, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, radii, spacing } from '@/theme';
import { Text } from '@/components/ui';

const SCROLL_PAD = { paddingHorizontal: 2, gap: spacing.sm };

// ── ChipSelector ──────────────────────────────────────────────────────────────

interface ChipSelectorProps<T extends string> {
	options: { label: string; value: T }[];
	value: T;
	onChange: (value: T) => void;
}

/** Horizontal scroll of pill chips; selected = filled ink. */
export function ChipSelector<T extends string>({
	options,
	value,
	onChange,
}: ChipSelectorProps<T>) {
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={SCROLL_PAD}
		>
			{options.map((opt) => {
				const active = opt.value === value;
				return (
					<Pressable
						key={opt.value}
						onPress={() => onChange(opt.value)}
						style={({ pressed }) => ({
							height: 40,
							paddingHorizontal: spacing.base,
							borderRadius: radii.pill,
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: active
								? colors.ink
								: colors.surface,
							borderWidth: 1,
							borderColor: active ? colors.ink : colors.line,
							opacity: pressed ? 0.8 : 1,
						})}
					>
						<Text
							variant='small'
							weight={active ? 'semibold' : 'medium'}
							color={active ? colors.onAccent : colors.inkMuted}
						>
							{opt.label}
						</Text>
					</Pressable>
				);
			})}
		</ScrollView>
	);
}

// ── IconPicker ────────────────────────────────────────────────────────────────

interface IconPickerProps {
	options: string[];
	value: string;
	onChange: (icon: string) => void;
}

/** Horizontal scroll of icons in selectable circles. */
export function IconPicker({ options, value, onChange }: IconPickerProps) {
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={SCROLL_PAD}
		>
			{options.map((icon) => {
				const active = icon === value;
				return (
					<Pressable
						key={icon}
						onPress={() => onChange(icon)}
						style={({ pressed }) => ({
							width: 52,
							height: 52,
							borderRadius: radii.pill,
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: active
								? colors.ink
								: colors.surface,
							borderWidth: 1,
							borderColor: active ? colors.ink : colors.line,
							opacity: pressed ? 0.8 : 1,
						})}
					>
						<Feather
							name={icon as keyof typeof Feather.glyphMap}
							size={22}
							color={active ? colors.onAccent : colors.inkMuted}
						/>
					</Pressable>
				);
			})}
		</ScrollView>
	);
}

// ── ColorPicker ───────────────────────────────────────────────────────────────

interface ColorPickerProps {
	options: string[];
	value: string;
	onChange: (color: string) => void;
}

/** Row of subtle swatches; selected gets a ring. */
export function ColorPicker({ options, value, onChange }: ColorPickerProps) {
	return (
		<View
			style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' }}
		>
			{options.map((color) => {
				const active = color === value;
				return (
					<Pressable
						key={color}
						onPress={() => onChange(color)}
						style={{
							width: 40,
							height: 40,
							borderRadius: radii.pill,
							alignItems: 'center',
							justifyContent: 'center',
							borderWidth: active ? 2 : 1,
							borderColor: active ? colors.ink : colors.line,
						}}
					>
						<View
							style={{
								width: active ? 26 : 30,
								height: active ? 26 : 30,
								borderRadius: radii.pill,
								backgroundColor: color,
							}}
						/>
					</Pressable>
				);
			})}
		</View>
	);
}
