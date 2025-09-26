import { useEffect } from "react";
import { Helmet } from "../components/Helmet";
import { useToast } from "../hooks/use-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useIsClient } from '../hooks/useIsClient';
import { GraduationCap, BookOpen, Users, Award, Play, Clock, Star } from "lucide-react";

const Ensino = () => {
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

  const cursos = [
    {
      id: "aec-fundamentos",
      title: "Fundamentos da Arte da Entrevista Clínica",
      description: "Aprenda os princípios básicos da metodologia AEC para uma comunicação clínica humanizada e eficaz.",
      duration: "8 horas",
      level: "Iniciante",
      rating: 4.9,
      students: 1250,
      price: "R$ 297",
      features: [
        "Metodologia triaxial de escuta",
        "Técnicas de comunicação não-verbal",
        "Exercícios práticos com role-playing",
        "Certificado de conclusão"
      ],
      image: "/curso-aec-fundamentos.jpg"
    },
    {
      id: "aec-avancado",
      title: "AEC Avançado: Casos Complexos",
      description: "Aprofunde-se na aplicação da AEC em casos clínicos complexos e situações desafiadoras.",
      duration: "12 horas",
      level: "Avançado",
      rating: 4.8,
      students: 890,
      price: "R$ 497",
      features: [
        "Análise de casos complexos",
        "Técnicas avançadas de escuta",
        "Gestão de situações difíceis",
        "Supervisão clínica"
      ],
      image: "/curso-aec-avancado.jpg"
    },
    {
      id: "aec-nefrologia",
      title: "AEC em Nefrologia",
      description: "Aplicação específica da metodologia AEC no cuidado de pacientes nefrológicos.",
      duration: "6 horas",
      level: "Intermediário",
      rating: 4.9,
      students: 650,
      price: "R$ 397",
      features: [
        "Comunicação em nefrologia",
        "Cuidado com pacientes crônicos",
        "Família e suporte emocional",
        "Protocolos específicos"
      ],
      image: "/curso-aec-nefrologia.jpg"
    },
    {
      id: "aec-cannabis",
      title: "AEC e Cannabis Medicinal",
      description: "Metodologia AEC aplicada ao cuidado de pacientes em tratamento com cannabis medicinal.",
      duration: "4 horas",
      level: "Intermediário",
      rating: 4.7,
      students: 420,
      price: "R$ 297",
      features: [
        "Comunicação sobre cannabis medicinal",
        "Gestão de expectativas",
        "Acompanhamento terapêutico",
        "Casos práticos"
      ],
      image: "/curso-aec-cannabis.jpg"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Ensino - Arte da Entrevista Clínica | Nôa Esperanza</title>
        <meta
          name="description"
          content="Aprenda a Arte da Entrevista Clínica com metodologia revolucionária. Formação humanizada em saúde e projetos aplicados."
        />
        <meta
          name="keywords"
          content="ensino medicina, arte entrevista clínica, formação médica, curso medicina, metodologia triaxial, escuta clínica"
        />
        <link rel="canonical" href={`${window.location.origin}/ensino`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header currentSpecialty="rim" setCurrentSpecialty={() => {}} />
        <main>
          {/* Hero Section */}
          <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto max-w-7xl">
              <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  Arte da Entrevista Clínica
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  A metodologia revolucionária que transforma a comunicação clínica através da escuta humanizada e técnicas avançadas de entrevista.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Formação Especializada</h3>
                  <p className="text-muted-foreground">Cursos desenvolvidos por especialistas em comunicação clínica</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Metodologia Triaxial</h3>
                  <p className="text-muted-foreground">Abordagem única que considera paciente, profissional e contexto</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Certificação</h3>
                  <p className="text-muted-foreground">Certificados reconhecidos para desenvolvimento profissional</p>
                </div>
              </div>
            </div>
          </section>

          {/* Cursos Section */}
          <section className="py-20 px-6">
            <div className="container mx-auto max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Cursos Disponíveis
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Escolha o curso que melhor se adapta ao seu nível e área de interesse
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                {cursos.map((curso) => (
                  <Card key={curso.id} className="group hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <CardTitle className="text-xl mb-2">{curso.title}</CardTitle>
                          <p className="text-muted-foreground">{curso.description}</p>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          {curso.level}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {curso.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {curso.rating}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {curso.students} alunos
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold">O que você vai aprender:</h4>
                          <ul className="space-y-1">
                            {curso.features.map((feature, index) => (
                              <li key={index} className="flex items-center text-sm text-muted-foreground">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-2xl font-bold text-blue-600">
                            {curso.price}
                          </div>
                          <Button className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Play className="w-4 h-4 mr-2" />
                            Começar Curso
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* LabPEC Section */}
          <section className="py-20 px-6 bg-muted/50">
            <div className="container mx-auto max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  LabPEC - Laboratório de Performance em Entrevista Clínica
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Prática supervisionada com role-playing realista e análise triaxial
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      O que acontece no LabPEC?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2" />
                        <span><strong>Role-playing clínico realista:</strong> consultas encenadas por duplas com base em casos clínicos reais</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2" />
                        <span><strong>Análise triaxial da consulta:</strong> diferentes perspectivas entre entrevistador, paciente e professor</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2" />
                        <span><strong>Gravação e revisão técnica:</strong> análise em grupo da comunicação clínica e não-verbal</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-600" />
                      Por que participar?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-2" />
                        <span>Treinamento intensivo em habilidades comunicacionais</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-2" />
                        <span>Aplicação prática dos conceitos da AEC</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-2" />
                        <span>Feedback direto e individualizado</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-2" />
                        <span>Prática segura, com supervisão ativa</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Como funciona?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 mt-2" />
                        <span>💻 Aulas ao vivo via Zoom às 21h</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 mt-2" />
                        <span>🧾 Casos clínicos alinhados ao tema da aula</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 mt-2" />
                        <span>👩‍⚕️ Dupla de alunos selecionada na hora</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 mt-2" />
                        <span>⏱️ Exercícios com até 3 rodadas por noite</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 mt-2" />
                        <span>📊 Análise final orientada por Dr. Ricardo Valença</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-12">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Play className="w-5 h-5 mr-2" />
                  Inscrever-se no LabPEC
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Ensino;
