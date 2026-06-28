/**
 * Kaizen design tokens — minimalist, near-monochrome.
 * Color carries no meaning; state is conveyed through ink opacity, fills, and
 * borders. The single "accent" is near-black.
 */

export const palette = {
	bg: '#FFFFFF',
	surface: '#F6F6F7',
	surfaceStrong: '#EFEFF1',
	ink: '#0A0A0A',
	white: '#FFFFFF',
	// opacity-derived inks (precomputed for performance / consistency)
	inkMuted: 'rgba(10,10,10,0.55)',
	inkFaint: 'rgba(10,10,10,0.35)',
	inkGhost: 'rgba(10,10,10,0.18)',
	line: 'rgba(10,10,10,0.08)',
	lineStrong: 'rgba(10,10,10,0.14)',
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
	xxl: 28,
	pill: 999,
} as const;

export const fontSize = {
	caption: 11,
	small: 13,
	body: 15,
	label: 16,
	heading: 20,
	title: 26,
	display: 34,
	mega: 56,
} as const;

export const fontFamily = {
	regular: 'Inter_400Regular',
	medium: 'Inter_500Medium',
	semibold: 'Inter_600SemiBold',
	bold: 'Inter_700Bold',
} as const;

export const theme = { colors, spacing, radii, fontSize, fontFamily };
export type Theme = typeof theme;
