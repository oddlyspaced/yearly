import * as Haptics from 'expo-haptics';

/**
 * Tasteful, centralized haptics. All calls are fire-and-forget and swallow
 * errors (haptics are unavailable on some devices / the simulator).
 */
export const haptics = {
	/** Light tap — steppers, small value changes. */
	light: () =>
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
	/** Medium tap — destructive / weightier actions. */
	medium: () =>
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
	/** Selection tick — tabs, chips, segmented, pickers, nav. */
	selection: () => Haptics.selectionAsync().catch(() => {}),
	/** Success notification — completing a goal, creating. */
	success: () =>
		Haptics.notificationAsync(
			Haptics.NotificationFeedbackType.Success,
		).catch(() => {}),
};
