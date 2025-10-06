import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  cooldownMs?: number;
}

interface RateLimitState {
  requests: number[];
  isLimited: boolean;
  nextAllowedTime: number;
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 15, // 15 mensagens por janela
  windowMs: 60 * 1000, // 1 minuto
  cooldownMs: 30 * 1000, // 30 segundos de cooldown se atingir limite
};

export const useRateLimit = (config: Partial<RateLimitConfig> = {}) => {
  const { toast } = useToast();
  const finalConfig = { ...defaultConfig, ...config };
  
  const [state, setState] = useState<RateLimitState>({
    requests: [],
    isLimited: false,
    nextAllowedTime: 0,
  });

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    
    // Se está em cooldown, verificar se já passou o tempo
    if (state.isLimited && now < state.nextAllowedTime) {
      const remainingSeconds = Math.ceil((state.nextAllowedTime - now) / 1000);
      toast({
        title: "Calma aí! 🤗",
        description: `A Alice precisa de um pausinha. Tente novamente em ${remainingSeconds}s`,
        variant: "default",
      });
      return false;
    }

    // Limpar requests antigas (fora da janela de tempo)
    const windowStart = now - finalConfig.windowMs;
    const recentRequests = state.requests.filter(time => time > windowStart);
    
    // Verificar se excedeu o limite
    if (recentRequests.length >= finalConfig.maxRequests) {
      const nextAllowedTime = now + (finalConfig.cooldownMs || 30000);
      
      setState({
        requests: recentRequests,
        isLimited: true,
        nextAllowedTime,
      });
      
      toast({
        title: "Oops! Muitas mensagens 😅",
        description: "A Alice ficou um pouco cansada. Que tal uma pausa de 30 segundos?",
        variant: "default",
      });
      
      return false;
    }

    // Adicionar nova request
    const updatedRequests = [...recentRequests, now];
    setState({
      requests: updatedRequests,
      isLimited: false,
      nextAllowedTime: 0,
    });

    return true;
  }, [state, finalConfig, toast]);

  const getRemainingRequests = useCallback((): number => {
    const now = Date.now();
    const windowStart = now - finalConfig.windowMs;
    const recentRequests = state.requests.filter(time => time > windowStart);
    return Math.max(0, finalConfig.maxRequests - recentRequests.length);
  }, [state.requests, finalConfig]);

  const getTimeUntilReset = useCallback((): number => {
    if (!state.isLimited) return 0;
    return Math.max(0, state.nextAllowedTime - Date.now());
  }, [state.isLimited, state.nextAllowedTime]);

  return {
    checkRateLimit,
    getRemainingRequests,
    getTimeUntilReset,
    isLimited: state.isLimited,
  };
};