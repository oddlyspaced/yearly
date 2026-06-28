import {
	Inter_400Regular,
	Inter_500Medium,
	Inter_600SemiBold,
	Inter_700Bold,
	useFonts,
} from '@expo-google-fonts/inter';

/**
 * Loads the Inter family used across the app. Returns `true` once fonts are
 * ready to render.
 */
export function useAppFonts(): boolean {
	const [loaded] = useFonts({
		Inter_400Regular,
		Inter_500Medium,
		Inter_600SemiBold,
		Inter_700Bold,
	});
	return loaded;
}
