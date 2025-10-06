import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Ebook {
  id: string;
  title: string;
  description: string | null;
  category: 'nutrition' | 'orthomolecular' | 'physiotherapy' | 'mev';
  file_url: string;
  cover_image: string | null;
  read_time: string | null;
  downloads: number | null;
  is_active: boolean | null;
  upload_date: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useEbooks = () => {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadEbooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEbooks(data as Ebook[] || []);
    } catch (error) {
      console.error('Erro ao carregar e-books:', error);
      toast({
        title: "Erro ao carregar e-books",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addEbook = async (ebookData: Omit<Ebook, 'id' | 'downloads' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .insert([ebookData])
        .select()
        .single();

      if (error) throw error;

      setEbooks(prev => [data as Ebook, ...prev]);
      toast({
        title: "E-book adicionado!",
        description: "O e-book foi adicionado com sucesso"
      });

      return data;
    } catch (error) {
      console.error('Erro ao adicionar e-book:', error);
      toast({
        title: "Erro ao adicionar e-book",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateEbook = async (id: string, updates: Partial<Ebook>) => {
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setEbooks(prev => prev.map(ebook => 
        ebook.id === id ? { ...ebook, ...data } as Ebook : ebook
      ));

      toast({
        title: "E-book atualizado!",
        description: "As alterações foram salvas com sucesso"
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar e-book:', error);
      toast({
        title: "Erro ao atualizar e-book",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
      throw error;
    }
  };

  const incrementDownloads = async (id: string) => {
    try {
      const ebook = ebooks.find(e => e.id === id);
      if (!ebook) return;

      await supabase
        .from('ebooks')
        .update({ downloads: (ebook.downloads || 0) + 1 })
        .eq('id', id);

      setEbooks(prev => prev.map(e => 
        e.id === id ? { ...e, downloads: (e.downloads || 0) + 1 } : e
      ));
    } catch (error) {
      console.error('Erro ao incrementar downloads:', error);
    }
  };

  useEffect(() => {
    loadEbooks();
  }, []);

  return {
    ebooks,
    loading,
    addEbook,
    updateEbook,
    incrementDownloads,
    reloadEbooks: loadEbooks
  };
};