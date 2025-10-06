import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Send, User, Heart, CheckCircle, Circle, 
  Book, Video, Download, ArrowLeft, FileText,
  Clock, MessageSquare, Camera, CreditCard, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AliceAI } from '../lib/alice-ai';
import AlicePresence from './AlicePresence';
import EbooksLibrary from './EbooksLibrary';
import VideoLibrary from './VideoLibrary';
import PaymentArea from './PaymentArea';
import PreConsultationFlow, { type PreConsultationData } from './PreConsultationFlow';
import PostConsultationFlow, { type DietaryData } from './PostConsultationFlow';
import { EnhancedAliceAI } from '../lib/alice-enhanced-ai';
import { AliceAdvancedIntelligence } from '../lib/alice-advanced-intelligence';
import { AliceConversationFlow } from '../lib/alice-conversation-flow';
import { AliceEnhancedConversationFlow } from '../lib/alice-enhanced-conversation-flow';
import MealPlanGenerator from './MealPlanGenerator';
import MealPlanPDFGenerator from './MealPlanPDFGenerator';
import PlateAnalyzer from './PlateAnalyzer';
import ComprehensiveAdminDashboard from './ComprehensiveAdminDashboard';
import PatientProgressStatus from './PatientProgressStatus';
import AppointmentScheduler from './AppointmentScheduler';
import VoiceControls from './VoiceControls';
import AliceThoughtBubble from './AliceThoughtBubble';
import SupabaseTestPanel from './SupabaseTestPanel';
import PersonalizedPlan from './PersonalizedPlan';
import UserProfileEdit from './UserProfileEdit';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { getCurrentBrazilianTimeString } from '../utils/timezone';

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
  const { user, userProfile, loading: authLoading } = useSupabaseAuth();
  
  // Realtime data for the patient
  const { lastUpdate, isConnected } = useRealtimeData(user?.id || userProfile?.id);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const aliceAI = useRef(new AliceAI());
  const advancedAlice = useRef(new AliceAdvancedIntelligence());
  const conversationFlow = useRef(new AliceConversationFlow());
  const enhancedFlow = useRef(new AliceEnhancedConversationFlow());

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
    const userId = data.identification.email || 'anonymous';
    enhancedFlow.current.resetConversation(userId);
    
    console.log("🔄 Estado da Alice resetado para nova conversa");
    
    // Inicializar o Enhanced Conversation Flow com os dados da pré-consulta
    const userProfile = {
      id: userId,
      name: data.identification.name,
      age: data.identification.age,
      weight: 0, // Será coletado na anamnese
      height: 0, // Será coletado na anamnese
      activityLevel: 'moderate',
      sleepPattern: data.sleepQuality || '8h',
      stressLevel: data.stressLevel || 5,
      foodPreferences: [],
      allergies: [],
      healthGoals: [data.goals || 'melhorar saúde'],
      currentPhase: 'chat' as 'pre-consultation' | 'chat' | 'post-consultation' | 'ongoing'
    };

    // Iniciar a anamnese automaticamente com Alice Enhanced
    const enhancedResponse = enhancedFlow.current.generateProgressiveResponse(
      `Meu nome é ${data.identification.name}`,
      userProfile.id,
      userProfile.name
    );

    console.log("🚀 Iniciando anamnese automática:", enhancedResponse);
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      sender: 'alice',
      content: enhancedResponse.message || `Olá ${data.identification.name}! Que alegria ter você aqui. Agora vamos fazer uma anamnese completa para conhecê-lo(a) melhor e criar um protocolo personalizado. Vamos começar?`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    setUserData(prev => ({
      ...prev,
      name: data.identification.name,
      email: data.identification.email,
      whatsapp: data.identification.whatsapp,
      age: data.identification.age
    }));
    
    setAliceEmotion('caring');
    setAlicePresenceEmotion('caring');
  };

  const handlePostConsultationComplete = (data: DietaryData) => {
    setPostConsultationData(data);
    setShowPostConsultation(false);
    setActiveModule('meal-plan');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to Supabase
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.id) {
        await supabase.from('conversations').insert({
          user_id: currentUser.id,
          message_content: inputMessage,
          message_type: 'user',
          session_id: currentUser.id + '-' + new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Erro ao salvar mensagem do usuário:', error);
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

      // Usar o novo sistema Enhanced Flow como principal
      const enhancedResponse = enhancedFlow.current.generateProgressiveResponse(
        inputMessage,
        userProfile.id,
        userProfile.name
      );

      console.log("🔍 Enhanced Flow Response:", enhancedResponse);

      // Usar sistema de inteligência avançada como complemento
      const intelligentResponse = advancedAlice.current.generateIntelligentResponse(
        inputMessage,
        userProfile.id,
        userProfile
      );

      // Salvar conversa na memória da Alice (mantendo sistema existente)
      const conversationMemory = {
        userId: userProfile.id,
        timestamp: new Date(),
        message: inputMessage,
        response: enhancedResponse.message,
        mood: intelligentResponse.mood as 'positive' | 'neutral' | 'concerned' | 'excited' | 'tired',
        topics: currentTopics,
        suggestions_followed: false,
        satisfaction_score: 8
      };
      
      advancedAlice.current.saveConversation(conversationMemory);
      
      // Configurar emoção da Alice baseada na resposta inteligente
      const emotionMap = {
        'positive': 'encouraging',
        'excited': 'encouraging', 
        'concerned': 'empathetic',
        'tired': 'caring'
      } as const;
      
      setAliceEmotion(emotionMap[intelligentResponse.mood as keyof typeof emotionMap] || 'caring');
      setAlicePresenceEmotion(emotionMap[intelligentResponse.mood as keyof typeof emotionMap] || 'caring');
      setIsSpeaking(true);

      setTimeout(() => {
        // Mostrar dicas na thought bubble
        if (enhancedResponse.biohackingTip) {
          setCurrentBiohackingTip(enhancedResponse.biohackingTip);
        }
        if (enhancedResponse.frequencyRecommendation) {
          setCurrentFrequency(enhancedResponse.frequencyRecommendation);
        }
        if (enhancedResponse.personalizationNote) {
          setCurrentPersonalization(enhancedResponse.personalizationNote);
        }
        
        // Mostrar thought bubble se houver dicas
        if (enhancedResponse.biohackingTip || enhancedResponse.frequencyRecommendation || enhancedResponse.personalizationNote) {
          setShowThoughtBubble(true);
          // Auto-hide após 8 segundos
          setTimeout(() => setShowThoughtBubble(false), 8000);
        }

        // Usar apenas a mensagem principal sem as dicas extras
        const aliceMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'alice',
          content: enhancedResponse.message,
          timestamp: new Date(),
          options: intelligentResponse.suggestions?.slice(0, 3) // Limitar a 3 opções
        };

        setMessages(prev => [...prev, aliceMessage]);

        // Save Alice message to Supabase
        setTimeout(async () => {
          try {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (currentUser.id) {
              await supabase.from('conversations').insert({
                user_id: currentUser.id,
                message_content: enhancedResponse.message,
                message_type: 'alice',
                session_id: currentUser.id + '-' + new Date().toISOString().split('T')[0],
                mood_detected: intelligentResponse.mood,
                biohacking_suggested: enhancedResponse.biohackingTip,
                frequency_suggested: enhancedResponse.frequencyRecommendation,
                conversation_stage: enhancedResponse.currentPhase,
                data_collected: {
                  userProfile: userProfile,
                  topics: currentTopics,
                  suggestions: intelligentResponse.suggestions
                }
              });
            }
          } catch (error) {
            console.error('Erro ao salvar mensagem da Alice:', error);
          }
        }, 0);
        setCurrentTopics([enhancedResponse.currentPhase || 'chat']);
        setIsSpeaking(false);
        setIsLoading(false);

        // Ler resposta em voz alta se habilitado
        if (voiceEnabled) {
          // Usar apenas o texto principal, sem emojis e formatação
          const cleanText = enhancedResponse.message
            .replace(/💡.*?\n/g, '')
            .replace(/🎵.*?\n/g, '')
            .replace(/✨.*?\n/g, '')
            .replace(/\*\*/g, '')
            .trim();
          speakText(cleanText);
        }

        // Verificar se a conversa foi completada e gerar resumo para a doutora
        if (enhancedResponse.isCompleted) {
          const patientProfile = enhancedFlow.current.getPatientProfile(userProfile.id);
          if (patientProfile) {
            const doctorSummary = enhancedFlow.current.generateDoctorSummary(patientProfile);
            console.log("📋 Resumo Completo para a Dra. Dayana:", doctorSummary);
            
            // Adicionar mensagem especial de conclusão
            setTimeout(() => {
              const summaryMessage: Message = {
                id: (Date.now() + 2).toString(),
                sender: 'alice',
                content: "🎉 Perfeito! Coletei todas as informações necessárias. A Dra. Dayana já tem seu perfil completo para criar um protocolo totalmente personalizado. Em breve você receberá suas recomendações específicas!",
                timestamp: new Date()
              };
              setMessages(prev => [...prev, summaryMessage]);
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
    enhancedFlow.current.resetConversation(userData.email || 'anonymous');
    setMessages([]);
    
    // Send initial guided message
    setTimeout(() => {
      const guidedMessage: Message = {
        id: Date.now().toString(),
        sender: 'alice',
        content: "🌟 Ótimo! Vamos começar seu atendimento guiado personalizado. Vou te fazer algumas perguntas específicas para criar o melhor protocolo para você. Como você gostaria que eu te chamasse?",
        timestamp: new Date(),
        options: [
          "Pode me chamar pelo meu nome",
          "Use um apelido carinhoso",
          "Mantenha formal, por favor"
        ]
      };
      setMessages([guidedMessage]);
    }, 500);
  };

  const handleAppointmentScheduled = (appointment: { date: string; time: string }) => {
    setNextAppointment(appointment);
    setShowAppointmentScheduler(false);
  };

  if (isAdmin || userType === 'admin') {
    return <ComprehensiveAdminDashboard />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-primary/3 to-accent/12">{/* Background com gradientes mais sutis */}
      {/* Header */}
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
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
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
                  { id: 'payment', label: 'Assinar Premium', icon: CreditCard, color: 'indigo' },
                  { id: 'consultation', label: 'Agendar Consulta', icon: Calendar, color: 'emerald' }
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
                <div className="h-96 flex flex-col">
                  <div className="p-4 border-b border-accent/10 bg-gradient-to-r from-accent/5 to-accent/10 flex items-center justify-between">{/* Header roxo da Alice */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-b from-accent/20 to-accent/40 flex items-center justify-center shadow-lg">{/* Avatar Alice roxo */}
                        <img 
                          src="/lovable-uploads/47c629a3-0c29-4cd3-b1f6-3a97760e0abe.png"
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
                        {/* Botão de Atendimento Guiado */}
                        {hasCompletedPreConsultation && timeRemaining > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStartGuidedChat()}
                            className="text-accent border-accent/30 hover:bg-accent/10 flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
                          >
                            <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Atendimento Guiado</span>
                            <span className="sm:hidden">Guiado</span>
                          </Button>
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
                          src="/lovable-uploads/47c629a3-0c29-4cd3-b1f6-3a97760e0abe.png"
                          alt="Alice IA"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                      <span className="text-lg font-medium mb-2">
                        {isGuidedMode ? "Atendimento Guiado com Alice!" : "Bem-vindo ao Chat com Alice!"}
                      </span>
                      <p className="text-sm">
                        {isGuidedMode 
                          ? "Vou te guiar através de perguntas específicas para criar seu protocolo personalizado."
                          : hasCompletedPreConsultation 
                            ? "Faça suas perguntas sobre nutrição. Você tem 10 minutos comigo!"
                            : "Complete a pré-consulta para começar nossa conversa."
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
                                  src="/lovable-uploads/47c629a3-0c29-4cd3-b1f6-3a97760e0abe.png"
                                  alt="Alice IA"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                            
                            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                              message.sender === 'user'
                                ? 'bg-primary text-primary-foreground shadow-lg'
                                : 'bg-accent/90 text-white border border-accent shadow-lg'
                            }`}>{/* Mensagens mais visíveis com fundo sólido */}
                              <p className="text-sm">{message.content}</p>
                              {message.options && (
                                <div className="mt-2 space-y-1">
                                   {message.options.map((option, index) => (
                                     <button
                                       key={index}
                                       onClick={() => handleOptionClick(option)}
                                        className="block w-full text-left text-xs bg-white/20 hover:bg-white/30 rounded px-2 py-1 transition-colors text-white font-medium"
                                      >
                                       {option}
                                     </button>
                                   ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gradient-to-r from-primary/90 to-accent/90 text-white rounded-2xl px-6 py-4 shadow-xl border border-white/20">
                              <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.1s]"></div>
                                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
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
                          !hasCompletedPreConsultation 
                            ? "Complete a pré-consulta primeiro"
                            : (timeRemaining === 0 && timerActive)
                            ? "Tempo esgotado. Agende uma nova consulta."
                            : "Digite sua pergunta ou use o microfone..."
                        }
                        disabled={!hasCompletedPreConsultation || (timeRemaining === 0 && timerActive) || isLoading || isRecording}
                        className="flex-1 px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || !hasCompletedPreConsultation || (timeRemaining === 0 && timerActive) || isLoading || isRecording}
                        className="px-4 py-2 bg-gradient-to-r from-accent to-accent/90 text-white rounded-lg hover:from-accent/90 hover:to-accent/80 transition-all disabled:bg-muted disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeModule === 'ebooks' && <EbooksLibrary hasAccess={true} onUpgrade={() => {}} key={Date.now()} />}
              {activeModule === 'videos' && <VideoLibrary hasAccess={true} onUpgrade={() => {}} key={Date.now()} />}
              {activeModule === 'payment' && <PaymentArea onPaymentSuccess={() => {}} hasAccess={true} />}
              {activeModule === 'consultation' && (
                <div className="p-6">
                  <div className="text-center mb-6">
                    <Calendar className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-foreground mb-2">Agendar Consulta Presencial</h3>
                    <p className="text-muted-foreground">
                      Consulta com Dra. Dayana Hanemann - R$ {localStorage.getItem('consultationPrice') ? parseFloat(localStorage.getItem('consultationPrice')!).toFixed(2).replace('.', ',') : '800,00'}
                    </p>
                  </div>

                  <div className="max-w-2xl mx-auto space-y-6">
                    {/* Fluxo explicativo */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
                      <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-3">📋 Próximos Passos:</h4>
                      <ol className="text-sm text-emerald-700 dark:text-emerald-300 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                          <span>Use a plataforma Alice Health para coletar seus dados de saúde</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                          <span>Complete questionários e prepare informações médicas</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                          <span>Agende sua consulta presencial com dados já organizados</span>
                        </li>
                      </ol>
                    </div>

                    {/* Informações da consulta */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-card border border-border rounded-lg">
                        <h5 className="font-semibold mb-2">💰 Investimento</h5>
                        <p className="text-2xl font-bold text-emerald-600">
                          R$ {localStorage.getItem('consultationPrice') ? parseFloat(localStorage.getItem('consultationPrice')!).toFixed(2).replace('.', ',') : '800,00'}
                        </p>
                        <p className="text-sm text-muted-foreground">Consulta presencial completa</p>
                      </div>
                      
                      <div className="p-4 bg-card border border-border rounded-lg">
                        <h5 className="font-semibold mb-2">⏱️ Duração</h5>
                        <p className="text-2xl font-bold text-primary">90 min</p>
                        <p className="text-sm text-muted-foreground">Avaliação completa e personalizada</p>
                      </div>
                    </div>

                    {/* Benefícios */}
                    <div className="p-4 bg-card border border-border rounded-lg">
                      <h5 className="font-semibold mb-3">✨ O que está incluído:</h5>
                      <ul className="text-sm space-y-2">
                        {[
                          "Anamnese completa baseada nos dados da plataforma",
                          "Avaliação de exames e biomarkers",
                          "Protocolo MEV personalizado",
                          "Suplementação ortomolecular específica",
                          "Acompanhamento pós-consulta",
                          "Acesso contínuo à plataforma Alice Health"
                        ].map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Botão de contato */}
                    <div className="text-center">
                      <button
                        onClick={() => {
                          const message = `Olá! Sou assinante da plataforma Alice Health e gostaria de agendar uma consulta presencial com a Dra. Dayana Hanemann (R$ ${localStorage.getItem('consultationPrice') ? parseFloat(localStorage.getItem('consultationPrice')!).toFixed(2).replace('.', ',') : '800,00'}). Já estou coletando meus dados na plataforma para facilitar a consulta.`;
                          const whatsappUrl = `https://wa.me/5521996936317?text=${encodeURIComponent(message)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                      >
                        <span className="text-2xl">📱</span>
                        Agendar via WhatsApp
                      </button>
                      
                      <p className="text-xs text-muted-foreground mt-3">
                        Você será redirecionado para o WhatsApp da Dra. Dayana
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeModule === 'plate-analyzer' && <PlateAnalyzer userId={user?.id || userProfile?.id} />}
              
              {activeModule === 'meal-plan' && (
                <div className="p-6">
                  {hasCompletedPostConsultation ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Plano Alimentar Personalizado</h3>
                        <p className="text-gray-600 mb-6">Seu plano foi gerado com base nas informações coletadas</p>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-green-700">Plano alimentar disponível!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Plano Alimentar</h3>
                      <p className="text-gray-600 mb-6">
                        Complete a pós-consulta para gerar seu plano alimentar personalizado
                      </p>
                      <button
                        onClick={() => setShowPostConsultation(true)}
                        disabled={!hasCompletedPreConsultation || (timeRemaining > 0 && timerActive)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {!hasCompletedPreConsultation 
                          ? "Complete a pré-consulta primeiro"
                          : timeRemaining > 0 && timerActive
                          ? "Aguarde o término do chat"
                          : "Iniciar Pós-consulta"
                        }
                      </button>
                    </div>
                  )}
                </div>
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
            <h3 className="text-lg font-semibold mb-4">Encerrar Chat com Alice?</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja encerrar o chat? Você pode prosseguir para a pós-consulta.
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowEndChatModal(false)}
              >
                Continuar Chat
              </Button>
              <Button 
                onClick={handleEndChat}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Encerrar e Prosseguir
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
