import { useEffect } from "react";
import { Helmet } from "../components/Helmet";
import { useToast } from "../hooks/use-toast";
import { useIsClient } from "../hooks/useIsClient";
import Header from "../components/Header";
import Footer from "../components/Footer";
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

      <div className="min-h-screen bg-background text-foreground">
        <Header currentSpecialty="cannabis" setCurrentSpecialty={() => {}} />
        <main className="py-8 px-4 bg-gradient-to-br from-background via-muted/10 to-background">
          <div className="container mx-auto max-w-6xl">
            {/* Hero Section Compacto */}
            <section className="text-center mb-6">
              <h1 className="text-xl md:text-2xl font-bold mb-3 bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text">
                Cannabis Medicinal & Nefrologia
              </h1>
              
              <p className="text-xs text-muted-foreground max-w-xl mx-auto mb-6">
                Integração pioneira da cannabis medicinal com nefrologia e neurologia, 
                aplicada pela metodologia Arte da Entrevista Clínica.
              </p>
            </section>

            {/* Conteúdo Principal em Grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Research Areas - Lado Esquerdo */}
              <section>
                <h2 className="text-lg font-bold mb-4 text-center">Áreas de Pesquisa</h2>
                <div className="grid gap-3">
                  {researchAreas.map((area, index) => (
                    <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-2">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white flex-shrink-0">
                            <area.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm mb-1">{area.title}</CardTitle>
                            <CardDescription className="text-xs">{area.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progresso</span>
                              <span>{area.progress}%</span>
                            </div>
                            <Progress value={area.progress} className="h-1" />
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-1 text-xs">Características:</h4>
                            <ul className="space-y-0.5">
                              {area.details.map((detail, idx) => (
                                <li key={idx} className="flex items-center text-xs text-muted-foreground">
                                  <div className="w-1 h-1 bg-green-500 rounded-full mr-1 flex-shrink-0" />
                                  <span className="truncate">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Methodologies - Lado Direito */}
              <section>
                <h2 className="text-lg font-bold mb-4 text-center">Metodologias Integradas</h2>
                <div className="grid gap-3">
                  {methodologies.map((method, index) => (
                    <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-2">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <method.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm mb-1">{method.title}</CardTitle>
                            <CardDescription className="text-xs">{method.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <ul className="space-y-1">
                          {method.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center text-xs text-muted-foreground">
                              <div className="w-1 h-1 bg-green-500 rounded-full mr-2 flex-shrink-0" />
                              <span className="truncate">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>

            {/* Call to Action Compacto */}
            <section className="text-center">
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="pt-3 pb-3">
                  <h3 className="text-sm font-bold mb-2">Participe da Pesquisa</h3>
                  <p className="text-xs text-muted-foreground mb-3 max-w-lg mx-auto">
                    Seja parte desta revolução no cuidado em saúde. Participe de nossos 
                    estudos e contribua para o avanço da cannabis medicinal na nefrologia.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                      <BookOpen className="w-3 h-3 mr-1" />
                      Saiba Mais
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      Participar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default MedCannLab;
