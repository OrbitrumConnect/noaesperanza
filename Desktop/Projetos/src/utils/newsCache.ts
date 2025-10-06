// Sistema de cache para notícias
interface CachedNews {
  data: any[];
  timestamp: number;
  expiresAt: number;
}

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos
const CACHE_KEY = 'arena_news_cache';

export const newsCache = {
  // Salvar notícias no cache
  set: (news: any[]): void => {
    const cacheData: CachedNews = {
      data: news,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION
    };
    
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Erro ao salvar cache de notícias:', error);
    }
  },

  // Recuperar notícias do cache
  get: (): any[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cacheData: CachedNews = JSON.parse(cached);
      
      // Verificar se o cache ainda é válido
      if (Date.now() > cacheData.expiresAt) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.warn('Erro ao recuperar cache de notícias:', error);
      return null;
    }
  },

  // Limpar cache
  clear: (): void => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.warn('Erro ao limpar cache de notícias:', error);
    }
  },

  // Verificar se cache existe e é válido
  isValid: (): boolean => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return false;

      const cacheData: CachedNews = JSON.parse(cached);
      return Date.now() <= cacheData.expiresAt;
    } catch (error) {
      return false;
    }
  },

  // Obter tempo restante do cache
  getTimeRemaining: (): number => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return 0;

      const cacheData: CachedNews = JSON.parse(cached);
      return Math.max(0, cacheData.expiresAt - Date.now());
    } catch (error) {
      return 0;
    }
  }
};
