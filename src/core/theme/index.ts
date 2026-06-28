/**
 * Kaizen design tokens — monochrome, in the "Fold" design language:
 * a soft cool-grey canvas with white cards floating on top, soft shadows,
 * generous radii, and bold typography. Color carries no meaning; state is
 * conveyed through ink opacity, fills, and borders. The single accent is ink.
 */

export const palette = {
	/** Neutral light-grey canvas (Vercel/Geist gray) — cards float on top. */
	bg: '#F2F2F2',
	/** White cards / sheets / rows. */
	surface: '#FFFFFF',
	/** Geist accents-2: icon circles, segmented tracks, pressed states, chips. */
	surfaceStrong: '#EAEAEA',
	/** accents-1: very subtle inset fill. */
	surfaceMuted: '#F5F5F5',
	ink: '#000000',
	white: '#FFFFFF',
	// neutral grays (Geist scale) — read on both white cards and the canvas
	inkMuted: '#666666',
	inkFaint: '#8F8F8F',
	inkGhost: '#C7C7C7',
	line: 'rgba(0,0,0,0.08)',
	lineStrong: 'rgba(0,0,0,0.14)',
} as const;

export const colors = {
	...palette,
	accent: palette.ink,
	onAccent: palette.white,
};

export const spacing = {
	xs: 4,
	sm: 8,
	md: 12,
	base: 16,
	lg: 20,
	xl: 24,
	xxl: 32,
	xxxl: 40,
} as const;

export const radii = {
	sm: 8,
	md: 12,
	lg: 16,
	xl: 20,
	xxl: 24,
	card: 22,
	pill: 999,
} as const;

export const fontSize = {
	caption: 11,
	small: 13,
	body: 15,
	label: 16,
	heading: 20,
	title: 28,
	display: 34,
	mega: 52,
} as const;

export const fontFamily = {
	regular: 'Geist_400Regular',
	medium: 'Geist_500Medium',
	semibold: 'Geist_600SemiBold',
	bold: 'Geist_700Bold',
	extrabold: 'Geist_800ExtraBold',
	mono: 'SpaceMono_400Regular',
	monoBold: 'SpaceMono_700Bold',
} as const;

/** Soft, neutral-dark elevation (Fold uses navy-tinted; we keep it monochrome). */
export const shadow = {
	card: {
		shadowColor: '#0A0A0A',
		shadowOpacity: 0.05,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 4 },
		elevation: 2,
	},
	float: {
		shadowColor: '#0A0A0A',
		shadowOpacity: 0.12,
		shadowRadius: 20,
		shadowOffset: { width: 0, height: 10 },
		elevation: 10,
	},
} as const;

export const theme = { colors, spacing, radii, fontSize, fontFamily, shadow };
export type Theme = typeof theme;
