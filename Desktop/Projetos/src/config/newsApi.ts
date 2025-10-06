// Configuração da API de notícias
export const NEWS_API_CONFIG = {
  API_KEYS: [
    '86c5e8d6cb0846b9aab8f41784682680',
    '4c273d239ec3303a4855eb33a36c79d7'
  ],
  BASE_URL: 'https://newsapi.org/v2',
  ENDPOINTS: {
    TOP_HEADLINES: '/top-headlines',
    EVERYTHING: '/everything',
    SOURCES: '/sources'
  },
  DEFAULT_PARAMS: {
    country: 'br',
    pageSize: 20,
    language: 'pt'
  },
  FALLBACK_PARAMS: {
    language: 'pt',
    pageSize: 20,
    q: 'brasil OR tecnologia OR ciência OR educação OR história'
  },
  CACHE_DURATION: 15 * 60 * 1000, // 15 minutos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 segundo
};

// Configuração do GNews API (gratuita)
export const GNEWS_CONFIG = {
  BASE_URL: 'https://gnews.io/api/v4',
  ENDPOINTS: {
    TOP_HEADLINES: '/top-headlines',
    SEARCH: '/search'
  },
  DEFAULT_PARAMS: {
    country: 'br',
    max: 20,
    lang: 'pt'
  },
  FALLBACK_PARAMS: {
    q: 'brasil tecnologia ciência educação história',
    max: 20,
    lang: 'pt'
  }
};

// URLs completas para facilitar uso
export const NEWS_API_URLS = {
  // NewsAPI URLs (usando primeira chave como padrão)
  TOP_HEADLINES_BR: `${NEWS_API_CONFIG.BASE_URL}${NEWS_API_CONFIG.ENDPOINTS.TOP_HEADLINES}?country=${NEWS_API_CONFIG.DEFAULT_PARAMS.country}&pageSize=${NEWS_API_CONFIG.DEFAULT_PARAMS.pageSize}&apiKey=${NEWS_API_CONFIG.API_KEYS[0]}`,
  EVERYTHING_BR: `${NEWS_API_CONFIG.BASE_URL}${NEWS_API_CONFIG.ENDPOINTS.EVERYTHING}?language=${NEWS_API_CONFIG.DEFAULT_PARAMS.language}&pageSize=${NEWS_API_CONFIG.DEFAULT_PARAMS.pageSize}&apiKey=${NEWS_API_CONFIG.API_KEYS[0]}`,
  EVERYTHING_FALLBACK: `${NEWS_API_CONFIG.BASE_URL}${NEWS_API_CONFIG.ENDPOINTS.EVERYTHING}?language=${NEWS_API_CONFIG.FALLBACK_PARAMS.language}&pageSize=${NEWS_API_CONFIG.FALLBACK_PARAMS.pageSize}&q=${encodeURIComponent(NEWS_API_CONFIG.FALLBACK_PARAMS.q)}&apiKey=${NEWS_API_CONFIG.API_KEYS[0]}`,
  SOURCES: `${NEWS_API_CONFIG.BASE_URL}${NEWS_API_CONFIG.ENDPOINTS.SOURCES}?apiKey=${NEWS_API_CONFIG.API_KEYS[0]}`,
  
  // GNews URLs (gratuitas)
  GNEWS_TOP_BR: `${GNEWS_CONFIG.BASE_URL}${GNEWS_CONFIG.ENDPOINTS.TOP_HEADLINES}?country=${GNEWS_CONFIG.DEFAULT_PARAMS.country}&max=${GNEWS_CONFIG.DEFAULT_PARAMS.max}&lang=${GNEWS_CONFIG.DEFAULT_PARAMS.lang}`,
  GNEWS_SEARCH: `${GNEWS_CONFIG.BASE_URL}${GNEWS_CONFIG.ENDPOINTS.SEARCH}?q=${encodeURIComponent(GNEWS_CONFIG.FALLBACK_PARAMS.q)}&max=${GNEWS_CONFIG.FALLBACK_PARAMS.max}&lang=${GNEWS_CONFIG.FALLBACK_PARAMS.lang}`
};