import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Plus, Edit, Trash2, Eye, Save, X, Youtube, 
  FileText, Video, Users, Brain, BarChart3, Settings,
  CheckCircle, AlertCircle, Clock, Star, Download,
  Search, Filter, Calendar, Target, TrendingUp, ArrowLeft,
  MessageSquare, Heart, Activity, Send, UserCheck, RefreshCw, Wifi, WifiOff
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import PersonalizedPlan from './PersonalizedPlan';
import AdminCalendarView from './AdminCalendarView';
import InfoTooltip from './InfoTooltip';

interface AdminEbook {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'orthomolecular' | 'physiotherapy' | 'mev';
  fileUrl: string;
  coverImage: string;
  readTime: string;
  isActive: boolean;
  uploadDate: string;
  downloads: number;
}

interface AdminVideo {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'orthomolecular' | 'physiotherapy' | 'mev';
  type: 'youtube' | 'upload';
  url: string;
  duration: string;
  isActive: boolean;
  uploadDate: string;
  views: number;
}

interface PatientReport {
  id: string;
  patientName: string;
  patientEmail: string;
  consultationDate: string;
  reportDate: string;
  status: 'pending' | 'reviewed' | 'completed';
  priority: 'low' | 'medium' | 'high';
  medicalSummary: {
    mainComplaint: string;
    symptoms: string;
    healthHistory: string;
    lifestyle: {
      sleep: string | number;
      stress: string | number;
      activity: string;
      routine: string;
    };
    aiAnalysis: string;
    recommendations: string;
  };
  patientData: {
    name: string;
    age: string | number;
    weight: string | number;
    height: string | number;
    email: string;
    whatsapp: string;
  };
  conversationMetrics: {
    duration: string;
    totalMessages: number;
  };
  hasAlerts: boolean;
  doctorNotes: string;
}

interface AIPrompt {
  id: string;
  category: 'nutrition' | 'orthomolecular' | 'physiotherapy' | 'mev' | 'general';
  title: string;
  prompt: string;
  isActive: boolean;
  usage: number;
  lastUsed: string;
}

interface PatientData {
  id: string;
  name: string;
  email: string;
  age: number;
  weight?: number;
  height?: number;
  phone?: string;
  lastConsultation: string;
  status: 'active' | 'pending' | 'inactive';
  planData?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snacks?: string;
    biohacking?: string[];
    microgreens?: string[];
    frequencies?: string[];
  };
  conversationSummary?: string;
  isafScore?: number;
  alerts?: string[];
  goals?: string[];
}

export default function ComprehensiveAdminDashboard({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'ebook' | 'video' | 'prompt' | 'appointment' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [viewingPatientPlan, setViewingPatientPlan] = useState<string | null>(null);
  
  // Estados do modal de adicionar paciente
  const [patientData, setPatientData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: '',
    occupation: ''
  });
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  
  // Função para fechar modal e resetar dados
  const handleCloseAddPatientModal = () => {
    setShowAddPatientModal(false);
    setPatientData({
      name: '',
      email: '',
      password: '',
      phone: '',
      age: '',
      gender: '',
      occupation: ''
    });
  };
  const [consultationPrice, setConsultationPrice] = useState(() => {
    const stored = localStorage.getItem('consultationPrice');
    return stored ? parseFloat(stored) : 800;
  });
  
  // Realtime data hook and states (OTIMIZADO - sem auto reconexão)
  const { lastUpdate, isConnected, syncData, connectionStatus } = useRealtimeData();
  const { toast } = useToast();

  // Real data from Supabase
  const [appointments, setAppointments] = useState<any[]>([]);
  const [realPatients, setRealPatients] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Estado para usuário selecionado real
  const [selectedRealUser, setSelectedRealUser] = useState<any>(null);
  const [userEducationalPlans, setUserEducationalPlans] = useState<any[]>([]);
  const [userConversations, setUserConversations] = useState<any[]>([]);
  const [startInEditMode, setStartInEditMode] = useState(false);
  const [realSubscribers, setRealSubscribers] = useState<any[]>([]); // Novo estado para assinantes reais

  // Load real data from Supabase
  useEffect(() => {
    loadRealData();
  }, []);

  // Função para carregar dados educacionais de um usuário
  const loadUserEducationalData = async (userId: string) => {
    console.log('🔍 [ADMIN] loadUserEducationalData - userId:', userId);
    try {
      // Carregar planos educacionais
      const { data: plans, error: plansError } = await supabase
        .from('educational_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      console.log('📋 [ADMIN] Educational plans result:', { plans, plansError });

      // Carregar conversas com Alice
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('💬 [ADMIN] Conversations result:', { conversations, conversationsError, count: conversations?.length });

      setUserEducationalPlans(plans || []);
      setUserConversations(conversations || []);

      console.log('✅ [ADMIN] States updated - plans:', plans?.length, 'conversations:', conversations?.length);
    } catch (error) {
      console.error('Error loading user educational data:', error);
    }
  };

  const loadRealData = async () => {
    setIsLoadingData(true);
    try {
      // Load appointments
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      // Load profiles (patients)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Load real subscribers data 
      const { data: subscribersData } = await supabase
        .from('subscribers')
        .select('*')
        .eq('subscribed', true)
        .order('created_at', { ascending: false });

      setAppointments(appointmentsData || []);
      setRealPatients(profilesData || []);
      setRealSubscribers(subscribersData || []);
      
      toast({
        title: "Dados carregados",
        description: `${appointmentsData?.length || 0} agendamentos, ${profilesData?.length || 0} pacientes e ${subscribersData?.length || 0} assinantes`,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Usando dados de exemplo",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  // Buscar agendamentos do Supabase
  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true });
      
      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadAppointments();
  }, []);

  // E-books data from Supabase
  const [ebooks, setEbooks] = useState<AdminEbook[]>([]);

  // Vídeos data from Supabase
  const [videos, setVideos] = useState<AdminVideo[]>([]);

  const [reports, setReports] = useState<PatientReport[]>(() => {
    const storedReports = localStorage.getItem('medicalReports');
    return storedReports ? JSON.parse(storedReports) : [];
  });

  // AI Prompts data from Supabase
  const [aiPrompts, setAiPrompts] = useState<AIPrompt[]>([]);

  // Patients data from Supabase - apenas dados reais
  const [patients, setPatients] = useState<PatientData[]>([]);

  // Update reports from localStorage on mount
  React.useEffect(() => {
    const updateReports = () => {
      const storedReports = localStorage.getItem('medicalReports');
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      }
    };

    // Inicializar dados de exemplo para e-books e vídeos se não existirem
    const initializeExampleData = () => {
      if (!localStorage.getItem('admin_ebooks')) {
        const exampleEbooks: AdminEbook[] = [
          {
            id: '1',
            title: 'Guia Completo de Nutrição Funcional',
            description: 'Descubra como os alimentos podem ser seus melhores medicamentos',
            category: 'nutrition' as const,
            fileUrl: '/ebooks/nutricao-funcional.pdf',
            coverImage: '/covers/nutricao.jpg',
            readTime: '45 min',
            isActive: true,
            uploadDate: '2024-01-15',
            downloads: 245
          },
          {
            id: '2',
            title: 'Ortomolecular: Vitaminas e Minerais',
            description: 'Entenda como corrigir deficiências nutricionais',
            category: 'orthomolecular' as const,
            fileUrl: '/ebooks/ortomolecular.pdf',
            coverImage: '/covers/ortomolecular.jpg',
            readTime: '35 min',
            isActive: true,
            uploadDate: '2024-01-10',
            downloads: 189
          }
        ];
        localStorage.setItem('admin_ebooks', JSON.stringify(exampleEbooks));
        setEbooks(exampleEbooks);
      }

      if (!localStorage.getItem('admin_videos')) {
        const exampleVideos: AdminVideo[] = [
          {
            id: '1',
            title: 'Introdução à Medicina do Estilo de Vida',
            description: 'Entenda os fundamentos da MEV',
            category: 'mev' as const,
            type: 'youtube' as const,
            url: 'https://youtube.com/watch?v=demo1',
            duration: '15:30',
            isActive: true,
            uploadDate: '2024-01-12',
            views: 1247
          },
          {
            id: '2',
            title: 'Protocolo de Suplementação',
            description: 'Aprenda a criar protocolos personalizados',
            category: 'orthomolecular' as const,
            type: 'youtube' as const,
            url: 'https://youtube.com/watch?v=demo2',
            duration: '22:45',
            isActive: true,
            uploadDate: '2024-01-08',
            views: 892
          }
        ];
        localStorage.setItem('admin_videos', JSON.stringify(exampleVideos));
        setVideos(exampleVideos);
      }
    };

    updateReports();
    initializeExampleData();
    const interval = setInterval(updateReports, 2000); // Check every 2 seconds
    return () => clearInterval(interval);
  }, []);

  // Função para buscar conversas de um paciente específico
  const fetchPatientConversations = async (userId: string) => {
    if (!userId) return;
    
    setIsLoadingData(true);
    try {
      console.log('📊 [ADMIN] Buscando conversas para usuário:', userId);
      
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ [ADMIN] Erro ao buscar conversas:', error);
        setUserConversations([]);
      } else {
        console.log('✅ [ADMIN] Conversas encontradas:', conversationsData?.length || 0);
        setUserConversations(conversationsData || []);
      }
    } catch (error) {
      console.error('❌ [ADMIN] Erro geral ao buscar conversas:', error);
      setUserConversations([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Buscar conversas quando selecionar paciente
  useEffect(() => {
    if (selectedRealUser?.user_id) {
      console.log('🎯 [ADMIN] useEffect - selectedRealUser changed:', selectedRealUser.user_id);
      loadUserEducationalData(selectedRealUser.user_id);
      fetchPatientConversations(selectedRealUser.user_id);
    } else {
      setUserConversations([]);
      setUserEducationalPlans([]);
    }
  }, [selectedRealUser]);

  const stats = {
    totalPatients: patients.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    activeEbooks: ebooks.filter(e => e.isActive).length,
    activeVideos: videos.filter(v => v.isActive).length,
    totalDownloads: ebooks.length > 0 ? ebooks.reduce((sum, e) => sum + (e.downloads || 0), 0) : 0,
    totalViews: videos.length > 0 ? videos.reduce((sum, v) => sum + (v.views || 0), 0) : 0,
    averageSatisfaction: reports.length > 0 ? '8.5' : '0',
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter(a => a.status === 'pending').length
  };

  const handleOpenModal = (type: 'ebook' | 'video' | 'prompt', item?: any) => {
    setModalType(type);
    setSelectedItem(item || null);
    setShowModal(true);
  };

  const handleSaveItem = (formData: any) => {
    if (modalType === 'ebook') {
      if (selectedItem) {
        setEbooks(prev => prev.map(e => e.id === selectedItem.id ? { ...e, ...formData } : e));
        toast({ title: "E-book atualizado com sucesso!" });
      } else {
        const newEbook: AdminEbook = {
          id: Date.now().toString(),
          ...formData,
          uploadDate: new Date().toISOString().split('T')[0],
          downloads: 0,
          isActive: true
        };
        const updatedEbooks = [...ebooks, newEbook];
        setEbooks(updatedEbooks);
        
        // Sincronizar com localStorage para o dashboard do paciente
        localStorage.setItem('admin_ebooks', JSON.stringify(updatedEbooks));
        window.dispatchEvent(new CustomEvent('ebooksUpdated', { detail: updatedEbooks }));
        
        toast({ title: "E-book adicionado e sincronizado!" });
      }
    } else if (modalType === 'video') {
      if (selectedItem) {
        setVideos(prev => prev.map(v => v.id === selectedItem.id ? { ...v, ...formData } : v));
        toast({ title: "Vídeo atualizado com sucesso!" });
      } else {
        const newVideo: AdminVideo = {
          id: Date.now().toString(),
          ...formData,
          uploadDate: new Date().toISOString().split('T')[0],
          views: 0,
          isActive: true
        };
        const updatedVideos = [...videos, newVideo];
        setVideos(updatedVideos);
        
        // Sincronizar com localStorage para o dashboard do paciente
        localStorage.setItem('admin_videos', JSON.stringify(updatedVideos));
        window.dispatchEvent(new CustomEvent('videosUpdated', { detail: updatedVideos }));
        
        toast({ title: "Vídeo adicionado e sincronizado!" });
      }
    } else if (modalType === 'prompt') {
      if (selectedItem) {
        setAiPrompts(prev => prev.map(p => p.id === selectedItem.id ? { ...p, ...formData } : p));
        toast({ title: "Prompt atualizado com sucesso!" });
      } else {
        const newPrompt: AIPrompt = {
          id: Date.now().toString(),
          ...formData,
          usage: 0,
          lastUsed: new Date().toISOString().split('T')[0],
          isActive: true
        };
        setAiPrompts(prev => [...prev, newPrompt]);
        toast({ title: "Prompt adicionado com sucesso!" });
      }
    }
    setShowModal(false);
  };

  const handleUpdateReportNotes = (reportId: string, notes: string) => {
    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, doctorNotes: notes, status: 'reviewed' } : r
    ));
    toast({ title: "Notas salvas com sucesso!" });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Pacientes</p>
                <p className="text-2xl font-bold text-primary">{stats.totalPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-secondary/10 rounded-xl">
                <Clock className="h-8 w-8 text-secondary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Relatórios Pendentes</p>
                <p className="text-2xl font-bold text-secondary">{stats.pendingReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-accent/10 rounded-xl">
                <FileText className="h-8 w-8 text-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">E-books Ativos</p>
                <p className="text-2xl font-bold text-accent">{stats.activeEbooks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-warning/10 rounded-xl">
                <Calendar className="h-8 w-8 text-warning" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Agendamentos</p>
                <p className="text-2xl font-bold text-warning">{stats.totalAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-card to-muted/20 border-primary/10">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="text-primary">Agendamentos Recentes</CardTitle>
            <CardDescription>Últimas consultas agendadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoadingData ? (
                <p className="text-center py-4">Carregando agendamentos...</p>
              ) : appointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Nenhum agendamento encontrado</p>
              ) : (
                appointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">{appointment.patient_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às {appointment.appointment_time.slice(0, 5)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={appointment.payment_status === 'pending' ? 'destructive' : 'default'}>
                      {appointment.payment_status === 'pending' ? 'Pagamento Pendente' : 'Pago'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 border-secondary/10">
          <CardHeader className="bg-gradient-to-r from-secondary/5 to-success/5">
            <CardTitle className="text-secondary">Pacientes Reais</CardTitle>
            <CardDescription>Usuários cadastrados na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoadingData ? (
                <p className="text-center py-4">Carregando pacientes...</p>
              ) : realPatients.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Nenhum paciente encontrado</p>
              ) : (
                realPatients.slice(0, 5).map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-secondary" />
                      <div>
                        <p className="font-medium">{patient.full_name || patient.name || patient.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {patient.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPatientsManagement = () => {
    const filteredPatients = realPatients.filter(patient =>
      (patient.name || patient.full_name || '').toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      (patient.email || '').toLowerCase().includes(patientSearchTerm.toLowerCase())
    );

    // Se estiver visualizando plano de um paciente (PRIORIDADE MÁXIMA)
    if (viewingPatientPlan) {
      console.log('🔍 RENDERIZANDO PLANO - viewingPatientPlan:', viewingPatientPlan, 'startInEditMode:', startInEditMode);
      return (
        <div className="min-h-screen w-full space-y-6 relative z-10">
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('🔙 CLICOU VOLTAR - resetando viewingPatientPlan');
                setViewingPatientPlan(null);
                setStartInEditMode(false);
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Pacientes
            </Button>
          </div>
          <div key={viewingPatientPlan} className="w-full">
            <PersonalizedPlan 
              userId={viewingPatientPlan} 
              isPatientView={false}
              startInEditMode={startInEditMode}
              onEditPlan={(planData) => {
                console.log('Plano editado:', planData);
                toast({
                  title: "Editando plano do paciente",
                  description: "Interface de edição administrativa ativa."
                });
              }}
            />
          </div>
        </div>
      );
    }

    // Se estiver visualizando usuário real selecionado
    if (selectedRealUser) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedRealUser(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Lista de Pacientes
            </Button>
            <h3 className="text-xl font-bold">{selectedRealUser.name || selectedRealUser.full_name}</h3>
            <Badge variant="secondary">
              {selectedRealUser.user_id === 'd11d49f5-eb96-4c6e-98e9-e22ae4426554' || selectedRealUser.user_id === '5e60daff-ebe8-4f71-8aaf-568f5112c08e' ? '👑 Admin' : '👤 Paciente'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dados do usuário */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Dados do Usuário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p><strong>Email:</strong> {selectedRealUser.email}</p>
                  <p><strong>Nome Completo:</strong> {selectedRealUser.full_name || 'Não informado'}</p>
                  <p><strong>Telefone:</strong> {selectedRealUser.phone || 'Não informado'}</p>
                  <p><strong>Gênero:</strong> {selectedRealUser.gender || 'Não informado'}</p>
                  {selectedRealUser.height && <p><strong>Altura:</strong> {selectedRealUser.height}cm</p>}
                  {selectedRealUser.weight && <p><strong>Peso:</strong> {selectedRealUser.weight}kg</p>}
                  <p><strong>Ocupação:</strong> {selectedRealUser.occupation || 'Não informado'}</p>
                  <p><strong>Cadastrado em:</strong> {new Date(selectedRealUser.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                
                <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                  <p className="font-medium">ID do Usuário</p>
                  <p className="text-sm font-mono text-muted-foreground">{selectedRealUser.user_id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Planos educacionais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Planos Educacionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userEducationalPlans.length > 0 ? (
                  <div className="space-y-4">
                    {userEducationalPlans.map((plan, index) => (
                      <div key={plan.id} className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-accent/5">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-primary">{plan.plan_name}</h4>
                          <Badge variant={plan.status === 'ativo' ? 'default' : 'secondary'}>
                            {plan.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Criado em: {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        
                        {/* Detalhes do plano */}
                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                          {plan.meal_plans && (
                            <div className="flex items-center gap-1">
                              <span>🍽️</span>
                              <span>Planos alimentares</span>
                            </div>
                          )}
                          {plan.biohacking_practices && (
                            <div className="flex items-center gap-1">
                              <span>⚡</span>
                              <span>Biohacking</span>
                            </div>
                          )}
                          {plan.microverdes_schedule && (
                            <div className="flex items-center gap-1">
                              <span>🌱</span>
                              <span>Microverdes</span>
                            </div>
                          )}
                          {plan.frequency_therapy && (
                            <div className="flex items-center gap-1">
                              <span>🎵</span>
                              <span>Frequências</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => {
                              console.log('🎯 CLICOU VER PLANO - selectedRealUser:', selectedRealUser?.user_id);
                              setViewingPatientPlan(selectedRealUser.user_id);
                              setStartInEditMode(false);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Plano
                          </Button>
                          <InfoTooltip 
                            content="Visualizar o plano MEV completo: refeições, biohacking, microverdes e frequências terapêuticas."
                            title="Visualização de Plano MEV"
                          />
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Gerar PDF
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Nenhum plano educacional encontrado para este paciente.
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Os planos são criados automaticamente pela IA após a conversa com Alice.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Conversa com Alice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Resumo da Conversa com Alice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-xs text-muted-foreground">
                Debug: userConversations.length = {userConversations.length} | selectedRealUser: {selectedRealUser?.user_id}
              </div>
              {userConversations.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="outline" className="bg-primary/5">
                      {userConversations.length} mensagens
                    </Badge>
                    <Badge variant="outline" className="bg-secondary/5">
                      Última conversa: {new Date(userConversations[0]?.created_at).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                  
                  {/* Resumo das últimas conversas */}
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {userConversations.slice(0, 5).map((conversation, index) => (
                      <div key={conversation.id} className="p-3 bg-muted/30 rounded-lg border-l-4 border-accent">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">
                            {conversation.message_type === 'user' ? '👤 Paciente' : '🤖 Alice'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(conversation.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {conversation.message_content?.length > 150 
                            ? `${conversation.message_content.substring(0, 150)}...` 
                            : conversation.message_content
                          }
                        </p>
                        
                        {/* Dados coletados pela IA */}
                        {conversation.data_collected && (
                          <div className="mt-2 p-2 bg-primary/5 rounded text-xs">
                            <strong>Dados coletados:</strong> {JSON.stringify(conversation.data_collected)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fetchPatientConversations(selectedRealUser.user_id)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Conversa Completa
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fetchPatientConversations(selectedRealUser.user_id)}
                    >
                      🔄 Atualizar Conversas
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Nenhuma conversa com Alice registrada.</p>
                  <p className="text-xs text-muted-foreground">
                    As conversas aparecerão aqui após o paciente interagir com a IA.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Informações Complementares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium mb-2">Contato de Emergência</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRealUser.emergency_contact || 'Não informado'}
                  </p>
                  {selectedRealUser.emergency_phone && (
                    <p className="text-sm text-muted-foreground">
                      📱 {selectedRealUser.emergency_phone}
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-medium mb-2">Consentimentos</p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      Uso de dados: {selectedRealUser.consent_data_usage ? '✅ Sim' : '❌ Não'}
                    </p>
                    <p className="text-sm">
                      Tratamento: {selectedRealUser.consent_treatment ? '✅ Sim' : '❌ Não'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header da gestão de pacientes */}
        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 shadow-lg backdrop-blur-sm">
          <div>
            <h2 className="text-2xl font-bold text-primary">👥 Gestão de Pacientes</h2>
            <p className="text-muted-foreground">Visualize dados, planos e interações dos pacientes</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar paciente..."
                value={patientSearchTerm}
                onChange={(e) => setPatientSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button
              onClick={() => setShowAddPatientModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
            >
              <Plus className="h-4 w-4" />
              Adicionar Paciente
            </Button>
          </div>
        </div>

        {selectedPatient ? (
          // Visualização detalhada do paciente
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedPatient(null)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar à lista
              </Button>
              <h3 className="text-xl font-bold">{selectedPatient.name}</h3>
              <Badge variant={selectedPatient.status === 'active' ? 'default' : 'secondary'}>
                {selectedPatient.status === 'active' ? 'Ativo' : selectedPatient.status === 'pending' ? 'Pendente' : 'Inativo'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Dados do paciente */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Dados do Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p><strong>Email:</strong> {selectedPatient.email}</p>
                    <p><strong>Idade:</strong> {selectedPatient.age} anos</p>
                    {selectedPatient.weight && <p><strong>Peso:</strong> {selectedPatient.weight}kg</p>}
                    {selectedPatient.height && <p><strong>Altura:</strong> {selectedPatient.height}cm</p>}
                    {selectedPatient.phone && <p><strong>Telefone:</strong> {selectedPatient.phone}</p>}
                    <p><strong>Última consulta:</strong> {new Date(selectedPatient.lastConsultation).toLocaleDateString('pt-BR')}</p>
                  </div>
                  
                  {selectedPatient.isafScore && (
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                      <p className="font-medium">Score iSAFE</p>
                      <p className="text-2xl font-bold text-primary">{selectedPatient.isafScore}/10</p>
                    </div>
                  )}

                  {selectedPatient.alerts && selectedPatient.alerts.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium text-destructive mb-2">Alertas:</p>
                      {selectedPatient.alerts.map((alert, index) => (
                        <Badge key={index} variant="destructive" className="mr-1 mb-1">
                          {alert}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {selectedPatient.goals && selectedPatient.goals.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium mb-2">Objetivos:</p>
                      {selectedPatient.goals.map((goal, index) => (
                        <Badge key={index} variant="outline" className="mr-1 mb-1">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Plano alimentar e protocolos */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Plano Personalizado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPatient.planData ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-medium text-primary">🌅 Café da Manhã</h4>
                          <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedPatient.planData.breakfast}</p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium text-secondary">🍽️ Almoço</h4>
                          <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedPatient.planData.lunch}</p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium text-accent">🌙 Jantar</h4>
                          <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedPatient.planData.dinner}</p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium text-success">🥜 Lanches</h4>
                          <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedPatient.planData.snacks}</p>
                        </div>
                      </div>

                      {selectedPatient.planData.biohacking && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-primary">⚡ Biohacking</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedPatient.planData.biohacking.map((item, index) => (
                              <Badge key={index} variant="outline" className="bg-primary/5">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPatient.planData.microgreens && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-secondary">🌱 Microverdes</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedPatient.planData.microgreens.map((item, index) => (
                              <Badge key={index} variant="outline" className="bg-secondary/5">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPatient.planData.frequencies && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-accent">🎵 Frequências</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedPatient.planData.frequencies.map((item, index) => (
                              <Badge key={index} variant="outline" className="bg-accent/5">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button 
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={() => {
                            console.log('🎯 CLICOU VER PLANO - selectedPatient:', selectedPatient?.id);
                            setViewingPatientPlan(selectedPatient.id);
                            setStartInEditMode(false);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          Ver Plano
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Enviar ao Paciente
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Gerar PDF
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum plano personalizado ainda.</p>
                      <Button className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Plano
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Resumo da conversa */}
            {selectedPatient.conversationSummary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Resumo da Conversa com Alice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
                    {selectedPatient.conversationSummary}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Conversa Completa
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Adicionar Notas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // Lista de usuários reais do sistema
          <div className="grid grid-cols-1 gap-4">
            {filteredPatients.length === 0 ? (
              <Card className="p-8">
                <CardContent className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {patientSearchTerm ? 'Nenhum usuário encontrado com esse termo de busca' : 'Nenhum usuário cadastrado'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredPatients.map((user) => {
                // Verificar se é admin através dos IDs conhecidos
                const isAdmin = user.user_id === 'd11d49f5-eb96-4c6e-98e9-e22ae4426554' || user.user_id === '5e60daff-ebe8-4f71-8aaf-568f5112c08e';
                
                return (
                  <Card 
                    key={user.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/30"
                     onClick={async () => {
                       // Carregar dados educacionais do usuário
                       await loadUserEducationalData(user.user_id);
                       setSelectedRealUser(user);
                     }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${isAdmin ? 'bg-orange-100' : 'bg-primary/10'}`}>
                            {isAdmin ? (
                              <Settings className="h-6 w-6 text-orange-600" />
                            ) : (
                              <Users className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{user.name || user.full_name}</h3>
                            <p className="text-muted-foreground">{user.email}</p>
                            <p className="text-sm text-muted-foreground">
                              Cadastrado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </p>
                            {user.phone && (
                              <p className="text-sm text-muted-foreground">
                                📱 {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col gap-2">
                            <Badge variant={isAdmin ? 'default' : 'secondary'}>
                              {isAdmin ? '👑 Administrador' : '👤 Paciente'}
                            </Badge>
                            
                            <Badge variant="outline" className="text-xs">
                              ID: {user.user_id.slice(0, 8)}...
                            </Badge>
                          </div>
                          
                          <Eye className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Gênero</p>
                            <p className="font-medium">{user.gender || 'Não informado'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Altura</p>
                            <p className="font-medium">{user.height ? `${user.height}cm` : 'Não informado'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Peso</p>
                            <p className="font-medium">{user.weight ? `${user.weight}kg` : 'Não informado'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Ocupação</p>
                            <p className="font-medium">{user.occupation || 'Não informado'}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  // Modal de Novo Agendamento
  const renderNewAppointmentModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-foreground">
            📅 Novo Agendamento
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNewAppointmentModal(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Nome do Paciente</Label>
            <Input placeholder="Ex: Maria da Silva" />
          </div>
          
          <div className="space-y-2">
            <Label>Email</Label>
            <Input placeholder="maria@email.com" type="email" />
          </div>
          
          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input placeholder="(21) 99999-9999" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Horário</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00">08:00</SelectItem>
                  <SelectItem value="09:00">09:00</SelectItem>
                  <SelectItem value="10:00">10:00</SelectItem>
                  <SelectItem value="14:00">14:00</SelectItem>
                  <SelectItem value="15:00">15:00</SelectItem>
                  <SelectItem value="16:00">16:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Tipo de Consulta</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primeira">Primeira Consulta</SelectItem>
                <SelectItem value="retorno">Consulta de Retorno</SelectItem>
                <SelectItem value="avaliacao">Avaliação</SelectItem>
                <SelectItem value="emergencia">Emergência</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea placeholder="Informações adicionais sobre a consulta..." rows={3} />
          </div>
        </div>
        
        <div className="flex gap-2 justify-end p-6 border-t">
          <Button 
            variant="outline" 
            onClick={() => setShowNewAppointmentModal(false)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              toast({
                title: "Agendamento criado!",
                description: "O paciente receberá uma confirmação por WhatsApp."
              });
              setShowNewAppointmentModal(false);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Agendar Consulta
          </Button>
        </div>
      </div>
    </div>
  );

  // Modal de Adicionar Paciente
  const renderAddPatientModal = () => {
    const handleAddPatient = async () => {
      if (!patientData.name || !patientData.email || !patientData.password) {
        toast({
          title: "Campos obrigatórios",
          description: "Nome, email e senha são obrigatórios.",
          variant: "destructive"
        });
        return;
      }

      setIsCreatingPatient(true);
      try {
        // 1. Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: patientData.email.trim(),
          password: patientData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: patientData.name.trim(),
              name: patientData.name.trim()
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // 2. Criar perfil
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: authData.user.id,
              email: patientData.email.trim(),
              full_name: patientData.name.trim(),
              name: patientData.name.trim(),
              phone: patientData.phone || null,
              gender: patientData.gender || null,
              occupation: patientData.occupation || null,
              birth_date: patientData.age ? new Date(new Date().getFullYear() - parseInt(patientData.age), 0, 1).toISOString().split('T')[0] : null
            });

          if (profileError) throw profileError;

          // 3. Criar role de paciente
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: 'patient'
            });

          if (roleError) throw roleError;

          // 4. Dar acesso VIP automático para pacientes criados pela doutora
          console.log('🔧 Criando VIP automático para paciente da doutora:', patientData.email);
          
          const { data: subscriberData, error: subscriberError } = await supabase
            .from('subscribers')
            .upsert({
              user_id: authData.user.id,
              email: patientData.email.trim(),
              subscribed: true, // VIP automático para pacientes da doutora
              subscription_tier: 'VIP Doutora', // Acesso total à plataforma
              subscription_end: null, // Acesso indefinido
              updated_at: new Date().toISOString()
            }, { 
              onConflict: 'email',
              ignoreDuplicates: false 
            })
            .select();

          if (subscriberError) {
            console.error('❌ ERRO ao criar VIP:', subscriberError);
            toast({
              title: "⚠️ Aviso: Acesso VIP",
              description: `Paciente criado mas erro no VIP: ${subscriberError.message}`,
              variant: "destructive"
            });
          } else {
            console.log('✅ Paciente criado com VIP automático:', subscriberData);
          }

          // 5. Criar plano educacional padrão
          const { error: planError } = await supabase
            .from('educational_plans')
            .insert({
              user_id: authData.user.id,
              plan_name: `Plano Personalizado - ${patientData.name}`,
              status: 'ativo',
              plan_type: 'premium',
              meal_plans: {
                breakfast: { name: 'Café da Manhã', description: 'A ser personalizado', color: 'bg-orange-500' },
                lunch: { name: 'Almoço', description: 'A ser personalizado', color: 'bg-green-500' },
                snack: { name: 'Lanche', description: 'A ser personalizado', color: 'bg-blue-500' },
                dinner: { name: 'Jantar', description: 'A ser personalizado', color: 'bg-purple-500' }
              },
              biohacking_practices: {
                morning: 'A ser personalizado pela doutora',
                afternoon: 'A ser personalizado pela doutora', 
                evening: 'A ser personalizado pela doutora'
              },
              microverdes_schedule: {
                type: ['A definir'],
                usage: 'A ser personalizado pela doutora',
                benefits: 'A ser definido conforme avaliação'
              },
              frequency_therapy: {
                morning: { hz: 'A definir', purpose: 'A ser personalizado' },
                evening: { hz: 'A definir', purpose: 'A ser personalizado' }
              }
            });

          if (planError) {
            console.log('Info: Plano educacional não criado:', planError);
            // Não falhar por isso, só logar
          }

          toast({
            title: "✅ Paciente criado com sucesso!",
            description: `${patientData.name} foi adicionado com acesso VIP e plano educacional inicial.`
          });

          // Recarregar dados e fechar modal
          loadRealData();
          handleCloseAddPatientModal();
        }
      } catch (error: any) {
        console.error('Erro ao criar paciente:', error);
        
        let errorMessage = 'Erro ao criar paciente.';
        if (error.message?.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado.';
        }
        
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsCreatingPatient(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-foreground">
              👤 Adicionar Novo Paciente
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseAddPatientModal}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <Label htmlFor="patient-name">Nome completo *</Label>
              <Input
                id="patient-name"
                placeholder="Nome do paciente"
                value={patientData.name}
                onChange={(e) => setPatientData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="patient-email">Email *</Label>
              <Input
                id="patient-email"
                type="email"
                placeholder="email@exemplo.com"
                value={patientData.email}
                onChange={(e) => setPatientData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="patient-password">Senha inicial *</Label>
              <Input
                id="patient-password"
                type="password"
                placeholder="Senha temporária"
                value={patientData.password}
                onChange={(e) => setPatientData(prev => ({ ...prev, password: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                O paciente poderá alterar a senha após o primeiro login
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient-phone">Telefone</Label>
                <Input
                  id="patient-phone"
                  placeholder="(11) 99999-9999"
                  value={patientData.phone}
                  onChange={(e) => setPatientData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="patient-age">Idade</Label>
                <Input
                  id="patient-age"
                  type="number"
                  placeholder="30"
                  value={patientData.age}
                  onChange={(e) => setPatientData(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient-gender">Gênero</Label>
                <Select value={patientData.gender} onValueChange={(value) => setPatientData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="patient-occupation">Profissão</Label>
                <Input
                  id="patient-occupation"
                  placeholder="Ex: Engenheiro"
                  value={patientData.occupation}
                  onChange={(e) => setPatientData(prev => ({ ...prev, occupation: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end p-6 border-t">
            <Button
              variant="outline"
              onClick={handleCloseAddPatientModal}
              disabled={isCreatingPatient}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddPatient}
              disabled={isCreatingPatient}
              className="bg-primary hover:bg-primary/90"
            >
              {isCreatingPatient ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Paciente
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/15 via-accent/5 to-primary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          )}
          <div className="text-center space-y-2 flex-1">
            <h1 className="text-3xl font-bold text-foreground">🏥 Dashboard Administrativo</h1>
            <p className="text-muted-foreground">
              Gestão completa da plataforma - Dra. Dayana | Horário de Brasília
            </p>
          </div>
          
          {/* Status de Conexão e Sincronização */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {connectionStatus === 'connected' ? 'Online' : 
                 connectionStatus === 'connecting' ? 'Conectando...' : 'Offline'}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={syncData}
              disabled={connectionStatus === 'connecting'}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
            
            {lastUpdate && (
              <div className="text-sm text-muted-foreground">
                <Clock className="w-4 h-4 inline mr-1" />
                {lastUpdate}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="patients">
              <Users className="h-4 w-4 mr-2" />
              Pacientes
            </TabsTrigger>
            <TabsTrigger value="ebooks">
              <FileText className="h-4 w-4 mr-2" />
              E-books
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="h-4 w-4 mr-2" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="h-4 w-4 mr-2" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Brain className="h-4 w-4 mr-2" />
              IA Training
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="patients">
            {renderPatientsManagement()}
          </TabsContent>

          <TabsContent value="calendar">
            <AdminCalendarView onBack={() => {}} />
          </TabsContent>

          <TabsContent value="ebooks">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-6 bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl border border-accent/20">
                <div>
                  <h2 className="text-2xl font-bold text-accent">Gestão de E-books</h2>
                  <p className="text-muted-foreground">Gerencie o conteúdo educativo da plataforma</p>
                </div>
                <Button onClick={() => handleOpenModal('ebook')} className="bg-accent hover:bg-accent/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar E-book
                </Button>
              </div>
              
              {/* E-books Table */}
              <Card className="border-accent/10">
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ebooks.map((ebook) => (
                        <TableRow key={ebook.id}>
                          <TableCell className="font-medium">{ebook.title}</TableCell>
                          <TableCell>{ebook.category}</TableCell>
                          <TableCell>{ebook.downloads}</TableCell>
                          <TableCell>
                            <Badge variant={ebook.isActive ? 'default' : 'secondary'}>
                              {ebook.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenModal('ebook', ebook)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-6 bg-gradient-to-r from-success/10 to-success/5 rounded-xl border border-success/20">
                <div>
                  <h2 className="text-2xl font-bold text-success">Gestão de Vídeos</h2>
                  <p className="text-muted-foreground">Adicione vídeos do YouTube ou faça upload</p>
                </div>
                <Button onClick={() => handleOpenModal('video')} className="bg-success hover:bg-success/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Vídeo
                </Button>
              </div>
              
              {/* Videos Table */}
              <Card className="border-success/10">
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Visualizações</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {videos.map((video) => (
                        <TableRow key={video.id}>
                          <TableCell className="font-medium">{video.title}</TableCell>
                          <TableCell>
                            <Badge variant={video.type === 'youtube' ? 'default' : 'secondary'}>
                              {video.type === 'youtube' ? (
                                <><Youtube className="h-3 w-3 mr-1" />YouTube</>
                              ) : (
                                <><Video className="h-3 w-3 mr-1" />Upload</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>{video.category}</TableCell>
                          <TableCell>{video.views}</TableCell>
                          <TableCell>
                            <Badge variant={video.isActive ? 'default' : 'secondary'}>
                              {video.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenModal('video', video)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Relatórios Pós-Consulta</h2>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="reviewed">Revisados</SelectItem>
                      <SelectItem value="completed">Concluídos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Reports Grid */}
              <div className="grid gap-4">
                {reports
                  .filter(report => 
                    report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (filterCategory === 'all' || report.status === filterCategory)
                  )
                  .map((report) => (
                  <Card key={report.id} className={`${report.hasAlerts ? 'border-destructive/20 bg-destructive/5' : ''}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {report.hasAlerts && <AlertCircle className="h-5 w-5 text-destructive" />}
                            {report.patientName}
                          </CardTitle>
                          <CardDescription>
                            Consulta: {new Date(report.consultationDate).toLocaleDateString('pt-BR')} | 
                            Relatório: {new Date(report.reportDate).toLocaleDateString('pt-BR')}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={
                            report.status === 'pending' ? 'destructive' : 
                            report.status === 'reviewed' ? 'default' : 'secondary'
                          }>
                            {report.status === 'pending' ? 'Pendente' : 
                             report.status === 'reviewed' ? 'Revisado' : 'Concluído'}
                          </Badge>
                          <Badge variant={
                            report.priority === 'high' ? 'destructive' : 
                            report.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            Prioridade {report.priority === 'high' ? 'Alta' : 
                                      report.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label className="font-semibold text-primary">👤 Dados do Paciente:</Label>
                          <div className="bg-primary/5 p-3 rounded-lg text-sm">
                            <p><strong>Idade:</strong> {report.patientData.age} anos</p>
                            <p><strong>Peso:</strong> {report.patientData.weight} kg</p>
                            <p><strong>Altura:</strong> {report.patientData.height} cm</p>
                            <p><strong>WhatsApp:</strong> {report.patientData.whatsapp}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold text-accent">📊 Métricas da Conversa:</Label>
                          <div className="bg-accent/5 p-3 rounded-lg text-sm">
                            <p><strong>Duração:</strong> {report.conversationMetrics.duration}</p>
                            <p><strong>Total de mensagens:</strong> {report.conversationMetrics.totalMessages}</p>
                            <p><strong>Status:</strong> <Badge variant={report.status === 'pending' ? 'destructive' : 'default'}>
                              {report.status === 'pending' ? 'Pendente' : 'Revisado'}
                            </Badge></p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-secondary/5 p-4 rounded-lg">
                          <Label className="font-semibold text-secondary">🎯 Queixa Principal:</Label>
                          <p className="text-sm text-muted-foreground mt-1">{report.medicalSummary.mainComplaint}</p>
                        </div>
                        
                        <div className="bg-destructive/5 p-4 rounded-lg">
                          <Label className="font-semibold text-destructive">🩺 Sintomas Relatados:</Label>
                          <p className="text-sm text-muted-foreground mt-1">{report.medicalSummary.symptoms}</p>
                        </div>
                        
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <Label className="font-semibold">📋 Histórico de Saúde:</Label>
                          <p className="text-sm text-muted-foreground mt-1">{report.medicalSummary.healthHistory}</p>
                        </div>
                        
                        <div className="bg-success/5 p-4 rounded-lg">
                          <Label className="font-semibold text-success">🏃‍♀️ Estilo de Vida:</Label>
                          <div className="text-sm text-muted-foreground mt-1 space-y-1">
                            <p><strong>Sono:</strong> {report.medicalSummary.lifestyle.sleep}</p>
                            <p><strong>Estresse:</strong> {report.medicalSummary.lifestyle.stress}</p>
                            <p><strong>Atividade:</strong> {report.medicalSummary.lifestyle.activity}</p>
                            <p><strong>Rotina:</strong> {report.medicalSummary.lifestyle.routine}</p>
                          </div>
                        </div>
                        
                        <div className="bg-primary/5 p-4 rounded-lg">
                          <Label className="font-semibold text-primary">🤖 Análise da IA:</Label>
                          <p className="text-sm text-muted-foreground mt-1">{report.medicalSummary.aiAnalysis}</p>
                        </div>
                        
                        <div className="bg-accent/5 p-4 rounded-lg">
                          <Label className="font-semibold text-accent">💡 Recomendações Preliminares:</Label>
                          <p className="text-sm text-muted-foreground mt-1">{report.medicalSummary.recommendations}</p>
                        </div>
                        
                        <div>
                          <Label htmlFor={`notes-${report.id}`} className="font-semibold">Notas da Dra. Dayana:</Label>
                          <Textarea
                            id={`notes-${report.id}`}
                            value={report.doctorNotes}
                            onChange={(e) => {
                              setReports(prev => prev.map(r => 
                                r.id === report.id ? { ...r, doctorNotes: e.target.value } : r
                              ));
                            }}
                            placeholder="Adicionar observações e orientações para o paciente..."
                            className="mt-2"
                            rows={3}
                          />
                          <Button 
                            size="sm" 
                            className="mt-2"
                            onClick={() => handleUpdateReportNotes(report.id, report.doctorNotes)}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Notas
                          </Button>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar PDF
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Completo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                <div>
                  <h2 className="text-2xl font-bold text-primary">Treinamento de IA</h2>
                  <p className="text-muted-foreground">Configure prompts personalizados para Alice</p>
                </div>
                <Button onClick={() => handleOpenModal('prompt')} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Prompt
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
                  <CardHeader>
                    <CardTitle className="text-primary">Estatísticas de IA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Prompts Ativos:</span>
                        <span className="font-bold">{aiPrompts.filter(p => p.isActive).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total de Uso:</span>
                        <span className="font-bold">{aiPrompts.length > 0 ? aiPrompts.reduce((sum, p) => sum + p.usage, 0) : 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Categorias:</span>
                        <span className="font-bold">5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-secondary/5 to-success/5 border-secondary/10">
                  <CardHeader>
                    <CardTitle className="text-secondary">Prompt Mais Usado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      if (aiPrompts.length === 0) {
                        return (
                          <div>
                            <p className="font-medium">Nenhum prompt disponível</p>
                            <p className="text-sm text-muted-foreground">
                              Adicione prompts para ver estatísticas
                            </p>
                          </div>
                        );
                      }
                      const mostUsed = aiPrompts.reduce((prev, current) => 
                        (prev.usage > current.usage) ? prev : current
                      );
                      return (
                        <div>
                          <p className="font-medium">{mostUsed.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {mostUsed.usage} usos | Última vez: {new Date(mostUsed.lastUsed).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
              
              {/* AI Prompts Table */}
              <Card>
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Usos</TableHead>
                        <TableHead>Último Uso</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aiPrompts.map((prompt) => (
                        <TableRow key={prompt.id}>
                          <TableCell className="font-medium">{prompt.title}</TableCell>
                          <TableCell>{prompt.category}</TableCell>
                          <TableCell>{prompt.usage}</TableCell>
                          <TableCell>{new Date(prompt.lastUsed).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>
                            <Badge variant={prompt.isActive ? 'default' : 'secondary'}>
                              {prompt.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenModal('prompt', prompt)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">📊 Analytics & Relatórios</h2>
              
              {/* Estatísticas principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Pacientes</p>
                        <p className="text-2xl font-bold text-primary">{realPatients.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-primary/60" />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-success">Perfis cadastrados</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Assinantes Premium</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {realSubscribers.length}
                        </p>
                      </div>
                      <Star className="h-8 w-8 text-emerald-600/60" />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-emerald-600">
                        {realPatients.length > 0 ? Math.round((realSubscribers.length / realPatients.length) * 100) : 0}% dos pacientes
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Receita Mensal</p>
                        <p className="text-2xl font-bold text-primary">
                          R$ {(realSubscribers.length * 297).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-primary/60" />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-success">Assinaturas ativas</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Consultas Agendadas</p>
                        <p className="text-2xl font-bold text-secondary">{appointments.length}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-secondary/60" />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-secondary">Este mês</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos e análises */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status dos usuários */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status dos Usuários</CardTitle>
                    <CardDescription>Distribuição por status de pagamento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { 
                          status: 'active', 
                          label: 'Assinantes Premium', 
                          count: realSubscribers.length,
                          color: 'bg-emerald-500' 
                        },
                        { 
                          status: 'pending', 
                          label: 'Aguardando Pagamento', 
                          count: 0, 
                          color: 'bg-yellow-500' 
                        },
                        { 
                          status: 'inactive', 
                          label: 'Inativos', 
                          count: 0, 
                          color: 'bg-gray-500' 
                        }
                      ].map((item) => (
                        <div key={item.status} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{item.count}</span>
                           <span className="text-xs text-muted-foreground">
                             ({realPatients.length > 0 ? Math.round((item.count / realPatients.length) * 100) : 0}%)
                           </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Receita por período */}
                <Card>
                  <CardHeader>
                    <CardTitle>Projeção de Receita</CardTitle>
                    <CardDescription>Baseado nas assinaturas atuais</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                       {[
                         { 
                           period: 'Mensal', 
                           value: realSubscribers.length * 297, 
                           color: 'text-primary' 
                         },
                         { 
                           period: 'Trimestral', 
                           value: realSubscribers.length * 297 * 3, 
                           color: 'text-secondary' 
                         },
                         { 
                           period: 'Anual', 
                           value: realSubscribers.length * 297 * 12, 
                           color: 'text-emerald-600' 
                         }
                       ].map((item) => (
                        <div key={item.period} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <span className="font-medium">{item.period}</span>
                          <span className={`text-xl font-bold ${item.color}`}>
                            R$ {item.value.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabela detalhada */}
              <Card>
                <CardHeader>
                  <CardTitle>Pacientes Detalhados</CardTitle>
                  <CardDescription>Lista completa com status de pagamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Última Atividade</TableHead>
                        <TableHead>Tipo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {realPatients.map((user) => {
                        const isAdmin = user.user_id === 'd11d49f5-eb96-4c6e-98e9-e22ae4426554' || user.user_id === '5e60daff-ebe8-4f71-8aaf-568f5112c08e';
                        const isSubscriber = realSubscribers.some(sub => sub.user_id === user.user_id && sub.subscribed);
                        
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name || user.full_name}</TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={isAdmin ? 'secondary' : isSubscriber ? 'default' : 'outline'}>
                                {isAdmin ? '👑 Admin' : isSubscriber ? '💎 Premium' : '👤 Usuário'} 
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {isAdmin ? 'Administrador' : isSubscriber ? 'Assinante' : 'Paciente'}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Resumo financeiro */}
              <Card>
                <CardHeader>
                  <CardTitle>💰 Resumo Financeiro</CardTitle>
                  <CardDescription>Análise completa de receitas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Assinaturas Mensais</h4>
                      <p className="text-2xl font-bold text-emerald-600">
                        R$ {(realSubscribers.length * 297).toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        {realSubscribers.length} × R$ 297,00
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Consultas Presenciais</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        R$ {(appointments.length * consultationPrice).toFixed(2).replace('.', ',')}  
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {appointments.length} × R$ {consultationPrice.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Total do Mês</h4>
                      <p className="text-2xl font-bold text-purple-600">
                        R$ {((realSubscribers.length * 297) + (appointments.length * consultationPrice)).toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Receita combinada
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Configurações</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Integração Supabase</CardTitle>
                    <CardDescription>
                      Configure a conexão com o banco de dados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Status da Conexão</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm">Conectado</span>
                      </div>
                    </div>
                    <div>
                      <Label>Último Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString('pt-BR')} às 14:30
                      </p>
                    </div>
                    <Button variant="outline">
                      Fazer Backup Manual
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Notificações</CardTitle>
                    <CardDescription>
                      Configure alertas e notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Novos relatórios pós-consulta</Label>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">Enviar por email</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Relatórios com alta prioridade</Label>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">Notificação imediata</span>
                      </div>
                    </div>
                    <Button variant="outline">
                      Salvar Configurações
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Preços da Consulta</CardTitle>
                    <CardDescription>
                      Configure o valor da consulta presencial
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="consultation-price">Valor da Consulta Presencial (R$)</Label>
                      <Input
                        id="consultation-price"
                        type="number"
                        value={consultationPrice}
                        onChange={(e) => setConsultationPrice(parseFloat(e.target.value) || 0)}
                        placeholder="800"
                        min="0"
                        step="0.01"
                      />
                      <p className="text-xs text-muted-foreground">
                        Valor atual: R$ {consultationPrice.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        localStorage.setItem('consultationPrice', consultationPrice.toString());
                        toast({
                          title: "Preço Atualizado",
                          description: `Valor da consulta definido para R$ ${consultationPrice.toFixed(2).replace('.', ',')}`,
                        });
                      }}
                      className="w-full"
                    >
                      Salvar Preço da Consulta
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Modelo de Negócio</CardTitle>
                    <CardDescription>
                      Estrutura de preços da plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <h4 className="font-semibold text-primary mb-2">💎 Assinatura Clube Digital</h4>
                        <p className="text-2xl font-bold">R$ 297/mês</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Acesso à plataforma, Alice IA, e-books, vídeos
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
                        <h4 className="font-semibold text-secondary mb-2">🏥 Consulta Presencial</h4>
                        <p className="text-2xl font-bold">R$ {consultationPrice.toFixed(2).replace('.', ',')}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Consulta com Dra. Dayana (após usar a plataforma)
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <h5 className="font-medium text-amber-800 dark:text-amber-200 mb-2">📋 Fluxo do Paciente:</h5>
                      <ol className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                        <li>1. Assina a plataforma (R$ 99/mês)</li>
                        <li>2. Usa Alice IA e conteúdo educativo</li>
                        <li>3. Se prepara com dados coletados</li>
                        <li>4. Agenda consulta presencial (R$ {consultationPrice.toFixed(2).replace('.', ',')})</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

        </Tabs>

        {/* Modal for Add/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedItem ? 'Editar' : 'Adicionar'} {modalType === 'ebook' ? 'E-book' : modalType === 'video' ? 'Vídeo' : 'Prompt de IA'}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {modalType === 'ebook' && (
                <EbookForm 
                  item={selectedItem} 
                  onSave={handleSaveItem} 
                  onCancel={() => setShowModal(false)} 
                />
              )}
              
              {modalType === 'video' && (
                <VideoForm 
                  item={selectedItem} 
                  onSave={handleSaveItem} 
                  onCancel={() => setShowModal(false)} 
                />
              )}
              
              {modalType === 'prompt' && (
                <PromptForm 
                  item={selectedItem} 
                  onSave={handleSaveItem} 
                  onCancel={() => setShowModal(false)} 
                />
              )}
            </div>
          </div>
        )}

        {/* Modal de novo agendamento */}
        {showNewAppointmentModal && renderNewAppointmentModal()}

        {/* Modal de adicionar paciente */}
        {showAddPatientModal && renderAddPatientModal()}
      </div>
    </div>
  );
}

// E-book Form Component
const EbookForm = ({ item, onSave, onCancel }: any) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    category: item?.category || 'nutrition',
    readTime: item?.readTime || '',
    file: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    onSave({
      ...formData,
      fileUrl: formData.file ? URL.createObjectURL(formData.file) : item?.fileUrl,
      coverImage: '/covers/default.jpg'
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ex: Guia Completo de Nutrição"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva o conteúdo do e-book..."
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="category">Categoria</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nutrition">Nutrição</SelectItem>
            <SelectItem value="orthomolecular">Ortomolecular</SelectItem>
            <SelectItem value="physiotherapy">Fisioterapia</SelectItem>
            <SelectItem value="mev">MEV</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="readTime">Tempo de Leitura</Label>
        <Input
          id="readTime"
          value={formData.readTime}
          onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
          placeholder="Ex: 45 min"
        />
      </div>
      
      <div>
        <Label htmlFor="file">📁 Arquivo PDF {!item && '*'}</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
        />
        {item?.fileUrl && <p className="text-xs text-muted-foreground mt-1">Arquivo atual: {item.title}.pdf</p>}
      </div>
      
      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>
          <Upload className="h-4 w-4 mr-2" />
          {item ? 'Atualizar' : 'Upload E-book'}
        </Button>
      </div>
    </div>
  );
};

// Video Form Component
const VideoForm = ({ item, onSave, onCancel }: any) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    category: item?.category || 'nutrition',
    type: item?.type || 'youtube',
    url: item?.url || '',
    duration: item?.duration || ''
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.url) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
    // Validate YouTube URL
    if (formData.type === 'youtube' && !formData.url.includes('youtube.com') && !formData.url.includes('youtu.be')) {
      alert('URL do YouTube inválida');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="video-title">Título *</Label>
        <Input
          id="video-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ex: Introdução à Medicina do Estilo de Vida"
        />
      </div>
      
      <div>
        <Label htmlFor="video-description">Descrição *</Label>
        <Textarea
          id="video-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva o conteúdo do vídeo..."
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="video-category">Categoria</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nutrition">Nutrição</SelectItem>
            <SelectItem value="orthomolecular">Ortomolecular</SelectItem>
            <SelectItem value="physiotherapy">Fisioterapia</SelectItem>
            <SelectItem value="mev">MEV</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="video-type">Tipo</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="youtube">
              <div className="flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                YouTube
              </div>
            </SelectItem>
            <SelectItem value="upload">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="video-url">
          {formData.type === 'youtube' ? '🎥 URL do YouTube *' : '📁 Arquivo de Vídeo *'}
        </Label>
        {formData.type === 'youtube' ? (
          <Input
            id="video-url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
            className="font-mono text-sm"
          />
        ) : (
          <Input
            id="video-url"
            type="file"
            accept="video/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFormData({ ...formData, url: URL.createObjectURL(e.target.files[0]) });
              }
            }}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
          />
        )}
      </div>
      
      <div>
        <Label htmlFor="video-duration">Duração</Label>
        <Input
          id="video-duration"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          placeholder="Ex: 15:30"
        />
      </div>
      
      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>
          {formData.type === 'youtube' ? <Youtube className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
          {item ? 'Atualizar' : 'Adicionar'} Vídeo
        </Button>
      </div>
    </div>
  );
};

// Prompt Form Component
const PromptForm = ({ item, onSave, onCancel }: any) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    category: item?.category || 'nutrition',
    prompt: item?.prompt || ''
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.prompt) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="prompt-title">Título *</Label>
        <Input
          id="prompt-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ex: Orientações Nutricionais Personalizadas"
        />
      </div>
      
      <div>
        <Label htmlFor="prompt-category">Categoria</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nutrition">Nutrição</SelectItem>
            <SelectItem value="orthomolecular">Ortomolecular</SelectItem>
            <SelectItem value="physiotherapy">Fisioterapia</SelectItem>
            <SelectItem value="mev">MEV</SelectItem>
            <SelectItem value="general">Geral</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="prompt-text">🤖 Prompt de IA *</Label>
        <Textarea
          id="prompt-text"
          value={formData.prompt}
          onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
          placeholder="Com base no perfil do paciente, forneça orientações personalizadas..."
          rows={6}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use variáveis como {'{age}'}, {'{weight}'}, {'{goals}'} para personalização
        </p>
      </div>
      
      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>
          <Brain className="h-4 w-4 mr-2" />
          {item ? 'Atualizar' : 'Adicionar'} Prompt
        </Button>
      </div>
    </div>
  );
};
