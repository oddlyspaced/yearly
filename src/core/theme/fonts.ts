import {
	Geist_400Regular,
	Geist_500Medium,
	Geist_600SemiBold,
	Geist_700Bold,
	Geist_800ExtraBold,
} from '@expo-google-fonts/geist';
import {
	SpaceMono_400Regular,
	SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';
import { useFonts } from 'expo-font';

/**
 * Loads the type system: Geist (sans) for prose + headings, Space Mono for
 * numbers and small subheading labels. Returns `true` once ready.
 */
export function useAppFonts(): boolean {
	const [loaded] = useFonts({
		Geist_400Regular,
		Geist_500Medium,
		Geist_600SemiBold,
		Geist_700Bold,
		Geist_800ExtraBold,
		SpaceMono_400Regular,
		SpaceMono_700Bold,
	});
	return loaded;
}
