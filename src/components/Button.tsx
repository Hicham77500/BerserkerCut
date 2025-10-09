/**
 * @fileoverview Composant Button réutilisable avec architecture clean
 * @description Composant de la couche PRESENTATION implémentant un bouton flexible
 * avec variants, tailles et états multiples. Optimisé pour iOS et Android avec
 * gestion des interactions tactiles et accessibilité.
 * 
 * @author BerserkerCut Team
 * @version 1.0.4
 * @since 2025-07-21
 * 
 * Architecture:
 * - Couche PRESENTATION (UI Components)
 * - Design System centralisé (Colors, Typography, Spacing)
 * - Props typées pour sécurité TypeScript
 * - Optimisations cross-platform iOS/Android
 * 
 * Fonctionnalités:
 * - 5 variants visuels (primary, secondary, outline, ghost, danger)
 * - 3 tailles configurables (sm, md, lg)
 * - États loading et disabled intégrés
 * - Support d'icônes avec texte
 * - Responsive fullWidth
 * - Accessibilité native
 * 
 * @example
 * ```tsx
 * // Bouton principal simple
 * <Button 
 *   title="Connexion" 
 *   variant="primary" 
 *   onPress={handleLogin} 
 * />
 * 
 * // Bouton avec loading
 * <Button 
 *   title="Enregistrement..." 
 *   variant="secondary"
 *   loading={isLoading}
 *   disabled={!isValid}
 * />
 * 
 * // Bouton outline avec icône
 * <Button 
 *   title="Ajouter" 
 *   variant="outline"
 *   size="lg"
 *   icon={<PlusIcon />}
 *   fullWidth
 * />
 * ```
 */

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator,
  TouchableOpacityProps,
  Platform,
  View
} from 'react-native';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../utils/theme';

/**
 * Variantes visuelles disponibles pour le bouton
 * @description Définit les styles et comportements visuels du bouton
 */
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

/**
 * Tailles disponibles pour le bouton
 * @description Contrôle les dimensions et l'espacement interne
 */
type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Propriétés du composant Button
 * @description Interface complète étendant TouchableOpacityProps pour compatibilité native
 */
interface ButtonProps extends TouchableOpacityProps {
  /** Texte affiché dans le bouton */
  title: string;
  
  /** Variante visuelle du bouton @default 'primary' */
  variant?: ButtonVariant;
  
  /** Taille du bouton @default 'md' */
  size?: ButtonSize;
  
  /** État de chargement avec spinner @default false */
  loading?: boolean;
  
  /** État désactivé @default false */
  disabled?: boolean;
  
  /** Bouton pleine largeur @default false */
  fullWidth?: boolean;
  
  /** Icône optionnelle affichée avant le texte */
  icon?: React.ReactNode;
  
  /** Couleur personnalisée pour le texte (override les variants) */
  textColor?: string;
  
  /** Couleur personnalisée pour l'arrière-plan (override les variants) */
  backgroundColor?: string;
}

/**
 * Composant Button réutilisable et accessible
 * @description Bouton polyvalent avec gestion complète des états et optimisations cross-platform.
 * Implémente les meilleures pratiques d'accessibilité et d'interaction utilisateur.
 * 
 * Optimisations cross-platform:
 * - Gestion des ombres différente iOS/Android
 * - Ajustements de hauteur pour Material Design
 * - Amélioration du contraste texte sur Android
 * - Gestion de l'activeOpacity adaptée
 * 
 * États gérés:
 * - Normal, hover, pressed, disabled, loading
 * - Accessibilité pour lecteurs d'écran
 * - Feedback tactile natif
 * 
 * @param props - Propriétés du composant
 * @returns Composant Button configuré et accessible
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  textColor,
  backgroundColor,
  style,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  
  /**
   * Construction du style du conteneur
   * @description Combine les styles de base, variant, taille et états
   */
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    backgroundColor && { backgroundColor },
    style,
  ].filter(Boolean); // Filtre les valeurs falsy

  /**
   * Construction du style du texte
   * @description Combine les styles de texte selon variant, taille et états
   */
  const textStyle = [
    styles.baseText,
    styles[`${variant}Text` as keyof typeof styles] as TextStyle,
    styles[`${size}Text` as keyof typeof styles] as TextStyle,
    (disabled || loading) && styles.disabledText,
    textColor && { color: textColor },
  ].filter(Boolean); // Filtre les valeurs falsy

  /**
   * Configuration de l'accessibilité
   * @description Propriétés pour améliorer l'expérience des lecteurs d'écran
   */
  const accessibilityProps = {
    accessible,
    accessibilityRole: 'button' as const,
    accessibilityLabel: accessibilityLabel || title,
    accessibilityHint: accessibilityHint || undefined,
    accessibilityState: {
      disabled: disabled || loading,
      busy: loading,
    },
  };

  /**
   * Contenu du bouton selon l'état
   * @description Affiche soit le spinner de loading, soit le contenu normal
   */
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={getSpinnerColor(variant)} 
            style={styles.spinner}
          />
          <Text style={[textStyle, styles.loadingText]}>
            {title}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        <Text style={textStyle}>
          {title}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={getActiveOpacity(variant)}
      {...accessibilityProps}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

/**
 * Détermine la couleur du spinner selon le variant
 * @description Assure un contraste optimal du spinner sur chaque arrière-plan
 * 
 * @param variant - Variante du bouton
 * @returns Couleur optimale pour le spinner
 */
function getSpinnerColor(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
    case 'secondary':
    case 'danger':
      return Colors.textDark; // Spinner sombre sur fond coloré
    case 'outline':
    case 'ghost':
      return Colors.primary; // Spinner coloré sur fond transparent
    default:
      return Colors.primary;
  }
}

/**
 * Détermine l'opacité active selon le variant
 * @description Adapte le feedback visuel selon le style du bouton
 * 
 * @param variant - Variante du bouton
 * @returns Valeur d'opacité pour l'état pressed
 */
function getActiveOpacity(variant: ButtonVariant): number {
  // Les boutons outline et ghost nécessitent moins d'opacité pour rester visibles
  if (variant === 'outline' || variant === 'ghost') {
    return Platform.OS === 'android' ? 0.7 : 0.85;
  }
  
  return Platform.OS === 'android' ? 0.6 : 0.8;
}

/**
 * Styles du composant avec optimisations cross-platform
 * @description Styles organisés par catégorie avec gestion des spécificités iOS/Android
 */
const styles = StyleSheet.create({
  /**
   * Style de base appliqué à tous les boutons
   * @description Structure fondamentale avec alignement et bordures
   */
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl, // Updated to use our XL radius for iOS style
    overflow: 'hidden', // Évite les débordements sur Android
    // Improved shadows for iOS
    ...(Platform.OS === 'ios' ? Shadows.md : {}),
  } as ViewStyle,

  /**
   * Conteneur pour le contenu normal (icône + texte)
   * @description Gestion de l'espacement entre icône et texte
   */
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  /**
   * Conteneur pour l'état loading
   * @description Alignement spinner + texte pendant le chargement
   */
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  /**
   * Conteneur pour l'icône
   * @description Espacement approprié entre icône et texte
   */
  iconContainer: {
    marginRight: Spacing.xs,
  } as ViewStyle,

  /**
   * Style du spinner de loading
   * @description Positionnement et espacement du spinner
   */
  spinner: {
    marginRight: Spacing.xs,
  } as ViewStyle,

  /**
   * Style du texte en état loading
   * @description Légère opacité pour indiquer l'état de chargement
   */
  loadingText: {
    opacity: 0.8,
  } as TextStyle,

  // === VARIANTS ===
  
  /**
   * Variant primary - Bouton principal de l'application
   * @description Style pour les actions principales (connexion, validation, etc.)
   */
  primary: {
    backgroundColor: Colors.primary,
    // Élévation Material Design sur Android
    ...(Platform.OS === 'android' ? { elevation: 2 } : {}),
  } as ViewStyle,

  /**
   * Variant secondary - Bouton secondaire
   * @description Style pour les actions secondaires importantes
   */
  secondary: {
    backgroundColor: Colors.secondary,
    ...(Platform.OS === 'android' ? { elevation: 1 } : {}),
  } as ViewStyle,

  /**
   * Variant outline - Bouton avec bordure uniquement
   * @description Style pour les actions alternatives sans dominer visuellement
   */
  outline: {
    backgroundColor: Platform.OS === 'android'
      ? 'rgba(184, 115, 51, 0.08)'
      : 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    // Suppression complète des ombres sur Android pour éviter les artifacts
    ...(Platform.OS === 'android' ? { 
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    } : {}),
  } as ViewStyle,

  /**
   * Variant ghost - Bouton transparent
   * @description Style pour les actions discrètes (annuler, retour, etc.)
   */
  ghost: {
    backgroundColor: 'transparent',
  } as ViewStyle,

  /**
   * Variant danger - Bouton pour actions destructives
   * @description Style pour les actions à risque (supprimer, déconnecter, etc.)
   */
  danger: {
    backgroundColor: Colors.error,
    ...(Platform.OS === 'android' ? { elevation: 2 } : {}),
  } as ViewStyle,

  // === TAILLES ===

  /**
   * Taille small - Bouton compact
   * @description Pour les espaces restreints ou actions secondaires
   */
  sm: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: Platform.OS === 'android' ? 40 : 36, // Hauteur minimale Material Design
  } as ViewStyle,

  /**
   * Taille medium - Taille standard
   * @description Taille par défaut pour la plupart des cas d'usage
   */
  md: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: Platform.OS === 'android' ? 52 : 44, // Updated to iOS standard 44pt height
  } as ViewStyle,

  /**
   * Taille large - Bouton proéminent
   * @description Pour les actions principales importantes (CTA)
   */
  lg: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: Platform.OS === 'android' ? 60 : 52, // Updated to iOS standard large control
  } as ViewStyle,

  // === ÉTATS ===

  /**
   * État disabled - Bouton désactivé
   * @description Réduction d'opacité pour indiquer l'indisponibilité
   */
  disabled: {
    opacity: 0.5,
  } as ViewStyle,

  /**
   * Mode fullWidth - Bouton pleine largeur
   * @description S'étend sur toute la largeur du conteneur parent
   */
  fullWidth: {
    width: '100%',
  } as ViewStyle,

  // === STYLES DE TEXTE ===

  /**
   * Style de base pour le texte
   * @description Typographie fondamentale avec optimisations iOS et Android
   */
  baseText: {
    ...Typography.button,
    textAlign: 'center',
    // Platform-specific typography optimizations
    ...(Platform.OS === 'android' ? { 
      fontWeight: '600',
      letterSpacing: 0.5,
      includeFontPadding: false, // Évite l'espacement vertical supplémentaire
    } : {
      letterSpacing: 0.35, // iOS-optimized letter spacing
      fontWeight: '600',   // SF Pro medium weight
    }),
  } as TextStyle,

  /**
   * Texte pour variant primary
   * @description Contraste optimal sur fond coloré
   */
  primaryText: {
    color: Colors.text,
    fontWeight: 'bold',
  } as TextStyle,

  /**
   * Texte pour variant secondary
   * @description Lisibilité sur fond secondaire
   */
  secondaryText: {
    color: Colors.text,
    fontWeight: 'bold',
  } as TextStyle,

  /**
   * Texte pour variant outline
   * @description Couleur brand avec optimisations Android
   */
  outlineText: {
    color: Colors.primary,
    fontWeight: Platform.OS === 'android' ? '700' : 'bold',
    // Améliorations spécifiques Android pour la visibilité
    ...(Platform.OS === 'android' ? {
      letterSpacing: 0.8,
      textShadowColor: 'rgba(0,0,0,0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    } : {}),
  } as TextStyle,

  /**
   * Texte pour variant ghost
   * @description Couleur brand sur fond transparent
   */
  ghostText: {
    color: Colors.text,
    fontWeight: '600',
  } as TextStyle,

  /**
   * Texte pour variant danger
   * @description Contraste sur fond d'erreur
   */
  dangerText: {
    color: Colors.text,
    fontWeight: 'bold',
  } as TextStyle,

  /**
   * Texte en état disabled
   * @description Opacité réduite pour l'état désactivé
   */
  disabledText: {
    opacity: 0.7,
  } as TextStyle,

  // === TAILLES DE TEXTE ===

  /**
   * Texte taille small
   * @description Typographie pour boutons compacts
   */
  smText: {
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,

  /**
   * Texte taille medium
   * @description Typographie standard
   */
  mdText: {
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,

  /**
   * Texte taille large
   * @description Typographie pour boutons proéminents
   */
  lgText: {
    fontSize: 18,
    lineHeight: 28,
  } as TextStyle,
});
