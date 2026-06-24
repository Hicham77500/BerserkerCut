/**
 * Module: src/hooks/useAuth.tsx
 * Utilite: Contient la logique fonctionnelle de cette partie de BerserkerCut.
 * Navigation: Voir les exports nommes pour les points d'entree publics.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { AuthService } from '@/services/auth';
import { DemoAuthService } from '@/services/demoAuth';
import { User, AuthContextType, UserProfile } from '@/types';
import { getSecureItem, setSecureItem } from '@/utils/storage/secureStorage';
import { PRIVACY_CONSENT_SHOWN, CLOUD_CONSENT_STORAGE_KEY } from '@/constants/storageKeys';
import { PrivacyConsentModal } from '@/components';
import {
  isDemoMode,
  addModeChangeListener,
  initializeAppMode,
} from '@/services/appModeService';
import { ProfileHistoryService } from '@/services/profileHistory';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

let demoAuthInitialized = false;

/**
 * Composant: AuthProvider
 * Utilite: Gere le rendu UI et les interactions utilisateur de cet ecran/composant.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrivacyConsent, setShowPrivacyConsent] = useState(false);
  const [initialCloudConsent, setInitialCloudConsent] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let unsubscribeAuth: (() => void) | undefined;

/**
 * Fonction: prepareAuth
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
    const prepareAuth = async () => {
      try {
        await initializeAppMode();

        if (isDemoMode() && !demoAuthInitialized) {
          demoAuthInitialized = true;
          await DemoAuthService.initialize();
        }

        unsubscribeAuth = AuthService.onAuthStateChanged(async (currentUser) => {
          if (!isMounted) return;
          
          setUser(currentUser);
          
          // Si l'utilisateur est connecté, vérifier s'il a déjà vu la modal de consentement
          if (currentUser) {
            const [storedConsent, hasShownConsent] = await Promise.all([
              getSecureItem(CLOUD_CONSENT_STORAGE_KEY),
              getSecureItem(PRIVACY_CONSENT_SHOWN),
            ]);

            setInitialCloudConsent(storedConsent === 'true');

            if (!hasShownConsent) {
              setShowPrivacyConsent(true);
            } else {
              setShowPrivacyConsent(false);
            }
          } else {
            setShowPrivacyConsent(false);
          }
          
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

/**
 * Fonction: login
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const userData = await AuthService.login(email, password);
      setUser(userData);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  };

/**
 * Fonction: register
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
  const register = async (email: string, password: string): Promise<void> => {
    try {
      const userData = await AuthService.register(email, password);
      setUser(userData);
      await ProfileHistoryService.append(userData, 'account_created');
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  };

/**
 * Fonction: logout
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

/**
 * Fonction: deleteAccount
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
  const deleteAccount = async (): Promise<void> => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      await AuthService.deleteAccount(user.id);
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      throw error;
    }
  };

/**
 * Fonction: updateProfile
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
  const updateProfile = async (profileUpdates: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      const updatedUser = await AuthService.updateProfile(user.id, profileUpdates);
      setUser(updatedUser);
      const reason = 'objective' in profileUpdates ? 'goal_updated' : 'profile_updated';
      await ProfileHistoryService.append(updatedUser, reason);
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
    deleteAccount,
    updateProfile,
  };

/**
 * Fonction: handlePrivacyConsent
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
  const handlePrivacyConsent = async (cloudConsent: boolean) => {
    await setSecureItem(CLOUD_CONSENT_STORAGE_KEY, cloudConsent ? 'true' : 'false');
    await setSecureItem(PRIVACY_CONSENT_SHOWN, 'true');
    setInitialCloudConsent(cloudConsent);
    setShowPrivacyConsent(false);
  };

  return (
    <>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
      <PrivacyConsentModal
        visible={showPrivacyConsent}
        initialCloudConsent={initialCloudConsent}
        onClose={() => setShowPrivacyConsent(false)}
        onConsent={handlePrivacyConsent}
      />
    </>
  );
};

/**
 * Fonction: useAuth
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
