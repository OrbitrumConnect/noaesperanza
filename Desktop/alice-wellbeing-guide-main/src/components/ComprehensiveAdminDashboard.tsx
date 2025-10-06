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
import PersonalizedPlan from './PersonalizedPlan';

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
  const [viewingPatientPlan, setViewingPatientPlan] = useState<string | null>(null);
  const [consultationPrice, setConsultationPrice] = useState(() => {
    const stored = localStorage.getItem('consultationPrice');
    return stored ? parseFloat(stored) : 800;
  });
  
  // Realtime data hook
  const { lastUpdate, isConnected, syncData, connectionStatus } = useRealtimeData('admin');
  const { toast } = useToast();

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

  // Patients data from Supabase
  const [patients, setPatients] = useState<PatientData[]>(() => {
    // Dados de exemplo para demonstração
    return [
      {
        id: 'test-patient-1',
        name: 'Ana Silva',
        email: 'ana.silva@email.com',
        age: 34,
        weight: 65,
        height: 165,
        phone: '(11) 99999-1234',
        lastConsultation: '2024-01-15',
        status: 'active',
        planData: {
          breakfast: 'Smoothie verde com espinafre, banana e microverdes',
          lunch: 'Quinoa com legumes grelhados e azeite de oliva',
          dinner: 'Salmão grelhado com aspargos e batata doce',
          snacks: 'Castanhas do Brasil (3 unidades) e chá verde',
          biohacking: ['Banho de sol matinal', 'Água com limão', 'Respiração 4-7-8'],
          microgreens: ['Brócolis', 'Rúcula', 'Alfafa'],
          frequencies: ['528Hz - Manhã', '741Hz - Tarde']
        },
        conversationSummary: 'Paciente busca melhorar qualidade do sono e reduzir ansiedade. Relatou sintomas de estresse e fadiga.',
        isafScore: 7.2,
        alerts: ['Privação de sono', 'Alto nível de estresse'],
        goals: ['Melhorar sono', 'Reduzir ansiedade', 'Aumentar energia']
      },
      {
        id: 'test-patient-2', 
        name: 'Carlos Santos',
        email: 'carlos.santos@email.com',
        age: 42,
        weight: 78,
        height: 175,
        phone: '(11) 99999-5678',
        lastConsultation: '2024-01-12',
        status: 'active',
        conversationSummary: 'Paciente com histórico de hipertensão, busca reequilibrio nutricional.',
        isafScore: 5.8,
        alerts: ['Pressão arterial elevada'],
        goals: ['Controlar pressão', 'Perder peso']
      }
    ];
  });

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

  const stats = {
    totalPatients: patients.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    activeEbooks: ebooks.filter(e => e.isActive).length,
    activeVideos: videos.filter(v => v.isActive).length,
    totalDownloads: ebooks.length > 0 ? ebooks.reduce((sum, e) => sum + (e.downloads || 0), 0) : 0,
    totalViews: videos.length > 0 ? videos.reduce((sum, v) => sum + (v.views || 0), 0) : 0,
    averageSatisfaction: reports.length > 0 ? '8.5' : '0'
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

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-success/10 rounded-xl">
                <Video className="h-8 w-8 text-success" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Vídeos Ativos</p>
                <p className="text-2xl font-bold text-success">{stats.activeVideos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-card to-muted/20 border-primary/10">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="text-primary">Relatórios Recentes</CardTitle>
            <CardDescription>Últimas avaliações pós-consulta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {report.hasAlerts && <AlertCircle className="h-4 w-4 text-destructive" />}
                    <div>
                      <p className="font-medium">{report.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(report.reportDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={report.status === 'pending' ? 'destructive' : 'default'}>
                    {report.status === 'pending' ? 'Pendente' : 'Revisado'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 border-secondary/10">
          <CardHeader className="bg-gradient-to-r from-secondary/5 to-success/5">
            <CardTitle className="text-secondary">Métricas de Conteúdo</CardTitle>
            <CardDescription>Performance dos materiais educativos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-accent/5 rounded-lg">
                <span className="text-sm font-medium">Downloads de E-books</span>
                <span className="font-bold text-accent">{stats.totalDownloads}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-success/5 rounded-lg">
                <span className="text-sm font-medium">Visualizações de Vídeos</span>
                <span className="font-bold text-success">{stats.totalViews}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                <span className="text-sm font-medium">Satisfação Média</span>
                <span className="font-bold text-primary">{stats.averageSatisfaction}/10</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/5 rounded-lg">
                <span className="text-sm font-medium">Prompts de IA Ativos</span>
                <span className="font-bold text-secondary">{aiPrompts.filter(p => p.isActive).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPatientsManagement = () => {
    const filteredPatients = patients.filter(patient =>
      patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(patientSearchTerm.toLowerCase())
    );

    // Se estiver visualizando plano de um paciente
    if (viewingPatientPlan) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setViewingPatientPlan(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Pacientes
            </Button>
          </div>
          <PersonalizedPlan 
            userId={viewingPatientPlan} 
            isPatientView={false}
          />
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
                          className="flex items-center gap-2"
                          onClick={() => setViewingPatientPlan(selectedPatient.id)}
                        >
                          <Edit className="h-4 w-4" />
                          Editar Plano
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
          // Lista de pacientes
          <div className="grid grid-cols-1 gap-4">
            {filteredPatients.map((patient) => (
              <Card 
                key={patient.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/30"
                onClick={() => setSelectedPatient(patient)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{patient.name}</h3>
                        <p className="text-muted-foreground">{patient.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Última consulta: {new Date(patient.lastConsultation).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {patient.isafScore && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">iSAFE Score</p>
                          <p className="text-xl font-bold text-primary">{patient.isafScore}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-2">
                        <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                          {patient.status === 'active' ? 'Ativo' : patient.status === 'pending' ? 'Pendente' : 'Inativo'}
                        </Badge>
                        
                        {patient.alerts && patient.alerts.length > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {patient.alerts.length} Alerta{patient.alerts.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                        
                        {patient.planData && (
                          <Badge variant="outline" className="text-xs bg-success/5">
                            Plano Ativo
                          </Badge>
                        )}
                      </div>
                      
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  
                  {patient.conversationSummary && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {patient.conversationSummary}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ... continuando com renderização dos outros tabs ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/15 via-accent/5 to-primary/20 p-6">{/* Background admin mais vibrante +20% */}
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
          <TabsList className="grid w-full grid-cols-9">{/* Aumentar para 9 colunas */}
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
            <div className="space-y-6">
              {/* Header da Agenda */}
              <div className="flex justify-between items-center p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 shadow-lg backdrop-blur-sm">{/* Header calendário elegante */}
                <div>
                  <h2 className="text-2xl font-bold text-primary">📅 Gestão de Agenda</h2>
                  <p className="text-muted-foreground">Configure horários e gerencie consultas</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => setShowNewAppointmentModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Agendamento
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendário Visual */}
                <div className="lg:col-span-2">
                  <Card className="border-primary/10">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                      <CardTitle className="text-primary">Calendário - Janeiro 2024</CardTitle>
                      <CardDescription>Visualização mensal dos horários</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      {/* Grid do Calendário */}
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                          <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      {/* Dias do mês */}
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 31 }, (_, i) => {
                          const day = i + 1;
                          const hasAppointment = [5, 12, 18, 25].includes(day);
                          const isAvailable = [8, 15, 22, 29].includes(day);
                          
                          // Dados simulados dos agendamentos
                          const appointmentData = {
                            5: [{ time: '09:00', patient: 'Maria Silva', type: 'Retorno' }],
                            12: [{ time: '14:30', patient: 'João Santos', type: 'Primeira consulta' }],
                            18: [
                              { time: '09:00', patient: 'Ana Costa', type: 'Retorno' },
                              { time: '14:00', patient: 'Pedro Lima', type: 'Primeira consulta' }
                            ],
                            25: [{ time: '10:30', patient: 'Sofia Mendes', type: 'Avaliação' }]
                          };
                          
                          const dayAppointments = appointmentData[day as keyof typeof appointmentData] || [];
                          
                          return (
                            <div
                              key={day}
                              className={`h-12 flex items-center justify-center rounded-lg border cursor-pointer transition-all duration-200 relative group ${
                                hasAppointment 
                                  ? 'bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20' 
                                  : isAvailable
                                  ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                                  : 'border-border hover:bg-muted/50'
                              }`}
                              onClick={() => {
                                if (hasAppointment || isAvailable) {
                                  toast({
                                    title: `Agenda do dia ${day}`,
                                    description: hasAppointment 
                                      ? `${dayAppointments.length} consulta(s) agendada(s)`
                                      : 'Horário disponível para agendamento'
                                  });
                                }
                              }}
                            >
                              <span className="text-sm font-medium">{day}</span>
                              
                              {/* Tooltip com detalhes */}
                              {(hasAppointment || isAvailable) && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                  <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
                                    <div className="text-xs font-medium text-popover-foreground mb-2">
                                      {day} de Janeiro
                                    </div>
                                    {hasAppointment ? (
                                      <div className="space-y-2">
                                        {dayAppointments.map((apt, idx) => (
                                          <div key={idx} className="text-xs text-muted-foreground">
                                            <div className="font-medium text-foreground">{apt.time}</div>
                                            <div>{apt.patient}</div>
                                            <div className="text-primary">{apt.type}</div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-muted-foreground">
                                        Horário disponível para agendamento
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Indicador de número de consultas */}
                              {hasAppointment && dayAppointments.length > 1 && (
                                <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                                  {dayAppointments.length}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Legenda */}
                      <div className="flex justify-center gap-6 mt-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-destructive/20 rounded"></div>
                          <span>Ocupado</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-primary/20 rounded"></div>
                          <span>Disponível</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-muted rounded"></div>
                          <span>Livre</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Painel Lateral */}
                <div className="space-y-4">
                  {/* Horários de Trabalho */}
                  <Card className="border-accent/10">
                    <CardHeader className="bg-gradient-to-r from-accent/5 to-accent/10">
                      <CardTitle className="text-accent">⏰ Horários de Trabalho</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Dias da Semana</Label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                            <div key={day} className="flex items-center gap-1">
                              <input type="checkbox" defaultChecked={day !== 'Sáb'} className="text-primary" />
                              <span>{day}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                       <div className="space-y-2">
                        <Label className="text-sm font-medium">Horário Manhã</Label>
                        <div className="flex gap-2">
                          <Input placeholder="08:00" className="text-xs" defaultValue="08:00" />
                          <Input placeholder="12:00" className="text-xs" defaultValue="12:00" />
                        </div>
                      </div>
                      
                       <div className="space-y-2">
                         <Label className="text-sm font-medium">Horário Tarde</Label>
                         <div className="flex gap-2">
                           <Input placeholder="14:00" className="text-xs" defaultValue="14:00" />
                           <Input placeholder="18:00" className="text-xs" defaultValue="18:00" />
                         </div>
                       </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">📱 WhatsApp da Dra.</Label>
                          <Input
                           placeholder="+55 21 99693-6317" 
                           className="text-xs font-mono" 
                           defaultValue="+55 21 99693-6317"
                           readOnly
                         />
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="w-full bg-accent hover:bg-accent/90"
                        onClick={() => {
                          toast({ title: "Configurações salvas!", description: "Horários atualizados com sucesso." });
                        }}
                      >
                        Salvar Configurações
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Consultas do Dia */}
                  <Card className="border-secondary/10">
                    <CardHeader className="bg-gradient-to-r from-secondary/5 to-secondary/10">
                      <CardTitle className="text-secondary">📋 Hoje - 18/08</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-3">
                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                          <div className="font-medium text-sm text-primary">09:00 - Maria Silva</div>
                          <div className="text-xs text-muted-foreground">Consulta de retorno</div>
                          <div className="flex gap-1 mt-2">
                            <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-accent/5 rounded-lg border border-accent/10">
                          <div className="font-medium text-sm text-accent">14:30 - João Santos</div>
                          <div className="text-xs text-muted-foreground">Primeira consulta</div>
                          <div className="flex gap-1 mt-2">
                            <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-muted/50 rounded-lg border-dashed border">
                          <div className="text-center text-xs text-muted-foreground">
                            16:00 - Horário Livre
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Estatísticas Rápidas */}
                  <Card className="border-tertiary/10">
                    <CardHeader className="bg-gradient-to-r from-tertiary/5 to-tertiary/10">
                      <CardTitle className="text-tertiary">📊 Estatísticas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Consultas hoje:</span>
                        <span className="font-bold text-primary">2</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Esta semana:</span>
                        <span className="font-bold text-accent">12</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Taxa ocupação:</span>
                        <span className="font-bold text-secondary">85%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Próxima livre:</span>
                        <span className="font-bold text-tertiary">16:00</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
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
                        <h4 className="font-semibold text-primary mb-2">💎 Assinatura Premium</h4>
                        <p className="text-2xl font-bold">R$ 99/mês</p>
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

          <TabsContent value="analytics">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">📊 Analytics & Relatórios</h2>
              
              {/* Estatísticas principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Usuários Totais</p>
                        <p className="text-2xl font-bold text-primary">{patients.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-primary/60" />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-success">+2 esta semana</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Assinantes Premium</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {patients.filter(p => p.status === 'active').length}
                        </p>
                      </div>
                      <Star className="h-8 w-8 text-emerald-600/60" />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-emerald-600">
                        {Math.round((patients.filter(p => p.status === 'active').length / patients.length) * 100)}% dos usuários
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
                          R$ {(patients.filter(p => p.status === 'active').length * 99).toFixed(2).replace('.', ',')}
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
                        <p className="text-2xl font-bold text-secondary">3</p>
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
                        { status: 'active', label: 'Assinantes Premium', count: patients.filter(p => p.status === 'active').length, color: 'bg-emerald-500' },
                        { status: 'pending', label: 'Aguardando Pagamento', count: patients.filter(p => p.status === 'pending').length, color: 'bg-yellow-500' },
                        { status: 'inactive', label: 'Inativos', count: patients.filter(p => p.status === 'inactive').length, color: 'bg-gray-500' }
                      ].map((item) => (
                        <div key={item.status} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{item.count}</span>
                            <span className="text-xs text-muted-foreground">
                              ({patients.length > 0 ? Math.round((item.count / patients.length) * 100) : 0}%)
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
                        { period: 'Mensal', value: patients.filter(p => p.status === 'active').length * 99, color: 'text-primary' },
                        { period: 'Trimestral', value: patients.filter(p => p.status === 'active').length * 99 * 3, color: 'text-secondary' },
                        { period: 'Anual', value: patients.filter(p => p.status === 'active').length * 99 * 12, color: 'text-emerald-600' }
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
                  <CardTitle>Usuários Detalhado</CardTitle>
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
                        <TableHead>Score iSAFE</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">{patient.name}</TableCell>
                          <TableCell className="text-muted-foreground">{patient.email}</TableCell>
                          <TableCell>
                            <Badge variant={
                              patient.status === 'active' ? 'default' : 
                              patient.status === 'pending' ? 'secondary' : 
                              'outline'
                            }>
                              {patient.status === 'active' ? '💎 Premium' : 
                               patient.status === 'pending' ? '⏳ Pendente' : 
                               '❌ Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {patient.lastConsultation}
                          </TableCell>
                          <TableCell>
                            {patient.isafScore ? (
                              <span className={`font-semibold ${
                                patient.isafScore >= 8 ? 'text-emerald-600' :
                                patient.isafScore >= 6 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {patient.isafScore.toFixed(1)}/10
                              </span>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
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
                        R$ {(patients.filter(p => p.status === 'active').length * 99).toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        {patients.filter(p => p.status === 'active').length} × R$ 99,00
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Consultas Presenciais</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        R$ {(3 * consultationPrice).toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        3 × R$ {consultationPrice.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Total do Mês</h4>
                      <p className="text-2xl font-bold text-purple-600">
                        R$ {((patients.filter(p => p.status === 'active').length * 99) + (3 * consultationPrice)).toFixed(2).replace('.', ',')}
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
      </div>
    </div>
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/15 via-accent/5 to-primary/20 p-6">{/* Background admin mais vibrante +20% */}
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
              Gestão completa da plataforma - Dra. Dayana
            </p>
          </div>
        </div>

        {/* Modal de novo agendamento */}
        {showNewAppointmentModal && renderNewAppointmentModal()}
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