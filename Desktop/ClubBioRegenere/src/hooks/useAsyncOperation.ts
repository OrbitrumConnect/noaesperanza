import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncOperationOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export const useAsyncOperation = (options: AsyncOperationOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const {
    retries = 2,
    retryDelay = 1000,
    timeout = 30000,
    onSuccess,
    onError
  } = options;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(async <T>(
    asyncFn: (signal: AbortSignal) => Promise<T>,
    executeOptions?: AsyncOperationOptions
  ): Promise<T | null> => {
    // Cancel previous operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const finalOptions = { ...options, ...executeOptions };
    let lastError: Error | null = null;

    setIsLoading(true);
    setError(null);

    // Retry logic
    for (let attempt = 0; attempt <= (finalOptions.retries || 0); attempt++) {
      try {
        // Timeout protection
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Operation timed out after ${finalOptions.timeout || timeout}ms`));
          }, finalOptions.timeout || timeout);
        });

        const result = await Promise.race([
          asyncFn(controller.signal),
          timeoutPromise
        ]);

        if (controller.signal.aborted) {
          throw new Error('Operation was cancelled');
        }

        setData(result);
        setError(null);
        setIsLoading(false);
        
        onSuccess?.(result);
        finalOptions.onSuccess?.(result);
        
        return result;

      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        
        // Don't retry if operation was cancelled
        if (controller.signal.aborted) {
          setIsLoading(false);
          return null;
        }

        // Don't retry on the last attempt
        if (attempt < (finalOptions.retries || 0)) {
          console.log(`Attempt ${attempt + 1} failed, retrying in ${finalOptions.retryDelay || retryDelay}ms...`);
          await new Promise(resolve => 
            setTimeout(resolve, finalOptions.retryDelay || retryDelay)
          );
        }
      }
    }

    // All attempts failed
    setError(lastError);
    setIsLoading(false);
    
    if (lastError) {
      onError?.(lastError);
      finalOptions.onError?.(lastError);
    }
    
    return null;
  }, [retries, retryDelay, timeout, onSuccess, onError]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    error,
    data,
    execute,
    cancel,
    reset
  };
};