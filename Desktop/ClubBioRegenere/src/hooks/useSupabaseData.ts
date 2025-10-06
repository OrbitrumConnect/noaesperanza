import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BiomarcadorIsafe {
  id?: string;
  user_id: string;
  assessment_date: string;
  imc?: number;
  percentual_gordura?: number;
  percentual_massa_muscular?: number;
  gordura_visceral?: number;
  circunferencia_cintura?: number;
  razao_cintura_quadril?: number;
  razao_cintura_estatura?: number;
  circunferencia_pescoco?: number;
  preensao_manual_direita?: number;
  preensao_manual_esquerda?: number;
  vo2?: number;
  isafe_score?: number;
  isafe_zona?: string;
  capacidade_funcional_1?: number;
  limitacoes_aspectos_fisicos?: number;
  capacidade_funcional_2?: number;
  nivel_dor_1?: number;
  nivel_dor_2?: number;
  vitalidade?: number;
  fadiga?: number;
  auto_relato_animo?: number;
  estresse?: number;
  nivel_ansiedade?: number;
  saude_bem_estar_mental?: number;
  saude_social?: number;
  auto_percepcao_felicidade?: number;
  saude_emocional?: number;
  nivel_sonolencia?: number;
  qualidade_sono?: number;
  disposicao_acordar?: number;
  saude_geral?: number;
  auto_percepcao_saude?: number;
  coeficiente_gratidao?: number;
  religiao_espiritualidade?: number;
  satisfacao_vida?: number;
  coeficiente_garra?: number;
  horas_sentado?: string;
  horas_tv_dia?: string;
  horas_tv_fim_semana?: string;
  escala_bristol?: number;
}

interface EducationalPlan {
  id?: string;
  user_id: string;
  plan_name: string;
  plan_type?: string;
  duration_days?: number;
  status?: string;
  meal_plans?: any;
  exercise_plans?: any;
  microverdes_schedule?: any;
  frequency_therapy?: any;
  biohacking_practices?: any;
  progress_markers?: any;
  created_at?: string;
  updated_at?: string;
}

export function useSupabaseData(userId?: string) {
  const [biomarcadores, setBiomarcadores] = useState<BiomarcadorIsafe[]>([]);
  const [educationalPlans, setEducationalPlans] = useState<EducationalPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBiomarcadores = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('biomarcadores_isafe')
        .select('*')
        .eq('user_id', userId)
        .order('assessment_date', { ascending: false });

      if (error) {
        throw error;
      }

      setBiomarcadores(data || []);
    } catch (error) {
      console.error('Erro ao carregar biomarcadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBiomarcador = async (data: Partial<BiomarcadorIsafe>) => {
    if (!userId) return;

    try {
      const dataToSave = {
        ...data,
        user_id: userId,
        assessment_date: data.assessment_date || new Date().toISOString().split('T')[0]
      };

      const { data: savedData, error } = await supabase
        .from('biomarcadores_isafe')
        .upsert(dataToSave)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setBiomarcadores(prev => {
        const filtered = prev.filter(item => item.id !== savedData.id);
        return [savedData, ...filtered].sort((a, b) => 
          new Date(b.assessment_date).getTime() - new Date(a.assessment_date).getTime()
        );
      });

      return savedData;
    } catch (error) {
      console.error('Erro ao salvar biomarcador:', error);
      throw error;
    }
  };

  const loadEducationalPlans = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('educational_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setEducationalPlans(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos educacionais:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEducationalPlan = async (planData: Partial<EducationalPlan>) => {
    if (!userId) return;

    try {
      const dataToSave = {
        ...planData,
        user_id: userId,
        plan_name: planData.plan_name || 'Plano Personalizado'
      };

      const { data, error } = await supabase
        .from('educational_plans')
        .upsert(dataToSave)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setEducationalPlans(prev => {
        const filtered = prev.filter(plan => plan.id !== data.id);
        return [data, ...filtered].sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
      });

      return data;
    } catch (error) {
      console.error('Erro ao salvar plano educacional:', error);
      throw error;
    }
  };

  const getLatestBiomarcador = () => {
    return biomarcadores.length > 0 ? biomarcadores[0] : null;
  };

  const getActivePlans = () => {
    return educationalPlans.filter(plan => plan.status === 'ativo');
  };

  useEffect(() => {
    if (userId) {
      loadBiomarcadores();
      loadEducationalPlans();
    }
  }, [userId]);

  return {
    biomarcadores,
    educationalPlans,
    loading,
    loadBiomarcadores,
    saveBiomarcador,
    loadEducationalPlans,
    saveEducationalPlan,
    getLatestBiomarcador,
    getActivePlans
  };
}