import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Shield, 
  Lock, 
  ArrowLeft, 
  Check, 
  AlertTriangle,
  Percent,
  Calendar,
  Trophy,
  Zap,
  QrCode,
  FileText
} from 'lucide-react';
import { ParticleBackground } from '@/components/ui/particles';
import { ActionButton } from '@/components/arena/ActionButton';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMercadoPago } from '@/hooks/useMercadoPago';
import { useAuth } from '@/hooks/useAuth';
import { calculateWithdrawal } from '@/utils/creditsSystem';
import egyptArena from '@/assets/egypt-arena.png';

const Payment = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { 
    paymentState, 
    isInitialized, 
    processPix, 
    processCard, 
    processBoleto, 
    createPaymentData,
    formatCPF,
    validateCPF,
    formatCardNumber,
    detectCardBrand
  } = useMercadoPago();
  
  const [currentStep, setCurrentStep] = useState<'payment' | 'confirmation' | 'pix' | 'boleto'>('payment');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | 'boleto'>('card');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    cpf: user?.user_metadata?.document || '',
    cardNumber: '',
    expirationMonth: '',
    expirationYear: '',
    cvv: '',
    cardholderName: ''
  });

  // Data de início da promoção (29/08/2024)
  const promoStartDate = new Date('2024-08-29');
  const promoEndDate = new Date(promoStartDate.getTime() + (6 * 30 * 24 * 60 * 60 * 1000)); // 6 meses
  const today = new Date();
  const isPromoActive = today <= promoEndDate;
  
  // Cálculo dos valores
  const regularPrice = 5.00; // Novo sistema - Mês 1
  const discountPercent = isPromoActive ? 50 : 0;
  const currentPrice = isPromoActive ? regularPrice * 0.5 : regularPrice;
  // Simular dados do usuário (em produção viria do contexto/estado)
  const userRank = 'top10'; // Exemplo: top1, top5, top10, top20, regular
  const isAdult = localStorage.getItem('userAge') !== 'minor';
  const pvpEarnings = 10; // Créditos de PvP
  const trainingEarnings = 30; // Créditos de treinos
  const labyrinthEarnings = parseFloat(localStorage.getItem('labyrinthCredits') || '0'); // Créditos do Labirinto
  
  // Usar função real do sistema
  const withdrawalInfo = calculateWithdrawal(
    'premium', // planType
    30, // daysSinceDeposit (exemplo)
    0, // monthlyEarnings
    isAdult,
    userRank as any,
    pvpEarnings,
    trainingEarnings,
    labyrinthEarnings
  );
  
  const maxWithdrawal = withdrawalInfo.finalAmount;

  const handlePayment = async () => {
    if (!acceptTerms) {
      alert('Você deve aceitar os termos e condições para continuar.');
      return;
    }

    if (!isInitialized) {
      alert('Sistema de pagamento ainda não foi inicializado. Aguarde um momento.');
      return;
    }

    if (!user) {
      alert('Você precisa estar logado para fazer um pagamento.');
      return;
    }

    try {
      // Criar dados de pagamento
      const paymentData = createPaymentData(
        currentPrice,
        `Arena Premium - ${isPromoActive ? 'Promoção 50%' : 'Mensal'}`,
        paymentMethod === 'card' ? 'credit_card' : paymentMethod
      );

      let result;

      switch (paymentMethod) {
        case 'pix':
          result = await processPix(paymentData);
          if (result?.success) {
            setCurrentStep('pix');
          }
          break;
          
        case 'boleto':
          result = await processBoleto(paymentData);
          if (result?.success) {
            setCurrentStep('boleto');
          }
          break;
          
        case 'card':
          // Validar dados do cartão
          if (!formData.cardNumber || !formData.expirationMonth || !formData.expirationYear || !formData.cvv || !formData.cardholderName) {
            alert('Preencha todos os dados do cartão.');
            return;
          }
          
          result = await processCard(paymentData, {
            number: formData.cardNumber,
            expirationMonth: formData.expirationMonth,
            expirationYear: formData.expirationYear,
            securityCode: formData.cvv,
            cardholderName: formData.cardholderName
          });
          
          if (result?.success && result.status === 'approved') {
            setCurrentStep('confirmation');
          }
          break;
      }
      
    } catch (error) {
      console.error('❌ Erro no processamento do pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    }
  };

  // Tela de PIX
  if (currentStep === 'pix') {
    return (
      <div className={`${isMobile ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-background relative`}>
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${egyptArena})` }}
        />
        <ParticleBackground />
        
        <div className={`relative z-10 ${isMobile ? 'h-full overflow-y-auto' : 'min-h-screen'} flex items-center justify-center ${isMobile ? 'p-3' : 'p-4'}`}>
          <Card className="max-w-md w-full p-8 text-center arena-card-epic">
            <div className="text-6xl mb-6">🏦</div>
            <h1 className="text-2xl font-montserrat font-bold text-epic mb-4">
              PIX Gerado com Sucesso!
            </h1>
            <p className="text-muted-foreground mb-6">
              Escaneie o QR Code ou copie o código PIX para pagar
            </p>
            
            {paymentState.qrCodeBase64 && (
              <div className="bg-white p-4 rounded-lg mb-6 inline-block">
                <img 
                  src={`data:image/png;base64,${paymentState.qrCodeBase64}`} 
                  alt="QR Code PIX" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
            )}
            
            {paymentState.qrCode && (
              <div className="bg-muted/20 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-epic mb-2">Código PIX:</h3>
                <p className="text-sm font-mono break-all bg-white p-2 rounded">
                  {paymentState.qrCode}
                </p>
                <button 
                  onClick={() => navigator.clipboard.writeText(paymentState.qrCode || '')}
                  className="mt-2 text-sm text-epic hover:underline"
                >
                  📋 Copiar código
                </button>
              </div>
            )}

            <div className="bg-epic/10 border border-epic/30 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-epic mb-2">📋 Instruções:</h3>
              <ul className="text-sm space-y-1 text-left">
                <li>1. Abra seu app bancário</li>
                <li>2. Escolha PIX</li>
                <li>3. Escaneie o QR Code ou cole o código</li>
                <li>4. Confirme o pagamento</li>
                <li>5. Aguarde a confirmação automática</li>
              </ul>
            </div>

            <ActionButton 
              variant="epic" 
              onClick={() => setCurrentStep('payment')}
              className="w-full mb-4"
              icon={<ArrowLeft />}
            >
              Voltar
            </ActionButton>
          </Card>
        </div>
      </div>
    );
  }

  // Tela de Boleto
  if (currentStep === 'boleto') {
    return (
      <div className={`${isMobile ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-background relative`}>
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${egyptArena})` }}
        />
        <ParticleBackground />
        
        <div className={`relative z-10 ${isMobile ? 'h-full overflow-y-auto' : 'min-h-screen'} flex items-center justify-center ${isMobile ? 'p-3' : 'p-4'}`}>
          <Card className="max-w-md w-full p-8 text-center arena-card-epic">
            <div className="text-6xl mb-6">🧾</div>
            <h1 className="text-2xl font-montserrat font-bold text-epic mb-4">
              Boleto Gerado!
            </h1>
            <p className="text-muted-foreground mb-6">
              Clique no botão abaixo para imprimir seu boleto
            </p>
            
            {paymentState.boletoUrl && (
              <div className="mb-6">
                <ActionButton 
                  variant="epic" 
                  onClick={() => window.open(paymentState.boletoUrl, '_blank')}
                  className="w-full mb-4"
                  icon={<FileText />}
                >
                  🖨️ Imprimir Boleto
                </ActionButton>
              </div>
            )}

            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-warning mb-2">⚠️ Importante:</h3>
              <ul className="text-sm space-y-1 text-left">
                <li>• Boleto válido por 3 dias úteis</li>
                <li>• Após o vencimento, gere um novo boleto</li>
                <li>• Pagamento pode levar até 2 dias úteis</li>
                <li>• Você receberá um e-mail de confirmação</li>
              </ul>
            </div>

            <ActionButton 
              variant="epic" 
              onClick={() => setCurrentStep('payment')}
              className="w-full"
              icon={<ArrowLeft />}
            >
              Voltar
            </ActionButton>
          </Card>
        </div>
      </div>
    );
  }

  if (currentStep === 'confirmation') {
    return (
      <div className={`${isMobile ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-background relative`}>
        {/* Background temático do guerreiro */}
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${egyptArena})` }}
        />
        <ParticleBackground />
        
        <div className={`relative z-10 ${isMobile ? 'h-full overflow-y-auto' : 'min-h-screen'} flex items-center justify-center ${isMobile ? 'p-3' : 'p-4'}`}>
          <Card className="max-w-md w-full p-8 text-center arena-card-epic">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-2xl font-montserrat font-bold text-epic mb-4">
              Pagamento Realizado com Sucesso!
            </h1>
            <p className="text-muted-foreground mb-6">
              Você pode começar a jogar imediatamente e explorar todas as eras históricas!
            </p>
            
            <div className="bg-epic/10 border border-epic/30 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-epic mb-2">🎮 Acesso Liberado</h3>
              <ul className="text-sm space-y-1 text-left">
                <li>✅ Todas as 4 eras históricas</li>
                <li>✅ Arena PvP completa</li>
                <li>✅ Sistema de créditos ativo</li>
                <li>✅ Ranking global</li>
              </ul>
            </div>

            <ActionButton 
              variant="epic" 
              onClick={() => navigate('/app')}
              className="w-full mb-4"
              icon={<Trophy />}
            >
              Ir para Arena
            </ActionButton>

            <ActionButton 
              variant="epic" 
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Ver Dashboard
            </ActionButton>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-background relative`}>
      {/* Background temático do guerreiro */}
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${egyptArena})` }}
      />
      <ParticleBackground />
      
      {/* Header */}
      <header className="relative z-10 p-6 border-b border-card-border bg-background-soft/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <ActionButton variant="epic" onClick={() => navigate('/app')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </ActionButton>
          
          <div className="text-center">
            <h1 className="text-2xl font-montserrat font-bold text-epic">Arena do Conhecimento</h1>
            <p className="text-sm text-muted-foreground">Pagamento Seguro</p>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Shield className="w-4 h-4 mr-1" />
            SSL Seguro
          </div>
        </div>
      </header>

      <div className={`relative z-10 max-w-6xl mx-auto ${isMobile ? 'p-3 h-full overflow-y-auto' : 'p-6'}`}>
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'lg:grid-cols-3 gap-8'}`}>
          
          {/* Coluna da Esquerda - Resumo da Oferta */}
          <div className={isMobile ? 'order-2' : 'lg:col-span-1'}>
            <Card className="arena-card-epic p-6 sticky top-6">
              <h2 className="text-xl font-montserrat font-bold text-epic mb-4">
                💎 Arena Premium
              </h2>
              
              {/* Promoção Ativa */}
              {isPromoActive && (
                <div className="bg-gradient-to-r from-epic/20 to-victory/20 border border-epic/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Percent className="w-5 h-5 text-epic" />
                    <span className="font-bold text-epic">OFERTA ESPECIAL!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    50% de desconto nos primeiros 6 meses
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                    <Calendar className="w-4 h-4" />
                    <span>Válido até {promoEndDate.toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              )}

              {/* Preços */}
              <div className="space-y-3 mb-6">
                {isPromoActive && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground line-through">Preço normal</span>
                    <span className="text-muted-foreground line-through">R$ {regularPrice.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold">Valor a pagar</span>
                  <span className="text-2xl font-bold text-epic">
                    R$ {currentPrice.toFixed(2)}
                  </span>
                </div>

                {isPromoActive && (
                  <div className="text-center">
                                      <span className="bg-epic text-white px-3 py-1 rounded-full text-sm font-bold">
                    Desconto: R$ {(regularPrice - currentPrice).toFixed(2)}
                  </span>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Sistema de 3 */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-epic" />
                  Sistema de 3 Meses
                </h3>
                
                <div className="bg-muted/20 rounded-lg p-3">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Limite mínimo para saque:</span>
                      <span className="font-bold text-epic">200 créditos</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Limite máximo (usuários regulares):</span>
                      <span className="font-bold text-victory">400 créditos</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TOP RANKED:</span>
                      <span className="font-bold text-legendary">Ilimitado</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    <p>• Saque disponível dia 1° do mês • Taxa administrativa 15%</p>
                    <p>• Usuários regulares: 1 dia para sacar (até 400)</p>
                    <p>• TOP RANKED: 3 dias para sacar (ilimitado)</p>
                    <p>• Após prazo: créditos expiram (não acumulam)</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>🏛️ Mês 1 (Atual)</span>
                    <span className="font-semibold">437 créditos sacáveis</span>
                  </div>
                  {!isPromoActive && (
                    <>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>📜 Mês 2</span>
                        <span>306 créditos sacáveis</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>⚔️ Mês 3</span>
                        <span>175 créditos sacáveis</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Explicação do Sistema */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                <h4 className="font-semibold text-blue-600 mb-2">📊 Como Funciona o Sistema:</h4>
                <div className="text-xs text-blue-500 space-y-1">
                  <p>• <strong>Mês 1:</strong> R$ 5,00 → 350 créditos → 297,5 sacáveis (taxa 15%)</p>
<p>• <strong>Mês 2:</strong> R$ 3,50 → 245 créditos → 208,25 sacáveis (taxa 15%)</p>
<p>• <strong>Mês 3:</strong> R$ 2,00 → 140 créditos → 119 sacáveis (taxa 15%)</p>
                  <p>• <strong>Bônus:</strong> Top 1 (+45), Top 5 (+35), Top 10 (+25), Top 20 (+15)</p>
                  <p>• <strong>Menores de 18:</strong> Limite 50% dos valores acima</p>
                </div>
              </div>

              {/* Aviso Legal - Compacto */}
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <div className="text-xs">
                    <span className="font-semibold text-warning">⚖️ Legal:</span>
                    <span className="text-muted-foreground ml-1">
                      Créditos para uso interno • Não constitui investimento • LGPD compliant
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Coluna da Direita - Formulário de Pagamento */}
          <div className={isMobile ? 'order-1' : 'lg:col-span-2'}>
            <Card className="arena-card p-6">
              <h2 className="text-xl font-montserrat font-bold mb-6">
                💳 Dados do Pagamento
              </h2>

              {/* Métodos de Pagamento */}
              <div className="mb-6">
                <Label className="text-base font-semibold mb-3 block">Método de Pagamento</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border rounded-lg text-center transition-all ${
                      paymentMethod === 'card' 
                        ? 'border-epic bg-epic/10 text-epic' 
                        : 'border-muted hover:border-epic/50'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Cartão</span>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-4 border rounded-lg text-center transition-all ${
                      paymentMethod === 'pix' 
                        ? 'border-epic bg-epic/10 text-epic' 
                        : 'border-muted hover:border-epic/50'
                    }`}
                  >
                    <div className="w-6 h-6 mx-auto mb-2 text-lg">🏦</div>
                    <span className="text-sm font-medium">PIX</span>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod('boleto')}
                    className={`p-4 border rounded-lg text-center transition-all ${
                      paymentMethod === 'boleto' 
                        ? 'border-epic bg-epic/10 text-epic' 
                        : 'border-muted hover:border-epic/50'
                    }`}
                  >
                    <div className="w-6 h-6 mx-auto mb-2 text-lg">🧾</div>
                    <span className="text-sm font-medium">Boleto</span>
                  </button>
                </div>
              </div>

              {/* Dados Pessoais */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold">📋 Dados Pessoais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input 
                      id="name" 
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input 
                      id="cpf" 
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => setFormData(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Dados do Cartão (se selecionado) */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Dados do Cartão
                  </h3>
                  
                  <div>
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input 
                      id="cardNumber" 
                      placeholder="1234 5678 9012 3456"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="validity">Validade</Label>
                      <Input 
                        id="validity" 
                        placeholder="MM/AA"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input 
                        id="cvv" 
                        placeholder="123"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PIX */}
              {paymentMethod === 'pix' && (
                <div className="space-y-3 mb-6">
                  <h3 className="font-semibold">🏦 PIX Instantâneo</h3>
                  <div className="bg-epic/10 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      QR Code gerado após confirmação • Pagamento instantâneo
                    </p>
                  </div>
                </div>
              )}

              {/* Boleto */}
              {paymentMethod === 'boleto' && (
                <div className="space-y-3 mb-6">
                  <h3 className="font-semibold">🧾 Boleto Bancário</h3>
                  <div className="bg-epic/10 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      Enviado por e-mail • Vencimento: 3 dias úteis
                    </p>
                  </div>
                </div>
              )}

              {/* Termos e Condições - Ultra Compacto */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-xs">
                    Aceito{' '}
                    <button className="text-epic hover:underline font-medium">
                      T&C
                    </button>
                    {' '}e{' '}
                    <button className="text-epic hover:underline font-medium">
                      PP
                    </button>
                    . Créditos internos.
                  </Label>
                </div>
              </div>

              {/* Segurança - Compacto */}
              <div className="bg-epic/10 border border-epic/30 rounded-lg p-3 mb-6">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-epic" />
                  <span className="text-sm font-semibold text-epic">SSL 256-bit • Dados Protegidos</span>
                </div>
              </div>

              {/* Botão de Pagamento */}
              <ActionButton
                variant="epic"
                onClick={handlePayment}
                disabled={!acceptTerms || paymentState.loading}
                className="w-full text-lg py-4"
                icon={paymentState.loading ? undefined : <Check />}
              >
                {paymentState.loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processando...</span>
                  </div>
                ) : (
                  `Pagar R$ ${currentPrice.toFixed(2)} - ${paymentMethod.toUpperCase()}`
                )}
              </ActionButton>

              {isPromoActive && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  ⚡ Oferta especial aplicada automaticamente!
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
