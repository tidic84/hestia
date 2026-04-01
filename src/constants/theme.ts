// Hestia Design System — "The Digital Sanctuary"
// Dark mode adaptation of the Stitch design tokens
// Warm charcoal base, terracotta accents, organic feel

export const colors = {
  // Surfaces — warm charcoal layers, never pure black
  background: '#1c1816',        // darkened on_background
  surface: '#2a2420',           // dark warm surface
  surfaceLight: '#34302d',      // inverse_surface from design system
  surfaceBright: '#3d3733',     // elevated surface

  // Primary — terracotta palette
  primary: '#C27D65',           // overridePrimaryColor
  primaryDark: '#874c37',       // primary from design system
  primaryContainer: '#a4644e',  // primary_container
  primaryLight: '#ffb59c',      // inverse_primary

  // Secondary — warm neutrals
  secondary: '#605e5b',         // secondary
  secondaryContainer: '#484744', // muted container

  // Tertiary — sage green for accents
  accent: '#8A9A5B',            // overrideTertiaryColor
  accentDark: '#536229',        // tertiary
  accentLight: '#bdce89',       // tertiary_fixed_dim

  // Text — warm whites, never pure white
  text: '#f8efea',              // inverse_on_surface
  textSecondary: '#d8c2bb',     // outline_variant
  textMuted: '#85736e',         // outline

  // Semantic
  success: '#8A9A5B',           // reuse sage for success
  error: '#ba1a1a',             // error
  errorContainer: '#ffdad6',    // error_container

  // Structural — no hard borders, use tonal shifts
  border: '#3d3733',            // subtle tonal border
  overlay: 'rgba(28, 24, 22, 0.75)',

  // Glassmorphism
  glass: 'rgba(52, 48, 45, 0.8)', // inverse_surface at 80%
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  hero: 48,
} as const;

export const borderRadius = {
  sm: 12,       // was 8 — rounder per design system
  md: 16,       // was 12
  lg: 24,       // was 16 — generous rounding
  xl: 32,       // was 24
  full: 9999,
} as const;

// Font families for use with expo-google-fonts or system fallback
export const fonts = {
  serif: 'NotoSerif',               // headlines, emotional anchors
  sans: 'PlusJakartaSans',          // UI, body, functional text
  // Fallbacks used until custom fonts load
  serifFallback: 'serif',
  sansFallback: 'System',
} as const;
