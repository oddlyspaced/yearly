import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

type FeatherIconName = keyof typeof Feather.glyphMap;
type MciIconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Icon names that live in MaterialCommunityIcons rather than Feather. */
const MCI_ICONS = new Set<string>(['pill', 'dumbbell']);

interface GlyphProps {
	name: string;
	size: number;
	color: string;
}

/** Renders a goal/ui glyph from the correct icon set based on its name. */
export function Glyph({ name, size, color }: GlyphProps) {
	if (MCI_ICONS.has(name)) {
		return (
			<MaterialCommunityIcons
				name={name as MciIconName}
				size={size}
				color={color}
			/>
		);
	}
	return <Feather name={name as FeatherIconName} size={size} color={color} />;
}
