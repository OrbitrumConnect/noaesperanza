import { useEffect } from "react";
import { Helmet } from "../components/Helmet";
import { useToast } from "../hooks/use-toast";
import { useIsClient } from "../hooks/useIsClient";
import Header from "../components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
// import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import {
  Brain,
  Stethoscope,
  Cpu,
  Building2,
  GraduationCap,
  Target,
  Activity,
  Database,
  FlaskConical,
  Heart,
  Shield,
  TrendingUp,
  BookOpen,
  Microscope,
  Users
} from "lucide-react";

const MedCannLab = () => {
  const { toast } = useToast();
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;

    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("message");

    if (message === "auth_success") {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo à plataforma Nôa Esperanza."
      });
    }
  }, [toast, isClient]);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }


  const researchAreas = [
    {
      title: "Escuta Clínica Nefrológica",
      description: "Análise simbólica com foco em função renal e cannabis",
      icon: Stethoscope,
      progress: 85,
      details: [
        "Protocolos de avaliação renal integrada",
        "Correlação entre sintomas e estágios CKD",
        "Impacto da cannabis na qualidade de vida",
      ],
    },
    {
      title: "Classificação por Estágios Renais",
      description: "Estratificação de usuários conforme função renal",
      icon: Target,
      progress: 78,
      details: [
        "Algoritmos de classificação automática",
        "Marcadores semiológicos específicos",
        "Integração com exames laboratoriais",
      ],
    },
    {
      title: "Deep Learning Biomarcadores",
      description: "IA para análise de marcadores de função renal",
      icon: Brain,
      progress: 92,
      details: [
        "Análise de creatinina e eGFR",
        "Predição de progressão da doença",
        "Otimização de dosagens",
      ],
    },
    {
      title: "Integração Dispositivos Médicos",
      description: "Conectividade com equipamentos de monitoramento",
      icon: Cpu,
      progress: 65,
      details: [
        "Sincronização com monitores de pressão",
        "Integração com balanças inteligentes",
        "Alertas automáticos de risco",
      ],
    },
  ];

  const methodologies = [
    {
      title: "Metodologia AEC",
      description: "Arte da Entrevista Clínica aplicada à cannabis medicinal",
      icon: Heart,
      features: [
        "Escuta ativa e humanizada",
        "Análise triaxial da consulta",
        "Protocolos de prescrição baseados em evidência",
      ],
    },
    {
      title: "Pesquisa Clínica",
      description: "Estudos controlados e observacionais",
      icon: Microscope,
      features: [
        "Ensaios clínicos randomizados",
        "Estudos de coorte prospectivos",
        "Análise de dados em tempo real",
      ],
    },
    {
      title: "Tecnologia Avançada",
      description: "IA e machine learning para análise de dados",
      icon: Database,
      features: [
        "Algoritmos de predição",
        "Análise de padrões clínicos",
        "Otimização de tratamentos",
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>MedCann Lab - Cannabis Medicinal & Nefrologia | Nôa Esperanza</title>
        <meta
          name="description"
          content="Integração pioneira da cannabis medicinal com nefrologia e neurologia, aplicada pela metodologia AEC para transformar o cuidado em saúde."
        />
        <meta
          name="keywords"
          content="cannabis medicinal, nefrologia, neurologia, metodologia AEC, pesquisa médica, inovação saúde"
        />
        <link rel="canonical" href={`${window.location.origin}/medcann-lab`} />
      </Helmet>

      <div className="min-h-screen premium-background">
        <Header currentSpecialty="cannabis" setCurrentSpecialty={() => {}} />
        <main>
          {/* Layout Principal com Sidebar */}
          <div className="flex gap-4 py-1 px-4">
            {/* Sidebar de Áreas de Pesquisa */}
            <div className="w-72 flex-shrink-0">
              <div className="premium-card p-2 sticky top-4 h-[calc(100vh-8rem)] overflow-y-auto z-10">
                <div className="mb-2">
                  <h2 className="text-xs font-bold mb-0.5 text-premium">
                    Áreas de Pesquisa
                  </h2>
                  <p className="text-xs text-gray-300">
                    Focos de investigação do MedCann Lab
                  </p>
                </div>

                <div className="space-y-1">
                  {researchAreas.map((area, index) => (
                    <div key={index} className="premium-card p-1 group hover:bg-gray-800 transition-all duration-300">
                      <div className="flex items-start space-x-1 mb-1">
                        <div className="p-0.5 rounded bg-gradient-to-r from-green-500 to-blue-500 text-white flex-shrink-0">
                          <area.icon className="w-2 h-2" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-premium group-hover:text-green-400 transition-colors mb-0.5">
                            {area.title}
                          </h3>
                          <p className="text-xs text-gray-400 mb-0.5">
                            {area.description}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-1">
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-gray-400">Progresso</span>
                          <span className="text-premium font-bold">{area.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-0.5">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-0.5 rounded-full transition-all duration-300"
                            style={{ width: `${area.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Características */}
                      <div className="space-y-0.5">
                        {area.details.slice(0, 2).map((detail, idx) => (
                          <div key={idx} className="flex items-center text-xs text-gray-300">
                            <div className="w-0.5 h-0.5 bg-green-400 rounded-full mr-1 flex-shrink-0" />
                            <span className="line-clamp-1">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1">
              {/* Hero Section */}
              <section className="mb-3">
                <div className="text-center mb-2">
                  <h1 className="text-sm font-bold mb-1 text-premium">
                    Cannabis Medicinal & Nefrologia
                  </h1>
                  <p className="text-xs text-gray-300 leading-tight">
                    Integração pioneira da cannabis medicinal com nefrologia e neurologia, 
                    aplicada pela metodologia Arte da Entrevista Clínica.
                  </p>
                </div>
              </section>

              {/* Metodologias Integradas */}
              <section className="mb-2">
                <div className="text-center mb-1">
                  <h2 className="text-xs font-bold text-premium mb-0.5">
                    Metodologias Integradas
                  </h2>
                  <p className="text-xs text-gray-300 leading-tight">
                    Abordagens metodológicas aplicadas na pesquisa
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-1">
                  {methodologies.map((method, index) => (
                    <div key={index} className="premium-card p-1 group hover:bg-gray-800 transition-all duration-300">
                      <div className="flex items-start space-x-1 mb-1">
                        <div className="p-0.5 rounded bg-gradient-to-r from-green-500 to-blue-500 text-white flex-shrink-0">
                          <method.icon className="w-2 h-2" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-premium group-hover:text-green-400 transition-colors mb-0.5">
                            {method.title}
                          </h3>
                          <p className="text-xs text-gray-400 mb-0.5">
                            {method.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        {method.features.slice(0, 2).map((feature, idx) => (
                          <div key={idx} className="flex items-center text-xs text-gray-300">
                            <div className="w-0.5 h-0.5 bg-green-400 rounded-full mr-1 flex-shrink-0" />
                            <span className="line-clamp-1">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Call to Action */}
              <section className="mb-1">
                <div className="premium-card p-1 text-center">
                  <h3 className="text-xs font-bold mb-1 text-premium">Participe da Pesquisa</h3>
                  <p className="text-xs text-gray-300 mb-2">
                    Seja parte desta revolução no cuidado em saúde. Participe de nossos 
                    estudos e contribua para o avanço da cannabis medicinal na nefrologia.
                  </p>
                  <div className="flex gap-1 justify-center">
                    <button className="premium-button text-xs px-1 py-0.5">
                      <BookOpen className="w-2 h-2 mr-0.5" />
                      Saiba Mais
                    </button>
                    <button className="premium-button text-xs px-1 py-0.5">
                      <Users className="w-2 h-2 mr-0.5" />
                      Participar
                    </button>
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

export default MedCannLab;
