import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { CheckCircle, Heart, FileText, Download } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { useIsClient } from '../hooks/useIsClient';

interface AvaliacaoData {
  sessionId: string;
  status: 'in_progress' | 'completed';
  etapa_atual: string;
  dados: {
    apresentacao?: string;
    lista_indiciaria: string[];
    queixa_principal?: string;
    desenvolvimento_indiciario?: {
      localizacao?: string;
      inicio?: string;
      qualidade?: string;
      sintomas_associados?: string;
      fatores_melhora?: string;
      fatores_piora?: string;
    };
    historia_patologica: string[];
    historia_familiar: {
      mae: string[];
      pai: string[];
    };
    habitos_vida: string[];
    medicacoes?: {
      continuas?: string;
      eventuais?: string;
    };
    alergias?: string;
    relatorio_narrativo?: string;
    concordancia_final?: boolean;
    autorizacao_prontuario?: boolean;
    data_autorizacao?: string;
  };
}

interface NoaAvaliacaoClinicaProps {
  onComplete?: (data: AvaliacaoData) => void;
}

const ETAPAS_AVALIACAO = [
  { id: 'abertura', title: 'Abertura', pergunta: 'Por favor, apresente-se e vamos iniciar a sua avaliação inicial para consultas com Dr. Ricardo Valença.' },
  { id: 'lista_indiciaria', title: 'Lista Indiciária', pergunta: 'Quais são as principais queixas ou sintomas que o trouxeram aqui hoje?' },
  { id: 'queixa_principal', title: 'Queixa Principal', pergunta: 'Dentre essas queixas, qual é a mais importante para você no momento?' },
  { id: 'desenvolvimento_indiciario', title: 'Desenvolvimento Indiciário', pergunta: 'Vamos detalhar sua queixa principal. Pode me contar mais sobre ela?' },
  { id: 'historia_patologica', title: 'História Patológica', pergunta: 'Você tem algum problema de saúde conhecido ou já foi diagnosticado com alguma condição médica?' },
  { id: 'historia_familiar', title: 'História Familiar', pergunta: 'Vamos falar sobre sua família. Há algum problema de saúde que seja comum na sua família?' },
  { id: 'habitos_vida', title: 'Hábitos de Vida', pergunta: 'Conte-me sobre seus hábitos de vida: alimentação, exercícios, sono, trabalho.' },
  { id: 'medicacoes', title: 'Medicações', pergunta: 'Você está tomando alguma medicação atualmente?' },
  { id: 'alergias', title: 'Alergias', pergunta: 'Você tem alguma alergia conhecida a medicamentos ou outras substâncias?' },
  { id: 'concordancia', title: 'Concordância', pergunta: 'Você concorda com o relatório gerado e autoriza o uso dessas informações para seu cuidado?' }
];

const NoaAvaliacaoClinica: React.FC<NoaAvaliacaoClinicaProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isClient = useIsClient();
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [respostaAtual, setRespostaAtual] = useState('');
  const [avaliacaoData, setAvaliacaoData] = useState<AvaliacaoData>({
    sessionId: crypto.randomUUID(),
    status: 'in_progress',
    etapa_atual: ETAPAS_AVALIACAO[0].id,
    dados: {
      lista_indiciaria: [],
      historia_patologica: [],
      historia_familiar: { mae: [], pai: [] },
      habitos_vida: []
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showRelatorio, setShowRelatorio] = useState(false);
  const [relatorioGerado, setRelatorioGerado] = useState<string>('');
  const [showAutorizacaoProntuario, setShowAutorizacaoProntuario] = useState(false);
  const [autorizacaoProntuario, setAutorizacaoProntuario] = useState(false);

  const progresso = ((etapaAtual + 1) / ETAPAS_AVALIACAO.length) * 100;

  const handleProximaEtapa = async () => {
    if (!respostaAtual.trim()) {
      toast({
        title: "Resposta necessária",
        description: "Por favor, forneça uma resposta antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const etapa = ETAPAS_AVALIACAO[etapaAtual];
      const novosDados = { ...avaliacaoData.dados };

      // Processar resposta baseada na etapa
      switch (etapa.id) {
        case 'abertura':
          novosDados.apresentacao = respostaAtual;
          break;
        case 'lista_indiciaria':
          novosDados.lista_indiciaria = respostaAtual.split(',').map(item => item.trim());
          break;
        case 'queixa_principal':
          novosDados.queixa_principal = respostaAtual;
          break;
        case 'desenvolvimento_indiciario':
          novosDados.desenvolvimento_indiciario = {
            localizacao: respostaAtual,
            inicio: '',
            qualidade: '',
            sintomas_associados: '',
            fatores_melhora: '',
            fatores_piora: ''
          };
          break;
        case 'historia_patologica':
          novosDados.historia_patologica = respostaAtual.split(',').map(item => item.trim());
          break;
        case 'historia_familiar':
          novosDados.historia_familiar = {
            mae: respostaAtual.split(',').map(item => item.trim()),
            pai: []
          };
          break;
        case 'habitos_vida':
          novosDados.habitos_vida = respostaAtual.split(',').map(item => item.trim());
          break;
        case 'medicacoes':
          novosDados.medicacoes = {
            continuas: respostaAtual,
            eventuais: ''
          };
          break;
        case 'alergias':
          novosDados.alergias = respostaAtual;
          break;
        case 'concordancia':
          novosDados.concordancia_final = respostaAtual.toLowerCase().includes('sim');
          break;
      }

      const dadosAtualizados = {
        ...avaliacaoData,
        dados: novosDados,
        etapa_atual: etapa.id
      };

      setAvaliacaoData(dadosAtualizados);

      // Salvar no Supabase
      if (user) {
        const { error } = await supabase
          .from('avaliacoes_clinicas')
          .upsert({
            id: dadosAtualizados.sessionId,
            user_id: user.id,
            status: dadosAtualizados.status,
            etapa_atual: dadosAtualizados.etapa_atual,
            dados: dadosAtualizados.dados,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Erro ao salvar avaliação:', error);
        }
      }

      if (etapaAtual < ETAPAS_AVALIACAO.length - 1) {
        setEtapaAtual(etapaAtual + 1);
        setRespostaAtual('');
      } else {
        // Finalizar avaliação
        await finalizarAvaliacao(dadosAtualizados);
      }

    } catch (error) {
      console.error('Erro ao processar etapa:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua resposta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const finalizarAvaliacao = async (dados: AvaliacaoData) => {
    try {
      // Gerar relatório narrativo
      const relatorio = gerarRelatorioNarrativo(dados.dados);
      
      const dadosFinais = {
        ...dados,
        status: 'completed' as const,
        dados: {
          ...dados.dados,
          relatorio_narrativo: relatorio
        }
      };

      setRelatorioGerado(relatorio);
      setAvaliacaoData(dadosFinais);

      // Salvar avaliação finalizada
      if (user) {
        const { error } = await supabase
          .from('avaliacoes_clinicas')
          .upsert({
            id: dadosFinais.sessionId,
            user_id: user.id,
            status: dadosFinais.status,
            etapa_atual: 'completed',
            dados: dadosFinais.dados,
            relatorio_narrativo: relatorio,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Erro ao finalizar avaliação:', error);
        }
      }

      // Mostrar modal de autorização para prontuário
      setShowAutorizacaoProntuario(true);

    } catch (error) {
      console.error('Erro ao finalizar avaliação:', error);
    }
  };

  const gerarRelatorioNarrativo = (dados: any): string => {
    const relatorio = `
# RELATÓRIO DE AVALIAÇÃO CLÍNICA INICIAL

**Data:** ${new Date().toLocaleDateString('pt-BR')}
**Método:** Arte da Entrevista Clínica (AEC)
**Profissional:** Dr. Ricardo Valença

## APRESENTAÇÃO
${dados.apresentacao || 'Não informado'}

## LISTA INDICIÁRIA
${dados.lista_indiciaria?.join(', ') || 'Não informado'}

## QUEIXA PRINCIPAL
${dados.queixa_principal || 'Não informado'}

## DESENVOLVIMENTO INDICIÁRIO
${dados.desenvolvimento_indiciario?.localizacao || 'Não informado'}

## HISTÓRIA PATOLÓGICA
${dados.historia_patologica?.join(', ') || 'Não informado'}

## HISTÓRIA FAMILIAR
**Mãe:** ${dados.historia_familiar?.mae?.join(', ') || 'Não informado'}
**Pai:** ${dados.historia_familiar?.pai?.join(', ') || 'Não informado'}

## HÁBITOS DE VIDA
${dados.habitos_vida?.join(', ') || 'Não informado'}

## MEDICAÇÕES
**Contínuas:** ${dados.medicacoes?.continuas || 'Não informado'}
**Eventuais:** ${dados.medicacoes?.eventuais || 'Não informado'}

## ALERGIAS
${dados.alergias || 'Não informado'}

## OBSERVAÇÕES
Avaliação realizada utilizando a metodologia Arte da Entrevista Clínica, focando na escuta ativa e humanizada do paciente.

**Concordância do paciente:** ${dados.concordancia_final ? 'Sim' : 'Não'}
**Autorização para prontuário:** ${dados.autorizacao_prontuario ? 'Sim' : 'Não'}
${dados.data_autorizacao ? `**Data da autorização:** ${new Date(dados.data_autorizacao).toLocaleDateString('pt-BR')}` : ''}

---
*Relatório gerado automaticamente pelo sistema NOA Esperanza*
    `.trim();

    return relatorio;
  };

  const handleAutorizacaoProntuario = async (autorizado: boolean) => {
    setAutorizacaoProntuario(autorizado);
    
    // Atualizar dados da avaliação com a autorização
    const dadosComAutorizacao = {
      ...avaliacaoData,
      dados: {
        ...avaliacaoData.dados,
        autorizacao_prontuario: autorizado,
        data_autorizacao: autorizado ? new Date().toISOString() : null
      }
    };

    // Salvar autorização no Supabase
    if (user && autorizado) {
      try {
        const { error } = await supabase
          .from('avaliacoes_clinicas')
          .update({
            dados: dadosComAutorizacao.dados,
            autorizacao_prontuario: autorizado,
            data_autorizacao: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', avaliacaoData.sessionId);

        if (error) {
          console.error('Erro ao salvar autorização:', error);
        }
      } catch (error) {
        console.error('Erro ao processar autorização:', error);
      }
    }

    setShowAutorizacaoProntuario(false);
    setShowRelatorio(true);
    onComplete?.(dadosComAutorizacao);

    toast({
      title: "Avaliação Concluída!",
      description: autorizado 
        ? "Sua avaliação foi finalizada e as informações foram liberadas para seu prontuário."
        : "Sua avaliação foi finalizada. As informações não serão incluídas no prontuário.",
      variant: "default"
    });
  };

  const downloadRelatorio = () => {
    const blob = new Blob([relatorioGerado], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avaliacao-clinica-${avaliacaoData.sessionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isClient) {
    return <div className="animate-pulse text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Avaliação Clínica Inicial
          </CardTitle>
          <CardDescription>
            Etapa {etapaAtual + 1} de {ETAPAS_AVALIACAO.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progresso}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {Math.round(progresso)}% concluído
          </p>
        </CardContent>
      </Card>

      {/* Etapa Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">{ETAPAS_AVALIACAO[etapaAtual].title}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">{ETAPAS_AVALIACAO[etapaAtual].pergunta}</p>
          
          <Textarea
            value={respostaAtual}
            onChange={(e) => setRespostaAtual(e.target.value)}
            placeholder="Digite sua resposta aqui..."
            className="min-h-[120px]"
          />
          
          <Button 
            onClick={handleProximaEtapa}
            disabled={isLoading || !respostaAtual.trim()}
            className="w-full"
          >
            {isLoading ? 'Processando...' : 
             etapaAtual < ETAPAS_AVALIACAO.length - 1 ? 'Próxima Etapa' : 'Finalizar Avaliação'}
          </Button>
        </CardContent>
      </Card>

      {/* Modal de Autorização para Prontuário */}
      <Dialog open={showAutorizacaoProntuario} onOpenChange={setShowAutorizacaoProntuario}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Autorização para Prontuário
            </DialogTitle>
            <DialogDescription>
              Sua avaliação clínica inicial foi concluída com sucesso!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                📋 Liberação de Informações para Prontuário
              </h4>
              <p className="text-blue-800 text-sm">
                Para que o Dr. Ricardo Valença possa acessar as informações da sua avaliação clínica 
                e incluí-las em seu prontuário médico, precisamos da sua autorização.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Informações que serão incluídas:</p>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>• Dados da avaliação clínica inicial</li>
                    <li>• Relatório narrativo da consulta</li>
                    <li>• Histórico médico e familiar</li>
                    <li>• Hábitos de vida e medicações</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Benefícios da autorização:</p>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>• Continuidade do cuidado médico</li>
                    <li>• Acesso completo ao seu histórico</li>
                    <li>• Melhor planejamento terapêutico</li>
                    <li>• Seguimento personalizado</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Importante:</strong> Você pode negar a autorização e ainda assim manter 
                sua avaliação salva no sistema. Apenas não será incluída no prontuário médico.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={() => handleAutorizacaoProntuario(true)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Autorizar para Prontuário
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleAutorizacaoProntuario(false)}
                className="flex-1"
              >
                Manter Apenas no Sistema
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal do Relatório */}
      <Dialog open={showRelatorio} onOpenChange={setShowRelatorio}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Relatório de Avaliação Clínica
            </DialogTitle>
            <DialogDescription>
              Seu relatório foi gerado com sucesso utilizando a metodologia Arte da Entrevista Clínica.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
              {relatorioGerado}
            </pre>
            
            <div className="flex gap-2">
              <Button onClick={downloadRelatorio} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Baixar Relatório
              </Button>
              <Button variant="outline" onClick={() => setShowRelatorio(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { NoaAvaliacaoClinica };
