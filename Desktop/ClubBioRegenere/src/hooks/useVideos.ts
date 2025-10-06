import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Video {
  id: string;
  title: string;
  description: string | null;
  category: 'nutrition' | 'orthomolecular' | 'physiotherapy' | 'mev';
  type: 'youtube' | 'vimeo' | 'local';
  url: string;
  thumbnail: string | null;
  duration: string | null;
  views: number | null;
  is_active: boolean | null;
  upload_date: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data as Video[] || []);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
      toast({
        title: "Erro ao carregar vídeos",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addVideo = async (videoData: Omit<Video, 'id' | 'views' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .insert([videoData])
        .select()
        .single();

      if (error) throw error;

      setVideos(prev => [data as Video, ...prev]);
      toast({
        title: "Vídeo adicionado!",
        description: "O vídeo foi adicionado com sucesso"
      });

      return data;
    } catch (error) {
      console.error('Erro ao adicionar vídeo:', error);
      toast({
        title: "Erro ao adicionar vídeo",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateVideo = async (id: string, updates: Partial<Video>) => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setVideos(prev => prev.map(video => 
        video.id === id ? { ...video, ...data } as Video : video
      ));

      toast({
        title: "Vídeo atualizado!",
        description: "As alterações foram salvas com sucesso"
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar vídeo:', error);
      toast({
        title: "Erro ao atualizar vídeo",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
      throw error;
    }
  };

  const incrementViews = async (id: string) => {
    try {
      const video = videos.find(v => v.id === id);
      if (!video) return;

      await supabase
        .from('videos')
        .update({ views: (video.views || 0) + 1 })
        .eq('id', id);

      setVideos(prev => prev.map(v => 
        v.id === id ? { ...v, views: (v.views || 0) + 1 } : v
      ));
    } catch (error) {
      console.error('Erro ao incrementar views:', error);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  return {
    videos,
    loading,
    addVideo,
    updateVideo,
    incrementViews,
    reloadVideos: loadVideos
  };
};