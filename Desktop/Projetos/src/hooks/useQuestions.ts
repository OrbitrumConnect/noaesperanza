import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabase';

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  era?: string;
  era_slug?: string;
}

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🎲 Embaralhar array de opções mantendo o índice correto
  const shuffleOptions = useCallback((options: string[], correctIndex: number) => {
    const shuffled = [...options];
    let correctAnswer = shuffled[correctIndex];
    
    // Embaralhar o array
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Encontrar o novo índice da resposta correta
    const newCorrectIndex = shuffled.findIndex(option => option === correctAnswer);
    
    return {
      shuffledOptions: shuffled,
      correctIndex: newCorrectIndex
    };
  }, []);

  // 📚 Buscar perguntas do banco de dados
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await (supabase as any)
        .from('knowledge_items')
        .select(`
          id,
          question,
          correct_answer,
          wrong_options,
          era_id,
          eras!inner(name, slug)
        `)
        .eq('item_type', 'qa')
        .not('question', 'is', null)
        .not('correct_answer', 'is', null)
        .not('wrong_options', 'is', null)
        .limit(100);
      
      if (error) throw error;
      
      const allQuestions = (data || []).map((item: any) => {
        const wrongOptions = Array.isArray(item.wrong_options) ? item.wrong_options : [];
        const correctAnswer = item.correct_answer;
        const options = [correctAnswer, ...wrongOptions].slice(0, 4);
        
        // Embaralhar opções para cada pergunta
        const { shuffledOptions, correctIndex } = shuffleOptions(options, 0);
        
        return {
          id: item.id,
          question: item.question,
          options: shuffledOptions,
          correct_answer: correctIndex,
          era: item.eras?.name || 'Geral',
          era_slug: item.eras?.slug || 'geral'
        };
      });
      
      // 🎲 RANDOMIZAR E SELECIONAR 25 PERGUNTAS DIFERENTES
      const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffledQuestions.slice(0, 25);
      
      setQuestions(selectedQuestions);
      console.log('✅ Perguntas PvP carregadas do knowledge_items:', selectedQuestions.length);
      console.log('🎲 Perguntas randomizadas para variedade a cada partida');
    } catch (err) {
      console.error('❌ Erro ao buscar perguntas PvP:', err);
      setError('Erro ao carregar perguntas');
      
      // Fallback para perguntas demo em caso de erro
      const fallbackQuestions: Question[] = [
        { 
          id: 1, 
          question: 'Qual foi a primeira civilização a desenvolver a escrita?', 
          options: ['Egípcia', 'Suméria', 'Chinesa', 'Grega'], 
          correct_answer: 1 
        },
        { 
          id: 2, 
          question: 'Quem escreveu "Dom Casmurro"?', 
          options: ['Machado de Assis', 'José de Alencar', 'Castro Alves', 'Graciliano Ramos'], 
          correct_answer: 0 
        },
        { 
          id: 3, 
          question: 'Qual é a capital do Canadá?', 
          options: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'], 
          correct_answer: 2 
        }
      ];
      
      setQuestions(fallbackQuestions);
    } finally {
      setLoading(false);
    }
  }, [shuffleOptions]);

  // 🔄 Recarregar perguntas
  const reloadQuestions = useCallback(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // 🎯 Obter pergunta específica
  const getQuestion = useCallback((index: number): Question | null => {
    if (index >= 0 && index < questions.length) {
      return questions[index];
    }
    return null;
  }, [questions]);

  // 📊 Obter estatísticas
  const getStats = useCallback(() => {
    return {
      total: questions.length,
      byEra: questions.reduce((acc, q) => {
        const era = q.era || 'Geral';
        acc[era] = (acc[era] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [questions]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    error,
    reloadQuestions,
    getQuestion,
    getStats,
    shuffleOptions
  };
};
