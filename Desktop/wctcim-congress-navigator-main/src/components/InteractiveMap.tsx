import { useState } from "react";
import { VenueCard } from "./VenueCard";
import { SearchSystem } from "./SearchSystem";
import { WorkCard } from "./WorkCard";
import { ChatbotRAG } from "./ChatbotRAG";
import { FavoritesSystem } from "./FavoritesSystem";
import { SupabaseSetup } from "./SupabaseSetup";
import { congressService } from "@/lib/supabase-extended-services";
import { Play, Clock, MapPin, Users, Calendar, Award, Globe, BookOpen, Menu, BarChart3, Settings, X, Search, MessageCircle, Heart, List } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Autoplay from "embla-carousel-autoplay";
import scientificWorks from "@/data/scientificWorks.json";

interface Speaker {
  name: string;
  country: string;
  topic: string;
  time: string;
  isLive?: boolean;
}

interface EventInfo {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Dados dinâmicos por dia
const dayData = {
  15: {
    speakers: [
      { name: "Dr. Maria Santos", country: "Brasil", topic: "Medicina Integrativa", time: "09:00" },
      { name: "Prof. James Chen", country: "China", topic: "Medicina Tradicional Chinesa", time: "10:30" },
      { name: "Dr. Sarah Johnson", country: "EUA", topic: "Terapias Complementares", time: "14:00" },
      { name: "Dr. Ahmed Hassan", country: "Egito", topic: "Medicina Unani", time: "16:00" }
    ],
    brands: [
      { name: "Herbalife", category: "Suplementos" },
      { name: "Nature's Way", category: "Produtos Naturais" },
      { name: "GNC", category: "Vitaminas" }
    ],
    gradient: "bg-gradient-to-br from-green-500 via-blue-500 to-purple-600",
    cardGradient: "linear-gradient(45deg, rgba(34, 197, 94, 0.8), rgba(59, 130, 246, 0.9))",
    agenda: {
      "todas": [
        { horario: "09:00", nome: "Dr. Maria Santos", tema: "Medicina Integrativa", sala: "Sala 1" },
        { horario: "10:30", nome: "Prof. James Chen", tema: "Medicina Tradicional Chinesa", sala: "Sala 2" },
        { horario: "14:00", nome: "Dr. Sarah Johnson", tema: "Terapias Complementares", sala: "Sala 3" },
        { horario: "16:00", nome: "Dr. Ahmed Hassan", tema: "Medicina Unani", sala: "Sala 1" }
      ],
      "Sala 1": [
        { horario: "09:00", nome: "Dr. Maria Santos", tema: "Medicina Integrativa", sala: "Sala 1" },
        { horario: "16:00", nome: "Dr. Ahmed Hassan", tema: "Medicina Unani", sala: "Sala 1" }
      ],
      "Sala 2": [
        { horario: "10:30", nome: "Prof. James Chen", tema: "Medicina Tradicional Chinesa", sala: "Sala 2" }
      ],
      "Sala 3": [
        { horario: "14:00", nome: "Dr. Sarah Johnson", tema: "Terapias Complementares", sala: "Sala 3" }
      ]
    }
  },
  16: {
    speakers: [
      { name: "Dr. Elena Rodriguez", country: "Espanha", topic: "Medicina Funcional", time: "09:00" },
      { name: "Prof. Kenji Tanaka", country: "Japão", topic: "Medicina Oriental", time: "10:30" },
      { name: "Dr. Lisa Anderson", country: "Canadá", topic: "Naturopatia", time: "14:00" },
      { name: "Dr. Raj Patel", country: "Índia", topic: "Ayurveda", time: "16:00" }
    ],
    brands: [
      { name: "Now Foods", category: "Alimentos Funcionais" },
      { name: "Swisse", category: "Bem-estar" },
      { name: "Blackmores", category: "Suplementos" }
    ],
    gradient: "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-600",
    cardGradient: "linear-gradient(45deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.9))",
    agenda: {
      "todas": [
        { horario: "09:00", nome: "Dr. Elena Rodriguez", tema: "Medicina Funcional", sala: "Sala 2" },
        { horario: "10:30", nome: "Prof. Kenji Tanaka", tema: "Medicina Oriental", sala: "Sala 1" },
        { horario: "14:00", nome: "Dr. Lisa Anderson", tema: "Naturopatia", sala: "Sala 3" },
        { horario: "16:00", nome: "Dr. Raj Patel", tema: "Ayurveda", sala: "Sala 2" }
      ],
      "Sala 1": [
        { horario: "10:30", nome: "Prof. Kenji Tanaka", tema: "Medicina Oriental", sala: "Sala 1" }
      ],
      "Sala 2": [
        { horario: "09:00", nome: "Dr. Elena Rodriguez", tema: "Medicina Funcional", sala: "Sala 2" },
        { horario: "16:00", nome: "Dr. Raj Patel", tema: "Ayurveda", sala: "Sala 2" }
      ],
      "Sala 3": [
        { horario: "14:00", nome: "Dr. Lisa Anderson", tema: "Naturopatia", sala: "Sala 3" }
      ]
    }
  },
  17: {
    speakers: [
      { name: "Dr. Anna Kowalski", country: "Polônia", topic: "Medicina Energética", time: "09:00" },
      { name: "Prof. Michael Brown", country: "Austrália", topic: "Medicina Integrativa", time: "10:30" },
      { name: "Dr. Sofia Petrov", country: "Rússia", topic: "Medicina Tradicional", time: "14:00" },
      { name: "Dr. Carlos Mendez", country: "México", topic: "Medicina Herbal", time: "16:00" }
    ],
    brands: [
      { name: "Solgar", category: "Vitaminas Premium" },
      { name: "Garden of Life", category: "Orgânicos" },
      { name: "Thorne", category: "Suplementos Médicos" }
    ],
    gradient: "bg-gradient-to-br from-purple-500 via-pink-500 to-red-500",
    cardGradient: "linear-gradient(45deg, rgba(147, 51, 234, 0.8), rgba(236, 72, 153, 0.9))",
    agenda: {
      "todas": [
        { horario: "09:00", nome: "Dr. Anna Kowalski", tema: "Medicina Energética", sala: "Sala 1" },
        { horario: "10:30", nome: "Prof. Michael Brown", tema: "Medicina Integrativa", sala: "Sala 3" },
        { horario: "14:00", nome: "Dr. Sofia Petrov", tema: "Medicina Tradicional", sala: "Sala 2" },
        { horario: "16:00", nome: "Dr. Carlos Mendez", tema: "Medicina Herbal", sala: "Sala 1" }
      ],
      "Sala 1": [
        { horario: "09:00", nome: "Dr. Anna Kowalski", tema: "Medicina Energética", sala: "Sala 1" },
        { horario: "16:00", nome: "Dr. Carlos Mendez", tema: "Medicina Herbal", sala: "Sala 1" }
      ],
      "Sala 2": [
        { horario: "14:00", nome: "Dr. Sofia Petrov", tema: "Medicina Tradicional", sala: "Sala 2" }
      ],
      "Sala 3": [
        { horario: "10:30", nome: "Prof. Michael Brown", tema: "Medicina Integrativa", sala: "Sala 3" }
      ]
    }
  },
  18: {
    speakers: [
      { name: "Dr. Yuki Nakamura", country: "Japão", topic: "Medicina Preventiva", time: "09:00" },
      { name: "Prof. David Wilson", country: "Reino Unido", topic: "Medicina Holística", time: "10:30" },
      { name: "Dr. Fatima Al-Zahra", country: "Emirados", topic: "Medicina Tradicional Árabe", time: "14:00" },
      { name: "Dr. Roberto Silva", country: "Brasil", topic: "Medicina Integrativa", time: "16:00" }
    ],
    brands: [
      { name: "Life Extension", category: "Longevidade" },
      { name: "Pure Encapsulations", category: "Suplementos Puros" },
      { name: "Nordic Naturals", category: "Ômega 3" }
    ],
    gradient: "bg-gradient-to-br from-orange-500 via-yellow-500 to-amber-600",
    cardGradient: "linear-gradient(45deg, rgba(249, 115, 22, 0.8), rgba(245, 158, 11, 0.9))",
    agenda: {
      "todas": [
        { horario: "09:00", nome: "Dr. Yuki Nakamura", tema: "Medicina Preventiva", sala: "Sala 3" },
        { horario: "10:30", nome: "Prof. David Wilson", tema: "Medicina Holística", sala: "Sala 1" },
        { horario: "14:00", nome: "Dr. Fatima Al-Zahra", tema: "Medicina Tradicional Árabe", sala: "Sala 2" },
        { horario: "16:00", nome: "Dr. Roberto Silva", tema: "Medicina Integrativa", sala: "Sala 3" }
      ],
      "Sala 1": [
        { horario: "10:30", nome: "Prof. David Wilson", tema: "Medicina Holística", sala: "Sala 1" }
      ],
      "Sala 2": [
        { horario: "14:00", nome: "Dr. Fatima Al-Zahra", tema: "Medicina Tradicional Árabe", sala: "Sala 2" }
      ],
      "Sala 3": [
        { horario: "09:00", nome: "Dr. Yuki Nakamura", tema: "Medicina Preventiva", sala: "Sala 3" },
        { horario: "16:00", nome: "Dr. Roberto Silva", tema: "Medicina Integrativa", sala: "Sala 3" }
      ]
    }
  }
};

const eventInfos: EventInfo[] = [
  {
    id: 1,
    title: "Programação Completa",
    description: "4 dias de palestras, workshops e networking com especialistas internacionais",
    icon: <Calendar className="w-5 h-5" />
  },
  {
    id: 2,
    title: "Palestrantes Internacionais",
    description: "120+ especialistas de 30 países compartilhando conhecimento e experiências",
    icon: <Award className="w-5 h-5" />
  },
  {
    id: 3,
    title: "Workshops Práticos",
    description: "Sessões hands-on para aplicação prática das técnicas apresentadas",
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    id: 4,
    title: "Networking Global",
    description: "Conecte-se com profissionais de medicina tradicional de todo o mundo",
    icon: <Globe className="w-5 h-5" />
  }
];

interface Booth {
  id: number;
  name: string;
  description: string;
  category: string;
}

const speakers: Speaker[] = [
  {
    name: "Dr. Maria Santos",
    country: "Brasil",
    topic: "Medicina Integrativa no SUS",
    time: "09:00 - 09:45",
    isLive: true
  },
  {
    name: "Prof. James Chen",
    country: "China",
    topic: "Traditional Chinese Medicine",
    time: "10:00 - 10:45"
  },
  {
    name: "Dr. Sarah Johnson",
    country: "USA",
    topic: "Complementary Therapies in Oncology",
    time: "11:00 - 11:45"
  },
  {
    name: "Dr. Raj Patel",
    country: "India",
    topic: "Ayurveda in Modern Healthcare",
    time: "14:00 - 14:45"
  }
];

const booths: Booth[] = [
  { id: 1, name: "Fitoterapia Brasil", description: "Plantas medicinais e extratos naturais", category: "Fitoterapia" },
  { id: 2, name: "Acupuncture World", description: "Equipamentos e técnicas de acupuntura", category: "Acupuntura" },
  { id: 3, name: "Homeopathy Plus", description: "Medicamentos homeopáticos", category: "Homeopatia" },
  { id: 4, name: "Mindfulness Tech", description: "Apps de meditação e bem-estar", category: "Tecnologia" },
  { id: 5, name: "Ayurveda Center", description: "Produtos e consultorias ayurvédicas", category: "Ayurveda" },
  { id: 6, name: "Medicina Chinesa", description: "Produtos e técnicas da medicina tradicional chinesa", category: "MTC" },
  { id: 7, name: "Aromaterapia Plus", description: "Óleos essenciais e aromaterapia", category: "Aromaterapia" },
  { id: 8, name: "Yoga & Wellness", description: "Equipamentos de yoga e bem-estar", category: "Yoga" },
  { id: 9, name: "Nutracêuticos", description: "Suplementos naturais e nutracêuticos", category: "Nutrição" },
  { id: 10, name: "Terapias Energéticas", description: "Cristais, reiki e terapias vibracionais", category: "Energética" },
  { id: 11, name: "Medicina Antroposófica", description: "Produtos antroposóficos", category: "Antroposofia" },
  { id: 12, name: "Flores de Bach", description: "Essências florais e terapia floral", category: "Florais" },
  { id: 13, name: "Massoterapia", description: "Equipamentos e técnicas de massagem", category: "Massagem" },
  { id: 14, name: "Práticas Integrativas", description: "Diversas práticas integrativas", category: "PICS" },
  { id: 15, name: "Pesquisa & Inovação", description: "Estudos científicos e inovações", category: "Pesquisa" },
  { id: 16, name: "Medicina Funcional", description: "Abordagem funcional da medicina", category: "Funcional" },
  { id: 17, name: "Terapias Manuais", description: "Técnicas manuais de tratamento", category: "Manual" },
  { id: 18, name: "Medicina Esportiva", description: "Medicina aplicada ao esporte", category: "Esportiva" },
  { id: 19, name: "Medicina Preventiva", description: "Foco na prevenção de doenças", category: "Preventiva" },
  { id: 20, name: "Medicina Estética", description: "Tratamentos estéticos naturais", category: "Estética" },
  { id: 21, name: "Medicina Veterinária", description: "Medicina integrativa veterinária", category: "Veterinária" },
  { id: 22, name: "Medicina Pediátrica", description: "Cuidados integrativos infantis", category: "Pediátrica" },
  { id: 23, name: "Medicina Geriátrica", description: "Cuidados para idosos", category: "Geriátrica" },
  { id: 24, name: "Medicina da Mulher", description: "Saúde integral feminina", category: "Feminina" },
  { id: 25, name: "Medicina do Homem", description: "Saúde integral masculina", category: "Masculina" },
  { id: 26, name: "Medicina Mental", description: "Saúde mental integrativa", category: "Mental" },
  { id: 27, name: "Medicina do Sono", description: "Tratamentos para distúrbios do sono", category: "Sono" },
  { id: 28, name: "Medicina da Dor", description: "Tratamento integrativo da dor", category: "Dor" },
  { id: 29, name: "Medicina Digestiva", description: "Saúde digestiva integrativa", category: "Digestiva" },
  { id: 30, name: "Medicina Cardiovascular", description: "Saúde cardiovascular integrativa", category: "Cardiovascular" },
  { id: 31, name: "Medicina Respiratória", description: "Saúde respiratória integrativa", category: "Respiratória" },
  { id: 32, name: "Medicina Endócrina", description: "Saúde hormonal integrativa", category: "Endócrina" },
  { id: 33, name: "Medicina Imunológica", description: "Fortalecimento do sistema imune", category: "Imunológica" },
  { id: 34, name: "Medicina Oncológica", description: "Suporte integrativo oncológico", category: "Oncológica" },
  { id: 35, name: "Medicina Neurológica", description: "Saúde neurológica integrativa", category: "Neurológica" },
  { id: 36, name: "Medicina Emergencial", description: "Primeiros socorros integrativos", category: "Emergencial" }
];

export const InteractiveMap = () => {
  const [activeCard, setActiveCard] = useState<"stage" | number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(15);
  const [selectedRoom, setSelectedRoom] = useState<string>("todas");
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [triggerPosition, setTriggerPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Novos estados para integração científica
  const [showScientificPanel, setShowScientificPanel] = useState<boolean>(false);
  const [activeWork, setActiveWork] = useState<any>(null);
  const [filteredWorks, setFilteredWorks] = useState<any[]>(scientificWorks);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("search");
  
  // Estados para dados do Supabase
  const [congressData, setCongressData] = useState<any>(null);
  const [loadingCongressData, setLoadingCongressData] = useState(false);

  const handleStageClick = () => {
    setActiveCard("stage");
  };

  const handleBoothClick = (boothId: number) => {
    setActiveCard(boothId);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTriggerPosition({
        x: e.clientX - 20, // Offset para centralizar o botão
        y: e.clientY - 20
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const closeCard = () => {
    setActiveCard(null);
  };

  // Funções para trabalhos científicos
  const handleWorkSelect = (work: any) => {
    setActiveWork(work);
  };

  const handleWorkClose = () => {
    setActiveWork(null);
  };

  const handleFavorite = (workId: string) => {
    setFavorites(prev => 
      prev.includes(workId) 
        ? prev.filter(id => id !== workId)
        : [...prev, workId]
    );
  };

  const handleFilterChange = (works: any[]) => {
    setFilteredWorks(works);
  };

  // Carregar dados do Supabase
  const loadCongressData = async (day?: number) => {
    setLoadingCongressData(true);
    try {
      const data = await congressService.getCongressData(day);
      setCongressData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do congresso:', error);
    } finally {
      setLoadingCongressData(false);
    }
  };

  const renderStageCard = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin style={{ color: dayColors.primary }} size={20} />
        <span className="text-sm text-gray-600">Palco Principal - Auditório Central</span>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-semibold" style={{ color: dayColors.primary }}>Programação do Dia</h3>
        
        {currentDayData.speakers.map((speaker, index) => (
          <div
            key={index}
            className="p-4 rounded-xl border"
            style={{
              background: (speaker as any).isLive 
                ? `${dayColors.primary}20` 
                : 'rgba(255, 255, 255, 0.5)',
              borderColor: (speaker as any).isLive 
                ? dayColors.primary 
                : '#e5e7eb'
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">{speaker.time}</span>
                {(speaker as any).isLive && (
                  <div className="flex items-center gap-1 text-white px-2 py-1 rounded-full text-xs" style={{ backgroundColor: dayColors.primary }}>
                    <Play size={10} />
                    AO VIVO
                  </div>
                )}
              </div>
            </div>
            
            <h4 className="font-medium" style={{ color: dayColors.primary }}>{speaker.name}</h4>
            <p className="text-sm text-gray-600">{speaker.country}</p>
            <p className="text-sm mt-1 text-gray-600">{speaker.topic}</p>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t">
        <h3 className="font-semibold mb-3" style={{ color: dayColors.primary }}>Palestrantes Confirmados</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users size={16} style={{ color: dayColors.primary }} />
          <span>+120 especialistas internacionais</span>
        </div>
      </div>
    </div>
  );

  const renderBoothCard = (boothId: number) => {
    const booth = booths.find(b => b.id === boothId);
    if (!booth) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin style={{ color: dayColors.primary }} size={20} />
          <span className="text-sm text-gray-600">Stand {booth.id}</span>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2" style={{ color: dayColors.primary }}>{booth.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{booth.description}</p>
          
          <div className="p-3 rounded-lg" style={{ backgroundColor: `${dayColors.primary}10` }}>
            <div className="text-sm">
              <span className="font-medium">Categoria: </span>
              <span style={{ color: dayColors.primary }}>{booth.category}</span>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2" style={{ color: dayColors.primary }}>Atividades</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock size={14} style={{ color: dayColors.primary }} />
              <span className="text-gray-600">Demonstrações: 10h - 12h</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} style={{ color: dayColors.primary }} />
              <span className="text-gray-600">Consultorias: 14h - 16h</span>
            </div>
          </div>
        </div>
        
        <button className="w-full mt-4 py-2 px-4 rounded-lg text-white font-medium transition-colors" style={{ backgroundColor: dayColors.primary }}>
          Mais Informações
        </button>
      </div>
    );
  };

  const currentDayData = dayData[selectedDay as keyof typeof dayData];

  // Função para gerar cores dinâmicas baseadas no dia
  const getDayColors = (day: number) => {
    const colorMap = {
      15: { primary: 'rgb(34, 197, 94)', secondary: 'rgb(59, 130, 246)' }, // Verde/Azul
      16: { primary: 'rgb(59, 130, 246)', secondary: 'rgb(147, 51, 234)' }, // Azul/Roxo
      17: { primary: 'rgb(147, 51, 234)', secondary: 'rgb(236, 72, 153)' }, // Roxo/Rosa
      18: { primary: 'rgb(249, 115, 22)', secondary: 'rgb(245, 158, 11)' }  // Laranja/Dourado
    };
    return colorMap[day as keyof typeof colorMap] || colorMap[15];
  };

  const dayColors = getDayColors(selectedDay);

  return (
    <div className={`fixed inset-0 overflow-y-auto flex flex-col transition-all duration-500 ${currentDayData.gradient}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {/* Enhanced Header */}
      <div className="w-full bg-black/20 backdrop-blur-sm border-b border-white/10 p-2 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="text-center md:text-left">
              <h1 className="text-white text-base md:text-xl font-bold drop-shadow-lg mb-1">
                WCTCIM 2025
              </h1>
              <p className="text-white text-xs md:text-sm font-medium">
                World Congress on Traditional & Complementary Medicine
              </p>
              <div className="flex items-center justify-center md:justify-start gap-1 mt-1">
                <MapPin className="text-congress-green w-3 h-3" />
                <span className="text-white/80 text-xs">Riocentro - Rio de Janeiro, Brasil</span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-2">
              <div className="text-center">
                <div className="text-white font-bold text-sm md:text-lg">15-18</div>
                <div className="text-white text-xs">MAIO</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-sm md:text-lg">2025</div>
                <div className="text-white text-xs">ANO</div>
              </div>
              <div className="hidden md:block w-px h-6 bg-white/20"></div>
              <div className="text-center">
                <div className="text-white font-bold text-sm md:text-lg">120+</div>
                <div className="text-white text-xs">PALESTRANTES</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowScientificPanel(!showScientificPanel)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Trabalhos Científicos"
                >
                  <BookOpen className="text-white w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowAdmin(!showAdmin)}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-move"
                  style={{
                    position: triggerPosition.x !== 0 || triggerPosition.y !== 0 ? 'fixed' : 'relative',
                    left: triggerPosition.x !== 0 || triggerPosition.y !== 0 ? `${triggerPosition.x}px` : 'auto',
                    top: triggerPosition.x !== 0 || triggerPosition.y !== 0 ? `${triggerPosition.y}px` : 'auto',
                    zIndex: 1000
                  }}
                  title="Acesso Administrativo - Arraste para mover"
                >
                  <Menu className="text-white w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="w-full bg-black/10 backdrop-blur-sm border-b border-white/10 p-2">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center gap-2">
            {[15, 16, 17, 18].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
                  selectedDay === day
                    ? 'text-white shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
                style={selectedDay === day ? { backgroundColor: dayColors.primary } : {}}
              >
                Dia {day}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Interactive Map Container */}
      <div className="relative w-full flex-1 p-2 flex items-center justify-center">
        
        {/* Left Side Carousels */}
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-64 space-y-4 z-10" style={{ left: 'calc(0.5rem + 8%)' }}>
          
          {/* Speakers Carousel */}
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3" style={{ height: '160px', margin: '1% 1% 3% 1%', border: `1px solid ${dayColors.primary}40` }}>
            <h3 className="text-white text-sm font-semibold mb-2 text-center">
              Palestrantes
            </h3>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[Autoplay({ delay: 3000 })]}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                {currentDayData.speakers.map((speaker, index) => (
                  <CarouselItem key={index} className="pl-2 basis-1/1">
                    <div className="venue-card p-3 h-full" style={{ height: '120px' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: dayColors.primary }}>
                          <span className="text-white font-bold text-sm">
                            {speaker.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate" style={{ color: dayColors.primary }}>
                            {speaker.name}
                          </h4>
                          <p className="text-xs" style={{ color: `${dayColors.primary}CC` }}>
                            {speaker.country}
                          </p>
                          <p className="text-xs truncate" style={{ color: `${dayColors.primary}CC` }}>
                            {speaker.topic}
                          </p>
                          <p className="text-xs mt-1" style={{ color: `${dayColors.primary}99` }}>
                            {speaker.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious 
                className="-left-8" 
                style={{ 
                  color: dayColors.primary, 
                  borderColor: `${dayColors.primary}40`
                }}
              />
              <CarouselNext 
                className="-right-8" 
                style={{ 
                  color: dayColors.primary, 
                  borderColor: `${dayColors.primary}40`
                }}
              />
            </Carousel>
          </div>

          {/* Brands Carousel */}
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3" style={{ height: 'calc(100% + 20%)', border: `1px solid ${dayColors.primary}40` }}>
            <h3 className="text-white text-sm font-semibold mb-2 text-center">
              Marcas dos Stands
            </h3>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[Autoplay({ delay: 3000 })]}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                {currentDayData.brands.map((brand, index) => (
                  <CarouselItem key={index} className="pl-2 basis-1/1">
                    <div className="venue-card p-2 h-full">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-congress-light rounded-lg flex items-center justify-center mx-auto mb-1">
                          <span className="text-congress-light-foreground font-bold text-xs">
                            {brand.name}
                          </span>
                        </div>
                        <h4 className="font-semibold text-xs" style={{ color: dayColors.primary }}>
                          {brand.name}
                        </h4>
                        <p className="text-xs" style={{ color: `${dayColors.primary}CC` }}>
                          {brand.category}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious 
                className="-left-8" 
                style={{ 
                  color: dayColors.primary, 
                  borderColor: `${dayColors.primary}40`
                }}
              />
              <CarouselNext 
                className="-right-8" 
                style={{ 
                  color: dayColors.primary, 
                  borderColor: `${dayColors.primary}40`
                }}
              />
            </Carousel>
          </div>
        </div>

        {/* Central Map Card */}
        <div className="venue-card h-[50vh] relative overflow-hidden mt-2" style={{ 
          border: '2px solid rgba(255, 255, 255, 0.8)', 
          boxShadow: '0 0 15px rgba(0, 0, 0, 0.1), inset 0 0 15px rgba(255, 255, 255, 0.1)',
          width: 'calc(100% + 10%)', 
          maxWidth: 'calc(50rem + 10%)' 
        }}>
          {/* Background Map Image */}
          <div 
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage: `url('/lovable-uploads/riocentro-map-new.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          
          {/* Stage positioned on the left side (orange area in the map) */}
          <div
            className="venue-item venue-stage absolute w-20 h-16 md:w-28 md:h-20 flex items-center justify-center z-20"
            onClick={handleStageClick}
            style={{ 
              left: 'calc(25% - 6% + 11%)', 
              top: 'calc(50% - 4%)', 
              transform: 'translate(-50%, -50%) rotateZ(-25deg)',
              background: currentDayData.cardGradient,
              border: '1px solid rgba(255, 255, 255, 0.8)'
            }}
          >
            <div className="text-center">
              <div className="text-congress-green-foreground font-bold text-xs md:text-sm">
                PALCO
              </div>
              <div className="text-congress-green-foreground text-xs">
                PRINCIPAL
              </div>
            </div>
          </div>

          {/* Emergency Exit */}
          <div
            className="venue-card absolute cursor-pointer transition-all duration-300"
            style={{
              left: 'calc(5%)',
              top: 'calc(40%)',
              width: '45px',
              height: '35px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              border: '1px solid #ef4444'
            }}
          >
            <div className="text-center text-red-600">
              <div className="text-sm">🚨</div>
              <div className="text-xs font-bold">SAÍDA</div>
            </div>
          </div>

          {/* Ambulance */}
          <div
            className="venue-card absolute cursor-pointer transition-all duration-300"
            style={{
              right: 'calc(5%)',
              top: 'calc(21%)',
              width: '45px',
              height: '35px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              border: '1px solid #3b82f6'
            }}
          >
            <div className="text-center text-blue-600">
              <div className="text-sm">🚑</div>
              <div className="text-xs font-bold">AMBULÂNCIA</div>
            </div>
          </div>

          {/* Restrooms */}
          <div
            className="venue-card absolute cursor-pointer transition-all duration-300"
            style={{
              left: 'calc(35%)',
              bottom: 'calc(15%)',
              width: '45px',
              height: '35px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              border: '1px solid #10b981'
            }}
          >
            <div className="text-center text-green-600">
              <div className="text-sm">🚻</div>
              <div className="text-xs font-bold">BANHEIROS</div>
            </div>
          </div>



          {/* Booths organized in rows */}
          <div className="absolute inset-0" style={{ transform: 'rotateZ(-24deg)' }}>
            {booths.map((booth, index) => {
              // Organize booths in 6 rows of 6 cards each
              const row = Math.floor(index / 6);
              const col = index % 6;
              
              // Position calculation for 6 rows x 6 columns (moved further from stage)
              const x = (col - 2.5) * 87 + 135; // Spread columns and move 135px right from stage (6 columns, more distance, moved right subtly, more spacing, 3% more spaced, 2% more spaced)
              const y = (row - 2.5) * 72 - 100; // Spread rows and lift 30% more (6 rows, more distance, moved down, more spacing, 3% more spaced, 5% more down, 2% more spaced)
              
              // Calculate gradient opacity based on booth position (1-36)
              const gradientProgress = (booth.id - 1) / (booths.length - 1);
              const opacity = 0.3 + (gradientProgress * 0.4); // Range from 0.3 to 0.7
              const gradientRotation = gradientProgress * 180; // Rotate gradient based on position
              
              return (
                <div
                  key={booth.id}
                  className="venue-item venue-booth absolute w-10 h-10 md:w-10 md:h-10 flex items-center justify-center text-xs font-medium"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)',
                    background: currentDayData.cardGradient,
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)'
                  }}
                  onClick={() => handleBoothClick(booth.id)}
                >
                  <span className="text-white font-bold text-xs">{booth.id}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Venue Cards */}
      <VenueCard
        title="Palco Principal"
        content={renderStageCard()}
        isOpen={activeCard === "stage"}
        onClose={closeCard}
      />

      {typeof activeCard === "number" && (
        <VenueCard
          title={`Stand ${activeCard}`}
          content={renderBoothCard(activeCard)}
          isOpen={true}
          onClose={closeCard}
        />
      )}

      {/* Event Information Carousel */}
      <div className="w-full bg-black/20 backdrop-blur-sm border-t border-white/10 p-2">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-white text-sm font-semibold mb-2 text-center">
            Informações do Evento
          </h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-1 md:-ml-2">
              {eventInfos.map((info) => (
                <CarouselItem key={info.id} className="pl-1 md:pl-2 md:basis-1/2 lg:basis-1/3">
                  <div className="p-3 h-full rounded-lg shadow-lg" style={{ 
                    background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))`,
                    border: `1px solid ${dayColors.primary}40`,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0" style={{ color: dayColors.primary }}>
                        <div className="w-4 h-4">
                          {info.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 text-sm" style={{ color: dayColors.primary }}>
                          {info.title}
                        </h3>
                        <p className="text-xs text-gray-700">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious 
              className="border-white/20 hover:bg-white/10" 
              style={{ color: dayColors.primary }}
            />
            <CarouselNext 
              className="border-white/20 hover:bg-white/10" 
              style={{ color: dayColors.primary }}
            />
          </Carousel>
        </div>
      </div>

      {/* Room Filter & Dynamic Agenda Grid */}
      <div className="w-full bg-black/10 backdrop-blur-sm border-t border-white/10 p-2">
        <div className="max-w-6xl mx-auto">
          {/* Room Filter */}
          <div className="flex justify-center gap-2 mb-3">
            {["todas", "Sala 1", "Sala 2", "Sala 3"].map((room) => (
              <button
                key={room}
                onClick={() => setSelectedRoom(room)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  selectedRoom === room 
                    ? "text-white shadow-lg" 
                    : "bg-white/80 text-gray-800 hover:bg-white/90"
                }`}
                style={selectedRoom === room ? { backgroundColor: dayColors.primary } : {}}
              >
                {room}
              </button>
            ))}
          </div>
          
          <h3 className="text-white text-sm font-semibold mb-2 text-center">
            Programação - Dia {selectedDay} - {selectedRoom}
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {currentDayData.agenda[selectedRoom as keyof typeof currentDayData.agenda]?.map((palestra, idx) => (
              <div key={idx} className="bg-white/90 p-3 rounded-lg shadow-lg min-w-[200px] max-w-[240px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: dayColors.primary }}>
                    {palestra.horario}
                  </span>
                  <span className="text-gray-600 text-xs font-medium">
                    {palestra.sala}
                  </span>
                </div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">
                  {palestra.nome}
                </h4>
                <p className="text-gray-600 text-xs">
                  {palestra.tema}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel Científico */}
      {showScientificPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Trabalhos Científicos WCTCIM 2025
              </h2>
              <button
                onClick={() => setShowScientificPanel(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-4 mb-3 h-8">
                <TabsTrigger value="search" className="flex items-center gap-1 text-xs">
                  <Search className="w-3 h-3" />
                  Buscar
                </TabsTrigger>
                <TabsTrigger value="chatbot" className="flex items-center gap-1 text-xs">
                  <MessageCircle className="w-3 h-3" />
                  IA Assistant
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-1 text-xs">
                  <Heart className="w-3 h-3" />
                  Favoritos
                </TabsTrigger>
                <TabsTrigger value="playlist" className="flex items-center gap-1 text-xs">
                  <List className="w-3 h-3" />
                  Playlist
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-hidden">
                <TabsContent value="search" className="h-full">
                  <div className="h-full overflow-y-auto pr-2">
                    <SearchSystem 
                      onWorkSelect={handleWorkSelect}
                      onFilterChange={handleFilterChange}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="chatbot" className="h-full">
                  <div className="h-full overflow-y-auto pr-2">
                    <ChatbotRAG onWorkSelect={handleWorkSelect} />
                  </div>
                </TabsContent>
                
                <TabsContent value="favorites" className="h-full">
                  <div className="h-full overflow-y-auto pr-2">
                    <FavoritesSystem onWorkSelect={handleWorkSelect} />
                  </div>
                </TabsContent>
                
                <TabsContent value="playlist" className="h-full">
                  <div className="h-full overflow-y-auto pr-2">
                    <FavoritesSystem onWorkSelect={handleWorkSelect} />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      )}

      {/* Work Card */}
      {activeWork && (
        <WorkCard
          work={activeWork}
          isOpen={true}
          onClose={handleWorkClose}
          onFavorite={handleFavorite}
          isFavorite={favorites.includes(activeWork.id)}
        />
      )}

      {/* Admin Dashboard */}
      {showAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Dashboard Administrativo</h2>
              <button
                onClick={() => setShowAdmin(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Analytics Cards */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs">Total de Visitantes</p>
                    <p className="text-2xl font-bold">2,847</p>
                  </div>
                  <Users className="w-6 h-6 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs">Stands Visitados</p>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                  <MapPin className="w-6 h-6 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs">Palestras Assistidas</p>
                    <p className="text-2xl font-bold">856</p>
                  </div>
                  <Play className="w-6 h-6 text-purple-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs">Tempo Médio</p>
                    <p className="text-2xl font-bold">2h 34m</p>
                  </div>
                  <Clock className="w-6 h-6 text-orange-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-xs">Downloads App</p>
                    <p className="text-2xl font-bold">1,567</p>
                  </div>
                  <Award className="w-6 h-6 text-red-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-xs">Networking</p>
                    <p className="text-2xl font-bold">423</p>
                  </div>
                  <Globe className="w-6 h-6 text-teal-200" />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Configuração do Sistema</h3>
              <div className="mb-4">
                <SupabaseSetup />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Ações Administrativas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-left">
                  <BarChart3 className="w-5 h-5 text-gray-600 mb-1" />
                  <h4 className="font-semibold text-gray-800 text-sm">Relatórios Detalhados</h4>
                  <p className="text-xs text-gray-600">Gerar relatórios de analytics</p>
                </button>
                <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-left">
                  <Settings className="w-5 h-5 text-gray-600 mb-1" />
                  <h4 className="font-semibold text-gray-800 text-sm">Configurações</h4>
                  <p className="text-xs text-gray-600">Gerenciar conteúdo e usuários</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};