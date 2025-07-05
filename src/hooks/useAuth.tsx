/**
 * Context d'authentification
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '../services/auth';
import { User, AuthContextType, UserProfile } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (user: User | null) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
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
      await AuthService.updateProfile(user.id, profileUpdates);
      
      // Mettre à jour l'état local
      setUser(prev => prev ? {
        ...prev,
        profile: { ...prev.profile, ...profileUpdates },
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
