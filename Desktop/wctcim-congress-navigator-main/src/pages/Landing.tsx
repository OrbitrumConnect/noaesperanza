import { CountdownTimer } from "@/components/CountdownTimer";
import { MapPin, Calendar, Users, Award, Globe, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

export const Landing = () => {
  // Congress date: October 15-18, 2025 (next month)
  const congressDate = new Date("2025-10-15T09:00:00");

  return (
    <div className="min-h-screen relative">
      {/* Header with Timer */}
      <header className="relative bg-white/10 backdrop-blur-sm border-b border-white/20 py-2 px-4 z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-2 md:mb-0">
            <h1 className="text-white font-bold text-sm md:text-base">WCTCIM 2025</h1>
            <p className="text-white/80 text-xs">15-18 Outubro • Riocentro</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-white font-bold text-sm md:text-base">28</div>
              <div className="text-white/80 text-xs">Dias</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-sm md:text-base">13</div>
              <div className="text-white/80 text-xs">Horas</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-sm md:text-base">28</div>
              <div className="text-white/80 text-xs">Min</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-sm md:text-base">15</div>
              <div className="text-white/80 text-xs">Seg</div>
            </div>
          </div>
        </div>
      </header>

      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/backg2.png)',
          zIndex: -1
        }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/70 via-blue-600/70 to-purple-700/70" style={{ zIndex: -1 }} />
      
      {/* Hero Section */}
      <section className="relative h-auto flex items-center justify-center text-center px-4 py-2" style={{ transform: 'translateY(5%) scale(0.9)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-3 bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
              3rd World Congress
            </h1>
            <h2 className="text-sm md:text-base font-semibold text-white mb-2">
              Traditional, Complementary &<br />
              Integrative Medicine
            </h2>
            <p className="text-white/90 text-xs mb-3">
              WCTCIM 2025 • 15-18 Outubro • Riocentro - Rio de Janeiro, Brasil
            </p>
          </div>

          {/* Countdown */}
          <div className="mb-4 bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <h3 className="text-white text-sm font-semibold mb-2">
              Faltam apenas:
            </h3>
            <CountdownTimer targetDate={congressDate} />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center mb-4 bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <Link to="/congress" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors text-xs">
              Acessar Congresso
            </Link>
            <button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors text-xs">
              Inscreva-se Agora
            </button>
          </div>

          {/* Key Info */}
          <div className="grid grid-cols-3 gap-1 mb-2 -mt-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 text-center">
              <MapPin className="mx-auto mb-1 text-white" size={14} />
              <h3 className="font-semibold text-white mb-1 text-xs">Local</h3>
              <p className="text-xs text-white/80">
                Riocentro
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 text-center">
              <Calendar className="mx-auto mb-1 text-white" size={14} />
              <h3 className="font-semibold text-white mb-1 text-xs">Data</h3>
              <p className="text-xs text-white/80">
                15-18 Out
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 text-center">
              <Users className="mx-auto mb-1 text-white" size={14} />
              <h3 className="font-semibold text-white mb-1 text-xs">Palestrantes</h3>
              <p className="text-xs text-white/80">
                120+
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-0 px-4 mt-4" style={{ transform: 'translateY(-5%) scale(0.8)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-3 bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <h2 className="text-sm md:text-base font-bold text-white mb-1">
              Sobre o Congresso
            </h2>
            <p className="text-xs text-white/80 max-w-lg mx-auto">
              O maior evento mundial de medicina tradicional, complementar e integrativa.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 text-center">
              <Stethoscope className="mx-auto mb-1 text-white" size={12} />
              <h3 className="text-xs font-semibold text-white mb-1">
                120+ Palestrantes
              </h3>
              <p className="text-xs text-white/80">
                Especialistas
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 text-center">
              <Award className="mx-auto mb-1 text-white" size={12} />
              <h3 className="text-xs font-semibold text-white mb-1">
                50+ Sessões
              </h3>
              <p className="text-xs text-white/80">
                Workshops
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 text-center">
              <Globe className="mx-auto mb-1 text-white" size={12} />
              <h3 className="text-xs font-semibold text-white mb-1">
                Networking
              </h3>
              <p className="text-xs text-white/80">
                Global
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Speakers Highlight */}
      <section className="py-0 px-4 mt-4" style={{ transform: 'translateY(-5%) scale(0.8)' }}>
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-sm md:text-base font-bold text-white mb-2">
            Palestrantes Principais
          </h2>
          
          <div className="grid grid-cols-2 gap-1 mb-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1">
              <div className="w-5 h-5 bg-congress-green rounded-full mx-auto mb-1 flex items-center justify-center">
                <span className="text-xs font-bold text-white">MS</span>
              </div>
              <h3 className="text-xs font-semibold text-white mb-1">
                Dr. Maria Santos
              </h3>
              <p className="text-xs text-white/80 mb-1">
                UFRJ
              </p>
              <p className="text-xs text-white/70">
                "Medicina Tradicional no SUS"
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1">
              <div className="w-5 h-5 bg-congress-green rounded-full mx-auto mb-1 flex items-center justify-center">
                <span className="text-xs font-bold text-white">JC</span>
              </div>
              <h3 className="text-xs font-semibold text-white mb-1">
                Prof. James Chen
              </h3>
              <p className="text-xs text-white/80 mb-1">
                Beijing University
              </p>
              <p className="text-xs text-white/70">
                "Innovation in TCM"
              </p>
            </div>
          </div>

          <div>
            <Link to="/congress" className="bg-congress-green hover:bg-congress-green/90 text-white px-3 py-1.5 rounded-lg font-medium transition-colors text-xs">
              Ver Programação Completa
            </Link>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-600 to-blue-600 py-4 px-4 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-3 md:mb-0">
              <p className="text-white text-sm font-medium">
                © 2025 WCTCIM - World Congress of Traditional, Complementary & Integrative Medicine
              </p>
              <p className="text-white/90 text-xs mt-1">
                Rio de Janeiro, Brasil • 15-18 Outubro 2025
              </p>
            </div>
            
            <div className="flex gap-4">
              <Link to="/congress" className="text-white hover:text-green-200 transition-colors text-sm font-medium">
                Acessar Congresso
              </Link>
              <a href="#" className="text-white/80 hover:text-white transition-colors text-sm">
                Contato
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors text-sm">
                Privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};