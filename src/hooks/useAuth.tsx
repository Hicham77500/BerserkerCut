/** Contexte global d'authentification basé sur `AuthService`. */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '../services/auth';
import { DemoAuthService } from '../services/demoAuth';
import { User, AuthContextType, UserProfile } from '../types';
import { isDemoMode, addModeChangeListener, initializeAppMode } from '../services/appModeService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let demoAuthInitialized = false;

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
    let isMounted = true;
    let unsubscribeAuth: (() => void) | undefined;

    const prepareAuth = async () => {
      try {
        await initializeAppMode();

        if (isDemoMode() && !demoAuthInitialized) {
          demoAuthInitialized = true;
          await DemoAuthService.initialize();
        }

        unsubscribeAuth = AuthService.onAuthStateChanged((currentUser) => {
          if (!isMounted) return;
          setUser(currentUser);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const unsubscribeModeChange = addModeChangeListener((demoMode) => {
      if (demoMode && !demoAuthInitialized) {
        demoAuthInitialized = true;
        DemoAuthService.initialize().catch((error) => {
          console.error('Erreur lors de l\'initialisation du mode démo:', error);
        });
      }
    });

    prepareAuth();

    return () => {
      isMounted = false;
      unsubscribeAuth?.();
      unsubscribeModeChange();
    };
  }, []);

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
      const updatedUser = await AuthService.updateProfile(user.id, profileUpdates);
      setUser(updatedUser);
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
