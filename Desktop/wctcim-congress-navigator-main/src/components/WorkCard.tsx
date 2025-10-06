import { useState } from "react";
import { X, Play, Download, Headphones, ExternalLink, Heart, Share2, Users, MapPin, Calendar, Clock, Globe, FileText, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PodcastPlayer } from "./PodcastPlayer";
import { usePodcast } from "@/hooks/usePodcast";

interface WorkCardProps {
  work: any;
  isOpen: boolean;
  onClose: () => void;
  onFavorite: (workId: string) => void;
  isFavorite: boolean;
}

export const WorkCard = ({ work, isOpen, onClose, onFavorite, isFavorite }: WorkCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPodcastPlayer, setShowPodcastPlayer] = useState(false);
  const { getPodcastByWorkId, generatePodcast, playPodcast } = usePodcast();

  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "científico": return <FileText className="w-5 h-5" />;
      case "relato_experiencia": return <Play className="w-5 h-5" />;
      case "relato_caso": return <FileText className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getModalityColor = (modality: string) => {
    switch (modality) {
      case "oral": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pôster": return "bg-green-100 text-green-800 border-green-200";
      case "vídeo": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "científico": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "relato_experiencia": return "bg-orange-100 text-orange-800 border-orange-200";
      case "relato_caso": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handlePlayPodcast = async () => {
    let podcast = getPodcastByWorkId(work.id);
    
    if (!podcast) {
      // Gerar podcast se não existir
      podcast = await generatePodcast(work.id, work.title);
    }
    
    if (podcast) {
      playPodcast(podcast);
      setShowPodcastPlayer(true);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: work.title,
        text: work.abstract,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Aqui você mostraria uma notificação de "Link copiado"
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Card */}
      <div className="fixed z-50 animate-fade-slide-in" style={{ 
        right: 'calc(1rem + 10%)', 
        top: 'calc(1rem + 3%)', 
        bottom: 'calc(1rem + 3%)', 
        width: 'calc(24rem + 4%)' 
      }}>
        <div className="h-full p-6 overflow-y-auto rounded-xl shadow-lg" style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon(work.category)}
                <Badge className={getCategoryColor(work.category)}>
                  {work.category.replace('_', ' ')}
                </Badge>
                <Badge className={getModalityColor(work.modality)}>
                  {work.modality}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight mb-2">
                {work.title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFavorite(work.id)}
                className={isFavorite ? "text-red-500" : "text-gray-400"}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Autores */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Autores
            </h3>
            <div className="space-y-2">
              {work.authors.map((author: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-800">{author.name}</div>
                  <div className="text-sm text-gray-600">{author.institution}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Globe className="w-3 h-3" />
                    <span>{author.country}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Informações da Apresentação */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Apresentação
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-800 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Dia {work.schedule.day}</span>
                </div>
                <div className="text-xs text-blue-600">{work.schedule.time}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-green-800 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{work.schedule.room}</span>
                </div>
                <div className="text-xs text-green-600">{work.schedule.duration} min</div>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Resumo</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {work.abstract}
            </p>
          </div>

          {/* Palavras-chave */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Palavras-chave</h3>
            <div className="flex flex-wrap gap-2">
              {work.keywords.map((keyword: string) => (
                <Badge key={keyword} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          {/* Mídia e Ações */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Recursos Disponíveis</h3>
            
            {/* PDF */}
            {work.media.pdf && (
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open(work.media.pdf, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
            )}

            {/* Vídeo */}
            {work.media.video && (
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open(work.media.video, '_blank')}
              >
                <Play className="w-4 h-4 mr-2" />
                Assistir Vídeo
              </Button>
            )}

            {/* Podcast */}
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handlePlayPodcast}
            >
              <Headphones className="w-4 h-4 mr-2" />
              {getPodcastByWorkId(work.id) ? "Ouvir Podcast" : "Gerar Podcast"}
            </Button>

            {/* Gerar Podcast com IA */}
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handlePlayPodcast}
            >
              <Mic className="w-4 h-4 mr-2" />
              Gerar com NotebookLM
            </Button>

            {/* Link Externo */}
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.open(`/works/${work.id}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Detalhes Completos
            </Button>
          </div>

          {/* Informações Adicionais */}
          <Separator className="my-6" />
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>ID:</span>
              <span>{work.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Idioma:</span>
              <span>{work.language}</span>
            </div>
            <div className="flex justify-between">
              <span>Região:</span>
              <span>{work.region}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge variant="outline" className="text-xs">
                {work.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Podcast Player */}
      {showPodcastPlayer && (
        <PodcastPlayer
          work={work}
          isOpen={showPodcastPlayer}
          onClose={() => setShowPodcastPlayer(false)}
        />
      )}
    </>
  );
};
