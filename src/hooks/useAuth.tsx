/** Contexte global d'authentification basé sur `AuthService`. */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService, USE_DEMO_MODE } from '../services/auth';
import { DemoAuthService } from '../services/demoAuth';
import { User, AuthContextType, UserProfile } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let demoAuthInitialized = false;

// Préserve les données imbriquées lors d'une mise à jour partielle de profil.
const mergeUserProfiles = (current: UserProfile, updates: Partial<UserProfile>): UserProfile => {
  const deepMerge = (target: unknown, source: unknown): unknown => {
    if (source === undefined) {
      return target;
    }

    if (Array.isArray(source)) {
      return [...source];
    }

    if (source !== null && typeof source === 'object' && !(source instanceof Date)) {
      const base = target !== null && target !== undefined && typeof target === 'object' && !Array.isArray(target)
        ? target as Record<string, unknown>
        : {};

      const result: Record<string, unknown> = { ...base };

      Object.entries(source as Record<string, unknown>).forEach(([key, value]) => {
        result[key] = deepMerge(base[key], value);
      });

      return result;
    }

    if (source instanceof Date) {
      return new Date(source.getTime());
    }

    return source;
  };

  return deepMerge(current, updates) as UserProfile;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Fournit l'état d'authentification et les actions associées aux descendants.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to prevent infinite loading state
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - forcing loading state to complete');
        setLoading(false);
      }
    }, 5000); // 5 seconds timeout

    if (USE_DEMO_MODE && !demoAuthInitialized) {
      demoAuthInitialized = true;
      DemoAuthService.initialize().catch((error) => {
        console.error('Erreur lors de l\'initialisation du mode démo:', error);
      });
    }

    try {
      const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // For web platform or if we need to fetch the full user profile
            // since Firebase Auth doesn't store our custom User type
            const userData = await AuthService.getUserProfile(firebaseUser.uid);
            setUser(userData);
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        
        // Clear loading state after auth state is determined
        setLoading(false);
      });

      return () => {
        clearTimeout(loadingTimeout);
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setLoading(false); // Ensure loading state is cleared on error
      return () => clearTimeout(loadingTimeout);
    }
  }, [loading]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const userData = await AuthService.login(email, password);
      setUser(userData);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    try {
      const userData = await AuthService.register(email, password);
      setUser(userData);
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  const updateProfile = async (profileUpdates: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    try {
      await AuthService.updateProfile(user.id, profileUpdates);
      
      // Mettre à jour l'état local
      setUser(prev => prev ? {
        ...prev,
        profile: mergeUserProfiles(prev.profile, profileUpdates),
        updatedAt: new Date()
      } : null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Récupère le contexte d'authentification typé. */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
