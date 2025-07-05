/**
 * Thème de couleurs pour BerserkerCut
 * Design moderne et professionnel pour une app de fitness
 */

export const Colors = {
  // Couleurs principales
  primary: '#FF6B35',      // Orange énergique
  primaryDark: '#E55A2B',  // Orange foncé
  primaryLight: '#FF8F70', // Orange clair
  
  // Couleurs secondaires
  secondary: '#2E3A59',    // Bleu marine
  secondaryDark: '#1F2937', // Bleu très foncé
  secondaryLight: '#4F5B73', // Bleu gris
  
  // Couleurs d'accent
  accent: '#10B981',       // Vert succès
  accentDark: '#059669',   // Vert foncé
  accentLight: '#34D399',  // Vert clair
  
  // Couleurs de fond
  background: '#F8FAFC',   // Blanc cassé
  backgroundDark: '#1E293B', // Sombre
  surface: '#FFFFFF',      // Blanc pur
  surfaceDark: '#334155',  // Gris foncé
  
  // Couleurs de texte
  text: '#1F2937',         // Noir/gris très foncé
  textLight: '#6B7280',    // Gris moyen
  textDark: '#FFFFFF',     // Blanc
  textMuted: '#9CA3AF',    // Gris clair
  
  // Couleurs d'état
  success: '#10B981',      // Vert
  warning: '#F59E0B',      // Jaune/orange
  error: '#EF4444',        // Rouge
  info: '#3B82F6',         // Bleu
  
  // Couleurs spécifiques nutrition
  protein: '#E11D48',      // Rouge pour protéines
  carbs: '#3B82F6',        // Bleu pour glucides
  fat: '#F59E0B',          // Jaune pour lipides
  calories: '#8B5CF6',     // Violet pour calories
  
  // Couleurs transparentes
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Couleurs de bordure
  border: '#E5E7EB',       // Gris très clair
  borderDark: '#4B5563',   // Gris foncé
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
} as const;

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
} as const;

export const Shadows = {
  sm: {
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

export type ColorKey = keyof typeof Colors;
export type SpacingKey = keyof typeof Spacing;
export type BorderRadiusKey = keyof typeof BorderRadius;
export type TypographyKey = keyof typeof Typography;
