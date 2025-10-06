import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, Clock, AlertCircle, Calendar, 
  FileText, MessageSquare, Utensils, Camera,
  Phone, Mail, Download
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PatientProgressStatusProps {
  hasCompletedPreConsultation: boolean;
  timeRemaining: number;
  hasCompletedPostConsultation: boolean;
  hasMealPlan: boolean;
  nextAppointment?: {
    date: string;
    time: string;
  };
  onStartPreConsultation: () => void;
  onStartPostConsultation: () => void;
  onScheduleAppointment: () => void;
  patientName: string;
  subscribed?: boolean; // Nova prop para verificar assinatura
  onUpgrade?: () => void; // Nova prop para upgrade
}

export default function PatientProgressStatus({
  hasCompletedPreConsultation,
  timeRemaining,
  hasCompletedPostConsultation,
  hasMealPlan,
  nextAppointment,
  onStartPreConsultation,
  onStartPostConsultation,
  onScheduleAppointment,
  patientName,
  subscribed = false,
  onUpgrade
}: PatientProgressStatusProps) {
  const { toast } = useToast();
  
  const getProgressPercentage = () => {
    let progress = 0;
    if (hasCompletedPreConsultation) progress += 25;
    if (timeRemaining < 600) progress += 25; // Chat iniciado
    if (hasCompletedPostConsultation) progress += 25;
    if (hasMealPlan) progress += 25;
    return progress;
  };

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCurrentStep = () => {
    if (!hasCompletedPreConsultation) return 1;
    if (timeRemaining > 0 && !hasCompletedPostConsultation) return 2;
    if (!hasCompletedPostConsultation) return 3;
    if (!hasMealPlan) return 4;
    return 5;
  };

  const currentStep = getCurrentStep();

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Progress Overview */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm sm:text-lg">Seu Progresso Hoje</CardTitle>
            <Badge variant="outline" className="text-primary border-primary text-xs sm:text-sm">
              {getProgressPercentage()}% Concluído
            </Badge>
          </div>
          <Progress value={getProgressPercentage()} className="h-1.5 sm:h-2" />
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          {/* Step 1: Pré-consulta */}
          <div className="flex items-center gap-2 sm:gap-3">
            {hasCompletedPreConsultation ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            ) : (
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0 ${currentStep === 1 ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                {currentStep === 1 && <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-1 sm:mt-1.5"></div>}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm sm:text-base ${hasCompletedPreConsultation ? 'text-primary' : currentStep === 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                Pré-consulta
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {hasCompletedPreConsultation ? 'Concluída com sucesso' : 'Avaliação inicial pendente'}
              </p>
            </div>
            {!hasCompletedPreConsultation && currentStep === 1 && (
              <>
                {subscribed ? (
                  <Button size="sm" onClick={onStartPreConsultation} className="text-xs">
                    Iniciar
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => {
                      if (onUpgrade) {
                        onUpgrade();
                      } else {
                        alert('⚠️ ACESSO RESTRITO\n\nPara iniciar a PRÉ-CONSULTA você precisa:\n\n💳 Ter uma assinatura ativa\n📞 Agendar e pagar sua consulta\n\n✨ Escolha um plano para continuar!');
                      }
                    }}
                    className="text-xs bg-orange-500 hover:bg-orange-600"
                  >
                    🔒 Assinar
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Step 2: Chat com Alice */}
          <div className="flex items-center gap-2 sm:gap-3">
            {timeRemaining < 600 && timeRemaining > 0 ? (
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
            ) : timeRemaining === 0 ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            ) : (
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0 ${currentStep === 2 ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                {currentStep === 2 && <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-1 sm:mt-1.5"></div>}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm sm:text-base ${timeRemaining === 0 ? 'text-primary' : timeRemaining < 600 ? 'text-orange-600' : currentStep === 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
                Chat com Alice (IA)
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {timeRemaining === 0 ? 'Chat finalizado' : 
                 timeRemaining < 600 ? `Tempo restante: ${formatTimeRemaining(timeRemaining)}` : 
                 'Aguardando pré-consulta'}
              </p>
            </div>
            {timeRemaining < 600 && timeRemaining > 0 && (
              <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                Em andamento
              </Badge>
            )}
          </div>

          {/* Step 3: Pós-consulta */}
          <div className="flex items-center gap-2 sm:gap-3">
            {hasCompletedPostConsultation ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            ) : (
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0 ${currentStep === 3 ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                {currentStep === 3 && <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-1 sm:mt-1.5"></div>}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm sm:text-base ${hasCompletedPostConsultation ? 'text-primary' : currentStep === 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                Pós-consulta
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {hasCompletedPostConsultation ? 'Avaliação finalizada' : 'Coleta de preferências alimentares'}
              </p>
            </div>
            {!hasCompletedPostConsultation && currentStep === 3 && (
              <Button 
                size="sm" 
                onClick={async () => {
                  // Verificar se já existe um plano criado nos últimos 7 dias
                  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                  
                  if (currentUser.id) {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    
                    try {
                      const { data: existingPlans } = await supabase
                        .from('educational_plans')
                        .select('created_at, plan_name')
                        .eq('user_id', currentUser.id)
                        .gte('created_at', sevenDaysAgo.toISOString())
                        .order('created_at', { ascending: false })
                        .limit(1);

                      if (existingPlans && existingPlans.length > 0) {
                        const daysSinceLastPlan = Math.ceil(
                          (new Date().getTime() - new Date(existingPlans[0].created_at).getTime()) / (1000 * 3600 * 24)
                        );
                        
                        toast({
                          title: "Aguarde para renovar 🕐",
                          description: `Você criou um plano há ${daysSinceLastPlan} dia(s). Só é possível renovar após 7 dias completos.`,
                          variant: "destructive",
                        });
                        return;
                      }
                    } catch (error) {
                      console.error('Erro ao verificar planos:', error);
                    }
                  }
                  
                  onStartPostConsultation();
                }}
                className="text-xs"
              >
                Iniciar
              </Button>
            )}
          </div>

          {/* Step 4: Plano Alimentar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {hasMealPlan ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            ) : (
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0 ${currentStep === 4 ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                {currentStep === 4 && <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-1 sm:mt-1.5"></div>}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm sm:text-base ${hasMealPlan ? 'text-primary' : currentStep === 4 ? 'text-foreground' : 'text-muted-foreground'}`}>
                Plano Alimentar MEV 7 dias
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {hasMealPlan ? 'Plano gerado com sucesso' : 'Aguardando dados pós-consulta'}
              </p>
            </div>
            {hasMealPlan && (
              <Badge variant="outline" className="text-primary border-primary text-xs sm:text-sm">
                Disponível
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps / Notifications */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          {nextAppointment ? (
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-primary/5 rounded-lg border border-primary/20">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-primary text-sm sm:text-base">Consulta Agendada</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {format(new Date(nextAppointment.date), "EEEE, d 'de' MMMM", { locale: ptBR })} às {nextAppointment.time}
                </p>
              </div>
              <Badge variant="outline" className="text-primary border-primary text-xs sm:text-sm">
                Confirmada
              </Badge>
            </div>
          ) : hasCompletedPostConsultation ? (
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-secondary/10 rounded-lg border border-secondary/20">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-secondary text-sm sm:text-base">Agendar Consulta</p>
                <p className="text-xs sm:text-sm text-secondary/80">
                  Você já pode agendar sua consulta com a Dra. Dayana
                </p>
              </div>
              <Button size="sm" onClick={onScheduleAppointment} className="bg-secondary hover:bg-secondary/90 text-xs sm:text-sm">
                Agendar
              </Button>
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => {
                if (!hasCompletedPreConsultation) {
                  alert('⚠️ Para agendar sua consulta, você precisa:\n\n1️⃣ Completar a PRÉ-CONSULTA\n2️⃣ Fazer o CHAT com Alice (10 min)\n3️⃣ Completar a PÓS-CONSULTA\n\n✨ Só assim poderá agendar com a Dra. Dayana!');
                } else if (timeRemaining > 0) {
                  alert('⏰ Quase lá! Termine o chat com Alice primeiro e depois complete a pós-consulta para liberar o agendamento.');
                } else {
                  alert('📋 Falta só a pós-consulta! Complete-a para poder agendar sua consulta com a Dra. Dayana.');
                }
              }}
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base">Finalize as etapas anteriores</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Complete pré-consulta, chat e pós-consulta para liberar agendamento
                </p>
              </div>
              <Badge variant="outline" className="text-muted-foreground border-muted-foreground/50 text-xs sm:text-sm">
                Bloqueado
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Access */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
            ⚡ Acesso Rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-auto py-2 sm:py-3 flex flex-col gap-1"
              onClick={() => window.open('https://wa.me/5521996936317', '_blank')}
            >
              <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs">WhatsApp Dra.</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-auto py-2 sm:py-3 flex flex-col gap-1"
              onClick={() => window.open('mailto:contato@bioregenere.com?subject=Dúvida sobre tratamento', '_blank')}
            >
              <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs">Enviar dúvida</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-auto py-2 sm:py-3 flex flex-col gap-1"
              onClick={() => {
                // Simplificado - baixar plano básico
                const basicPlan = `
PLANO PERSONALIZADO - ${patientName || 'Usuário'}
Gerado em: ${new Date().toLocaleDateString('pt-BR')}

📋 INFORMAÇÕES:
• Para acessar seu plano completo, vá na aba "Meu Plano"
• Lá você pode ver detalhes completos e baixar o plano personalizado
• Entre em contato conosco se precisar de ajuda

💌 CONTATO:
• WhatsApp: (21) 99693-6317
• Email: contato@bioregenere.com

🏥 Dra. Dayana Brazão - CRM/RJ XXXXX
Medicina Integrativa e Bem-Estar
                `;
                
                const blob = new Blob([basicPlan], { type: 'text/plain;charset=utf-8' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `informacoes-${patientName?.toLowerCase().replace(/\s+/g, '-') || 'usuario'}-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.txt`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
              }}
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs">Meu plano</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-auto py-2 sm:py-3 flex flex-col gap-1"
              onClick={() => {
                // Navegar para o analisador de prato
                window.open('/analisar-prato', '_blank');
              }}
            >
              <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs">Analisar prato</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}