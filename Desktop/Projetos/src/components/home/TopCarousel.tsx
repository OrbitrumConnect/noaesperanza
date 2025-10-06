import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, TrendingUp, Star, Crown, Medal, Award, RefreshCw } from 'lucide-react';
import { useRanking } from '@/hooks/useRanking';
import { useRealNews } from '@/hooks/useRealNews';

interface TopPlayer {
  id: string;
  name: string;
  xp: number;
  level: number;
  rank: number;
  avatar?: string;
}

interface ImpactNews {
  id: string;
  title: string;
  category: string;
  impact: 'Crítico' | 'Alto' | 'Médio' | 'Baixo';
  relevance: number;
  trending: boolean;
}

interface TopCarouselProps {
  isMobile?: boolean;
}

export const TopCarousel = ({ isMobile = false }: TopCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Buscar dados reais do ranking
  const { top10 } = useRanking("free");
  
  // Buscar notícias reais
  const { news, loading: newsLoading, error: newsError, refreshNews, lastUpdate } = useRealNews();
  
  // Converter dados do Supabase para o formato esperado
  const topPlayers: TopPlayer[] = top10.map((user, index) => ({
    id: user.user_id,
    name: (user as any).display_name || `Guerreiro ${user.user_id.slice(0, 8)}`,
    xp: user.total_xp || 0,
    level: Math.floor((user.total_xp || 0) / 100) + 1,
    rank: index + 1
  }));

  // Converter notícias reais para o formato esperado
  const impactNews: ImpactNews[] = news.map(article => ({
    id: article.id,
    title: article.title,
    category: article.category.charAt(0).toUpperCase() + article.category.slice(1),
    impact: article.impact,
    relevance: article.relevance,
    trending: article.trending
  }));

  // Combinar dados para o carousel
  const carouselItems = [
    ...topPlayers.map(player => ({ type: 'ranking' as const, data: player })),
    ...impactNews.map(news => ({ type: 'news' as const, data: news }))
  ];

  // Auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, 3000); // Troca a cada 3 segundos

    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const currentItem = carouselItems[currentIndex];
  
  // Verificação de segurança
  if (!currentItem || carouselItems.length === 0) {
    return (
      <Card className="p-4 bg-gradient-to-r from-background to-muted/20 border-2 border-dashed border-muted-foreground/30">
        <div className="flex items-center justify-center h-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      </Card>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-4 h-4 text-legendary" />;
      case 2: return <Medal className="w-4 h-4 text-epic" />;
      case 3: return <Award className="w-4 h-4 text-battle" />;
      default: return <Trophy className="w-4 h-4 text-victory" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Crítico': return 'text-destructive';
      case 'Alto': return 'text-battle';
      case 'Médio': return 'text-epic';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <section className={isMobile ? 'mb-3' : 'mb-4'}>
      <Card className="arena-card-epic p-3 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {currentItem?.type === 'ranking' ? (
              <>
                <Trophy className="w-4 h-4 text-epic" />
                <span className="text-sm font-semibold text-epic">Top Guerreiros</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 text-battle" />
                <span className="text-sm font-semibold text-battle">Impacto Global</span>
                {newsLoading && (
                  <RefreshCw className="w-3 h-3 text-battle animate-spin" />
                )}
                {newsError && (
                  <span className="text-xs text-destructive">Erro</span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {lastUpdate && currentItem?.type === 'news' && (
              <span className="text-xs text-muted-foreground">
                {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={refreshNews}
              className="p-1 hover:bg-epic/10 rounded transition-colors"
              title="Atualizar notícias"
            >
              <RefreshCw className="w-3 h-3 text-epic" />
            </button>
          </div>

          {/* Indicadores */}
          <div className="flex space-x-1">
            {carouselItems.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-epic' : 'bg-muted/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[60px] flex items-center">
          {currentItem?.type === 'ranking' ? (
            <div className="flex items-center space-x-3 w-full">
              <div className="flex items-center space-x-2">
                {getRankIcon((currentItem.data as TopPlayer).rank)}
                <span className="text-lg font-bold">#{(currentItem.data as TopPlayer).rank}</span>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{(currentItem.data as TopPlayer).name}</h3>
                <p className="text-xs text-muted-foreground">
                  Nível {(currentItem.data as TopPlayer).level} • {((currentItem.data as TopPlayer).xp || 0).toLocaleString()} XP
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-muted-foreground">Domínio</p>
                <div className="w-16 bg-muted/20 rounded-full h-2">
                  <div 
                    className="bg-epic h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (currentItem.data as TopPlayer).level)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  currentItem.data && (currentItem.data as ImpactNews)?.category === 'Tecnologia' ? 'bg-epic/20 text-epic' :
                  currentItem.data && (currentItem.data as ImpactNews)?.category === 'Meio Ambiente' ? 'bg-victory/20 text-victory' :
                  'bg-battle/20 text-battle'
                }`}>
                  {currentItem.data ? (currentItem.data as ImpactNews)?.category || 'Geral' : 'Geral'}
                </span>
                
                <div className="flex items-center space-x-2">
                  {currentItem.data && (currentItem.data as ImpactNews)?.trending && (
                    <Star className="w-3 h-3 text-legendary" />
                  )}
                  <span className={`text-xs font-medium ${getImpactColor(currentItem.data ? (currentItem.data as ImpactNews)?.impact || 'Médio' : 'Médio')}`}>
                    {currentItem.data ? (currentItem.data as ImpactNews)?.impact || 'Médio' : 'Médio'}
                  </span>
                </div>
              </div>
              
              <h3 className="font-semibold text-sm leading-tight mb-1">
                {currentItem.data ? (currentItem.data as ImpactNews)?.title || 'Título não disponível' : 'Título não disponível'}
              </h3>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Relevância: {currentItem.data ? (currentItem.data as ImpactNews)?.relevance || 0 : 0}%
                </span>
                <span className="text-xs text-epic">Quiz disponível</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
};
