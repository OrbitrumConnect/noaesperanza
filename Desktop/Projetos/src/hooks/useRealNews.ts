import { useState, useEffect, useCallback } from 'react';
import { newsCache } from '@/utils/newsCache';
import { NEWS_API_URLS, NEWS_API_CONFIG } from '@/config/newsApi';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
  category: string;
  impact: 'Crítico' | 'Alto' | 'Médio' | 'Baixo';
  relevance: number;
  trending: boolean;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: Array<{
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    source: {
      name: string;
    };
  }>;
}

// Temas do jogo Arena of Wisdom Wars
const GAME_THEMES = {
  'História': ['história', 'histórico', 'antigo', 'civilização', 'egito', 'egípcio', 'mesopotâmia', 'mesopotâmico', 'medieval', 'idade média', 'guerra', 'batalha', 'conquista', 'império', 'rei', 'rainha', 'nobre', 'cavaleiro', 'guerreiro', 'soldado'],
  'Conhecimento': ['conhecimento', 'sabedoria', 'aprendizado', 'educação', 'estudo', 'pesquisa', 'ciência', 'descoberta', 'inovação', 'tecnologia', 'inteligência', 'habilidade', 'competência', 'talent', 'genialidade'],
  'Estratégia': ['estratégia', 'tático', 'planejamento', 'decisão', 'liderança', 'comando', 'gestão', 'organização', 'metodologia', 'sistema', 'processo', 'otimização', 'eficiência'],
  'Competição': ['competição', 'competitivo', 'luta', 'duelo', 'arena', 'torneio', 'campeonato', 'ranking', 'posição', 'vitória', 'derrota', 'desafio', 'objetivo', 'meta', 'conquista'],
  'Economia Digital': ['economia', 'digital', 'fintech', 'blockchain', 'cryptocurrency', 'investimento', 'mercado', 'negócios', 'startup', 'empreendedorismo', 'inovação financeira', 'tecnologia financeira'],
  'Futuro': ['futuro', 'futurista', 'tendência', 'evolução', 'progresso', 'avanço', 'moderno', 'contemporâneo', 'próxima geração', 'emergente', 'disruptivo']
};

// Categorias de notícias com impacto (focadas nos temas do jogo)
const NEWS_CATEGORIES = {
  'História': { impact: 'Crítico' as const, relevance: 95, trending: true },
  'Conhecimento': { impact: 'Crítico' as const, relevance: 90, trending: true },
  'Estratégia': { impact: 'Alto' as const, relevance: 85, trending: true },
  'Competição': { impact: 'Alto' as const, relevance: 80, trending: false },
  'Economia Digital': { impact: 'Médio' as const, relevance: 75, trending: false },
  'Futuro': { impact: 'Médio' as const, relevance: 70, trending: false },
  'Geral': { impact: 'Baixo' as const, relevance: 50, trending: false }
};

// Palavras-chave para categorização automática (baseadas nos temas do jogo)
const CATEGORY_KEYWORDS = {
  'História': GAME_THEMES['História'],
  'Conhecimento': GAME_THEMES['Conhecimento'],
  'Estratégia': GAME_THEMES['Estratégia'],
  'Competição': GAME_THEMES['Competição'],
  'Economia Digital': GAME_THEMES['Economia Digital'],
  'Futuro': GAME_THEMES['Futuro'],
  'business': ['mercado', 'economia', 'empresa', 'negócio', 'financeiro', 'investimento', 'bolsa', 'crescimento'],
  'health': ['saúde', 'médico', 'hospital', 'vacina', 'tratamento', 'doença', 'cura', 'medicina'],
  'environment': ['clima', 'meio ambiente', 'sustentabilidade', 'energia', 'poluição', 'natureza', 'ecologia'],
  'politics': ['política', 'governo', 'eleição', 'presidente', 'ministro', 'congresso', 'senado'],
  'sports': ['futebol', 'esporte', 'jogos', 'olimpíadas', 'campeonato', 'atleta', 'competição'],
  'entertainment': ['cinema', 'música', 'celebridade', 'filme', 'série', 'show', 'arte', 'cultura']
};

export const useRealNews = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Função para categorizar notícia baseada no título e descrição (focada nos temas do jogo)
  const categorizeNews = useCallback((title: string, description: string): string => {
    const text = `${title} ${description}`.toLowerCase();
    
    // Priorizar temas do jogo
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        return category;
      }
    }
    
    return 'Geral';
  }, []);

  // Função para calcular relevância baseada nos temas do jogo
  const calculateRelevance = useCallback((title: string, description: string): number => {
    const text = `${title} ${description}`.toLowerCase();
    
    // Palavras-chave de alta relevância para o jogo
    const highRelevanceKeywords = [
      'história', 'guerra', 'batalha', 'conquista', 'império', 'civilização',
      'conhecimento', 'sabedoria', 'aprendizado', 'educação', 'inteligência',
      'estratégia', 'tático', 'liderança', 'competição', 'arena', 'duelo',
      'economia digital', 'fintech', 'blockchain', 'inovação', 'futuro'
    ];
    
    const matches = highRelevanceKeywords.filter(keyword => text.includes(keyword)).length;
    const baseRelevance = 40; // Relevância base para notícias do jogo
    const bonusPerMatch = 12; // Bônus por palavra-chave encontrada
    
    return Math.min(100, baseRelevance + (matches * bonusPerMatch));
  }, []);

  // Função para buscar notícias da API
  const fetchNews = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Verificar cache primeiro (se não for refresh forçado)
      if (!forceRefresh) {
        const cachedNews = newsCache.get();
        if (cachedNews) {
          setNews(cachedNews);
          setLoading(false);
          return;
        }
      }

      // Tentar buscar dados reais da API primeiro
      let apiSuccess = false;
      
      // Tentar com múltiplas chaves da NewsAPI
      for (let keyIndex = 0; keyIndex < NEWS_API_CONFIG.API_KEYS.length && !apiSuccess; keyIndex++) {
        const currentKey = NEWS_API_CONFIG.API_KEYS[keyIndex];
        console.log(`🔑 Tentando com chave ${keyIndex + 1}/${NEWS_API_CONFIG.API_KEYS.length}`);
        
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            console.log(`🔄 Tentativa ${attempt}/2 com chave ${keyIndex + 1}...`);
            const url = NEWS_API_URLS.TOP_HEADLINES_BR.replace(NEWS_API_CONFIG.API_KEYS[0], currentKey);
            const response = await fetch(url);
          
          if (response.ok) {
            const apiData: NewsAPIResponse = await response.json();
            
            console.log('📊 Resposta da API:', apiData);
            
            if (apiData.status === 'ok' && apiData.articles && apiData.articles.length > 0) {
              console.log(`✅ ${apiData.articles.length} notícias carregadas da API`);
              
              // Filtrar e priorizar notícias relacionadas aos temas do jogo
              const gameRelevantNews = apiData.articles
                .map((article, index) => ({
                  id: `real-${index}`,
                  title: article.title,
                  description: article.description || '',
                  url: article.url,
                  publishedAt: article.publishedAt,
                  source: article.source,
                  category: categorizeNews(article.title, article.description || ''),
                  impact: NEWS_CATEGORIES[categorizeNews(article.title, article.description || '')]?.impact || 'Médio',
                  relevance: calculateRelevance(article.title, article.description || ''),
                  trending: Math.random() > 0.7 // 30% chance de ser trending
                }))
                .filter(news => news.category !== 'Geral' || news.relevance > 60) // Filtrar notícias relevantes
                .sort((a, b) => b.relevance - a.relevance) // Ordenar por relevância
                .slice(0, 10); // Pegar as 10 mais relevantes
              
              console.log(`🎯 ${gameRelevantNews.length} notícias filtradas por relevância ao jogo`);
              
              const realNews: NewsArticle[] = gameRelevantNews;

              setNews(realNews);
              setLastUpdate(new Date());
              newsCache.set(realNews);
              setLoading(false);
              apiSuccess = true;
              break;
            } else {
              console.warn('⚠️ API retornou dados vazios ou inválidos');
              // Tentar fallback com busca mais ampla
              if (attempt === 1 && keyIndex === 0) {
                console.log('🔄 Tentando fallback com busca mais ampla...');
                const fallbackResponse = await fetch(NEWS_API_URLS.EVERYTHING_FALLBACK);
                if (fallbackResponse.ok) {
                  const fallbackData: NewsAPIResponse = await fallbackResponse.json();
                  console.log('📊 Resposta do fallback:', fallbackData);
                  
                  if (fallbackData.status === 'ok' && fallbackData.articles && fallbackData.articles.length > 0) {
                    console.log(`✅ ${fallbackData.articles.length} notícias carregadas do fallback`);
                    
                    const gameRelevantNews = fallbackData.articles
                      .map((article, index) => ({
                        id: `fallback-${index}`,
                        title: article.title,
                        description: article.description || '',
                        url: article.url,
                        publishedAt: article.publishedAt,
                        source: article.source,
                        category: categorizeNews(article.title, article.description || ''),
                        impact: NEWS_CATEGORIES[categorizeNews(article.title, article.description || '')]?.impact || 'Médio',
                        relevance: calculateRelevance(article.title, article.description || ''),
                        trending: Math.random() > 0.7
                      }))
                      .filter(news => news.category !== 'Geral' || news.relevance > 60)
                      .sort((a, b) => b.relevance - a.relevance)
                      .slice(0, 10);
                    
                    console.log(`🎯 ${gameRelevantNews.length} notícias filtradas do fallback`);
                    
                    if (gameRelevantNews.length > 0) {
                      setNews(gameRelevantNews);
                      setLastUpdate(new Date());
                      newsCache.set(gameRelevantNews);
                      setLoading(false);
                      apiSuccess = true;
                      break;
                    }
                  }
                }
                
                // Tentar GNews como segunda opção
                console.log('🔄 Tentando GNews API...');
                const gnewsResponse = await fetch(NEWS_API_URLS.GNEWS_TOP_BR);
                if (gnewsResponse.ok) {
                  const gnewsData = await gnewsResponse.json();
                  console.log('📊 Resposta do GNews:', gnewsData);
                  
                  if (gnewsData.articles && gnewsData.articles.length > 0) {
                    console.log(`✅ ${gnewsData.articles.length} notícias carregadas do GNews`);
                    
                    const gameRelevantNews = gnewsData.articles
                      .map((article: any, index: number) => ({
                        id: `gnews-${index}`,
                        title: article.title,
                        description: article.description || '',
                        url: article.url,
                        publishedAt: article.publishedAt,
                        source: { name: article.source?.name || 'GNews' },
                        category: categorizeNews(article.title, article.description || ''),
                        impact: NEWS_CATEGORIES[categorizeNews(article.title, article.description || '')]?.impact || 'Médio',
                        relevance: calculateRelevance(article.title, article.description || ''),
                        trending: Math.random() > 0.7
                      }))
                      .filter(news => news.category !== 'Geral' || news.relevance > 60)
                      .sort((a, b) => b.relevance - a.relevance)
                      .slice(0, 10);
                    
                    console.log(`🎯 ${gameRelevantNews.length} notícias filtradas do GNews`);
                    
                    if (gameRelevantNews.length > 0) {
                      setNews(gameRelevantNews);
                      setLastUpdate(new Date());
                      newsCache.set(gameRelevantNews);
                      setLoading(false);
                      apiSuccess = true;
                      break;
                    }
                  }
                }
              }
            }
          } else {
            console.warn(`⚠️ API retornou status ${response.status}: ${response.statusText}`);
            const errorText = await response.text();
            console.warn('📄 Resposta de erro:', errorText);
          }
          } catch (apiError) {
            console.warn(`❌ Erro na tentativa ${attempt}/2 com chave ${keyIndex + 1}:`, apiError);
            if (attempt < 2) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Delay progressivo
            }
          }
        }
        
        if (apiSuccess) break; // Se conseguiu com esta chave, para o loop
      }
      
      if (apiSuccess) return;
      
      // Fallback: usar dados simulados mais realistas se API não disponível
      console.log('📰 Usando dados simulados como fallback');
      const mockNews: NewsArticle[] = [
        {
          id: '1',
          title: 'Descoberta arqueológica revela estratégias militares do Egito Antigo',
          description: 'Novos achados em tumbas egípcias mostram técnicas de guerra e liderança que influenciaram civilizações por milênios.',
          url: '#',
          publishedAt: new Date().toISOString(),
          source: { name: 'História Viva' },
          category: 'História',
          impact: 'Crítico',
          relevance: 95,
          trending: true
        },
        {
          id: '2',
          title: 'Inteligência Artificial revoluciona métodos de aprendizado',
          description: 'Novas tecnologias estão transformando a educação, criando sistemas personalizados de conhecimento e competências.',
          url: '#',
          publishedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
          source: { name: 'Conhecimento Digital' },
          category: 'Conhecimento',
          impact: 'Crítico',
          relevance: 90,
          trending: true
        },
        {
          id: '3',
          title: 'Estratégias de liderança medieval inspiram gestão moderna',
          description: 'Técnicas de comando e organização de exércitos medievais são adaptadas para liderança empresarial contemporânea.',
          url: '#',
          publishedAt: new Date(Date.now() - 7200000).toISOString(), // 2 horas atrás
          source: { name: 'Estratégia & Liderança' },
          category: 'Estratégia',
          impact: 'Alto',
          relevance: 85,
          trending: true
        },
        {
          id: '4',
          title: 'Arena de competições digitais atrai milhares de participantes',
          description: 'Plataforma brasileira de duelos de conhecimento registra crescimento de 300% em participação este ano.',
          url: '#',
          publishedAt: new Date(Date.now() - 10800000).toISOString(), // 3 horas atrás
          source: { name: 'Competição Digital' },
          category: 'Competição',
          impact: 'Alto',
          relevance: 80,
          trending: false
        },
        {
          id: '5',
          title: 'Blockchain revoluciona sistema financeiro brasileiro',
          description: 'Tecnologia de criptomoedas e contratos inteligentes transformam economia digital nacional.',
          url: '#',
          publishedAt: new Date(Date.now() - 14400000).toISOString(), // 4 horas atrás
          source: { name: 'Economia Digital' },
          category: 'Economia Digital',
          impact: 'Médio',
          relevance: 75,
          trending: true
        }
      ];

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Usar dados mock por enquanto (substituir por API real depois)
      const processedNews = mockNews.map(article => ({
        ...article,
        category: categorizeNews(article.title, article.description),
        relevance: calculateRelevance(article.title, article.description)
      }));

      setNews(processedNews);
      setLastUpdate(new Date());
      
      // Salvar no cache
      newsCache.set(processedNews);
      
    } catch (err) {
      console.error('Erro ao buscar notícias:', err);
      setError('Erro ao carregar notícias');
    } finally {
      setLoading(false);
    }
  }, [categorizeNews, calculateRelevance]);

  // Buscar notícias na inicialização
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Atualização automática a cada 15 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNews();
    }, 15 * 60 * 1000); // 15 minutos

    return () => clearInterval(interval);
  }, [fetchNews]);

  // Função para forçar atualização
  const refreshNews = useCallback(() => {
    fetchNews(true); // Force refresh
  }, [fetchNews]);

  // Filtrar notícias por categoria
  const getNewsByCategory = useCallback((category: string) => {
    return news.filter(article => article.category === category);
  }, [news]);

  // Obter notícias mais relevantes
  const getTopNews = useCallback((limit: number = 5) => {
    return news
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }, [news]);

  // Obter notícias em alta
  const getTrendingNews = useCallback(() => {
    return news.filter(article => article.trending);
  }, [news]);

  return {
    news,
    loading,
    error,
    lastUpdate,
    refreshNews,
    getNewsByCategory,
    getTopNews,
    getTrendingNews
  };
};
