import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserHealthProfile {
  id?: string;
  user_id: string;
  medical_conditions?: string[];
  allergies?: string[];
  current_medications?: string[];
  family_history?: string[];
  dietary_restrictions?: string[];
  exercise_routine?: string;
  sleep_hours?: number;
  stress_level?: number;
  smoking_habits?: string;
  alcohol_consumption?: string;
  previous_surgeries?: string[];
}

interface DailyHabit {
  id?: string;
  user_id: string;
  date: string;
  sleep_quality?: number;
  nutrition_quality?: number;
  exercise_level?: number;
  stress_level?: number;
  energy_level?: number;
  water_intake?: number;
  mood?: string;
  symptoms?: string[];
  notes?: string;
  meal_times?: any;
  supplements_taken?: string[];
}

export function useUserData(userId?: string) {
  const [healthProfile, setHealthProfile] = useState<UserHealthProfile | null>(null);
  const [dailyHabits, setDailyHabits] = useState<DailyHabit[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHealthProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('health_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setHealthProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil de saúde:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveHealthProfile = async (profileData: Partial<UserHealthProfile>) => {
    if (!userId) return;

    try {
      const dataToSave = {
        ...profileData,
        user_id: userId
      };

      const { data, error } = await supabase
        .from('health_profiles')
        .upsert(dataToSave)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setHealthProfile(data);
      return data;
    } catch (error) {
      console.error('Erro ao salvar perfil de saúde:', error);
      throw error;
    }
  };

  const loadDailyHabits = async (startDate?: string, endDate?: string) => {
    if (!userId) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('daily_habits')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setDailyHabits(data || []);
    } catch (error) {
      console.error('Erro ao carregar hábitos diários:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDailyHabit = async (habitData: Partial<DailyHabit>) => {
    if (!userId) return;

    try {
      const dataToSave = {
        ...habitData,
        user_id: userId,
        date: habitData.date || new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('daily_habits')
        .upsert(dataToSave, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setDailyHabits(prev => {
        const filtered = prev.filter(habit => habit.date !== data.date);
        return [data, ...filtered].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

      return data;
    } catch (error) {
      console.error('Erro ao salvar hábito diário:', error);
      throw error;
    }
  };

  const getTodayHabit = () => {
    const today = new Date().toISOString().split('T')[0];
    return dailyHabits.find(habit => habit.date === today);
  };

  useEffect(() => {
    if (userId) {
      loadHealthProfile();
      loadDailyHabits();
    }
  }, [userId]);

  return {
    healthProfile,
    dailyHabits,
    loading,
    loadHealthProfile,
    saveHealthProfile,
    loadDailyHabits,
    saveDailyHabit,
    getTodayHabit
  };
}