import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Download, Clock, Star, Lock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Ebook {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'orthomolecular' | 'physiotherapy' | 'mev';
  readTime: string;
  rating: number;
  isUnlocked: boolean;
  coverImage: string;
  downloadUrl?: string;
}

interface EbooksLibraryProps {
  hasAccess: boolean;
  onUpgrade: () => void;
}

// Conectar com dados reais do localStorage (vindos do admin)
const getEbooksFromStorage = (): Ebook[] => {
  try {
    const stored = localStorage.getItem('admin_ebooks');
    if (stored) {
      const adminEbooks = JSON.parse(stored);
      return adminEbooks.map((ebook: any) => ({
        id: ebook.id,
        title: ebook.title,
        description: ebook.description,
        category: ebook.category,
        readTime: ebook.readTime,
        rating: 4.8,
        isUnlocked: true, // Todos desbloqueados para demonstração
        coverImage: ebook.coverImage,
        downloadUrl: ebook.fileUrl
      }));
    }
  } catch (error) {
    console.error('Erro ao carregar e-books:', error);
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

export default function EbooksLibrary({ hasAccess, onUpgrade }: EbooksLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [ebooks] = useState<Ebook[]>(getEbooksFromStorage());
  
  const filteredEbooks = selectedCategory === 'all' 
    ? ebooks 
    : ebooks.filter(ebook => ebook.category === selectedCategory);

  const categories = ['all', 'nutrition', 'orthomolecular', 'physiotherapy', 'mev'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">📚 Biblioteca Digital</h2>
        <p className="text-muted-foreground">
          Conteúdo exclusivo da Dra. Dayana sobre nutrição, ortomolecular e fisioterapia
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

      {/* E-books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEbooks.map((ebook, index) => (
          <motion.div
            key={ebook.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group hover:shadow-xl transition-all duration-200 relative overflow-hidden border-2 hover:border-primary/30">
              {/* Lock overlay for locked content */}
              {!ebook.isUnlocked && !hasAccess && (
                <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                  <div className="text-center text-white space-y-2">
                    <Lock className="h-8 w-8 mx-auto" />
                    <p className="text-sm font-medium">Acesso Premium</p>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={onUpgrade}
                      className="text-xs"
                    >
                      Desbloquear
                    </Button>
                  </div>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <Badge 
                    className={`${categoryColors[ebook.category]} text-white`}
                  >
                    {categoryLabels[ebook.category]}
                  </Badge>
                  {(ebook.isUnlocked || hasAccess) && (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                </div>
                
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center">
                  <Book className="h-16 w-16 text-primary/60" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                    {ebook.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {ebook.description}
                  </CardDescription>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {ebook.readTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    {ebook.rating}
                  </div>
                </div>

                <Button 
                  className="w-full"
                  disabled={!ebook.isUnlocked && !hasAccess}
                  onClick={() => {
                    if (!ebook.isUnlocked && !hasAccess) {
                      onUpgrade();
                    } else {
                      // Open e-book reader or download
                      console.log(`Opening ebook: ${ebook.title}`);
                    }
                  }}
                >
                  {(!ebook.isUnlocked && !hasAccess) ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Desbloquear
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PDF
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
          <Book className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">🎯 Desbloqueie Todo Conteúdo</h3>
          <p className="text-muted-foreground mb-4">
            Acesse nossa biblioteca completa com mais de 15 e-books exclusivos da Dra. Dayana
          </p>
          <Button onClick={onUpgrade} size="lg" className="font-semibold">
            Fazer Pagamento e Acessar Agora
          </Button>
        </motion.div>
      )}
    </div>
  );
}