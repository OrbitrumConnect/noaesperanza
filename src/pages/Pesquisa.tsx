import { useEffect } from "react";
import { Helmet } from "../components/Helmet";
import { useToast } from "../hooks/use-toast";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { useIsClient } from '../hooks/useIsClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
// import { Badge } from "../components/ui/badge";
import { FlaskConical, Globe, Building, Users, Target, Activity, Brain, Cpu } from "lucide-react";

// Componente Badge simples inline
const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode, variant?: string, className?: string }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}>
    {children}
  </span>
);

const Pesquisa = () => {
  const isClient = useIsClient();
  const { toast } = useToast();

  // Handlers para as funcionalidades
  const handleGravação = () => {
    // Aqui você pode adicionar lógica para acessar gravações
    console.log('Acessando gravações...');
    toast({
      title: "Gravações",
      description: "Acessando sessões gravadas do LabPEC...",
    });
    // Exemplo: window.open('/gravações', '_blank');
  };

  const handleAnálise = () => {
    // Aqui você pode adicionar lógica para acessar análises
    console.log('Acessando análises...');
    toast({
      title: "Análises",
      description: "Acessando feedback detalhado das sessões...",
    });
    // Exemplo: window.open('/análises', '_blank');
  };

  const handleColaboração = () => {
    // Aqui você pode adicionar lógica para acessar colaboração
    console.log('Acessando colaboração...');
    toast({
      title: "Colaboração",
      description: "Acessando ferramentas de trabalho em equipe...",
    });
    // Exemplo: window.open('/colaboração', '_blank');
  };

  useEffect(() => {
    if (isClient) {
      const urlParams = new URLSearchParams(window.location.search);
      const message = urlParams.get("message");

      if (message === "auth_success") {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo à plataforma Nôa Esperanza.",
        });
      }
    }
  }, [isClient, toast]);

  const projects = [
    {
      id: "cidade-amiga",
      title: "Cidade Amiga dos Rins",
      subtitle: "Saúde Comunitária & Nefrologia",
      description:
        "Programa pioneiro de saúde comunitária que integra tecnologia avançada e cuidado humanizado para identificação de fatores de risco para doença renal crônica e onboarding de profissionais através da metodologia Arte da Entrevista Clínica.",
      icon: Building,
      color: "from-green-400 to-teal-500",
      features: [
        "35 anos de nefrologia aplicados ao desenvolvimento urbano",
        "Abordagem preventiva com IA para fatores de risco",
        "Onboarding de profissionais de saúde",
        "Impacto direto em saúde pública",
      ],
      link: "/cidade-amiga-dos-rins",
      stats: [
        { label: "Cidades", value: "3", icon: Building },
        { label: "Profissionais", value: "45", icon: Users },
        { label: "Pacientes", value: "1.2K", icon: Target },
      ]
    },
    {
      id: "medcann-lab",
      title: "MedCann Lab",
      subtitle: "Integração Cannabis & Nefrologia",
      description:
        "Pesquisa pioneira da cannabis medicinal aplicada à nefrologia e neurologia, utilizando a metodologia AEC para identificar benefícios terapêuticos e avaliar impactos na função renal.",
      icon: FlaskConical,
      color: "from-green-500 to-blue-500",
      features: [
        "Protocolos de prescrição baseados em AEC",
        "Monitoramento de função renal",
        "Deep Learning para análise de biomarcadores",
        "Integração com dispositivos médicos",
      ],
      link: "/medcann-lab",
      stats: [
        { label: "Pacientes", value: "187", icon: Users },
        { label: "Estágios CKD", value: "5", icon: Activity },
        { label: "Cidades", value: "3", icon: Building },
      ]
    },
    {
      id: "jardins-cura",
      title: "Jardins de Cura",
      subtitle: "Saúde Global & Agência Crítica",
      description:
        "Projeto de saúde global focado na aplicação da metodologia AEC em comunidades vulneráveis, promovendo equidade em saúde e desenvolvimento de capacidades locais.",
      icon: Globe,
      color: "from-purple-500 to-pink-500",
      features: [
        "Formação de agentes comunitários",
        "Triagem preventiva baseada em AEC",
        "Indicadores de saúde populacional",
        "Parcerias com organizações internacionais",
      ],
      link: "/jardins-de-cura",
      stats: [
        { label: "Comunidades", value: "12", icon: Globe },
        { label: "Agentes", value: "28", icon: Users },
        { label: "Pessoas", value: "5.8K", icon: Target },
      ]
    },
  ];

  return (
    <>
      <Helmet>
        <title>Pesquisa - Laboratório de Performance em Entrevista Clínica | Nôa Esperanza</title>
        <meta
          name="description"
          content="Pesquisas avançadas em Deep Learning, NLP e IA aplicadas ao cuidado humanizado. Parcerias com MedCann Lab, Jardins de Cura e Cidade Amiga dos Rins."
        />
        <meta
          name="keywords"
          content="pesquisa saúde, deep learning medicina, NLP saúde, inteligência artificial médica, cannabis medicinal, nefrologia, saúde pública"
        />
        <link rel="canonical" href={`${window.location.origin}/pesquisa`} />
      </Helmet>

      <div className="min-h-screen premium-background">
        <Header currentSpecialty="rim" setCurrentSpecialty={() => {}} />
        <main>
          {/* Layout Principal com Sidebar */}
          <div className="flex gap-4 py-1 px-4">
            {/* Sidebar de eBooks */}
            <div className="w-72 flex-shrink-0">
              <div className="premium-card p-2 sticky top-4 h-[calc(100vh-8rem)] overflow-y-auto z-10">
                {/* Projetos de Pesquisa */}
                <div className="mb-2">
                  <h2 className="text-xs font-bold mb-0.5 text-premium">
                    Projetos de Pesquisa
              </h2>
                  <p className="text-xs text-gray-300">
                    Aplicações da metodologia AEC em diferentes contextos
                  </p>
                </div>

                <div className="space-y-1 mb-2">
                {projects.map((project) => (
                    <div key={project.id} className="premium-card p-1 group hover:bg-gray-800 transition-all duration-300">
                      <div className={`h-0.5 bg-gradient-to-r ${project.color} mb-1`} />
                      
                      <div className="flex items-start space-x-1 mb-1">
                        <div className={`p-0.5 rounded bg-gradient-to-r ${project.color} text-white flex-shrink-0`}>
                          <project.icon className="w-2 h-2" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-premium group-hover:text-green-400 transition-colors mb-0.5">
                            {project.title}
                          </h4>
                          <p className="text-xs text-gray-400 font-medium mb-0.5">
                            {project.subtitle}
                          </p>
                          <p className="text-xs text-gray-300 leading-tight mb-1 line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                      </div>

                      {/* Stats compactas */}
                      <div className="grid grid-cols-3 gap-0.5 mb-1">
                        {project.stats.map((stat, index) => (
                          <div key={index} className="text-center">
                            <stat.icon className="w-1.5 h-1.5 mx-auto mb-0.5 text-gray-400" />
                            <div className="text-xs font-bold text-premium">{stat.value}</div>
                            <div className="text-xs text-gray-400">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      <Link to={project.link} className="block">
                        <button className="premium-button w-full text-xs px-1 py-0.5">
                          Explorar Projeto
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* eBooks Disponíveis */}
                <div>
                  <h3 className="text-xs font-bold text-premium mb-1">eBooks Disponíveis</h3>
                  <p className="text-xs text-gray-300 mb-1">
                    Recursos educacionais da NOA Esperanza
                  </p>
                </div>

                <div className="space-y-1">
                  {/* eBook Principal */}
                  <div className="premium-card p-1.5 text-center">
                    <h3 className="text-xs font-bold mb-0.5">Seminário Setembro 2025</h3>
                    <p className="italic text-xs mb-1">Saúde Espectral</p>
                    <p className="text-xs text-gray-300 mb-1">
                      Análise de critérios diagnósticos em nefrologia e neurologia, e o uso da cannabis medicinal na prática clínica.
                    </p>
                    <button className="premium-button text-xs px-1 py-0.5 w-full">📕 Baixar eBook</button>
                  </div>

                  {/* Outros eBooks */}
                  <div className="premium-card p-1.5 text-center">
                    <h3 className="text-xs font-bold mb-0.5">AEC Fundamentos</h3>
                    <p className="text-xs text-gray-300 mb-1">
                      Guia completo da metodologia Arte da Entrevista Clínica.
                    </p>
                    <button className="premium-button text-xs px-1 py-0.5 w-full">📖 Baixar eBook</button>
                  </div>

                  <div className="premium-card p-1.5 text-center">
                    <h3 className="text-xs font-bold mb-0.5">Cannabis Medicinal</h3>
                    <p className="text-xs text-gray-300 mb-1">
                      Protocolos e aplicações da cannabis medicinal em nefrologia.
                    </p>
                    <button className="premium-button text-xs px-1 py-0.5 w-full">🌿 Baixar eBook</button>
                  </div>

                  <div className="premium-card p-1.5 text-center">
                    <h3 className="text-xs font-bold mb-0.5">Nefrologia Clínica</h3>
                    <p className="text-xs text-gray-300 mb-1">
                      Casos clínicos e abordagens em nefrologia.
                    </p>
                    <button className="premium-button text-xs px-1 py-0.5 w-full">🩺 Baixar eBook</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1">
              {/* Hero Section */}
              <section className="mb-3">
                <div className="text-center mb-2">
                  <h1 className="text-sm font-bold mb-1 text-premium">
                    Laboratório de Performance em Entrevista Clínica
                  </h1>
                  <p className="text-xs text-gray-300 leading-tight">
                    Projetos inovadores que aplicam a metodologia AEC em diferentes contextos,
                    desde pesquisa aplicada até intervenções comunitárias globais.
                  </p>
                </div>
              </section>

              {/* Funcionalidades da Página */}
              <section className="mb-2">
                <div className="grid md:grid-cols-2 gap-1 mb-2">
                  {/* Ações Rápidas */}
                  <div className="premium-card p-1">
                    <h3 className="text-xs font-bold text-premium mb-1 flex items-center gap-1">
                      <i className="fas fa-bolt text-yellow-400"></i>
                      Ações Rápidas
                    </h3>
                    <div className="space-y-0.5">
                      <button className="premium-button w-full text-xs px-1 py-0.5 text-left">
                        <i className="fas fa-video mr-1"></i>
                        Participar do LabPEC
                      </button>
                      <button className="premium-button w-full text-xs px-1 py-0.5 text-left">
                        <i className="fas fa-download mr-1"></i>
                        Baixar Materiais
                      </button>
                      <button className="premium-button w-full text-xs px-1 py-0.5 text-left">
                        <i className="fas fa-calendar mr-1"></i>
                        Próximos Eventos
                      </button>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="premium-card p-1">
                    <h3 className="text-xs font-bold text-premium mb-1 flex items-center gap-1">
                      <i className="fas fa-chart-bar text-green-400"></i>
                      Estatísticas
                    </h3>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-center">
                        <div className="text-sm font-bold text-premium">1.2K+</div>
                        <div className="text-xs text-gray-400">Pacientes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-premium">45+</div>
                        <div className="text-xs text-gray-400">Profissionais</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-premium">12</div>
                        <div className="text-xs text-gray-400">Comunidades</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-premium">3</div>
                        <div className="text-xs text-gray-400">Cidades</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recursos e Ferramentas */}
                <div className="premium-card p-1 mb-2">
                  <h3 className="text-xs font-bold text-premium mb-1 flex items-center gap-1">
                    <i className="fas fa-tools text-blue-400"></i>
                    Recursos e Ferramentas
                  </h3>
                  <div className="grid md:grid-cols-3 gap-1">
                    <button 
                      onClick={handleGravação}
                      className="group hover:bg-gray-800 transition-all duration-300 p-1 rounded"
                    >
                      <div className="w-6 h-6 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-0.5 group-hover:bg-opacity-30 transition-all">
                        <i className="fas fa-microphone text-blue-400 text-xs"></i>
                      </div>
                      <h4 className="text-xs font-semibold text-premium group-hover:text-green-400 transition-colors">Gravação</h4>
                      <p className="text-xs text-gray-400">Sessões gravadas</p>
                    </button>
                    <button 
                      onClick={handleAnálise}
                      className="group hover:bg-gray-800 transition-all duration-300 p-1 rounded"
                    >
                      <div className="w-6 h-6 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-0.5 group-hover:bg-opacity-30 transition-all">
                        <i className="fas fa-chart-line text-green-400 text-xs"></i>
                      </div>
                      <h4 className="text-xs font-semibold text-premium group-hover:text-green-400 transition-colors">Análise</h4>
                      <p className="text-xs text-gray-400">Feedback detalhado</p>
                    </button>
                    <button 
                      onClick={handleColaboração}
                      className="group hover:bg-gray-800 transition-all duration-300 p-1 rounded"
                    >
                      <div className="w-6 h-6 bg-purple-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-0.5 group-hover:bg-opacity-30 transition-all">
                        <i className="fas fa-users text-purple-400 text-xs"></i>
                      </div>
                      <h4 className="text-xs font-semibold text-premium group-hover:text-green-400 transition-colors">Colaboração</h4>
                      <p className="text-xs text-gray-400">Trabalho em equipe</p>
                    </button>
                  </div>
                </div>
              </section>

              {/* LabPEC */}
              <section className="mb-1">
                <div className="premium-card p-0.5">
                  <h3 className="text-xs font-semibold text-center mb-0.5 text-premium">
                    LabPEC - Laboratório de Prática Clínica
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="flex items-start gap-0.5">
                      <Brain className="w-1.5 h-1.5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-semibold text-premium">O que acontece:</span>
                        <p className="text-xs text-gray-300">Role-playing clínico, análise triaxial.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-0.5">
                      <Target className="w-1.5 h-1.5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-semibold text-premium">Por que participar:</span>
                        <p className="text-xs text-gray-300">Treinamento em habilidades.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-0.5">
                      <Users className="w-1.5 h-1.5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-semibold text-premium">Para quem:</span>
                        <p className="text-xs text-gray-300">Estudantes e profissionais.</p>
                      </div>
                      </div>

                    <div className="flex items-start gap-0.5">
                      <Cpu className="w-1.5 h-1.5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-semibold text-premium">Como funciona:</span>
                        <p className="text-xs text-gray-300">💻 Aulas às 21h • 🧾 Casos • 📊 Análise</p>
                      </div>
                    </div>
                  </div>
              </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Pesquisa;