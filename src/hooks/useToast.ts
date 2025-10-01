// Hook de toast simplificado (sem dependências externas)
export function useToast() {
  return {
    success: (message: string) => console.log('✅', message),
    error: (message: string) => console.error('❌', message),
    warning: (message: string) => console.warn('⚠️', message),
    info: (message: string) => console.info('ℹ️', message),
  };
}