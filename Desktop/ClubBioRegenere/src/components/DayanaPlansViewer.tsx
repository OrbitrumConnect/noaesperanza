import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Utensils, Activity, Calendar, Download, 
  CheckCircle, Coffee, Apple, Clock, Music, 
  Lightbulb, Leaf, Star, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DayanaPlansViewerProps {
  planosData: any;
  patientName?: string;
  onClose?: () => void;
}

export default function DayanaPlansViewer({ planosData, patientName, onClose }: DayanaPlansViewerProps) {
  const [activeTab, setActiveTab] = useState('alimentar');
  const [selectedDay, setSelectedDay] = useState(1);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();

  const planoAlimentar = planosData?.plano_alimentar;
  const planoMEV = planosData?.plano_mev;
  const mensagemInicial = planosData?.mensagem_inicial;

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Usar nova função de PDF profissional
      const { data, error } = await supabase.functions.invoke('generate-professional-pdf', {
        body: {
          planos: planosData,
          patient_name: patientName
        }
      });

      if (error) throw error;

      toast({
        title: "PDF profissional gerado! 📄",
        description: "Documento limpo e formatado para impressão.",
      });

      // Download do PDF limpo
      if (data && data.pdf_content) {
        // Converter base64 de volta para HTML e criar blob
        const htmlContent = atob(data.pdf_content);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Abrir em nova janela para impressão/PDF
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 500);
          };
        }
        
        URL.revokeObjectURL(url);
      }

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Houve um problema. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-6 border border-primary/20"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Planos Personalizados
                </h1>
                <p className="text-muted-foreground">
                  por Dra. Dayana Brazão Hanemann - {patientName}
                </p>
              </div>
            </div>
            
            {mensagemInicial && (
              <div className="bg-card/50 p-4 rounded-lg border border-primary/20 max-w-2xl">
                <p className="text-sm italic text-muted-foreground">
                  "{mensagemInicial}"
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                ← Voltar
              </Button>
            )}
            <Button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              {isGeneratingPDF ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Baixar PDF Completo
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alimentar" className="flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            Plano Alimentar (7 dias)
          </TabsTrigger>
          <TabsTrigger value="mev" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Plano MEV (Mudança de Vida)
          </TabsTrigger>
        </TabsList>

        {/* Plano Alimentar */}
        <TabsContent value="alimentar" className="space-y-6">
          {planoAlimentar?.dias ? (
            <>
              {/* Seletor de Dias */}
              <div className="flex flex-wrap gap-2 justify-center">
                {planoAlimentar.dias.map((dia: any, index: number) => (
                  <Button
                    key={index}
                    variant={selectedDay === dia.dia ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDay(dia.dia)}
                    className="min-w-[60px]"
                  >
                    Dia {dia.dia}
                  </Button>
                ))}
              </div>

              {/* Conteúdo do Dia Selecionado */}
              {planoAlimentar.dias.find((d: any) => d.dia === selectedDay) && (
                <div className="space-y-6">
                  {(() => {
                    const diaAtual = planoAlimentar.dias.find((d: any) => d.dia === selectedDay);
                    return (
                      <>
                        {/* Informações do Dia */}
                        <Card className="border-primary/20">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Star className="w-5 h-5 text-primary" />
                              Dia {diaAtual.dia}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {diaAtual.frase_positiva && (
                              <div className="bg-primary/10 p-4 rounded-lg">
                                <p className="text-primary font-medium italic">
                                  "💫 {diaAtual.frase_positiva}"
                                </p>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              {diaAtual.frequencia_quantica && (
                                <div className="flex items-center gap-2">
                                  <Music className="w-4 h-4 text-accent" />
                                  <span>{diaAtual.frequencia_quantica}</span>
                                </div>
                              )}
                              {diaAtual.biohacking_dia && (
                                <div className="flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4 text-secondary" />
                                  <span>{diaAtual.biohacking_dia}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-tertiary" />
                                <span>Sem glúten, lactose, açúcar</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Refeições */}
                        {diaAtual.refeicoes && (
                          <div className="grid grid-cols-1 gap-6">
                            {Object.entries(diaAtual.refeicoes).map(([tipoRefeicao, opcoes]: [string, any]) => (
                              <Card key={tipoRefeicao} className="border-secondary/20">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2 capitalize">
                                    {tipoRefeicao === 'cafe_manha' && <Coffee className="w-5 h-5 text-green-600" />}
                                    {tipoRefeicao === 'almoco' && <Utensils className="w-5 h-5 text-blue-600" />}
                                    {tipoRefeicao === 'lanche_tarde' && <Apple className="w-5 h-5 text-purple-600" />}
                                    {tipoRefeicao === 'jantar' && <Clock className="w-5 h-5 text-orange-600" />}
                                    {tipoRefeicao === 'ceia' && <Clock className="w-5 h-5 text-pink-600" />}
                                    {tipoRefeicao.replace('_', ' ')}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Array.isArray(opcoes) && opcoes.map((opcao: any, idx: number) => (
                                      <div key={idx} className="bg-card/50 p-4 rounded-lg border border-muted/20">
                                        <h4 className="font-semibold text-primary mb-2">
                                          Opção {idx + 1}: {opcao.nome}
                                        </h4>
                                        
                                        <div className="space-y-3 text-sm">
                                          <div>
                                            <span className="font-medium">Ingredientes:</span>
                                            <p className="text-muted-foreground mt-1">{opcao.ingredientes}</p>
                                          </div>
                                          
                                          <div>
                                            <span className="font-medium">Preparo:</span>
                                            <p className="text-muted-foreground mt-1">{opcao.preparo}</p>
                                          </div>
                                          
                                          {opcao.funcao && (
                                            <div>
                                              <span className="font-medium">Função:</span>
                                              <p className="text-muted-foreground mt-1">{opcao.funcao}</p>
                                            </div>
                                          )}
                                          
                                          {opcao.motivo_escolha && (
                                            <div>
                                              <span className="font-medium">Por que é ideal para você:</span>
                                              <p className="text-accent font-medium mt-1">{opcao.motivo_escolha}</p>
                                            </div>
                                          )}

                                          <div className="flex flex-wrap gap-2 mt-3">
                                            {opcao.calorias && (
                                              <Badge variant="outline" className="text-xs">
                                                {opcao.calorias} cal
                                              </Badge>
                                            )}
                                            {opcao.macros && (
                                              <Badge variant="outline" className="text-xs">
                                                {opcao.macros}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Lista de Compras */}
              {planoAlimentar.lista_compras && (
                <Card className="border-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-accent" />
                      Lista de Compras Semanal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(planoAlimentar.lista_compras).map(([categoria, itens]: [string, any]) => (
                        <div key={categoria} className="bg-card/50 p-4 rounded-lg">
                          <h4 className="font-semibold capitalize mb-2">
                            {categoria.replace('_', ' ')}
                          </h4>
                          <ul className="text-sm space-y-1">
                            {Array.isArray(itens) && itens.map((item: string, idx: number) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Plano alimentar não disponível
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Plano MEV */}
        <TabsContent value="mev" className="space-y-6">
          {planoMEV?.dias ? (
            <div className="grid grid-cols-1 gap-6">
              {planoMEV.dias.map((dia: any, index: number) => (
                <Card key={index} className="border-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-accent" />
                      Dia {dia.dia}: {dia.habito}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Descrição:</h4>
                      <p className="text-sm">{dia.descricao}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Benefícios:</h4>
                        <p className="text-sm text-muted-foreground">{dia.beneficios}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Como Aplicar:</h4>
                        <p className="text-sm text-muted-foreground">{dia.como_aplicar}</p>
                      </div>
                    </div>
                    
                    {dia.biohacking && (
                      <div className="bg-secondary/10 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Biohacking:
                        </h4>
                        <p className="text-sm">{dia.biohacking}</p>
                      </div>
                    )}
                    
                    {dia.frequencia && (
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          Frequência de Apoio:
                        </h4>
                        <p className="text-sm">{dia.frequencia}</p>
                      </div>
                    )}
                    
                    {dia.reflexao && (
                      <div className="bg-tertiary/10 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Reflexão do Dia:</h4>
                        <p className="text-sm italic">"{dia.reflexao}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Plano MEV não disponível
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}