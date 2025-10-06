import { useState, useMemo, useEffect } from "react";
import { Search, Filter, X, BookOpen, Video, FileText, Users, MapPin, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScientificWorks, useSearchWorks } from "@/hooks/useScientificWorks";

interface SearchSystemProps {
  onWorkSelect: (work: any) => void;
  onFilterChange: (filteredWorks: any[]) => void;
}

export const SearchSystem = ({ onWorkSelect, onFilterChange }: SearchSystemProps) => {
  const { works, loading } = useScientificWorks();
  const { searchTerm, setSearchTerm, filteredWorks: searchResults, isSearching } = useSearchWorks(works);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [selectedModality, setSelectedModality] = useState<string>("todas");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // Extrair todas as palavras-chave únicas
  const allKeywords = useMemo(() => {
    const keywords = new Set<string>();
    works.forEach(work => {
      work.keywords.forEach((keyword: string) => keywords.add(keyword));
    });
    return Array.from(keywords).sort();
  }, [works]);

  // Filtrar trabalhos baseado nos critérios
  const filteredWorks = useMemo(() => {
    let filtered = searchResults;

    // A busca já é feita pelo hook useSearchWorks

    // Filtro por categoria
    if (selectedCategory !== "todas") {
      filtered = filtered.filter(work => work.category === selectedCategory);
    }

    // Filtro por modalidade
    if (selectedModality !== "todas") {
      filtered = filtered.filter(work => work.modality === selectedModality);
    }

    // Filtro por dia
    if (selectedDay) {
      filtered = filtered.filter(work => work.schedule.day === selectedDay);
    }

    // Filtro por palavras-chave
    if (selectedKeywords.length > 0) {
      filtered = filtered.filter(work =>
        selectedKeywords.some(keyword => work.keywords.includes(keyword))
      );
    }

    return filtered;
  }, [searchResults, selectedCategory, selectedModality, selectedDay, selectedKeywords]);

  // Notificar o componente pai sobre os trabalhos filtrados
  useEffect(() => {
    onFilterChange(filteredWorks);
  }, [filteredWorks, onFilterChange]);

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev =>
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("todas");
    setSelectedModality("todas");
    setSelectedDay(null);
    setSelectedKeywords([]);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "científico": return <BookOpen className="w-4 h-4" />;
      case "relato_experiencia": return <Video className="w-4 h-4" />;
      case "relato_caso": return <FileText className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getModalityColor = (modality: string) => {
    switch (modality) {
      case "oral": return "bg-blue-100 text-blue-800";
      case "pôster": return "bg-green-100 text-green-800";
      case "vídeo": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Busca Principal */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar por título, autor, palavra-chave ou resumo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-4 py-2 text-sm"
        />
      </div>

      {/* Filtros Rápidos */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "todas" ? "default" : "outline"}
          onClick={() => setSelectedCategory("todas")}
          className="flex items-center gap-1 text-xs h-7"
        >
          <Filter className="w-3 h-3" />
          Todas as Categorias
        </Button>
        
        <Button
          variant={selectedCategory === "científico" ? "default" : "outline"}
          onClick={() => setSelectedCategory("científico")}
          className="flex items-center gap-1 text-xs h-7"
        >
          <BookOpen className="w-3 h-3" />
          Científicos
        </Button>
        
        <Button
          variant={selectedCategory === "relato_experiencia" ? "default" : "outline"}
          onClick={() => setSelectedCategory("relato_experiencia")}
          className="flex items-center gap-1 text-xs h-7"
        >
          <Video className="w-3 h-3" />
          Relatos de Experiência
        </Button>
        
        <Button
          variant={selectedCategory === "relato_caso" ? "default" : "outline"}
          onClick={() => setSelectedCategory("relato_caso")}
          className="flex items-center gap-1 text-xs h-7"
        >
          <FileText className="w-3 h-3" />
          Relatos de Caso
        </Button>
      </div>

      {/* Filtros por Modalidade */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-medium text-gray-600">Modalidade:</span>
        {["todas", "oral", "pôster", "vídeo"].map((modality) => (
          <Button
            key={modality}
            variant={selectedModality === modality ? "default" : "outline"}
            size="sm"
            className="text-xs h-6 px-2"
            onClick={() => setSelectedModality(modality)}
          >
            {modality}
          </Button>
        ))}
      </div>

      {/* Filtros por Dia */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-medium text-gray-600">Dia:</span>
        <Button
          variant={selectedDay === null ? "default" : "outline"}
          size="sm"
          className="text-xs h-6 px-2"
          onClick={() => setSelectedDay(null)}
        >
          Todos
        </Button>
        {[15, 16, 17, 18].map((day) => (
          <Button
            key={day}
            variant={selectedDay === day ? "default" : "outline"}
            size="sm"
            className="text-xs h-6 px-2"
            onClick={() => setSelectedDay(day)}
          >
            Dia {day}
          </Button>
        ))}
      </div>

      {/* Palavras-chave */}
      <div className="space-y-1">
        <span className="text-xs font-medium text-gray-600">Palavras-chave:</span>
        <div className="flex flex-wrap gap-1">
          {allKeywords.slice(0, 20).map((keyword) => (
            <Badge
              key={keyword}
              variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10 text-xs px-2 py-1"
              onClick={() => handleKeywordToggle(keyword)}
            >
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      {/* Limpar Filtros */}
      {(searchTerm || selectedCategory !== "todas" || selectedModality !== "todas" || selectedDay || selectedKeywords.length > 0) && (
        <Button variant="outline" onClick={clearFilters} className="flex items-center gap-1 text-xs h-6">
          <X className="w-3 h-3" />
          Limpar Filtros
        </Button>
      )}

      {/* Resultados */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {loading || isSearching ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Carregando...
              </span>
            ) : (
              `${filteredWorks.length} trabalho(s) encontrado(s)`
            )}
          </h3>
          <div className="text-xs text-gray-500">
            {selectedKeywords.length > 0 && `${selectedKeywords.length} palavra(s)-chave selecionada(s)`}
          </div>
        </div>

        {/* Lista de Trabalhos */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {filteredWorks.map((work) => (
            <Card
              key={work.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onWorkSelect(work)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-2 line-clamp-2">
                      {work.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Users className="w-4 h-4" />
                      <span>{work.authors.map((a: any) => a.name).join(", ")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(work.category)}
                    <Badge className={getModalityColor(work.modality)}>
                      {work.modality}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {work.abstract}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Dia {work.schedule.day} - {work.schedule.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{work.schedule.room}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {work.keywords.slice(0, 3).map((keyword: string) => (
                    <Badge key={keyword} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {work.keywords.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{work.keywords.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
