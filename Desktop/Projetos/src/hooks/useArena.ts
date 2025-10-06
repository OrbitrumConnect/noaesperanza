import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";

interface Question {
  id: string;
  era: string;
  question: string;
  options: string[];
  answer: string;
}

interface Transaction {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  description: string;
  battle_id?: string;
  created_at: string;
}

interface UseArenaResult {
  questions: Question[];
  transactions: Transaction[];
  totalCredits: number;
  loading: boolean;
  error: string | null;
}

export const useArena = (era: string, numQuestions: number = 10): UseArenaResult => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArenaData = async () => {
      setLoading(true);
      setError(null);

      try {
        // --- BUSCA PERGUNTAS ---
        // Primeiro buscar a era pelo slug
        const { data: eraData, error: eraError } = await supabase
          .from("eras")
          .select("id")
          .eq("slug", era)
          .single();

        if (eraError || !eraData) {
          console.warn("Era não encontrada:", era);
          const demoQuestions: Question[] = [
            {
              id: "demo-1",
              era: era,
              question: `Pergunta demo para ${era}`,
              options: ["Opção A", "Opção B", "Opção C", "Opção D"],
              answer: "Opção A"
            }
          ];
          setQuestions(demoQuestions);
        } else {
          // Buscar perguntas da era específica
          const { data: questionsData, error: questionsError } = await supabase
            .from("knowledge_items")
            .select("*")
            .eq("era_id", eraData.id)
            .eq("item_type", "qa")
            .not("question", "is", null);

          if (questionsError) {
            console.warn("Erro ao buscar perguntas:", questionsError);
            // Fallback: usar perguntas demo se não encontrar
            const demoQuestions: Question[] = [
              {
                id: "demo-1",
                era: era,
                question: `Pergunta demo para ${era}`,
                options: ["Opção A", "Opção B", "Opção C", "Opção D"],
                answer: "Opção A"
              }
            ];
            setQuestions(demoQuestions);
          } else {
            // Transformar knowledge_items em Question format
            const formattedQuestions: Question[] = (questionsData || []).map(item => ({
              id: item.id,
              era: era,
              question: item.question || '',
              options: [
                item.correct_answer || 'Opção A',
                ...(Array.isArray(item.wrong_options) ? item.wrong_options : [])
              ].slice(0, 4),
              answer: item.correct_answer || 'Opção A'
            }));
            
            // Seleciona aleatoriamente o número desejado de perguntas
            const shuffled = formattedQuestions.sort(() => 0.5 - Math.random());
            setQuestions(shuffled.slice(0, numQuestions));
          }
        }

        // --- BUSCA TRANSAÇÕES DO USUÁRIO AUTENTICADO ---
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.warn("Usuário não autenticado para buscar transações");
          setTransactions([]);
          setTotalCredits(0);
        } else {
          const { data: transactionsData, error: transactionsError } = await supabase
            .from<Transaction>("wallet_transactions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (transactionsError) {
            console.warn("Erro ao buscar transações:", transactionsError);
            setTransactions([]);
            setTotalCredits(0);
          } else {
            setTransactions(transactionsData || []);
            
            // --- CALCULA TOTAL DE CRÉDITOS ---
            const total = (transactionsData || []).reduce((sum, tx) => sum + Number(tx.amount), 0);
            setTotalCredits(total);
          }
        }

      } catch (err: any) {
        console.error("Erro no hook useArena:", err.message);
        setError(err.message);

        // Sem fallback - apenas dados reais
        setQuestions([]);
        setTransactions([]);
        setTotalCredits(0);
      } finally {
        setLoading(false);
      }
    };

    fetchArenaData();
  }, [era, numQuestions]);

  return { questions, transactions, totalCredits, loading, error };
};