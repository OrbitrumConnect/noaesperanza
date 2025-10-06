import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, Heart, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TermsConsentModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userEmail?: string;
}

export default function TermsConsentModal({ isOpen, onComplete, userEmail }: TermsConsentModalProps) {
  const [dataConsent, setDataConsent] = useState(false);
  const [treatmentConsent, setTreatmentConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveConsent = async () => {
    if (!dataConsent || !treatmentConsent) {
      toast({
        title: "⚠️ Consentimentos obrigatórios",
        description: "É necessário aceitar todos os termos para utilizar a plataforma.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          consent_data_usage: dataConsent,
          consent_treatment: treatmentConsent,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "✅ Consentimentos registrados",
        description: "Seus consentimentos foram salvos com sucesso. Bem-vindo à plataforma!"
      });

      onComplete();
    } catch (error) {
      console.error('Erro ao salvar consentimentos:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível registrar os consentimentos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onComplete()} modal={false}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-6 h-6 text-primary" />
            Termos de Uso e Consentimentos
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Para utilizar nossa plataforma de medicina do estilo de vida, é necessário aceitar os termos abaixo.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6 py-4">
            {/* Seção 1: Uso de Dados */}
            <div className="p-4 border rounded-lg bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
              <div className="flex items-start gap-3 mb-3">
                <Lock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Política de Privacidade e Uso de Dados</h3>
                  <Badge variant="outline" className="mt-1 text-xs">LGPD Compliance</Badge>
                </div>
              </div>
              
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-3">
                <div>
                  <p className="font-medium mb-2">Coletamos e utilizamos seus dados para:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                    <li>Personalizar seu plano de saúde e bem-estar</li>
                    <li>Acompanhar seu progresso e resultados</li>
                    <li>Gerar relatórios médicos e estatísticas de saúde</li>
                    <li>Comunicação sobre sua evolução e orientações</li>
                    <li>Pesquisa científica anonymizada (opcional)</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium mb-2">Seus direitos:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                    <li>Acesso aos seus dados a qualquer momento</li>
                    <li>Correção de informações incorretas</li>
                    <li>Exclusão dos dados (direito ao esquecimento)</li>
                    <li>Portabilidade para outros sistemas</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-3 mt-4 p-3 bg-white dark:bg-gray-950 rounded border">
                <Checkbox 
                  id="data-consent" 
                  checked={dataConsent}
                  onCheckedChange={(checked) => setDataConsent(checked === true)}
                  className="mt-0.5"
                />
                <label htmlFor="data-consent" className="text-sm font-medium cursor-pointer leading-relaxed">
                  Aceito a coleta e uso dos meus dados conforme descrito acima
                </label>
              </div>
            </div>

            {/* Seção 2: Consentimento Médico */}
            <div className="p-4 border rounded-lg bg-green-50/50 border-green-200">
              <div className="flex items-start gap-3 mb-3">
                <Heart className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900">Consentimento para Acompanhamento Médico</h3>
                  <Badge variant="outline" className="mt-1">Medicina do Estilo de Vida</Badge>
                </div>
              </div>
              
              <div className="text-sm text-green-800 space-y-2">
                <p><strong>Autorizo o acompanhamento profissional que inclui:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Avaliação do meu perfil de saúde e biomarcadores</li>
                  <li>Elaboração de planos alimentares personalizados</li>
                  <li>Orientações sobre práticas de biohacking seguras</li>
                  <li>Recomendações de suplementação quando apropriado</li>
                  <li>Acompanhamento do progresso e ajustes no plano</li>
                </ul>
                
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mt-3">
                  <p className="text-yellow-800 text-xs">
                    <strong>Importante:</strong> Este acompanhamento complementa, mas não substitui, 
                    consultas médicas regulares. Em caso de sintomas graves, procure atendimento médico presencial.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-4 p-3 bg-white rounded border">
                <Checkbox 
                  id="treatment-consent" 
                  checked={treatmentConsent}
                  onCheckedChange={(checked) => setTreatmentConsent(checked === true)}
                />
                <label htmlFor="treatment-consent" className="text-sm font-medium cursor-pointer">
                  Consinto com o acompanhamento profissional descrito acima
                </label>
              </div>
            </div>

            {/* Seção 3: Termos Gerais */}
            <div className="p-4 border rounded-lg bg-purple-50/50 border-purple-200">
              <div className="flex items-start gap-3 mb-3">
                <FileText className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-purple-900">Termos Gerais de Uso</h3>
                </div>
              </div>
              
              <div className="text-sm text-purple-800 space-y-2">
                <ul className="list-disc list-inside space-y-1">
                  <li>Esta plataforma destina-se a maiores de 18 anos</li>
                  <li>As informações fornecidas devem ser verdadeiras e atualizadas</li>
                  <li>O uso inadequado da plataforma pode resultar na suspensão da conta</li>
                  <li>Os profissionais podem editar e ajustar seu plano conforme necessário</li>
                  <li>A plataforma utiliza inteligência artificial para personalização</li>
                </ul>
              </div>
            </div>
            </div>
          </ScrollArea>
        </div>

        <div className="flex-shrink-0 border-t pt-4 flex justify-between items-center bg-background">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Badge variant="outline" className="text-xs">LGPD</Badge>
            Usuário: {userEmail}
          </p>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              disabled={loading}
              onClick={() => {
                toast({
                  title: "⚠️ Aceitação obrigatória",
                  description: "É necessário aceitar os termos para continuar.",
                  variant: "destructive"
                });
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveConsent}
              disabled={loading || !dataConsent || !treatmentConsent}
              className="min-w-[140px]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                '✅ Aceitar e Continuar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}