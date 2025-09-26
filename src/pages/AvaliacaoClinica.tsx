import React, { useState } from "react";
import { Helmet } from "../components/Helmet";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import { NoaAvaliacaoClinica } from "../components/NoaAvaliacaoClinica";
import { useIsClient } from "../hooks/useIsClient";

const AvaliacaoClinica: React.FC = () => {
  const { toast } = useToast();
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const isClient = useIsClient();

  // Evita erro no SSR da Vercel
  const { user } = isClient ? useAuth() : { user: null };

  const handleAvaliacaoComplete = (data: any) => {
    toast({
      title: "Avaliação Concluída!",
      description: "Sua avaliação clínica inicial foi finalizada com sucesso.",
      variant: "default",
    });
    setSessionCompleted(true);
    console.log("Dados da avaliação:", data);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header currentSpecialty="rim" setCurrentSpecialty={() => {}} />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
          <p className="text-lg text-muted-foreground">
            Você precisa estar logado para realizar a avaliação clínica inicial.
          </p>
        </div>
      </div>
    );
  }

  if (sessionCompleted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header currentSpecialty="rim" setCurrentSpecialty={() => {}} />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Avaliação Concluída
          </h2>
          <p className="text-lg text-muted-foreground">
            Obrigado por participar da sua Avaliação Clínica Inicial pelo método
            Arte da Entrevista Clínica. Seu relatório foi gerado e está disponível no seu dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Avaliação Clínica Inicial - Arte da Entrevista Clínica | Nôa Esperanza</title>
        <meta
          name="description"
          content="Realize sua avaliação clínica inicial utilizando a metodologia Arte da Entrevista Clínica com assistência da NOA."
        />
        <link rel="canonical" href="https://noaesperanza.com/avaliacao-clinica" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header currentSpecialty="rim" setCurrentSpecialty={() => {}} />

        <main className="flex-1 container mx-auto px-4 py-8 pt-24" role="main">
          <section aria-labelledby="avaliacao-title" className="max-w-5xl mx-auto space-y-6">
            <h1 id="avaliacao-title" className="text-3xl md:text-4xl font-bold text-foreground text-center">
              Avaliação Clínica Inicial
            </h1>
            <p className="text-center text-muted-foreground">
              Utilize a metodologia Arte da Entrevista Clínica para uma avaliação completa e humanizada.
            </p>
            
            <NoaAvaliacaoClinica onComplete={handleAvaliacaoComplete} />
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AvaliacaoClinica;
