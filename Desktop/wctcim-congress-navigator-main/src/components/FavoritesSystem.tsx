import { useState, useEffect } from "react";
import { Heart, Play, Download, ExternalLink, Trash2, Share2, BookOpen, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import scientificWorks from "@/data/scientificWorks.json";

interface FavoritesSystemProps {
  onWorkSelect: (work: any) => void;
}

export const FavoritesSystem = ({ onWorkSelect }: FavoritesSystemProps) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playlist, setPlaylist] = useState<string[]>([]);

  // Carregar favoritos do localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('wctcim-favorites');
    const savedPlaylist = localStorage.getItem('wctcim-playlist');
    
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    if (savedPlaylist) {
      setPlaylist(JSON.parse(savedPlaylist));
    }
  }, []);

  // Salvar favoritos no localStorage
  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem('wctcim-favorites', JSON.stringify(newFavorites));
  };

  // Salvar playlist no localStorage
  const savePlaylist = (newPlaylist: string[]) => {
    setPlaylist(newPlaylist);
    localStorage.setItem('wctcim-playlist', JSON.stringify(newPlaylist));
  };

  const toggleFavorite = (workId: string) => {
    const newFavorites = favorites.includes(workId)
      ? favorites.filter(id => id !== workId)
      : [...favorites, workId];
    saveFavorites(newFavorites);
  };

  const togglePlaylist = (workId: string) => {
    const newPlaylist = playlist.includes(workId)
      ? playlist.filter(id => id !== workId)
      : [...playlist, workId];
    savePlaylist(newPlaylist);
  };

  const removeFromFavorites = (workId: string) => {
    const newFavorites = favorites.filter(id => id !== workId);
    saveFavorites(newFavorites);
  };

  const removeFromPlaylist = (workId: string) => {
    const newPlaylist = playlist.filter(id => id !== workId);
    savePlaylist(newPlaylist);
  };

  const clearAllFavorites = () => {
    saveFavorites([]);
  };

  const clearAllPlaylist = () => {
    savePlaylist([]);
  };

  const getFavoriteWorks = () => {
    return scientificWorks.filter(work => favorites.includes(work.id));
  };

  const getPlaylistWorks = () => {
    return scientificWorks.filter(work => playlist.includes(work.id));
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

  const WorkCard = ({ work, showRemoveButton = false, onRemove }: { 
    work: any; 
    showRemoveButton?: boolean; 
    onRemove?: (workId: string) => void;
  }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onWorkSelect(work)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getCategoryIcon(work.category)}
              <Badge className={getModalityColor(work.modality)}>
                {work.modality}
              </Badge>
            </div>
            <CardTitle className="text-sm line-clamp-2 mb-2">
              {work.title}
            </CardTitle>
            <p className="text-xs text-gray-600 mb-2">
              {work.authors.map((a: any) => a.name).join(", ")}
            </p>
          </div>
          {showRemoveButton && onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(work.id);
              }}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {work.abstract}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Dia {work.schedule.day} • {work.schedule.time} • {work.schedule.room}
          </div>
          <div className="flex gap-1">
            {work.media.pdf && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Download className="w-3 h-3" />
              </Button>
            )}
            {work.media.video && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Play className="w-3 h-3" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Meus Favoritos</h2>
        <p className="text-gray-600">Gerencie seus trabalhos favoritos e playlist personalizada</p>
      </div>

      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Favoritos ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="playlist" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Playlist ({playlist.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Trabalhos Favoritos</h3>
            {favorites.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFavorites}>
                Limpar Todos
              </Button>
            )}
          </div>

          {favorites.length === 0 ? (
            <Card className="p-8 text-center">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum favorito ainda
              </h3>
              <p className="text-gray-500">
                Clique no coração nos trabalhos para adicioná-los aos seus favoritos
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFavoriteWorks().map((work) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  showRemoveButton={true}
                  onRemove={removeFromFavorites}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="playlist" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Minha Playlist</h3>
            {playlist.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllPlaylist}>
                Limpar Playlist
              </Button>
            )}
          </div>

          {playlist.length === 0 ? (
            <Card className="p-8 text-center">
              <Play className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Playlist vazia
              </h3>
              <p className="text-gray-500">
                Adicione trabalhos à sua playlist para criar uma lista personalizada
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Estatísticas da Playlist */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{playlist.length}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {getPlaylistWorks().filter(w => w.media.video).length}
                  </div>
                  <div className="text-sm text-gray-600">Vídeos</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {getPlaylistWorks().filter(w => w.media.podcast).length}
                  </div>
                  <div className="text-sm text-gray-600">Podcasts</div>
                </Card>
              </div>

              {/* Lista da Playlist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getPlaylistWorks().map((work) => (
                  <WorkCard
                    key={work.id}
                    work={work}
                    showRemoveButton={true}
                    onRemove={removeFromPlaylist}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Ações Rápidas */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Compartilhar Favoritos
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Lista
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Reproduzir Playlist
          </Button>
        </div>
      </Card>
    </div>
  );
};
