import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Users, Star, Lock, CheckCircle, Video } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VideoLesson {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'orthomolecular' | 'physiotherapy' | 'mev';
  duration: string;
  views: number;
  rating: number;
  isUnlocked: boolean;
  thumbnail: string;
  videoUrl?: string;
  instructor: string;
}

interface VideoLibraryProps {
  hasAccess: boolean;
  onUpgrade: () => void;
}

// Conectar com dados reais do localStorage (vindos do admin)
const getVideosFromStorage = (): VideoLesson[] => {
  try {
    const stored = localStorage.getItem('admin_videos');
    if (stored) {
      const adminVideos = JSON.parse(stored);
      return adminVideos.map((video: any) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        category: video.category,
        duration: video.duration,
        views: video.views || 0,
        rating: 4.8,
        isUnlocked: true,
        thumbnail: '/thumbnails/default.jpg',
        videoUrl: video.url,
        instructor: 'Dra. Dayana'
      }));
    }
  } catch (error) {
    console.error('Erro ao carregar vídeos:', error);
  }
  
  // Retorna array vazio se houver erro  
  return [];
};

const categoryLabels = {
  nutrition: 'Nutrição',
  orthomolecular: 'Ortomolecular',
  physiotherapy: 'Fisioterapia',
  mev: 'MEV'
};

const categoryColors = {
  nutrition: 'bg-tertiary',
  orthomolecular: 'bg-primary',
  physiotherapy: 'bg-secondary',
  mev: 'bg-accent'
};

export default function VideoLibrary({ hasAccess, onUpgrade }: VideoLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [videos] = useState<VideoLesson[]>(getVideosFromStorage());
  
  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const categories = ['all', 'mev', 'nutrition', 'orthomolecular', 'physiotherapy'];

  const handleVideoPlay = (video: VideoLesson) => {
    if (!video.isUnlocked && !hasAccess) {
      onUpgrade();
      return;
    }
    setSelectedVideo(video);
    // In real app, this would open a video player modal
    console.log(`Playing video: ${video.title}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">🎥 Aulas em Vídeo</h2>
        <p className="text-muted-foreground">
          Aprenda diretamente com a Dra. Dayana através de aulas práticas e explicativas
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === 'all' ? 'Todos' : categoryLabels[category as keyof typeof categoryLabels]}
          </Button>
        ))}
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden cursor-pointer">
              {/* Thumbnail with play overlay */}
              <div 
                className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden"
                onClick={() => handleVideoPlay(video)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-16 w-16 text-primary/60" />
                </div>
                
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 rounded-full p-3">
                    <Play className="h-6 w-6 text-primary fill-current" />
                  </div>
                </div>

                {/* Lock overlay for locked content */}
                {!video.isUnlocked && !hasAccess && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center text-white space-y-2">
                      <Lock className="h-6 w-6 mx-auto" />
                      <p className="text-xs font-medium">Premium</p>
                    </div>
                  </div>
                )}

                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {video.duration}
                </div>

                {/* Category badge */}
                <Badge 
                  className={`absolute top-2 left-2 ${categoryColors[video.category]} text-white text-xs`}
                >
                  {categoryLabels[video.category]}
                </Badge>

                {/* Unlock status */}
                {(video.isUnlocked || hasAccess) && (
                  <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-success bg-white rounded-full" />
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <CardTitle className="text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {video.title}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {video.description}
                  </CardDescription>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {video.views.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                      {video.rating}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Por {video.instructor}
                </div>

                <Button 
                  className="w-full"
                  variant={(!video.isUnlocked && !hasAccess) ? "outline" : "default"}
                  onClick={() => handleVideoPlay(video)}
                >
                  {(!video.isUnlocked && !hasAccess) ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Desbloquear
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Assistir Agora
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Access message for non-premium users */}
      {!hasAccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20"
        >
          <Video className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">🎯 Acesso Completo às Aulas</h3>
          <p className="text-muted-foreground mb-4">
            Desbloqueie todas as aulas em vídeo da Dra. Dayana e acelere seu aprendizado
          </p>
          <Button onClick={onUpgrade} size="lg" className="font-semibold">
            Fazer Pagamento e Começar Agora
          </Button>
        </motion.div>
      )}
    </div>
  );
}