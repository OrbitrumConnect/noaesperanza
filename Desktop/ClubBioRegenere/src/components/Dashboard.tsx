import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Send, User, Heart, CheckCircle, Circle, 
  Book, Video, Download, ArrowLeft, FileText,
  Clock, MessageSquare, Camera, CreditCard, Calendar, Crown, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AliceAI } from '../lib/alice-ai';
import { aliceUnified } from '../lib/alice-unified';
import AlicePresence from './AlicePresence';
import EbooksLibrary from './EbooksLibrary';
import VideoLibrary from './VideoLibrary';
import PaymentArea from './PaymentArea';
import PreConsultationFlow, { type PreConsultationData } from './PreConsultationFlow';
import PostConsultationFlow, { type DietaryData } from './PostConsultationFlow';
import MealPlanGenerator from './MealPlanGenerator';
import MealPlanPDFGenerator from './MealPlanPDFGenerator';
import PlateAnalyzer from './PlateAnalyzer';
import ComprehensiveAdminDashboard from './ComprehensiveAdminDashboard';
import PatientProgressStatus from './PatientProgressStatus';
import AppointmentScheduler from './AppointmentScheduler';
import VoiceControls from './VoiceControls';
import ContextualOptions from './ContextualOptions';
import AliceThoughtBubble from './AliceThoughtBubble';
import SupabaseTestPanel from './SupabaseTestPanel';
import PersonalizedPlan from './PersonalizedPlan';
import DayanaPlansViewer from './DayanaPlansViewer';

import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import UserProfileEdit from './UserProfileEdit';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import SubscriptionUpgrade from './SubscriptionUpgrade';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { getCurrentBrazilianTimeString } from '../utils/timezone';
import { autoRepairAuthLimbo } from '../utils/auth-cleanup';
import SubscriptionDebug from './SubscriptionDebug';
import AdminVIPManager from './AdminVIPManager';

type ChatPhase = 'welcome' | 'identification' | 'measurements' | 'routine' | 'objectives' | 'health' | 'preferences' | 'plan-generation' | 'plan-delivery' | 'resources';

interface UserData {
  name?: string;
  email?: string;
  whatsapp?: string;
  age?: number;
  height?: number;
  weight?: number;
  mainObjective?: string;
  routine?: string;
  sleepHours?: number;
  stressLevel?: number;
  activityLevel?: string;
}

interface Message {
  id: string;
  sender: 'alice' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
  isGuidedMode?: boolean;
  hasContextOptions?: boolean;
}

interface DashboardProps {
  onBack: () => void;
  isAdmin?: boolean;
  userType?: 'patient' | 'admin';
}

export default function Dashboard({ onBack, isAdmin = false, userType = 'patient' }: DashboardProps) {
  const [userData, setUserData] = useState<UserData>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatPhase, setChatPhase] = useState<ChatPhase>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [activeModule, setActiveModule] = useState<string>('chat');
  const [showPreConsultation, setShowPreConsultation] = useState(false);
  const [preConsultationData, setPreConsultationData] = useState<PreConsultationData | null>(null);
  const [postConsultationData, setPostConsultationData] = useState<DietaryData | null>(null);
  const [showPostConsultation, setShowPostConsultation] = useState(false);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aliceEmotion, setAliceEmotion] = useState<'neutral' | 'caring' | 'curious' | 'encouraging' | 'empathetic' | 'professional'>('neutral');
  const [alicePresenceEmotion, setAlicePresenceEmotion] = useState<'neutral' | 'caring' | 'curious' | 'encouraging' | 'empathetic' | 'professional'>('neutral');
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [timerActive, setTimerActive] = useState(false);
  const [showAppointmentScheduler, setShowAppointmentScheduler] = useState(false);
  const [nextAppointment, setNextAppointment] = useState<{ date: string; time: string } | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  // Thought bubble states
  const [showThoughtBubble, setShowThoughtBubble] = useState(false);
  const [currentBiohackingTip, setCurrentBiohackingTip] = useState<string>('');
  const [currentFrequency, setCurrentFrequency] = useState<string>('');
  const [currentPersonalization, setCurrentPersonalization] = useState<string>('');
  const [currentTopics, setCurrentTopics] = useState<string[]>([]);
  const [isGuidedMode, setIsGuidedMode] = useState(false);
  
  const [showEndChatModal, setShowEndChatModal] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  
  // Use the Supabase auth hook to get current user
  const { user, session, userProfile, loading: authLoading } = useSupabaseAuth();
  
  // Use subscription hook to check payment status
  const { subscribed, subscription_tier, loading: subscriptionLoading, error: subscriptionError } = useSubscription();
  
  // Realtime data for the patient
  const { lastUpdate, isConnected } = useRealtimeData(user?.id || userProfile?.id);
  
  // Toast hook
  const { toast } = useToast();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const aliceAI = useRef(new AliceAI());
  const alice = useRef(aliceUnified);

  // Voice Chat Hook
  const { isRecording, isProcessing, startRecording, stopRecording, speakText } = useVoiceChat({
    onTranscription: (text: string) => {
      console.log('📝 Transcrição recebida:', text);
      setInputMessage(text);
      setTimeout(() => handleSendMessage(), 500);
    },
    onAudioResponse: (audioUrl: string) => {
      console.log('🔊 Resposta em áudio recebida:', audioUrl);
    }
  });

  // Auto-repair auth limbo on component mount
  useEffect(() => {
    autoRepairAuthLimbo();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEndChat = () => {
    setTimerActive(false);
    setTimeRemaining(0);
    setShowEndChatModal(false);
    
    // Salvar o estado da conversa e redirecionar para planos
    console.log('✅ [CONVERSA] Chat encerrado pelo usuário - redirecionando para planos');
    setTimeout(() => {
      setActiveModule('personalized-plan');
    }, 500);
  };

  const startChatTimer = () => {
    setTimerActive(true);
    setTimeRemaining(600);
  };

  const handlePreConsultationComplete = (data: PreConsultationData) => {
    setPreConsultationData(data);
    setShowPreConsultation(false);
    startChatTimer();
    setActiveModule('chat');
    
    // LIMPAR ESTADO DA ALICE ANTES DE INICIAR NOVA CONVERSA  
    const userId = user?.id || session?.user?.id;
    if (userId) {
      alice.current.resetConversation(userId);
    }
    
    console.log("🔄 Estado da Alice resetado para nova conversa");
    
    // Salvar dados do usuário
    setUserData(prev => ({
      ...prev,
      name: data.identification.name,
      email: data.identification.email,
      whatsapp: data.identification.whatsapp,
      age: data.identification.age
    }));
    
    // Iniciar automaticamente o atendimento guiado
    setTimeout(() => {
      handleStartGuidedChat();
    }, 1000);
    
    setAliceEmotion('caring');
    setAlicePresenceEmotion('caring');
    
    toast({
      title: "Pré-consulta completada!",
      description: "Iniciando atendimento guiado com Alice...",
    });
  };

  const handlePostConsultationComplete = (data: DietaryData) => {
    setPostConsultationData(data);
    setShowPostConsultation(false);
    
    // Se os planos foram gerados, mostrar diretamente
    if (data.planosPersonalizados && data.planId) {
      console.log('📋 Planos personalizados recebidos:', data.planosPersonalizados);
      setActiveModule('personalized-plan');
      
      // Salvar os planos no estado para visualização
      setMealPlan(data.planosPersonalizados);
    } else {
      setActiveModule('meal-plan');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    // Permitir envio no modo guiado mesmo sem pré-consulta
    if (!hasCompletedPreConsultation && !isGuidedMode) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to Supabase  
    try {
      const currentUserId = user?.id || session?.user?.id;
      console.log('💾 [CONVERSA] Tentando salvar - User:', currentUserId, 'Session exists:', !!session);
      
      if (currentUserId && session) {
        console.log('📝 [CONVERSA] Salvando mensagem do usuário...');
        const sessionId = crypto.randomUUID();
        const { data, error } = await supabase.from('conversations').insert({
          user_id: currentUserId,
          message_content: inputMessage,
          message_type: 'user',
          session_id: sessionId
        });
        
        if (error) {
          console.error('❌ [CONVERSA] Erro ao salvar mensagem:', error);
        } else {
          console.log('✅ [CONVERSA] Mensagem do usuário salva com sucesso!');
        }
      } else {
        console.warn('⚠️ [CONVERSA] Não salvando - User ID:', currentUserId, 'Session:', !!session);
      }
    } catch (error) {
      console.error('❌ [CONVERSA] Erro geral ao salvar:', error);
    }

    setInputMessage('');
    setIsLoading(true);
    setAliceEmotion('professional');
    setAlicePresenceEmotion('professional');

    try {
      const userProfile = {
        id: userData.email || 'anonymous',
        name: userData.name || '',
        age: userData.age || 0,
        weight: userData.weight || 0,
        height: userData.height || 0,
        activityLevel: userData.activityLevel || 'moderate',
        sleepPattern: userData.sleepHours ? `${userData.sleepHours}h` : '8h',
        stressLevel: userData.stressLevel || 5,
        foodPreferences: [],
        allergies: [],
        healthGoals: [userData.mainObjective || 'melhorar saúde'],
        currentPhase: (hasCompletedPostConsultation ? 'ongoing' : timeRemaining < 600 ? 'chat' : 'pre-consultation') as 'pre-consultation' | 'chat' | 'post-consultation' | 'ongoing'
      };

      // Usar sistema Alice unificado
      const response = alice.current.generateResponse(
        inputMessage,
        userProfile.id,
        userProfile
      );

      console.log("🔍 Alice Unified Response:", response);

      // Salvar conversa na memória da Alice (mantendo sistema existente)
      const conversationMemory = {
        userId: userProfile.id,
        timestamp: new Date(),
        message: inputMessage,
        response: response.message,
        mood: response.emotion as 'positive' | 'neutral' | 'concerned' | 'excited' | 'tired',
        topics: currentTopics,
        suggestions_followed: false,
        satisfaction_score: 8
      };
      
      alice.current.saveConversation(conversationMemory);
      
      // Configurar emoção da Alice baseada na resposta
      const emotionMap = {
        'positive': 'encouraging',
        'excited': 'encouraging', 
        'concerned': 'empathetic',
        'tired': 'caring'
      } as const;
      
      setAliceEmotion(emotionMap[response.emotion as keyof typeof emotionMap] || 'caring');
      setAlicePresenceEmotion(emotionMap[response.emotion as keyof typeof emotionMap] || 'caring');
      setIsSpeaking(true);

      setTimeout(() => {
        // Mostrar dicas na thought bubble
        if (response.biohackingTip) {
          setCurrentBiohackingTip(response.biohackingTip);
        }
        if (response.frequencyRecommendation) {
          setCurrentFrequency(response.frequencyRecommendation);
        }
        if (response.personalizationNote) {
          setCurrentPersonalization(response.personalizationNote);
        }
        
        // Mostrar thought bubble se houver dicas
        if (response.biohackingTip || response.frequencyRecommendation || response.personalizationNote) {
          setShowThoughtBubble(true);
          // Auto-hide após 8 segundos
          setTimeout(() => setShowThoughtBubble(false), 8000);
        }

        // Usar apenas a mensagem principal sem as dicas extras
        const aliceMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'alice',
          content: response.message,
          timestamp: new Date(),
          options: response.suggestions?.slice(0, 3), // Limitar a 3 opções
          isGuidedMode: isGuidedMode,
          hasContextOptions: isGuidedMode // Mostrar opções contextuais no modo guiado
        };

        setMessages(prev => [...prev, aliceMessage]);

        // Auto-falar no modo guiado se voice estiver habilitado
        if (isGuidedMode && voiceEnabled) {
          setTimeout(() => {
            const cleanText = response.message
              .replace(/[🌟💬💚✨🎯]/g, '')
              .replace(/\*\*/g, '')
              .trim();
            speakText(cleanText);
          }, 500);
        }

        // Save Alice message to Supabase
        setTimeout(async () => {
          try {
            const currentUserId = user?.id || session?.user?.id;
            console.log('💾 [CONVERSA] Tentando salvar resposta Alice - User:', currentUserId);
            
            if (currentUserId && session) {
              console.log('📝 [CONVERSA] Salvando resposta da Alice...');
              const sessionId = crypto.randomUUID();
              const { data, error } = await supabase.from('conversations').insert({
                user_id: currentUserId,
                message_content: response.message,
                message_type: 'alice',
                session_id: sessionId,
                mood_detected: response.emotion,
                biohacking_suggested: response.biohackingTip,
                frequency_suggested: response.frequencyRecommendation,
                conversation_stage: response.currentPhase,
                data_collected: {
                  userProfile: userProfile,
                  topics: currentTopics,
                  suggestions: response.suggestions
                }
              });
              
              if (error) {
                console.error('❌ [CONVERSA] Erro ao salvar resposta Alice:', error);
              } else {
                console.log('✅ [CONVERSA] Resposta da Alice salva com sucesso!');
              }
            } else {
              console.warn('⚠️ [CONVERSA] Alice não salva - falta auth');
            }
          } catch (error) {
            console.error('❌ [CONVERSA] Erro geral Alice:', error);
          }
        }, 100);
        
        setCurrentTopics([response.currentPhase || 'chat']);
        setIsSpeaking(false);
        setIsLoading(false);

        // Ler resposta em voz alta se habilitado
        if (voiceEnabled) {
          // Usar apenas o texto principal, sem emojis e formatação
          const cleanText = response.message
            .replace(/💡.*?\n/g, '')
            .replace(/🎵.*?\n/g, '')
            .replace(/✨.*?\n/g, '')
            .replace(/\*\*/g, '')
            .trim();
          speakText(cleanText);
        }

        // Verificar se a conversa foi completada e gerar resumo para a doutora
        if (response.isCompleted) {
          const patientProfile = alice.current.getPatientProfile(userProfile.id);
          if (patientProfile) {
            const doctorSummary = alice.current.generateDoctorSummary(patientProfile);
            console.log("📋 Resumo Completo para a Dra. Dayana:", doctorSummary);
            
            // PROCESSAR DADOS COLETADOS
            (async () => {
              try {
                const currentUserId = user?.id || session?.user?.id;
                if (currentUserId) {
                  console.log('🔄 Processando conversa para extrair dados estruturados...');
                  
                  // 1. Buscar todas as conversas do usuário (últimas 20 para contexto)
                  const { data: conversations } = await supabase
                    .from('conversations')
                    .select('*')
                    .eq('user_id', currentUserId)
                    .order('created_at', { ascending: false })
                    .limit(20);

                  // 2. Processar através da edge function
                  if (conversations && conversations.length > 0) {
                    const { data: processedData, error: processError } = await supabase.functions.invoke('process-alice-conversation', {
                      body: {
                        user_id: currentUserId,
                        conversation_messages: conversations
                      }
                    });

                    if (processError) {
                      console.error('Erro ao processar conversa:', processError);
                    } else {
                      console.log('✅ Dados processados:', processedData);
                    }

                    // 3. Gerar planos automaticamente
                    console.log('🎯 Gerando planos personalizados da Dra. Dayana...');
                    const { data: planosData, error: planosError } = await supabase.functions.invoke('generate-dayana-plans', {
                      body: { user_id: currentUserId }
                    });

                    if (planosError) {
                      console.error('Erro ao gerar planos:', planosError);
                    } else {
                      console.log('🎉 Planos gerados automaticamente:', planosData);
                      
                      // Salvar planos no estado para exibição automática
                      setMealPlan(planosData.planos_gerados);
                      setPostConsultationData({
                        ...postConsultationData,
                        planosPersonalizados: planosData.planos_gerados,
                        planId: planosData.plan_id
                      } as any);
                    }
                  }
                }
              } catch (error) {
                console.error('Erro no processamento automático:', error);
              }
            })();
            
            // Adicionar mensagem especial de conclusão e mostrar modal
            setTimeout(() => {
              const summaryMessage: Message = {
                id: (Date.now() + 2).toString(),
                sender: 'alice',
                content: "🎉 Perfeito! Coletei todas as informações necessárias e já tenho seus dados estruturados para a Dra. Dayana. Conversa finalizada com sucesso! ✅",
                timestamp: new Date()
              };
              setMessages(prev => [...prev, summaryMessage]);
              
              // Mostrar modal de conclusão ao invés de redirecionar automaticamente
              setTimeout(() => {
                setShowEndChatModal(true);
                setTimerActive(false);
                setTimeRemaining(0);
              }, 2000);
            }, 2000);
          }
        }
      }, 1500);

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      setIsLoading(false);
      setAliceEmotion('neutral');
      setAlicePresenceEmotion('neutral');
      setIsSpeaking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOptionClick = (option: string) => {
    console.log('🔘 Opção clicada:', option);
    setInputMessage(option);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleToggleVoice = () => {
    setVoiceEnabled(prev => !prev);
    console.log('🔊 Voz', !voiceEnabled ? 'habilitada' : 'desabilitada');
  };

  const handleScheduleAppointment = () => {
    setShowAppointmentScheduler(true);
  };

  const handleStartGuidedChat = () => {
    setIsGuidedMode(true);
    // Reset conversation to start guided flow
    alice.current.resetConversation(userData.email || 'anonymous');
    setMessages([]);
    
    // Send initial guided message automatically
    setTimeout(() => {
      const guidedMessage: Message = {
        id: Date.now().toString(),
        sender: 'alice',
        content: `🌟 Olá ${userData.name || 'querida'}! Sou a Alice, sua IA nutricional personalizada da Dra. Dayana. Vamos iniciar seu atendimento guiado? Vou te fazer perguntas específicas para criar seu protocolo MEV perfeito. 
        
💬 Você pode responder por texto ou usar o microfone para falar comigo!

Como você gostaria de ser chamada durante nossa conversa?`,
        timestamp: new Date(),
        options: [
          `Pode me chamar de ${userData.name || 'seu nome'}`,
          "Use um apelido carinhoso",
          "Seja formal, por favor",
          "Você escolhe como me chamar",
          "Vamos começar direto as perguntas"
        ]
      };
      setMessages([guidedMessage]);
    }, 800);
  };

  const handleAppointmentScheduled = (appointment: { date: string; time: string }) => {
    setNextAppointment(appointment);
    setShowAppointmentScheduler(false);
  };

  // Adicionar controle para alternar entre modo admin e paciente
  const [adminMode, setAdminMode] = useState(() => {
    // Por padrão, admins iniciam no modo administrativo
    return (isAdmin || userType === 'admin') ? true : false;
  });

  // Se for admin mas estiver em modo paciente, usar dashboard normal
  if ((isAdmin || userType === 'admin') && adminMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent/10 to-primary/10">
        <div className="absolute top-4 right-4 z-50">
          <Button
            onClick={() => setAdminMode(false)}
            variant="outline"
            className="bg-white/90 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-white transition-all"
          >
            👤 Modo Paciente
          </Button>
        </div>
        <ComprehensiveAdminDashboard />
      </div>
    );
  }

  if (showPreConsultation) {
    return (
      <PreConsultationFlow 
        onSubmit={handlePreConsultationComplete}
        onCancel={() => setShowPreConsultation(false)}
        patientName={userData.name}
      />
    );
  }

  if (showPostConsultation) {
    return (
      <PostConsultationFlow 
        onSubmit={handlePostConsultationComplete}
        onCancel={() => setShowPostConsultation(false)}
        patientName={userData.name}
      />
    );
  }

  if (showAppointmentScheduler) {
    return (
      <AppointmentScheduler 
        onScheduleSuccess={(date: Date, time: string) => {
          setNextAppointment({ date: date.toISOString().split('T')[0], time });
          setShowAppointmentScheduler(false);
        }}
        onCancel={() => setShowAppointmentScheduler(false)}
        patientName={userData.name || 'Paciente'}
        patientEmail={userData.email || ''}
      />
    );
  }

  if (showProfileEdit) {
    return (
      <UserProfileEdit
        userId={user?.id || userProfile?.id || ''}
        onCancel={() => setShowProfileEdit(false)}
        onSave={() => {
          setShowProfileEdit(false);
          // Recarregar dados do usuário após salvar
          window.location.reload();
        }}
      />
    );
  }

  const hasCompletedPreConsultation = !!preConsultationData;
  const hasCompletedPostConsultation = !!postConsultationData;
  const hasMealPlan = !!mealPlan;

  // Show subscription loading state
  if (subscriptionLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-primary/3 to-accent/12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando seu acesso...</p>
        </div>
      </div>
    );
  }

  // Show upgrade screen for non-subscribers
  const showUpgradeForModule = (moduleName: string) => {
    if (!subscribed && ['ebooks', 'videos', 'plate-analyzer'].includes(moduleName)) {
      return (
        <SubscriptionUpgrade
          title="Acesso Necessário"
          description={`Para acessar ${moduleName === 'ebooks' ? 'a Biblioteca de E-books' : moduleName === 'videos' ? 'os Vídeos Educativos' : 'o Analisador de Pratos'}, você precisa de uma assinatura ativa.`}
          onUpgrade={() => setActiveModule('payment')}
          onClose={() => setActiveModule('chat')}
        />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-primary/3 to-accent/12">
      {/* Header com controle de alternância para admins */}
      <header className="bg-card/95 backdrop-blur-sm shadow-lg border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={onBack}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-foreground">
                  Olá, {userProfile?.name || userData.name || user?.email?.split('@')[0] || 'Usuário'}! 👋
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">Seu espaço de bem-estar e nutrição</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Botão para admins retornarem ao modo administrativo */}
              {(isAdmin || userType === 'admin') && (
                <Button
                  onClick={() => setAdminMode(true)}
                  variant="outline"
                  size="sm"
                  className="bg-primary/10 border-primary/30 hover:bg-primary hover:text-white transition-all"
                >
                  👑 Modo Admin
                </Button>
              )}
              
              {timeRemaining > 0 && timerActive && (
                <div className="flex items-center gap-1 sm:gap-2 bg-accent/10 text-accent-foreground px-2 sm:px-3 py-1 rounded-full">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium text-xs sm:text-sm">
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              <button
                onClick={() => setShowProfileEdit(true)}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                title="Editar Perfil"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </header>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Left Sidebar - Progress Status */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <PatientProgressStatus
              hasCompletedPreConsultation={hasCompletedPreConsultation}
              timeRemaining={timeRemaining}
              hasCompletedPostConsultation={hasCompletedPostConsultation}
              hasMealPlan={hasMealPlan}
              nextAppointment={nextAppointment}
              onStartPreConsultation={() => setShowPreConsultation(true)}
              onStartPostConsultation={() => setShowPostConsultation(true)}
              onScheduleAppointment={handleScheduleAppointment}
              patientName={userData.name || 'Paciente'}
              subscribed={subscribed || isAdmin || userType === 'admin'}
              onUpgrade={() => setActiveModule('payment')}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Subscription Status Banner - só aparece se não for admin */}
            {!subscribed && !isAdmin && userType !== 'admin' && (
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-4 mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Acesso Limitado</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Você tem acesso básico. Para desbloquear todos os recursos, escolha um dos planos disponíveis.
                </p>
                <Button 
                  onClick={() => setActiveModule('payment')}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  size="sm"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Escolher Plano
                </Button>
              </div>
            )}

            {/* Module Navigation */}
            <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 mb-4 lg:mb-6">
              <div className="p-3 sm:p-4 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-accent/5">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Módulos Disponíveis</h2>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-3 p-2.5 sm:p-3">
                {[
                  { id: 'chat', label: 'Chat com Alice', icon: MessageSquare, color: 'green' },
                  { id: 'ebooks', label: 'E-books', icon: Book, color: 'blue' },
                  { id: 'videos', label: 'Vídeos', icon: Video, color: 'purple' },
                  { id: 'meal-plan', label: 'Plano Alimentar', icon: FileText, color: 'orange' },
                  { id: 'plate-analyzer', label: 'Analisar Prato', icon: Camera, color: 'pink' },
                  { id: 'payment', label: 'Escolher Plano', icon: CreditCard, color: 'indigo' },
                  { id: 'consultation', label: 'Agendar Consulta', icon: Calendar, color: 'emerald' },
                  { id: 'debug', label: 'Debug', icon: Database, color: 'orange' },
                  { id: 'vip-manager', label: 'VIP Manager', icon: Crown, color: 'yellow' }
                ].map((module) => {
                  const Icon = module.icon;
                  const isActive = activeModule === module.id;
                  
                  return (
                    <button
                      key={module.id}
                      onClick={() => setActiveModule(module.id)}
                      className={`p-1.5 sm:p-3 rounded-lg text-center transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 mx-auto mb-1 ${isActive ? 'text-primary-foreground' : 'text-secondary-foreground'}`} />
                      <span className="text-xs font-medium leading-tight">{module.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Module Content */}
            <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg border border-accent/20">{/* Chat com tema roxo */}
              {activeModule === 'chat' && (
                <div className="h-[480px] flex flex-col">
                  <div className="p-4 border-b border-accent/10 bg-gradient-to-r from-accent/5 to-accent/10 flex items-center justify-between">{/* Header roxo da Alice */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-b from-accent/20 to-accent/40 flex items-center justify-center shadow-lg">{/* Avatar Alice roxo */}
                        <img 
                          src="/lovable-uploads/f2ba11b1-515b-4861-a031-846a68a96bd7.png"
                          alt="Alice IA"
                          className="w-full h-full object-contain"
                        />
                      </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-semibold text-accent flex items-center gap-1 sm:gap-2">{/* Título roxo Alice */}
                            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                            <span className="truncate">Alice - IA Nutricional</span>
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-accent/70">por</span>
                            <a 
                              href="https://instagram.com/dra.dayanahanemann" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                              @dra.dayanahanemann
                            </a>
                          </div>
                          {timeRemaining === 0 && timerActive && (
                            <p className="text-xs sm:text-sm text-accent/70 truncate">{/* Texto roxo suave */}
                              Tempo finalizado. Complete a pós-consulta.
                            </p>
                          )}
                        </div>
                    </div>
                    
                      {/* Botões de Ação */}
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        {/* Indicador de Modo Guiado */}
                        {isGuidedMode && (
                          <div className="flex items-center gap-1 text-accent text-xs sm:text-sm px-2 py-1 bg-accent/10 rounded-md border border-accent/20">
                            <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Modo Guiado Ativo</span>
                            <span className="sm:hidden">Guiado</span>
                          </div>
                        )}
                        
                        {/* Botão de Encerrar Chat */}
                        {timerActive && timeRemaining > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowEndChatModal(true)}
                            className="text-accent border-accent/30 hover:bg-accent/10 text-xs sm:text-sm px-2 sm:px-3"
                          >
                            <span className="hidden sm:inline">Encerrar Chat</span>
                            <span className="sm:hidden">Encerrar</span>
                          </Button>
                        )}
                      </div>
                  </div>
                  
                  <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-b from-accent/20 to-accent/40 flex items-center justify-center shadow-lg">{/* Avatar grande Alice */}
                        <img 
                          src="/lovable-uploads/f2ba11b1-515b-4861-a031-846a68a96bd7.png"
                          alt="Alice IA"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                      <span className="text-lg font-medium mb-2">
                        {isGuidedMode ? "Atendimento Guiado com Alice!" : "Bem-vindo ao Chat com Alice!"}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {isGuidedMode 
                          ? "💬 Responda por texto ou use o microfone. Vou te guiar através de perguntas específicas para criar seu protocolo MEV personalizado."
                          : hasCompletedPreConsultation 
                            ? "🎯 Modo guiado será iniciado automaticamente. Você pode fazer perguntas livres ou aguardar as perguntas direcionadas!"
                            : "Complete a pré-consulta para começar nossa conversa personalizada."
                        }
                      </p>
                  </div>
                    ) : (
                      <>
                        {messages.map((message) => (
                          <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {/* Avatar da Alice */}
                            {message.sender === 'alice' && (
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-b from-accent/20 to-accent/40 flex items-center justify-center flex-shrink-0 shadow-md">{/* Avatar pequeno Alice */}
                                <img 
                                  src="/lovable-uploads/f2ba11b1-515b-4861-a031-846a68a96bd7.png"
                                  alt="Alice IA"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                            
                             <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                               message.sender === 'user'
                                 ? 'bg-primary text-primary-foreground shadow-lg'
                                 : 'bg-accent/90 text-accent-foreground border border-accent shadow-lg'
                             }`}>{/* Mensagens mais visíveis com fundo sólido */}
                               <p className="text-sm">{message.content}</p>
                               {message.options && (
                                 <div className="mt-2 space-y-1">
                                    {message.options.map((option, index) => (
                                       <button
                                         key={index}
                                         onClick={() => handleOptionClick(option)}
                                          className="block w-full text-left text-xs bg-accent-foreground/20 hover:bg-accent-foreground/30 rounded px-2 py-1 transition-colors text-accent-foreground font-medium"
                                        >
                                        {option}
                                      </button>
                                    ))}
                                 </div>
                               )}
                               
                               {/* Opções contextuais para mensagens da AI no modo guiado */}
                               {message.hasContextOptions && (
                                 <ContextualOptions
                                   messageText={message.content}
                                   onOptionSelect={(option) => {
                                     setInputMessage(option);
                                     setTimeout(() => handleSendMessage(), 100);
                                   }}
                                 />
                               )}
                             </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gradient-to-r from-primary/90 to-accent/90 text-primary-foreground rounded-2xl px-6 py-4 shadow-xl border border-primary/20">
                              <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce [animation-delay:0.1s]"></div>
                                  <div className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                </div>
                                <span className="text-sm font-medium">Alice está analisando...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      {/* Voice Controls */}
                      <VoiceControls
                        isRecording={isRecording}
                        isProcessing={isProcessing}
                        onStartRecording={startRecording}
                        onStopRecording={stopRecording}
                        onToggleVoice={handleToggleVoice}
                        voiceEnabled={voiceEnabled}
                      />
                      
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                          (!hasCompletedPreConsultation && !isGuidedMode)
                            ? "Complete a pré-consulta primeiro"
                            : (timeRemaining === 0 && timerActive)
                            ? "Tempo esgotado. Agende uma nova consulta."
                            : isGuidedMode
                            ? "Responda à pergunta da Alice..."
                            : "Digite sua pergunta ou use o microfone..."
                        }
                        disabled={(!hasCompletedPreConsultation && !isGuidedMode) || (timeRemaining === 0 && timerActive) || isLoading || isRecording}
                        className="flex-1 px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || (!hasCompletedPreConsultation && !isGuidedMode) || (timeRemaining === 0 && timerActive) || isLoading || isRecording}
                        className="px-4 py-2 bg-gradient-to-r from-accent to-accent/90 text-white rounded-lg hover:from-accent/90 hover:to-accent/80 transition-all disabled:bg-muted disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

               {/* Controle de acesso baseado em subscription OU admin */}
               {!(isAdmin || userType === 'admin') && (
                 <>
                   {activeModule === 'ebooks' && (
                     showUpgradeForModule('ebooks') || <EbooksLibrary hasAccess={subscribed} onUpgrade={() => setActiveModule('payment')} key={Date.now()} />
                   )}
                   {activeModule === 'videos' && (
                     showUpgradeForModule('videos') || <VideoLibrary hasAccess={subscribed} onUpgrade={() => setActiveModule('payment')} key={Date.now()} />
                   )}
                   {activeModule === 'plate-analyzer' && (
                     showUpgradeForModule('plate-analyzer') || <PlateAnalyzer userId={user?.id || userProfile?.id} />
                   )}
                 </>
               )}
               
               {/* Admins têm acesso total - sem restrições */}
               {(isAdmin || userType === 'admin') && (
                 <>
                   {activeModule === 'ebooks' && <EbooksLibrary hasAccess={true} onUpgrade={() => setActiveModule('payment')} key={Date.now()} />}
                   {activeModule === 'videos' && <VideoLibrary hasAccess={true} onUpgrade={() => setActiveModule('payment')} key={Date.now()} />}
                   {activeModule === 'plate-analyzer' && <PlateAnalyzer userId={user?.id || userProfile?.id} />}
                 </>
                )}

               {activeModule === 'payment' && <PaymentArea onPaymentSuccess={() => {}} hasAccess={subscribed || isAdmin || userType === 'admin'} userEmail={user?.email || userProfile?.email || ''} />}
               
                               {activeModule === 'debug' && <SubscriptionDebug />}
                
                {activeModule === 'vip-manager' && <AdminVIPManager />}
               
               {activeModule === 'consultation' && (
                 <AppointmentScheduler 
                   onScheduleSuccess={(date, time) => {
                     toast({
                       title: "Consulta Agendada!",
                       description: `${format(date, 'dd/MM/yyyy')} às ${time}`,
                     });
                     setActiveModule('dashboard');
                   }}
                   onCancel={() => setActiveModule('dashboard')}
                   patientName={userProfile?.name || "Paciente"}
                   patientEmail={userProfile?.email || ""}
                 />
               )}
              
          {activeModule === 'personalized-plan' && (
            <DayanaPlansViewer 
              planosData={mealPlan}
              patientName={userData.name}
              onClose={() => setActiveModule('chat')}
            />
          )}
            </div>

            {/* Seção do Plano Personalizado - Sempre visível abaixo do chat */}
            <div className="mt-6">
              <PersonalizedPlan 
                userId={user?.id || userProfile?.id || ''} 
                isPatientView={true}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Confirmação para Encerrar Chat */}
      {showEndChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Conversa com Alice Finalizada! 🎉</h3>
            <p className="text-gray-600 mb-6">
              Sua conversa foi salva automaticamente e todos os dados foram coletados. Deseja prosseguir para ver seus planos personalizados?
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowEndChatModal(false)}
              >
                Revisar Conversa
              </Button>
              <Button 
                onClick={handleEndChat}
                className="bg-primary hover:bg-primary/90"
              >
                Ver Meus Planos
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
