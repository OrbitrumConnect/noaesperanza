import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface OptimizedLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number; // Delay antes de mostrar loading (evita flicker)
  timeout?: number; // Timeout para evitar loading infinito
}

export const OptimizedLoading: React.FC<OptimizedLoadingProps> = ({
  isLoading,
  children,
  fallback,
  delay = 200, // 200ms delay para evitar flicker
  timeout = 30000, // 30s timeout
}) => {
  const [showLoading, setShowLoading] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    let delayTimer: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    if (isLoading) {
      // Delay antes de mostrar loading
      delayTimer = setTimeout(() => {
        setShowLoading(true);
      }, delay);

      // Timeout para evitar loading infinito
      timeoutTimer = setTimeout(() => {
        setHasTimedOut(true);
        setShowLoading(false);
      }, timeout);
    } else {
      setShowLoading(false);
      setHasTimedOut(false);
    }

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(timeoutTimer);
    };
  }, [isLoading, delay, timeout]);

  if (hasTimedOut) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <p className="text-muted-foreground mb-2">
          Ops! Isso está demorando mais que o esperado...
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary hover:underline text-sm"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (showLoading) {
    return fallback || <DefaultLoadingFallback />;
  }

  return <>{children}</>;
};

const DefaultLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
    <span className="ml-2 text-muted-foreground">Carregando...</span>
  </div>
);

// Loading específico para Alice
export const AliceLoadingState: React.FC = () => (
  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
    </div>
    <span className="text-sm text-primary/80 font-medium">Alice está pensando...</span>
  </div>
);

// Loading para componentes pesados
export const HeavyComponentLoading: React.FC = () => (
  <div className="space-y-3 animate-pulse">
    <div className="h-4 bg-muted rounded w-3/4"></div>
    <div className="h-4 bg-muted rounded w-1/2"></div>
    <div className="h-32 bg-muted rounded"></div>
  </div>
);

// Hook para gerenciar loading states de forma otimizada
export const useOptimizedLoading = (initialState: boolean = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<Error | null>(null);

  const withLoading = async <T,>(
    asyncFn: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void;
      onError?: (error: Error) => void;
      minDuration?: number; // Duração mínima do loading
    }
  ): Promise<T | undefined> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const startTime = Date.now();
      const result = await asyncFn();
      
      // Garantir duração mínima se especificada
      if (options?.minDuration) {
        const elapsed = Date.now() - startTime;
        if (elapsed < options.minDuration) {
          await new Promise(resolve => 
            setTimeout(resolve, options.minDuration! - elapsed)
          );
        }
      }
      
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options?.onError?.(error);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    withLoading,
    setIsLoading,
    setError,
  };
};