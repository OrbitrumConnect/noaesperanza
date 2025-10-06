// Configuração centralizada da API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://orbitrum-novo-passos-projects-92954505.vercel.app');

export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

// Configuração para produção
export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV; 