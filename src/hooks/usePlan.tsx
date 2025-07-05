/**
 * Context des plans quotidiens
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PlanService } from '../services/plan';
import { DailyPlan, PlanContextType } from '../types';
import { useAuth } from './useAuth';

const PlanContext = createContext<PlanContextType | undefined>(undefined);

interface PlanProviderProps {
  children: ReactNode;
}

export const PlanProvider: React.FC<PlanProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadTodaysPlan();
    } else {
      setCurrentPlan(null);
    }
  }, [user]);

  const loadTodaysPlan = async (): Promise<void> => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let plan = await PlanService.getTodaysPlan(user.id);
      
      // Si aucun plan n'existe pour aujourd'hui, en générer un
      if (!plan) {
        plan = await PlanService.generateDailyPlan(user);
      }
      
      setCurrentPlan(plan);
    } catch (err) {
      console.error('Erreur lors du chargement du plan:', err);
      setError('Erreur lors du chargement du plan quotidien');
    } finally {
      setLoading(false);
    }
  };

  const generateDailyPlan = async (): Promise<void> => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const plan = await PlanService.generateDailyPlan(user);
      setCurrentPlan(plan);
    } catch (err) {
      console.error('Erreur lors de la génération du plan:', err);
      setError('Erreur lors de la génération du plan quotidien');
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (planId: string, updates: Partial<DailyPlan>): Promise<void> => {
    // Cette fonction sera implémentée plus tard si nécessaire
    console.log('Mise à jour du plan:', planId, updates);
  };

  const markSupplementTaken = async (supplementId: string): Promise<void> => {
    if (!currentPlan) return;
    
    try {
      await PlanService.markSupplementTaken(currentPlan.id, supplementId);
      
      // Mettre à jour l'état local
      setCurrentPlan(prev => {
        if (!prev) return null;
        
        const updatedSupplementPlan = { ...prev.supplementPlan };
        
        // Marquer le supplément comme pris dans tous les créneaux
        Object.keys(updatedSupplementPlan).forEach(timeSlot => {
          const supplements = updatedSupplementPlan[timeSlot as keyof typeof updatedSupplementPlan];
          supplements.forEach(supplement => {
            if (supplement.supplementId === supplementId) {
              supplement.taken = true;
            }
          });
        });
        
        return {
          ...prev,
          supplementPlan: updatedSupplementPlan
        };
      });
    } catch (err) {
      console.error('Erreur lors de la mise à jour du supplément:', err);
      setError('Erreur lors de la mise à jour du supplément');
    }
  };

  const value: PlanContextType = {
    currentPlan,
    loading,
    error,
    generateDailyPlan,
    updatePlan,
    markSupplementTaken
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};

export const usePlan = (): PlanContextType => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};
