import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PlateAnalyzer from '@/components/PlateAnalyzer';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function AnalisarPrato() {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Analisador de Prato</h1>
            <p className="text-muted-foreground">Análise nutricional inteligente com IA</p>
          </div>
        </div>

        {/* Analyzer Component */}
        <PlateAnalyzer 
          userId={user?.id}
          onAnalysisComplete={(analysis) => {
            console.log('Análise completa:', analysis);
          }}
        />
      </div>
    </div>
  );
}