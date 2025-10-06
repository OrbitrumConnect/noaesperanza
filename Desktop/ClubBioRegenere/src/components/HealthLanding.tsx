import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Shield, Video, BookOpen, Brain, HeartPulse, Stethoscope, CreditCard, HeadphonesIcon, Sparkles, Settings, Star, ThumbsUp, User, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Dashboard from "./Dashboard";
import ComprehensiveAdminDashboard from "./ComprehensiveAdminDashboard";
import AuthModal from "./AuthModal";
import wellnessBackground from "../assets/wellness-background.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "../hooks/useSubscription";
import { useNavigate } from "react-router-dom";

// Clube de Membros Vida Integral - Health & Wellness Landing Page
// Replace placeholders (PAYMENT_LINK, WHATSAPP_LINK, PRIVACY_LINK) before deploy

export default function HealthLanding() {
  const navigate = useNavigate();
  const { subscribed } = useSubscription();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPostConsultationModal, setShowPostConsultationModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userType, setUserType] = useState<'patient' | 'admin' | null>(null);
  const [newTestimonial, setNewTestimonial] = useState({ name: '', text: '' });
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);

  // Verificar se já há usuário logado e monitorar mudanças de auth
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      // Primeiro, tentar recuperar do localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser && mounted) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('🔄 Recuperando usuário do localStorage:', userData.userType);
          setCurrentUser(userData);
          setUserType(userData.userType);
          
          if (userData.userType === 'admin') {
            setShowAdmin(true);
          }
        } catch (error) {
          console.error('Erro ao recuperar dados do localStorage:', error);
          localStorage.removeItem('user');
        }
      }
      
      // Depois verificar a sessão atual
      await checkAuthState();
    };
    
    initializeAuth();
    
    // ✅ Removido listener duplicado - usando apenas o do useSupabaseAuth
    // O hook useSupabaseAuth já gerencia todos os eventos de auth
    console.log('📡 [HEALTH_LANDING] Auth listener removido - usando hook centralizado');

    return () => {
      mounted = false;
      // ✅ Cleanup removido - não há mais subscription local
    };
  }, []);

  const checkAuthState = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Erro ao obter sessão:', sessionError);
        return;
      }
      
      console.log('🔍 CheckAuthState - Session:', session?.user?.id);
      
      if (!session?.user) {
        console.log('❌ Nenhum usuário na sessão');
        setCurrentUser(null);
        setUserType(null);
        setShowAdmin(false);
        return;
      }

      try {
        // Get user role and profile data com tratamento de erro
        const [roleResponse, profileResponse] = await Promise.all([
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single()
            .then(res => ({ ...res, source: 'user_roles' })),
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
            .then(res => ({ ...res, source: 'profiles' }))
        ]);

        console.log('📊 Role response:', roleResponse);
        console.log('👤 Profile response:', profileResponse);

        const userType = roleResponse?.data?.role === 'admin' ? 'admin' : 'patient';
        const profile = profileResponse?.data;
        
        console.log('🎯 Detected userType:', userType);
        
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || profile?.full_name || session.user.email?.split('@')[0],
          userType,
          profile
        };
        
        setCurrentUser(userData);
        setUserType(userType);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Se for admin, mostrar dashboard automaticamente
        if (userType === 'admin') {
          console.log('👑 Setting showAdmin to true for admin user');
          setShowAdmin(true);
        } else if (userType === 'patient') {
          console.log('🏥 Patient user detected, staying on landing page');
        }
      } catch (dbError) {
        console.error('❌ Erro ao buscar dados do usuário:', dbError);
        // Em caso de erro na busca, assumir como paciente
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.email?.split('@')[0],
          userType: 'patient' as const,
          profile: null
        };
        
        setCurrentUser(userData);
        setUserType('patient');
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('❌ Erro geral ao verificar autenticação:', error);
    }
  };

  const handleAuthSuccess = (type: 'patient' | 'admin', userData: any) => {
    setCurrentUser(userData);
    setUserType(type);
    setShowLoginModal(false);
    
    if (type === 'admin') {
      setShowAdmin(true);
    } else {
      setShowDashboard(true);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      localStorage.removeItem('user');
      setCurrentUser(null);
      setUserType(null);
      setShowDashboard(false);
      setShowAdmin(false);
      
      // Clean up auth state
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Load testimonials from localStorage
  const [testimonials] = useState(() => {
    const approved = JSON.parse(localStorage.getItem('approvedTestimonials') || '[]');
    return approved.length > 0 ? approved : [
      { id: '1', nome_paciente: 'Maria Silva', texto: 'A Dr. Dayane transformou minha vida! Depois de anos sofrendo com fadiga crônica, finalmente encontrei respostas e um tratamento que realmente funciona.', status: 'aprovado' },
      { id: '2', nome_paciente: 'João Santos', texto: 'O protocolo MEV foi incrível. Em 3 meses consegui reverter minha síndrome metabólica e me sinto 20 anos mais jovem!', status: 'aprovado' },
      { id: '3', nome_paciente: 'Ana Costa', texto: 'Alice me ajudou muito no início do tratamento. A abordagem humanizada fez toda diferença no meu processo de cura.', status: 'aprovado' }
    ];
  });

  const features = [
    { icon: <BookOpen className="w-6 h-6"/>, title: "E-books e vídeos MEV", text: "Biblioteca com alimentação, sono, e-book antiestresse, atividade física e rotinas práticas de Mudanças no Estilo de Vida." },
    { icon: <Video className="w-6 h-6"/>, title: "Exames explicados", text: "Vídeos orientativos: o que é, como fazer e como receber seus resultados online." },
    { icon: <Brain className="w-6 h-6"/>, title: "IA Alice", text: "Anamnese guiada, rotina, preferências e objetivos para montar seu plano personalizado." },
    { icon: <HeartPulse className="w-6 h-6"/>, title: "Plano de Bem-estar", text: "Combinação única de plano alimentar + prescrição de estilo de vida (MEV): nutrição, hidratação, sono, luz/sol, movimento, respiração/estresse." },
    { icon: <HeadphonesIcon className="w-6 h-6"/>, title: "Frequências", text: "Faixas de áudio em hertz para relaxamento profundo e foco mental – tecnologia avançada para seu bem-estar." },
    { icon: <Sparkles className="w-6 h-6"/>, title: "Ferramentas mentais", text: "Técnicas de PNL, frases de constelação e Access Bars para transformação pessoal completa." },
  ];

  const steps = [
    { n: 1, title: "Agende e pague", text: "Clique em 'Começar agora', efetue o pagamento e receba acesso imediato à área de membros." },
    { n: 2, title: "Bem-vindo(a) à área de membros", text: "Desbloqueie e-books, vídeos e trilhas guiadas. Assista aos conteúdos de exames." },
    { n: 3, title: "Converse com a Alice (IA)", text: "Preencha a anamnese guiada no chat: rotina, medidas, preferências e objetivos." },
    { n: 4, title: "Receba seu Plano de Bem-estar", text: "Plano alimentar + prescrição de estilo de vida (MEV) personalizado em PDF estruturado, com checklist diário e recursos complementares." },
  ];

  const faqItems = [
    {q: "O que recebo ao pagar a consulta?", a: "Acesso imediato à área de membros, conteúdos educativos e orientação da IA para montar seu Plano de Bem-estar (combinação de plano alimentar + prescrição de Mudanças no Estilo de Vida - MEV). Sua consulta online será agendada conforme confirmação da equipe."},
    {q: "A IA receita medicamentos ou doses?", a: "Não. A plataforma é educativa e não substitui atendimento médico."},
    {q: "As frequências em hertz funcionam como tratamento?", a: "São trilhas para relaxamento/rotina de foco. Não caracterizam tratamento médico nem prometem cura."},
    {q: "Posso fazer tudo à distância?", a: "Sim. Conteúdos e anamnese são online. Exames presenciais, quando necessários, serão orientados por vídeo e instruções."},
  ];

  if (showAdmin) {
    return <ComprehensiveAdminDashboard onBack={() => setShowAdmin(false)} />;
  }

  if (showDashboard) {
    return <Dashboard onBack={() => setShowDashboard(false)} />;
  }

  const handleTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.name.trim() || !newTestimonial.text.trim()) return;

    const testimonial = {
      id: Date.now().toString(),
      nome_paciente: newTestimonial.name,
      texto: newTestimonial.text,
      data_envio: new Date().toISOString(),
      status: 'pendente'
    };

    const pendingTestimonials = JSON.parse(localStorage.getItem('pendingTestimonials') || '[]');
    pendingTestimonials.push(testimonial);
    localStorage.setItem('pendingTestimonials', JSON.stringify(pendingTestimonials));

    setNewTestimonial({ name: '', text: '' });
    setShowTestimonialForm(false);
    alert('Depoimento enviado! Aguarde aprovação da equipe.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/15 via-background to-accent/15 text-foreground">{/* Landing com gradientes mais sutis */}
      
      {/* HEADER SUPERIOR */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-primary/20 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Logo Mini */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <HeartPulse className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground text-sm hidden sm:block">BioRegenere</span>
            </div>

            {/* User Controls */}
            <div className="flex items-center gap-2">
              {currentUser ? (
                <>
                  {/* User Avatar */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-sm">
                      {currentUser.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-foreground hidden md:block">
                      {currentUser.name}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 ml-2">
                    {userType === 'admin' && (
                      <>
                        <button 
                          onClick={() => setShowDashboard(true)}
                          className="flex items-center gap-1.5 bg-gradient-to-r from-secondary/80 to-accent/80 hover:from-secondary hover:to-accent text-white px-3 py-1.5 rounded-lg transition-all duration-300 hover:scale-105 shadow-sm text-xs font-medium"
                        >
                          <User className="w-3 h-3"/> 
                          <span className="hidden sm:inline">👤 Área Paciente</span>
                          <span className="sm:hidden">👤</span>
                        </button>
                        <button 
                          onClick={() => setShowAdmin(true)}
                          className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-3 py-1.5 rounded-lg transition-all duration-300 hover:scale-105 shadow-sm text-xs font-medium"
                        >
                          <Settings className="w-3 h-3"/> 
                          <span className="hidden sm:inline">🔐 Admin</span>
                          <span className="sm:hidden">🔐</span>
                        </button>
                      </>
                    )}
                    
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-3 py-1.5 rounded-lg transition-all duration-300 hover:scale-105 shadow-sm text-xs font-medium"
                    >
                      <span className="hidden sm:inline">Sair</span>
                      <span className="sm:hidden">↗️</span>
                    </button>
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-sm text-sm font-medium"
                >
                  <User className="w-4 h-4"/> 
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section 
        className="relative overflow-hidden bg-gradient-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${wellnessBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-12 sm:pb-16 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              <div>
                <motion.h1 
                  initial={{opacity:0, y:20}} 
                  animate={{opacity:1, y:0}} 
                  transition={{duration:.6}} 
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg"
                >
                  Clube BioRegenere
                </motion.h1>
                <p className="mt-3 sm:mt-4 text-base sm:text-lg text-white/90 max-w-2xl drop-shadow-md">
                Sua jornada exclusiva de regeneração completa – corpo, mente e estilo de vida em um só lugar com apoio da IA <span className="font-semibold text-white bg-white/20 px-2 py-1 rounded-lg">Alice</span>.
              </p>
              <div className="mt-6 sm:mt-8 flex gap-2 sm:gap-3 flex-wrap">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentUser) {
                      // Se já está logado, verifica tipo de usuário
                      if (userType === 'admin') {
                        setShowAdmin(true);
                      } else {
                        // Para usuários pacientes, vai para dashboard
                        // O próprio Dashboard verificará a assinatura e mostrará payment se necessário
                        setShowDashboard(true);
                      }
                    } else {
                      // Se não está logado, abre modal de login
                      setShowLoginModal(true);
                    }
                  }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold px-8 py-4 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <User className="w-5 h-5"/> 
                  {currentUser ? 'Acessar Minha Área' : 'Acessar Área de Membros'}
                </button>
              </div>
              <div className="mt-8 text-sm text-white/80">
                <span className="italic">Conteúdo educativo. Não substitui avaliação clínica. Sem promessas de cura.</span>
              </div>
            </div>
            
            {/* Alice Avatar no Hero - Efeito Buraco Negro */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative group cursor-pointer">
                {/* Enhanced Glow Effect - Buraco Negro */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/50 to-secondary/50 blur-3xl scale-125 animate-pulse group-hover:scale-160 group-hover:animate-[pulse_4s_ease-in-out_infinite] transition-all duration-700"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-2xl scale-115 animate-pulse group-hover:from-primary/40 group-hover:to-secondary/40 group-hover:animate-[pulse_3s_ease-in-out_infinite] transition-all duration-500"></div>
                
                {/* Main Circle - Centro do Buraco Negro */}
                <div className="relative w-72 h-72 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-2xl group-hover:shadow-primary/20 group-hover:shadow-3xl transition-shadow duration-500">
                  <div className="w-56 h-56 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl overflow-hidden group-hover:scale-110 transition-transform duration-500">
                    <img 
                      src="/lovable-uploads/f2ba11b1-515b-4861-a031-846a68a96bd7.png" 
                      alt="Alice - Assistente IA" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  
                  {/* Animated Rings - Ondas do Buraco Negro */}
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse group-hover:border-primary/50 group-hover:animate-[pulse_3s_ease-in-out_infinite] transition-all duration-500"></div>
                  <div className="absolute -inset-4 rounded-full border border-secondary/20 animate-pulse animation-delay-1000 group-hover:border-secondary/40 group-hover:animate-[pulse_4s_ease-in-out_infinite] transition-all duration-500"></div>
                  <div className="absolute -inset-8 rounded-full border border-accent/15 animate-pulse animation-delay-2000 group-hover:border-accent/30 group-hover:animate-[pulse_5s_ease-in-out_infinite] transition-all duration-500"></div>
                </div>
                
                {/* Micropartículas Saindo do Buraco Negro */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {/* Partículas em espiral saindo do centro */}
                  {[...Array(32)].map((_, i) => {
                    const angle = (i * Math.PI * 2) / 32;
                    const spiralRadius = 50 + (i * 2);
                    const spiralAngle = angle + (i * 0.3);
                    return (
                      <div
                        key={`spiral-${i}`}
                        className="absolute w-0.5 h-0.5 bg-primary/70 rounded-full group-hover:bg-primary/90 group-hover:w-1 group-hover:h-1 transition-all duration-300"
                         style={{
                           top: `${50 + Math.sin(spiralAngle) * spiralRadius}%`,
                           left: `${50 + Math.cos(spiralAngle) * spiralRadius}%`,
                           animationName: `moveOut${i % 4}`,
                           animationDuration: `${4 + (i % 3)}s`,
                           animationTimingFunction: 'linear',
                           animationIterationCount: 'infinite',
                           animationDelay: `${i * 0.05}s`
                         }}
                      />
                    );
                  })}
                  
                  {/* Partículas micro flutuantes */}
                  {[...Array(48)].map((_, i) => {
                    const angle = (i * Math.PI * 2) / 48 + Math.random() * 0.5;
                    const radius = 55 + Math.random() * 25;
                    return (
                      <div
                        key={`micro-${i}`}
                        className="absolute w-0.5 h-0.5 bg-secondary/50 rounded-full group-hover:bg-secondary/80 transition-colors duration-300"
                        style={{
                          top: `${50 + Math.sin(angle + Date.now() * 0.0005) * radius}%`,
                          left: `${50 + Math.cos(angle + Date.now() * 0.0005) * radius}%`,
                          animation: `float${i % 6} ${5 + Math.random() * 3}s ease-in-out infinite`,
                          animationDelay: `${i * 0.03}s`
                        }}
                      />
                    );
                  })}
                  
                  {/* Partículas ultra finas escapando */}
                  {[...Array(24)].map((_, i) => {
                    const angle = (i * Math.PI * 2) / 24;
                    const escapeRadius = 45 + (i * 3);
                    return (
                      <div
                        key={`escape-${i}`}
                        className="absolute w-px h-px bg-accent/60 rounded-full group-hover:bg-accent/90 transition-colors duration-300"
                        style={{
                          top: `${50 + Math.sin(angle + i * 0.2) * escapeRadius}%`,
                          left: `${50 + Math.cos(angle + i * 0.2) * escapeRadius}%`,
                          animation: `escape${i % 3} ${6 + Math.random() * 2}s linear infinite`,
                          animationDelay: `${i * 0.08}s`
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3">
            O que você recebe
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Uma plataforma completa para sua jornada de regeneração e bem-estar
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              initial={{opacity:0, y:12}} 
              whileInView={{opacity:1, y:0}} 
              viewport={{once:true}} 
              transition={{delay: i*0.05}} 
              className="bg-card/95 backdrop-blur border border-primary/20 p-4 sm:p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="mb-3 text-primary bg-primary/10 rounded-full w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center">{f.icon}</div>
              <h3 className="font-semibold text-base sm:text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gradient-to-r from-secondary/10 via-primary/5 to-accent/10 border-y border-primary/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">Como funciona</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Um processo simples e guiado para sua transformação
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {steps.map((s) => (
              <motion.div 
                key={s.n} 
                initial={{opacity:0, y:20}} 
                whileInView={{opacity:1, y:0}} 
                viewport={{once:true}} 
                transition={{delay: s.n * 0.1}}
                className="p-4 sm:p-6 rounded-2xl border border-primary/20 bg-card/95 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground flex items-center justify-center font-bold text-lg sm:text-xl mb-4">{s.n}</div>
                <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">{s.title}</h4>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* IA SECTION */}
      <section id="ia" className="bg-gradient-section">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Converse com a IA "Alice"</h2>
            <ul className="mt-4 space-y-2 text-foreground/70 text-sm font-medium">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-1"/>
                Anamnese guiada (medidas, rotina, preferências, alergias, medicamentos, comorbidades).
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-1"/>
                Gera Plano MEV personalizado + checklist diário.
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-1"/>
                Entrega sugestões educativas de PNL, frases de constelação e trilhas de áudio em hertz (opcional).
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-1"/>
                Sem indicações de produtos, doses ou prescrições médicas – orientação educativa e de estilo de vida.
              </li>
            </ul>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setShowDashboard(true)}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold px-5 py-3 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Abrir chat da Alice
              </button>
              <a href="#faq" className="bg-gradient-to-r from-secondary/20 to-accent/20 hover:from-secondary/30 hover:to-accent/30 text-foreground border border-secondary/30 px-5 py-3 rounded-2xl transition-all duration-300 hover:scale-105 shadow-sm">
                Dúvidas frequentes
              </a>
            </div>
          </div>
          <motion.div 
            initial={{opacity:0, scale:.98}} 
            whileInView={{opacity:1, scale:1}} 
            viewport={{once:true}} 
            className="relative"
          >
            {/* Alice Hologram Container - Versão compacta */}
            <div className="relative bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20 rounded-3xl p-4 shadow-2xl overflow-hidden">
              {/* Glow Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-pulse"></div>
              <div className="absolute -top-2 -left-2 w-3 h-3 bg-primary rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-primary rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
              
              {/* Alice Image Container - Menor */}
              <div className="relative z-10 w-48 h-48 mx-auto rounded-2xl overflow-hidden bg-gradient-to-b from-primary/20 to-primary/30 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/f2ba11b1-515b-4861-a031-846a68a96bd7.png"
                  alt="Alice - IA Assistente"
                  className="w-full h-full object-contain"
                  style={{ 
                    filter: 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.4))'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-primary/20 pointer-events-none"></div>
                
                {/* Holographic overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse pointer-events-none"></div>
              </div>
              
              {/* Alice Info */}
              <div className="relative z-10 mt-4 text-center">
                <h3 className="text-xl font-bold text-gray-800">Alice - IA Assistente</h3>
                <p className="text-sm text-foreground/80 mt-1 font-medium">Especialista em Medicina do Estilo de Vida</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-xs text-primary font-medium">Online e Pronta para Ajudar</span>
                </div>
              </div>
              
              {/* Floating particles */}
              <div className="absolute top-4 left-4 w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute top-8 right-6 w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
              <div className="absolute bottom-6 left-8 w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.8s'}}></div>
            </div>
            
            <p className="mt-4 text-xs text-muted-foreground text-center">
              Chat inteligente com IA especializada • Educativo e Seguro
            </p>
          </motion.div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{opacity:0, y:20}} 
            whileInView={{opacity:1, y:0}} 
            viewport={{once:true}}
            className="text-3xl md:text-4xl font-bold text-foreground"
          >
            🚀 Desbloqueie Todo Seu Potencial
          </motion.h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Estrutura oficial dos acessos - Clube BioRegenere com a Dra. Dayana Brazão
          </p>
        </div>

        {/* Plan Cards - Two Side by Side */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Clube Digital */}
          <motion.div
            initial={{opacity:0, y:30}} 
            whileInView={{opacity:1, y:0}} 
            viewport={{once:true}}
          >
            <div className="relative bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-6 shadow-xl overflow-hidden">
              {/* Badge */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 rounded-full font-semibold text-xs shadow-lg">
                  <Sparkles className="w-3 h-3" />
                  Mais Popular
                </div>
              </div>

              {/* Plan Details */}
              <div className="relative z-10 text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-1">Clube Digital</h3>
                <p className="text-sm text-muted-foreground mb-4">Acesso imediato - Sem consulta</p>
                
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-success">R$ 297</span>
                  <span className="text-muted-foreground text-sm">/mês</span>
                </div>
                <div className="text-xs text-secondary font-medium">
                  🎯 Cupom Especial Ativo
                </div>
              </div>

              {/* Features - Lista Compacta */}
              <div className="relative z-10 space-y-2 mb-6">
                {[
                  "✅ Acesso imediato à área de membros",
                  "✅ Check-up de saúde funcional",
                  "✅ E-books e vídeos exclusivos",
                  "✅ Prescrição MEV personalizada",
                  "✅ IA Alice para dúvidas"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="relative z-10">
                <button 
                  onClick={() => navigate('/payment')}
                  className="w-full bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-success-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  Começar por R$ 297/mês
                </button>
                
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Seguro via Mercado Pago • Acesso imediato • Pode migrar para consulta
                </p>
              </div>
            </div>
          </motion.div>

          {/* Acesso Completo + Consulta */}
          <motion.div
            initial={{opacity:0, y:30}} 
            whileInView={{opacity:1, y:0}} 
            viewport={{once:true}}
            transition={{ delay: 0.1 }}
          >
            <div className="relative bg-gradient-to-br from-orange-50 to-blue-50 border border-orange-200 rounded-2xl p-6 shadow-xl overflow-hidden">
              {/* Badge */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-blue-500 text-white px-3 py-1 rounded-full font-semibold text-xs shadow-lg">
                  <Calendar className="w-3 h-3" />
                  Consulta Inclusa
                </div>
              </div>

              {/* Plan Details */}
              <div className="relative z-10 text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-1">Acesso Completo + Consulta</h3>
                <p className="text-sm text-muted-foreground mb-4">Presencial ou Online</p>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-lg font-medium text-muted-foreground line-through">
                    De R$ 800,00
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-orange-600">R$ 620,00</span>
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  R$ 800 presencial • R$ 620 online
                </div>
              </div>

              {/* Features - Lista Compacta */}
              <div className="relative z-10 space-y-2 mb-6">
                {[
                  "✅ Consulta individual com Dra. Dayana",
                  "✅ Exame de Neurometria (Presencial)",
                  "✅ Análise por Biorressonância",
                  "✅ Acesso total à área de membros",
                  "✅ Plano alimentar 100% personalizado"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="relative z-10">
                <button 
                  onClick={() => navigate('/payment')}
                  className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar Consulta
                </button>
                
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Agendamento confirmado pela equipe • Exames inclusos
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-8 h-8 text-success" />
            </div>
            <h4 className="font-semibold mb-2">Pagamento Seguro</h4>
            <p className="text-sm text-muted-foreground">
              Processamento 100% seguro via Mercado Pago com criptografia SSL
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h4 className="font-semibold mb-2">Acesso Imediato</h4>
            <p className="text-sm text-muted-foreground">
              Liberação instantânea após o pagamento
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Stethoscope className="w-8 h-8 text-secondary" />
            </div>
            <h4 className="font-semibold mb-2">Suporte Médico</h4>
            <p className="text-sm text-muted-foreground">
              Conteúdo validado por profissionais especializados
            </p>
          </div>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-glass backdrop-blur border border-glass-border rounded-2xl p-6">
          <h3 className="font-semibold">Aviso e Conformidade</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Plataforma educativa de saúde e bem‑estar. Não fornece diagnóstico, prescrição, indicações de produtos ou dosagens. 
            Para condições médicas e uso de medicamentos (incluindo cannabis medicinal), procure um profissional habilitado. 
            Conteúdos complementares (áudios em hertz, PNL, constelação, Access Bars) são opcionais e não substituem atendimento clínico.
          </p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold">O que dizem nossos pacientes</h2>
          <p className="mt-2 text-muted-foreground">Histórias reais de transformação</p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-glass backdrop-blur border border-glass-border p-6 rounded-2xl"
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-4">
                "{testimonial.texto}"
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm font-semibold">
                    {testimonial.nome_paciente.charAt(0)}
                  </span>
                </div>
                <span className="font-medium text-sm">{testimonial.nome_paciente}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Testimonial Button */}
        <div className="text-center">
          <button
            onClick={() => setShowTestimonialForm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <ThumbsUp className="w-4 h-4" />
            Compartilhar minha experiência
          </button>
        </div>

        {/* Testimonial Form Modal */}
        {showTestimonialForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-background border border-border rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">Compartilhe sua experiência</h3>
              <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={newTestimonial.name}
                  onChange={(e) => setNewTestimonial(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                <textarea
                  placeholder="Conte como foi sua experiência..."
                  value={newTestimonial.text}
                  onChange={(e) => setNewTestimonial(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  required
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    Enviar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTestimonialForm(false);
                      setNewTestimonial({ name: '', text: '' });
                    }}
                    className="flex-1 bg-gradient-to-r from-secondary/20 to-accent/20 hover:from-secondary/30 hover:to-accent/30 border border-secondary/30 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-2xl md:text-3xl font-bold">Perguntas frequentes</h2>
        <div className="mt-6 divide-y divide-border border border-border rounded-2xl">
          {faqItems.map((item, idx) => (
            <div key={idx} className="p-5">
              <button 
                onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)} 
                className="w-full text-left font-medium hover:text-primary transition-colors"
              >
                {item.q}
              </button>
              {openFAQ === idx && (
                <motion.p 
                  initial={{opacity:0, height:0}} 
                  animate={{opacity:1, height:'auto'}} 
                  className="mt-2 text-sm text-muted-foreground"
                >
                  {item.a}
                </motion.p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER PROFISSIONAL */}
      <footer className="bg-gradient-to-br from-primary/15 via-background to-secondary/15 border-t border-primary/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Logo e Descrição */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                  <HeartPulse className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Clube BioRegenere</h3>
                  <p className="text-sm text-muted-foreground">Medicina Integrativa e Longevidade</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                Transformando vidas através da medicina integrativa, biohacking e protocolos personalizados para regeneração completa e longevidade saudável.
              </p>
              
              {/* Dra. Dayana */}
              <div className="bg-card/70 border border-primary/30 rounded-xl p-4 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                      <img 
                        src="/lovable-uploads/f2ba11b1-515b-4861-a031-846a68a96bd7.png" 
                        alt="Dra. Dayana Brazão Hanemann" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Dra. Dayana Brazão Hanemann</h4>
                      <p className="text-xs text-muted-foreground">PhD Ortomolecular / Naturopata</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground/80 leading-relaxed space-y-1">
                    <p>Nutricionista / Dermatofuncional / Neurometrista</p>
                    <p>CRN 25104750 / CREFITO 162636</p>
                    <p>CTN 88146-2025 / CRTH 6729</p>
                  </div>
                  <a 
                    href="https://dradaybrazao.com.br/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-primary hover:text-secondary transition-colors font-medium"
                  >
                    🌐 dradaybrazao.com.br
                  </a>
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground text-lg">Contato</h4>
              <div className="space-y-3 text-sm">
                <a 
                  href="https://wa.me/5521996936317?text=Olá! Gostaria de saber mais sobre o Clube BioRegenere" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-green-600 transition-colors group"
                >
                  <div className="w-10 h-10 bg-green-200 dark:bg-green-800 rounded-xl flex items-center justify-center group-hover:bg-green-300 dark:group-hover:bg-green-700 transition-colors shadow-sm">
                    <span className="text-green-700 dark:text-green-200 text-base">📱</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">WhatsApp</p>
                    <p className="text-xs text-muted-foreground">(21) 99693-6317</p>
                  </div>
                </a>
                
                <a 
                  href="mailto:instituto@sustentaresaude.com.br" 
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-xl flex items-center justify-center group-hover:bg-blue-300 dark:group-hover:bg-blue-700 transition-colors shadow-sm">
                    <span className="text-blue-700 dark:text-blue-200 text-base">✉️</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p className="text-xs text-muted-foreground">instituto@sustentaresaude.com.br</p>
                  </div>
                </a>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-10 h-10 bg-purple-200 dark:bg-purple-800 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-purple-700 dark:text-purple-200 text-base">📍</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Localização</p>
                    <p className="text-xs text-muted-foreground">Rio de Janeiro, RJ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground text-lg">Siga-nos</h4>
              <div className="space-y-3">
                <a 
                  href="https://www.instagram.com/dra.dayanahanemann/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-pink-600 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-white text-base">📸</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Instagram</p>
                    <p className="text-xs text-muted-foreground">@dra.dayanahanemann</p>
                  </div>
                </a>

                <a 
                  href="https://www.youtube.com/@sustentaresaude" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-red-600 transition-colors group"
                >
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-white text-base">📺</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">YouTube</p>
                    <p className="text-xs text-muted-foreground">Sustenta e Saúde</p>
                  </div>
                </a>

                <a 
                  href="https://www.linkedin.com/in/dayana-brazao-ozonioterapia-no-rio-de-janeiro?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-blue-700 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-white text-base">💼</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">LinkedIn</p>
                    <p className="text-xs text-muted-foreground">Dra. Dayana Brazão</p>
                  </div>
                </a>

                <a 
                  href="https://share.google/SefWRT5Ep1CMv1eZ5" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-orange-600 transition-colors group"
                >
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-white text-base">📍</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Google</p>
                    <p className="text-xs text-muted-foreground">Localização e Avaliações</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Linha Divisória */}
          <div className="border-t border-primary/30 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-medium">© 2025 Clube BioRegenere. Todos os direitos reservados.</span>
                <span className="hidden md:inline text-muted-foreground/60">•</span>
                <button 
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:text-primary transition-colors font-medium underline"
                >
                  Política de Privacidade
                </button>
                <span className="hidden md:inline text-muted-foreground/60">•</span>
                <button 
                  onClick={() => setShowTermsModal(true)}
                  className="hover:text-primary transition-colors font-medium underline"
                >
                  Termos de Uso
                </button>
              </div>
              
              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1.5 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full font-medium shadow-sm">
                  ✅ Site Seguro
                </span>
                <span className="px-3 py-1.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full font-medium shadow-sm">
                  🔒 SSL Ativo
                </span>
              </div>
            </div>
          </div>

          {/* Disclaimer Legal */}
          <div className="mt-8 p-5 bg-amber-100/90 dark:bg-amber-900/40 border border-amber-300/60 dark:border-amber-700/40 rounded-2xl backdrop-blur-sm">
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
              <strong>Importante:</strong> Este site oferece conteúdo educativo sobre saúde e bem-estar. As informações aqui contidas não substituem consulta médica presencial. A IA Alice é uma ferramenta educativa e não realiza diagnósticos médicos. Sempre consulte um médico qualificado para questões relacionadas à sua saúde. Os resultados podem variar individualmente.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleAuthSuccess}
        mode="login"
      />
      
      {/* Post Consultation Modal */}
      {showPostConsultationModal && (
        <AuthModal 
          isOpen={showPostConsultationModal}
          onClose={() => setShowPostConsultationModal(false)}
          onSuccess={handleAuthSuccess}
          mode="login"
        />
      )}

      {/* Privacy Policy Modal */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Política de Privacidade</DialogTitle>
            <DialogDescription>
              Última atualização: Janeiro de 2025
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold mb-2">1. Coleta de Informações</h3>
              <p>Coletamos informações que você nos fornece diretamente, incluindo:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Dados pessoais (nome, email, telefone)</li>
                <li>Informações de saúde para personalização do plano</li>
                <li>Dados de uso da plataforma</li>
                <li>Informações de pagamento (processadas via Mercado Pago)</li>
              </ul>
            </section>
            
            <section>
              <h3 className="font-semibold mb-2">2. Uso das Informações</h3>
              <p>Utilizamos suas informações para:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Fornecer e personalizar nossos serviços</li>
                <li>Processar pagamentos e gerenciar sua conta</li>
                <li>Comunicar sobre atualizações e novidades</li>
                <li>Melhorar nossos serviços e experiência do usuário</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. Proteção de Dados</h3>
              <p>Implementamos medidas de segurança adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.</p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. Compartilhamento de Dados</h3>
              <p>Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto quando necessário para prestação do serviço ou exigido por lei.</p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. Seus Direitos</h3>
              <p>Você tem o direito de acessar, corrigir, excluir ou portar suas informações pessoais. Entre em contato conosco para exercer esses direitos.</p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">6. Contato</h3>
              <p>Para dúvidas sobre esta política, entre em contato: contato@bioregenere.com</p>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms of Use Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Termos de Uso</DialogTitle>
            <DialogDescription>
              Última atualização: Janeiro de 2025
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold mb-2">1. Aceitação dos Termos</h3>
              <p>Ao acessar e usar nossa plataforma, você concorda com estes termos de uso e nossa política de privacidade.</p>
            </section>
            
            <section>
              <h3 className="font-semibold mb-2">2. Descrição do Serviço</h3>
              <p>O Clube BioRegenere oferece:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Conteúdo educativo sobre medicina do estilo de vida</li>
                <li>Planos personalizados de bem-estar</li>
                <li>Assistente virtual "Alice" para anamnese</li>
                <li>Biblioteca de recursos em saúde e wellness</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. Limitações Importantes</h3>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <p className="font-medium text-amber-800">⚠️ AVISO MÉDICO IMPORTANTE:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2 text-amber-700">
                  <li>Este serviço é puramente educativo e informativo</li>
                  <li>NÃO substitui consulta médica profissional</li>
                  <li>NÃO fornece diagnósticos ou prescrições médicas</li>
                  <li>A IA "Alice" é uma ferramenta educativa, não médica</li>
                  <li>Sempre consulte um médico para questões de saúde</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. Responsabilidades do Usuário</h3>
              <p>Você concorda em:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Usar o serviço apenas para fins pessoais e legais</li>
                <li>Não compartilhar suas credenciais de acesso</li>
                <li>Respeitar os direitos autorais do conteúdo</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. Pagamentos e Cancelamentos</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Clube Digital: R$ 297/mês (acesso à plataforma)</li>
                <li>Acesso Completo + Consulta: R$ 530-620 (valor único)</li>
                <li>Renovação automática (apenas Clube Digital)</li>
                <li>Cancele a qualquer momento sem taxa</li>
                <li>Processamento seguro via Mercado Pago</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">6. Propriedade Intelectual</h3>
              <p>Todo o conteúdo da plataforma é protegido por direitos autorais e propriedade intelectual do Clube BioRegenere.</p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">7. Limitação de Responsabilidade</h3>
              <p>O Clube BioRegenere não se responsabiliza por decisões tomadas com base no conteúdo educativo fornecido. Sempre consulte profissionais qualificados.</p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">8. Contato</h3>
              <p>Dúvidas sobre estes termos: contato@bioregenere.com</p>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}