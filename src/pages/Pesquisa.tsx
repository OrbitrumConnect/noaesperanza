import { useEffect } from "react";
import { Helmet } from "../components/Helmet";
import { useToast } from "../hooks/use-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";
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

      <div className="min-h-screen bg-background text-foreground">
        <Header currentSpecialty="rim" setCurrentSpecialty={() => {}} />
        <main>
          {/* Hero Section para Pesquisa */}
          <section className="py-16 px-6">
            <div className="container mx-auto max-w-7xl grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                  Laboratório de Performance em Entrevista Clínica
                </h1>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Projetos inovadores que aplicam a metodologia AEC em diferentes contextos,
                  desde pesquisa aplicada até intervenções comunitárias globais. Integração de
                  <strong> Deep Learning </strong> e <strong> NLP </strong> para saúde humanizada.
                </p>
              </div>
              <div className="flex justify-center">
                <img
                  src="/logo-noa-triangulo.gif"
                  alt="Logo Nôa Esperanza Pesquisa"
                  className="w-64 h-64 object-contain"
                />
              </div>
            </div>
          </section>

          {/* Banner do Seminário */}
          <section className="bg-secondary text-center py-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Seminário Setembro 2025</h2>
            <p className="italic text-lg mb-4">Saúde Espectral</p>
            <p className="max-w-4xl mx-auto text-muted-foreground px-4">
              Análise de critérios diagnósticos em nefrologia e neurologia, e o uso da cannabis medicinal na prática clínica. Um olhar expandido pela metodologia da Arte da Entrevista Clínica.
            </p>
            <div className="mt-6">
              <Button variant="default">📕 Baixar eBook do Seminário</Button>
            </div>
          </section>

          {/* Descrição LabPEC destacada */}
          <section className="py-16 px-6">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-xl font-semibold text-center mb-8">
                No LabPEC, a metodologia da Arte da Entrevista Clínica ganha corpo em encontros ao vivo, simulados e analisados com profundidade. Aqui, a escuta clínica é treinada com rigor e sensibilidade, em situações reais da prática médica.
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      O que acontece no LabPEC?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li><strong>Role-playing clínico realista:</strong> consultas encenadas por duplas com base em casos clínicos reais.</li>
                      <li><strong>Análise triaxial da consulta:</strong> diferentes perspectivas entre entrevistador, paciente e professor.</li>
                      <li><strong>Gravação e revisão técnica:</strong> análise em grupo da comunicação clínica e não-verbal.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      Por que participar?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Treinamento intensivo em habilidades comunicacionais</li>
                      <li>Aplicação prática dos conceitos da AEC</li>
                      <li>Feedback direto e individualizado</li>
                      <li>Prática segura, com supervisão ativa</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Para quem?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Estudantes de Medicina e Saúde</li>
                      <li>Profissionais em formação continuada</li>
                      <li>Equipes de pesquisa aplicando a metodologia</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-10 bg-muted">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-blue-600" />
                    Como funciona?
                  </h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>💻 Aulas ao vivo via Zoom às 21h</li>
                    <li>🧾 Casos clínicos alinhados ao tema da aula</li>
                    <li>👩‍⚕️ Dupla de alunos selecionada na hora</li>
                    <li>⏱️ Exercícios com até 3 rodadas por noite</li>
                    <li>📊 Análise final orientada por Dr. Ricardo Valença</li>
                  </ul>
                  <p className="mt-4 text-sm text-muted-foreground">
                    O LabPEC integra o eixo formativo da plataforma Nôa Esperanza, articulando ensino, clínica e pesquisa.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Cards de Projetos */}
          <section className="py-20 px-4 bg-background">
            <div className="container mx-auto max-w-7xl">
              {/* Cabeçalho da seção */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full px-4 py-2 mb-6">
                  <span className="text-white font-medium text-sm">
                    Projetos de Aplicação AEC
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Aplicações da Arte da{" "}
                  <span className="text-primary block">Entrevista Clínica</span>
                </h2>

                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Projetos inovadores que aplicam a metodologia AEC em diferentes
                  contextos, desde pesquisa aplicada até intervenções comunitárias
                  globais.
                </p>
              </div>

              {/* Cards */}
              <div className="grid md:grid-cols-2 gap-8">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="group hover:shadow-xl transition-all duration-500 border hover:border-primary/50 overflow-hidden"
                  >
                    <div className={`h-2 bg-gradient-to-r ${project.color}`} />

                    <CardHeader className="pb-4">
                      <div className="flex items-start space-x-3 mb-3">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-r ${project.color} text-white`}
                        >
                          <project.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl text-foreground group-hover:text-primary transition-colors">
                            {project.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground font-medium">
                            {project.subtitle}
                          </p>
                        </div>
                      </div>

                      <p className="text-muted-foreground leading-relaxed">
                        {project.description}
                      </p>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {project.stats.map((stat, index) => (
                          <div key={index} className="text-center">
                            <stat.icon className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                            <div className="text-lg font-bold text-foreground">{stat.value}</div>
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold text-foreground mb-3">
                          Características Principais
                        </h4>
                        <ul className="space-y-2">
                          {project.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-center text-sm text-muted-foreground"
                            >
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex">
                        <Link to={project.link} className="flex-1">
                          <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            Explorar Projeto
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Pesquisa;
