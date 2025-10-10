/**
 * Déclarations de types globaux pour BerserkerCut
 */

declare global {
  /**
   * Étend l'objet global pour inclure la navigation
   */
  var navigation: {
    openDrawer?: () => void;
    closeDrawer?: () => void;
  };
}

export {};