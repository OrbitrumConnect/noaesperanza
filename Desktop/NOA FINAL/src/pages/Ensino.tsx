import { useEffect, useState } from "react";
import { Helmet } from "../components/Helmet";
import { useToast } from "../hooks/use-toast";
import Header from "../components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useIsClient } from '../hooks/useIsClient';
import { GraduationCap, BookOpen, Users, Award, Play, Clock, Star, X, CheckCircle } from "lucide-react";
import GPTPBuilder from "../components/GPTPBuilder";
import { useAuth } from "../contexts/AuthContext";

const Ensino = () => {
  const isClient = useIsClient();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, userProfile } = useAuth();
  const builderUserId = user?.id || 'noa-aluno-guest';
  const builderUserName = userProfile?.name || user?.email || 'Aluno Nôa';

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

  const openCourseModal = (curso: any) => {
    setSelectedCourse(curso);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

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
      modules: [
        {
          id: 1,
          title: "Introdução à AEC",
          duration: "2h",
          lessons: ["Conceitos fundamentais", "Histórico da metodologia", "Aplicações práticas"]
        },
        {
          id: 2,
          title: "Técnicas de Escuta",
          duration: "3h",
          lessons: ["Escuta ativa", "Comunicação não-verbal", "Empatia clínica"]
        },
        {
          id: 3,
          title: "Prática Supervisionada",
          duration: "3h",
          lessons: ["Role-playing", "Feedback individualizado", "Casos clínicos"]
        }
      ],
      instructor: "Dr. Ricardo Valença",
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
      modules: [
        {
          id: 1,
          title: "Análise de Casos Complexos",
          duration: "4h",
          lessons: ["Identificação de padrões", "Análise comportamental", "Estratégias de abordagem"]
        },
        {
          id: 2,
          title: "Comunicação em Situações Difíceis",
          duration: "4h",
          lessons: ["Pacientes resistentes", "Famílias em conflito", "Crises emocionais"]
        },
        {
          id: 3,
          title: "Prática Avançada",
          duration: "4h",
          lessons: ["Simulações complexas", "Feedback especializado", "Desenvolvimento de habilidades"]
        }
      ],
      instructor: "Dr. Ricardo Valença",
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
      modules: [
        {
          id: 1,
          title: "Fundamentos da Nefrologia",
          duration: "2h",
          lessons: ["Anatomia renal", "Fisiopatologia", "Exames complementares"]
        },
        {
          id: 2,
          title: "Comunicação com Pacientes Nefrológicos",
          duration: "2h",
          lessons: ["Diálise e transplante", "Acompanhamento familiar", "Cuidados paliativos"]
        },
        {
          id: 3,
          title: "Casos Clínicos Específicos",
          duration: "2h",
          lessons: ["Insuficiência renal", "Hipertensão", "Doenças glomerulares"]
        }
      ],
      instructor: "Dr. Ricardo Valença",
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
      modules: [
        {
          id: 1,
          title: "Fundamentos da Cannabis Medicinal",
          duration: "1.5h",
          lessons: ["Endocanabinoides", "Indicações terapêuticas", "Legislação"]
        },
        {
          id: 2,
          title: "Comunicação com Pacientes",
          duration: "1.5h",
          lessons: ["Expectativas e medos", "Acompanhamento familiar", "Efeitos colaterais"]
        },
        {
          id: 3,
          title: "Casos Práticos",
          duration: "1h",
          lessons: ["Dosagem e ajustes", "Interações medicamentosas", "Monitoramento"]
        }
      ],
      instructor: "Dr. Ricardo Valença",
      image: "/curso-aec-cannabis.jpg"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Ensino e Formação Médica | NOA Esperanza</title>
        <meta
          name="description"
          content="Formação especializada em neurologia, cannabis medicinal e nefrologia. Cursos e laboratórios de prática clínica com metodologia avançada."
        />
        <meta
          name="keywords"
          content="ensino medicina, neurologia, cannabis medicinal, nefrologia, formação médica, curso medicina, metodologia triaxial"
        />
        <link rel="canonical" href={`${window.location.origin}/ensino`} />
      </Helmet>

      <div className="min-h-screen premium-background">
        <Header currentSpecialty="rim" setCurrentSpecialty={() => {}} />
        <main>
          <section className="px-4">
            <div className="rounded-3xl border border-white/10 bg-black/40 shadow-xl backdrop-blur">
              <GPTPBuilder userId={builderUserId} userName={builderUserName} userType="aluno" />
            </div>
          </section>

          <div className="flex gap-4 py-3 px-4">
      {/* Sidebar com Cursos */}
      <div className="w-72 flex-shrink-0">
        <div className="premium-card p-2 sticky top-4 h-[calc(100vh-8rem)] overflow-y-auto z-10">
                <div className="mb-2">
                  <h2 className="text-xs font-bold mb-0.5 text-premium">
                    Cursos Disponíveis
                  </h2>
                  <p className="text-xs text-gray-300">
                    Formação nas especialidades da NOA Esperanza
                  </p>
                </div>

                <div className="space-y-1">
            {cursos.slice(0, 4).map((curso) => (
              <div 
                key={curso.id} 
                className="premium-card p-1 group hover:bg-gray-800 transition-all duration-300 cursor-pointer"
                onClick={() => openCourseModal(curso)}
              >
                <div className="flex items-start justify-between mb-0.5">
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold mb-0.5 text-premium leading-tight">{curso.title}</h3>
                    <p className="text-xs text-gray-400 mb-0.5 leading-tight line-clamp-2">{curso.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-1 text-xs px-1 py-0">
                    {curso.level}
                  </Badge>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <div className="flex items-center gap-0.5">
                      <Clock className="w-1.5 h-1.5" />
                      {curso.duration}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-1.5 h-1.5 text-yellow-400" />
                      {curso.rating}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-0.5 border-t border-gray-700">
                    <div className="text-xs font-bold text-yellow-400">
                      {curso.price}
                    </div>
                    <button 
                      className="premium-button text-xs px-1 py-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Aqui você pode adicionar lógica para iniciar o curso
                      }}
                    >
                      <Play className="w-1.5 h-1.5 mr-0.5" />
                      Iniciar
                    </button>
                  </div>
                </div>
              </div>
            ))}
                </div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1">
              {/* Hero Section */}
              <section className="mb-4">
                <div className="text-center mb-3">
                  <h1 className="text-lg md:text-xl font-bold mb-1 text-premium">
                    Ensino e Formação Médica
                  </h1>
                  <p className="text-xs text-gray-300 max-w-md mx-auto">
                    Formação especializada em neurologia, cannabis medicinal e nefrologia.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-2 mb-3">
                  <div className="premium-card p-1.5 text-center">
                    <div className="w-6 h-6 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-1">
                      <GraduationCap className="w-3 h-3 text-blue-400" />
                    </div>
                    <h3 className="text-xs font-semibold mb-0.5 text-premium">Formação Especializada</h3>
                    <p className="text-xs text-gray-400">Cursos especializados</p>
                  </div>
                  <div className="premium-card p-1.5 text-center">
                    <div className="w-6 h-6 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-1">
                      <Users className="w-3 h-3 text-green-400" />
                    </div>
                    <h3 className="text-xs font-semibold mb-0.5 text-premium">Metodologia Triaxial</h3>
                    <p className="text-xs text-gray-400">Abordagem completa</p>
                  </div>
                  <div className="premium-card p-1.5 text-center">
                    <div className="w-6 h-6 bg-yellow-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-1">
                      <Award className="w-3 h-3 text-yellow-400" />
                    </div>
                    <h3 className="text-xs font-semibold mb-0.5 text-premium">Certificação</h3>
                    <p className="text-xs text-gray-400">Certificados reconhecidos</p>
                  </div>
                </div>
              </section>

              {/* LabPEC Section */}
              <section className="mb-4">
                <div className="text-center mb-3">
                  <h2 className="text-base md:text-lg font-bold mb-1 text-premium">
                    Laboratório de Prática Clínica
                  </h2>
                  <p className="text-xs text-gray-300 max-w-md mx-auto">
                    Prática supervisionada com role-playing e análise triaxial
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-2">
                  <div className="premium-card p-1.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      <BookOpen className="w-2.5 h-2.5 text-blue-400" />
                      <h3 className="text-xs font-semibold text-premium">O que acontece?</h3>
                    </div>
                    <ul className="space-y-0.5 text-xs text-gray-400">
                      <li className="flex items-start">
                        <div className="w-0.5 h-0.5 bg-blue-400 rounded-full mr-1 mt-1.5" />
                        <span>Role-playing clínico</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-0.5 h-0.5 bg-blue-400 rounded-full mr-1 mt-1.5" />
                        <span>Análise triaxial</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-0.5 h-0.5 bg-blue-400 rounded-full mr-1 mt-1.5" />
                        <span>Gravação e revisão</span>
                      </li>
                    </ul>
                  </div>

                  <div className="premium-card p-1.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Award className="w-2.5 h-2.5 text-green-400" />
                      <h3 className="text-xs font-semibold text-premium">Por que participar?</h3>
                    </div>
                    <ul className="space-y-0.5 text-xs text-gray-400">
                      <li className="flex items-start">
                        <div className="w-0.5 h-0.5 bg-green-400 rounded-full mr-1 mt-1.5" />
                        <span>Treinamento em comunicação</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-0.5 h-0.5 bg-green-400 rounded-full mr-1 mt-1.5" />
                        <span>Aplicação prática</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-0.5 h-0.5 bg-green-400 rounded-full mr-1 mt-1.5" />
                        <span>Feedback individualizado</span>
                      </li>
                    </ul>
                  </div>

                  <div className="premium-card p-1.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Users className="w-2.5 h-2.5 text-yellow-400" />
                      <h3 className="text-xs font-semibold text-premium">Como funciona?</h3>
                    </div>
                    <ul className="space-y-0.5 text-xs text-gray-400">
                      <li className="flex items-start">
                        <div className="w-0.5 h-0.5 bg-yellow-400 rounded-full mr-1 mt-1.5" />
                        <span>Aulas ao vivo às 21h</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-0.5 h-0.5 bg-yellow-400 rounded-full mr-1 mt-1.5" />
                        <span>Casos clínicos</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-0.5 h-0.5 bg-yellow-400 rounded-full mr-1 mt-1.5" />
                        <span>Análise por Dr. Valença</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="text-center mt-3">
                  <button className="premium-button px-2 py-0.5 text-xs">
                    <Play className="w-2.5 h-2.5 mr-0.5" />
                    Inscrever-se
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Modal do Curso */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1">
          <div className="bg-gray-900 rounded-lg max-w-xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-2 flex justify-between items-center">
              <h2 className="text-base font-bold text-premium">{selectedCourse.title}</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3">
              {/* Informações do Curso */}
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-300 mb-2">{selectedCourse.description}</p>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-blue-400" />
                      <span className="text-xs text-gray-300">Duração: {selectedCourse.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 text-yellow-400" />
                      <span className="text-xs text-gray-300">Avaliação: {selectedCourse.rating}/5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-2.5 h-2.5 text-green-400" />
                      <span className="text-xs text-gray-300">{selectedCourse.students} alunos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-2.5 h-2.5 text-purple-400" />
                      <span className="text-xs text-gray-300">Instrutor: {selectedCourse.instructor}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-400 mb-1">{selectedCourse.price}</div>
                  <Badge variant="outline" className="mb-2 text-xs px-1 py-0">{selectedCourse.level}</Badge>
                  <button className="premium-button w-full text-xs">
                    <Play className="w-2.5 h-2.5 mr-1" />
                    Inscrever-se
                  </button>
                </div>
              </div>

              {/* Módulos do Curso */}
              {selectedCourse.modules && (
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-premium mb-2">Módulos do Curso</h3>
                  <div className="space-y-1">
                    {selectedCourse.modules.map((modulo: any, index: number) => (
                      <div key={modulo.id} className="premium-card p-1.5">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs font-semibold text-premium">
                            Módulo {index + 1}: {modulo.title}
                          </h4>
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {modulo.duration}
                          </Badge>
                        </div>
                        <div className="space-y-0.5">
                          {modulo.lessons.map((lesson: string, lessonIndex: number) => (
                            <div key={lessonIndex} className="flex items-center gap-1 text-xs text-gray-300">
                              <CheckCircle className="w-2 h-2 text-green-400" />
                              {lesson}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recursos do Curso */}
              {selectedCourse.features && (
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-premium mb-2">O que você vai aprender</h3>
                  <div className="grid md:grid-cols-2 gap-1">
                    {selectedCourse.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-1 text-xs text-gray-300">
                        <CheckCircle className="w-2.5 h-2.5 text-green-400" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Ensino;
