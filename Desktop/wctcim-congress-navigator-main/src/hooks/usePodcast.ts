import { useState, useEffect } from 'react';

interface PodcastData {
  id: string;
  title: string;
  workId: string;
  audioUrl: string;
  duration: number;
  isGenerated: boolean;
}

export const usePodcast = () => {
  const [podcasts, setPodcasts] = useState<PodcastData[]>([]);
  const [currentPodcast, setCurrentPodcast] = useState<PodcastData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Mock data para podcasts
  const mockPodcasts: PodcastData[] = [
    {
      id: 'podcast-001',
      title: 'Eficácia da Acupuntura no Tratamento da Dor Crônica',
      workId: 'WCTCIM-001',
      audioUrl: '/podcasts/WCTCIM-001.mp3',
      duration: 180,
      isGenerated: true
    },
    {
      id: 'podcast-002',
      title: 'Integração da Medicina Tradicional Chinesa no SUS',
      workId: 'WCTCIM-002',
      audioUrl: '/podcasts/WCTCIM-002.mp3',
      duration: 120,
      isGenerated: true
    },
    {
      id: 'podcast-003',
      title: 'Tratamento Integrativo de Fibromialgia com Ayurveda',
      workId: 'WCTCIM-003',
      audioUrl: '/podcasts/WCTCIM-003.mp3',
      duration: 150,
      isGenerated: true
    }
  ];

  useEffect(() => {
    setPodcasts(mockPodcasts);
  }, []);

  const generatePodcast = async (workId: string, workTitle: string) => {
    // Simular geração de podcast via NotebookLM
    const newPodcast: PodcastData = {
      id: `podcast-${Date.now()}`,
      title: workTitle,
      workId,
      audioUrl: `/podcasts/${workId}.mp3`,
      duration: Math.floor(Math.random() * 120) + 60, // 1-3 minutos
      isGenerated: true
    };

    setPodcasts(prev => [...prev, newPodcast]);
    return newPodcast;
  };

  const getPodcastByWorkId = (workId: string) => {
    return podcasts.find(podcast => podcast.workId === workId);
  };

  const playPodcast = (podcast: PodcastData) => {
    setCurrentPodcast(podcast);
    setIsPlaying(true);
  };

  const pausePodcast = () => {
    setIsPlaying(false);
  };

  const stopPodcast = () => {
    setCurrentPodcast(null);
    setIsPlaying(false);
  };

  return {
    podcasts,
    currentPodcast,
    isPlaying,
    generatePodcast,
    getPodcastByWorkId,
    playPodcast,
    pausePodcast,
    stopPodcast
  };
};
