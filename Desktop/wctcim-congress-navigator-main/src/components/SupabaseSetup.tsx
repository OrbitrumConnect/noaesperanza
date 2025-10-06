import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { runPopulateScript } from '@/scripts/populateSupabase';

export const SupabaseSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handlePopulate = async () => {
    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const success = await runPopulateScript();
      
      if (success) {
        setStatus('success');
        setMessage('Supabase configurado com sucesso! Dados carregados.');
      } else {
        setStatus('error');
        setMessage('Erro ao configurar o Supabase. Verifique a conexão.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Erro inesperado: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Configuração do Supabase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Configure o banco de dados Supabase com os dados dos trabalhos científicos.
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800">
            <strong>⚠️ Primeiro passo:</strong> Execute o SQL schema no Supabase
          </div>
          <div className="text-xs text-blue-600 mt-1">
            1. Acesse: <a href="https://supabase.com/dashboard/project/shngrwkqgasdpokdomhh/sql" target="_blank" rel="noopener noreferrer" className="underline">SQL Editor</a>
          </div>
          <div className="text-xs text-blue-600">
            2. Execute o arquivo: <code className="bg-blue-100 px-1 rounded">supabase-schema-safe.sql</code>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Trabalhos Científicos</Badge>
            <span className="text-xs text-gray-500">8 registros</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Analytics</Badge>
            <span className="text-xs text-gray-500">Tabela de métricas</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Índices</Badge>
            <span className="text-xs text-gray-500">Otimização de busca</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={handlePopulate}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Configurando...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Configurar Supabase
              </>
            )}
          </Button>
          
          <Button 
            onClick={() => window.open('https://supabase.com/dashboard/project/shngrwkqgasdpokdomhh/table-editor', '_blank')}
            variant="outline"
            className="w-full"
          >
            <Database className="w-4 h-4 mr-2" />
            Ver Dados no Supabase
          </Button>
        </div>

        {status !== 'idle' && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            status === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {status === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{message}</span>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <strong>Nota:</strong> Este processo criará as tabelas necessárias e inserirá os dados de exemplo.
        </div>
      </CardContent>
    </Card>
  );
};
