/**
 * @fileoverview Configuration d'architecture principale pour BerserkerCut
 * @description Définit les couches d'architecture, les patterns et les conventions
 * du projet selon les principes de Clean Architecture et les bonnes pratiques React Native/TypeScript
 * 
 * @author BerserkerCut Team
 * @version 1.0.4
 * @since 2025-07-21
 * 
 * Architecture Overview:
 * ┌─────────────────────────────────────────────────┐
 * │                PRESENTATION                     │
 * │  screens/ components/ navigation/ hooks/        │
 * ├─────────────────────────────────────────────────┤
 * │               APPLICATION                       │
 * │  services/ (business logic & use cases)        │
 * ├─────────────────────────────────────────────────┤
 * │                DOMAIN                          │
 * │  types/ (entities & interfaces)               │
 * ├─────────────────────────────────────────────────┤
 * │              INFRASTRUCTURE                    │
 * │  utils/ (configuration, external APIs, storage)│
 * └─────────────────────────────────────────────────┘
 */

/**
 * Définition des couches d'architecture selon Clean Architecture
 * Chaque couche a ses responsabilités spécifiques et dépend uniquement des couches inférieures
 */
export enum ArchitectureLayer {
  /** Couche de présentation - UI components, screens, navigation */
  PRESENTATION = 'presentation',
  
  /** Couche application - Use cases, business logic, services */
  APPLICATION = 'application',
  
  /** Couche domaine - Entities, interfaces, types métier */
  DOMAIN = 'domain',
  
  /** Couche infrastructure - APIs externes, configuration, utilitaires système */
  INFRASTRUCTURE = 'infrastructure'
}

/**
 * Structure des dossiers selon l'architecture Clean
 * Organisé par responsabilité plutôt que par type de fichier
 */
export const ARCHITECTURE_FOLDERS = {
  // === PRESENTATION LAYER ===
  /** Écrans principaux de l'application */
  SCREENS: 'src/screens',
  
  /** Composants UI réutilisables */
  COMPONENTS: 'src/components', 
  
  /** Configuration de navigation entre écrans */
  NAVIGATION: 'src/navigation',
  
  /** Hooks React personnalisés pour la logique de présentation */
  HOOKS: 'src/hooks',
  
  // === APPLICATION LAYER ===
  /** Services métier et use cases */
  SERVICES: 'src/services',
  
  // === DOMAIN LAYER ===
  /** Types, interfaces et entités métier */
  TYPES: 'src/types',
  
  // === INFRASTRUCTURE LAYER ===
  /** Utilitaires système et configuration externe */
  UTILS: 'src/utils'
} as const;

/**
 * Conventions de nommage pour maintenir la cohérence du code
 * Respecte les standards TypeScript/React Native et améliore la lisibilité
 */
export const NAMING_CONVENTIONS = {
  /** Composants React - PascalCase */
  COMPONENTS: 'PascalCase (ex: UserProfile, MacroCard)',
  
  /** Hooks personnalisés - camelCase avec préfixe "use" */
  HOOKS: 'camelCase with "use" prefix (ex: useAuth, usePlan)',
  
  /** Services - PascalCase avec suffixe "Service" */
  SERVICES: 'PascalCase with "Service" suffix (ex: AuthService, PlanService)',
  
  /** Types et interfaces - PascalCase */
  TYPES: 'PascalCase (ex: User, UserProfile, DailyPlan)',
  
  /** Variables et fonctions - camelCase */
  VARIABLES: 'camelCase (ex: userName, calculateMacros)',
  
  /** Constantes - SCREAMING_SNAKE_CASE */
  CONSTANTS: 'SCREAMING_SNAKE_CASE (ex: API_BASE_URL, DEFAULT_MACROS)',
  
  /** Énumérations - PascalCase pour l'enum, SCREAMING_SNAKE_CASE pour les valeurs */
  ENUMS: 'PascalCase enum, SCREAMING_SNAKE_CASE values (ex: UserRole.PREMIUM_USER)'
} as const;

/**
 * Patterns d'architecture recommandés pour chaque couche
 * Guide les développeurs vers les bonnes pratiques
 */
export const ARCHITECTURE_PATTERNS = {
  /** Patterns pour la couche présentation */
  PRESENTATION: {
    /** Utilisation de composants fonctionnels avec hooks */
    FUNCTIONAL_COMPONENTS: 'Prefer functional components with hooks over class components',
    
    /** Séparation container/présentation */
    CONTAINER_PRESENTATION: 'Separate business logic (hooks) from presentation (components)',
    
    /** Props drilling évité avec Context API */
    CONTEXT_API: 'Use Context API for deep prop drilling, custom hooks for local state',
    
    /** Gestion d\'état locale avec useState/useReducer */
    LOCAL_STATE: 'Use useState for simple state, useReducer for complex state logic'
  },
  
  /** Patterns pour la couche application */
  APPLICATION: {
    /** Services avec méthodes statiques pour les use cases simples */
    SERVICE_LAYER: 'Static methods for stateless operations, instances for stateful services',
    
    /** Error handling centralisé */
    ERROR_HANDLING: 'Centralized error handling with custom error types',
    
    /** Validation des données d\'entrée */
    INPUT_VALIDATION: 'Validate inputs at service layer boundaries',
    
    /** Logging et monitoring */
    MONITORING: 'Add logging for business operations and error tracking'
  },
  
  /** Patterns pour la couche domaine */
  DOMAIN: {
    /** Types stricts avec validation */
    STRICT_TYPES: 'Use strict TypeScript types with branded types for domain concepts',
    
    /** Interfaces segregées */
    INTERFACE_SEGREGATION: 'Small, focused interfaces rather than large ones',
    
    /** Entités immutables */
    IMMUTABLE_ENTITIES: 'Prefer readonly properties and immutable updates',
    
    /** Énumérations typées */
    TYPED_ENUMS: 'Use const assertions and union types over enums when possible'
  },
  
  /** Patterns pour la couche infrastructure */
  INFRASTRUCTURE: {
    /** Abstraction des APIs externes */
    API_ABSTRACTION: 'Abstract external APIs behind domain interfaces',
    
    /** Configuration centralisée */
    CENTRALIZED_CONFIG: 'Centralize configuration in environment-aware modules',
    
    /** Gestion des erreurs réseau */
    NETWORK_ERROR_HANDLING: 'Implement retry logic and offline handling',
    
    /** Performance et cache */
    CACHING: 'Implement appropriate caching strategies for data and assets'
  }
} as const;

/**
 * Guidelines pour les commentaires et documentation
 * Assure une documentation cohérente et utile
 */
export const DOCUMENTATION_GUIDELINES = {
  /** JSDoc pour toutes les fonctions publiques */
  JSDOC: {
    required: ['@description', '@param', '@returns', '@throws'],
    optional: ['@example', '@since', '@deprecated', '@see'],
    fileHeader: ['@fileoverview', '@author', '@version', '@since']
  },
  
  /** Commentaires inline pour la logique complexe */
  INLINE_COMMENTS: {
    when: 'Explain WHY, not WHAT - focus on business logic and non-obvious decisions',
    format: 'Single line // for short explanations, /* */ for longer descriptions',
    avoid: 'Obvious comments that just repeat the code'
  },
  
  /** Documentation des types complexes */
  TYPE_DOCUMENTATION: {
    interfaces: 'Document purpose and usage of complex interfaces',
    enums: 'Explain when to use each enum value',
    unions: 'Document the meaning of each union member'
  }
} as const;

/**
 * Configuration pour la future transition PWA
 * Prépare l'architecture pour la phase 2 du projet
 */
export const PWA_MIGRATION_CONFIG = {
  /** Code réutilisable à 100% */
  FULLY_REUSABLE: [
    'services/', // Services backend (REST) et logique métier
    'types/',    // Types et interfaces
    'hooks/',    // Hooks React (logique)
    'utils/'     // Utilitaires (sauf platform-specific)
  ],
  
  /** Code nécessitant des adaptations */
  ADAPTATION_REQUIRED: [
    'components/', // Styles et interactions différentes
    'screens/',    // Layout responsive
    'navigation/'  // React Router vs React Navigation
  ],
  
  /** Code platform-specific */
  PLATFORM_SPECIFIC: [
    'storage/',    // AsyncStorage vs localStorage
    'permissions/', // Permissions natives vs web APIs
    'notifications/' // Push notifications natives vs web
  ],
  
  /** Structure cible pour PWA */
  TARGET_STRUCTURE: {
    shared: 'Code commun entre iOS et PWA (90%)',
    mobile: 'Code spécifique React Native',
    web: 'Code spécifique PWA'
  }
} as const;

/**
 * Export de la configuration complète pour utilisation dans l'application
 */
export const ARCHITECTURE_CONFIG = {
  layers: ArchitectureLayer,
  folders: ARCHITECTURE_FOLDERS,
  naming: NAMING_CONVENTIONS,
  patterns: ARCHITECTURE_PATTERNS,
  documentation: DOCUMENTATION_GUIDELINES,
  pwa: PWA_MIGRATION_CONFIG
} as const;

/**
 * Type helper pour valider l'architecture
 * Utilisé par les outils de développement pour valider la structure
 */
export type ArchitectureConfig = typeof ARCHITECTURE_CONFIG;
