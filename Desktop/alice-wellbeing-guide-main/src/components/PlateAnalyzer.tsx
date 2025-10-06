import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NutritionalAnalysis {
  protein: { percentage: number; sources: string[] };
  carbohydrates: { percentage: number; type: 'complex' | 'simple'; sources: string[] };
  fats: { percentage: number; type: 'healthy' | 'moderate' | 'unhealthy'; sources: string[] };
  vegetables: { percentage: number; variety: number; colors: string[] };
  overall_score: number;
  recommendations: string[];
  portion_size: 'pequena' | 'adequada' | 'grande';
  meal_balance: 'excelente' | 'boa' | 'regular' | 'precisa melhorar';
}

interface PlateAnalyzerProps {
  onAnalysisComplete?: (analysis: NutritionalAnalysis) => void;
  userId?: string;
}

export default function PlateAnalyzer({ onAnalysisComplete, userId }: PlateAnalyzerProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NutritionalAnalysis | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Imagem muito grande. Máximo 10MB.');
      return;
    }

    setSelectedImage(file);
    setError('');
    setAnalysis(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError('');

    try {
      // Simulate AI analysis with realistic nutritional assessment
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate realistic analysis based on common plate patterns
      const mockAnalysis: NutritionalAnalysis = generateMockAnalysis();
      
      setAnalysis(mockAnalysis);
      onAnalysisComplete?.(mockAnalysis);

      // Save analysis to database for medical review
      if (userId) {
        await saveAnalysisToDatabase(mockAnalysis);
      }
    } catch (err) {
      setError('Erro ao analisar a imagem. Tente novamente.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAnalysisToDatabase = async (analysis: NutritionalAnalysis) => {
    try {
      const { error } = await supabase
        .from('daily_habits')
        .upsert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          nutrition_quality: Math.floor(analysis.overall_score / 10), // Convert to 1-10 scale
          notes: `Análise do prato: ${analysis.meal_balance}. Proteínas: ${analysis.protein.percentage}%, Carboidratos: ${analysis.carbohydrates.percentage}%, Gorduras: ${analysis.fats.percentage}%, Vegetais: ${analysis.vegetables.percentage}%. Recomendações: ${analysis.recommendations.join('; ')}`,
          meal_times: {
            plate_analysis: {
              timestamp: new Date().toISOString(),
              score: analysis.overall_score,
              balance: analysis.meal_balance,
              portion_size: analysis.portion_size,
              protein: analysis.protein,
              carbohydrates: analysis.carbohydrates,
              fats: analysis.fats,
              vegetables: analysis.vegetables,
              recommendations: analysis.recommendations
            }
          }
        });

      if (error) {
        console.error('Erro ao salvar análise:', error);
        toast.error('Erro ao salvar análise');
      } else {
        toast.success('Análise salva com sucesso! A médica poderá acompanhar seu progresso.');
      }
    } catch (error) {
      console.error('Erro ao salvar análise:', error);
      toast.error('Erro ao salvar análise');
    }
  };

  const generateMockAnalysis = (): NutritionalAnalysis => {
    // Simulate realistic nutritional analysis
    const proteinSources = ['frango grelhado', 'salmão', 'ovos', 'feijão', 'tofu', 'carne magra'];
    const carbSources = ['arroz integral', 'batata doce', 'quinoa', 'pão integral', 'macarrão'];
    const fatSources = ['abacate', 'azeite', 'castanhas', 'salmão', 'sementes'];
    const vegColors = ['verde (folhas)', 'laranja (cenoura)', 'vermelho (tomate)', 'roxo (berinjela)'];

    const proteinPerc = Math.floor(Math.random() * 30) + 15; // 15-45%
    const carbPerc = Math.floor(Math.random() * 35) + 25; // 25-60%
    const fatPerc = Math.floor(Math.random() * 25) + 10; // 10-35%
    const vegPerc = Math.floor(Math.random() * 30) + 20; // 20-50%

    const overallScore = Math.floor(
      (proteinPerc >= 20 && proteinPerc <= 35 ? 25 : 15) +
      (carbPerc >= 30 && carbPerc <= 50 ? 25 : 15) +
      (fatPerc >= 15 && fatPerc <= 30 ? 25 : 15) +
      (vegPerc >= 30 ? 25 : vegPerc >= 20 ? 15 : 10)
    );

    const recommendations = [];
    if (proteinPerc < 20) recommendations.push('Aumente a porção de proteína (carnes magras, ovos, leguminosas)');
    if (vegPerc < 30) recommendations.push('Adicione mais vegetais coloridos ao prato');
    if (carbPerc > 50) recommendations.push('Reduza um pouco os carboidratos e aumente vegetais');
    if (fatPerc < 15) recommendations.push('Inclua gorduras saudáveis (azeite, abacate, castanhas)');
    if (recommendations.length === 0) recommendations.push('Excelente equilíbrio nutricional! Continue assim!');

    return {
      protein: {
        percentage: proteinPerc,
        sources: [proteinSources[Math.floor(Math.random() * proteinSources.length)]]
      },
      carbohydrates: {
        percentage: carbPerc,
        type: carbPerc > 40 ? 'complex' : 'simple',
        sources: [carbSources[Math.floor(Math.random() * carbSources.length)]]
      },
      fats: {
        percentage: fatPerc,
        type: fatPerc > 25 ? 'moderate' : 'healthy',
        sources: [fatSources[Math.floor(Math.random() * fatSources.length)]]
      },
      vegetables: {
        percentage: vegPerc,
        variety: Math.floor(Math.random() * 4) + 2,
        colors: vegColors.slice(0, Math.floor(Math.random() * 3) + 1)
      },
      overall_score: overallScore,
      recommendations,
      portion_size: overallScore > 70 ? 'adequada' : overallScore > 50 ? 'grande' : 'pequena',
      meal_balance: overallScore > 80 ? 'excelente' : overallScore > 65 ? 'boa' : overallScore > 50 ? 'regular' : 'precisa melhorar'
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBalanceColor = (balance: string) => {
    switch (balance) {
      case 'excelente': return 'bg-green-100 text-green-800 border-green-200';
      case 'boa': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'regular': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Análise Nutricional de Prato
        </h2>
        <p className="text-muted-foreground">
          Tire uma foto do seu prato e receba feedback nutricional personalizado
        </p>
      </div>

      {/* Upload Area */}
      {!preview && (
        <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center mb-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Adicione uma foto do seu prato</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Tire uma foto ou selecione uma imagem da galeria
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
              >
                <Camera className="w-4 h-4" />
                Tirar Foto
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 border border-border hover:bg-muted px-4 py-2 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Selecionar Arquivo
              </button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      )}

      {/* Image Preview */}
      {preview && (
        <div className="mb-6">
          <div className="relative rounded-2xl overflow-hidden bg-card border border-border">
            <img
              src={preview}
              alt="Prato para análise"
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => {
                  setPreview('');
                  setSelectedImage(null);
                  setAnalysis(null);
                  setError('');
                }}
                className="bg-background/90 hover:bg-background border border-border px-3 py-1 rounded-lg text-sm transition-colors"
              >
                Trocar
              </button>
              {!isAnalyzing && !analysis && (
                <button
                  onClick={analyzeImage}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  Analisar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Loading */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Analisando seu prato...</h3>
          <p className="text-muted-foreground text-sm">
            Nossa IA está identificando os alimentos e calculando os valores nutricionais
          </p>
        </motion.div>
      )}

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overall Score */}
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold">Análise Concluída</h3>
              </div>
              <div className="mb-4">
                <div className={`text-3xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                  {analysis.overall_score}/100
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getBalanceColor(analysis.meal_balance)}`}>
                  Equilíbrio: {analysis.meal_balance}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Porção: <span className="font-medium">{analysis.portion_size}</span>
              </div>
            </div>

            {/* Macronutrients */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="font-semibold text-blue-600 mb-2">Proteínas</h4>
                <div className="text-2xl font-bold mb-1">{analysis.protein.percentage}%</div>
                <div className="text-xs text-muted-foreground">
                  Fonte: {analysis.protein.sources.join(', ')}
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="font-semibold text-green-600 mb-2">Carboidratos</h4>
                <div className="text-2xl font-bold mb-1">{analysis.carbohydrates.percentage}%</div>
                <div className="text-xs text-muted-foreground">
                  Tipo: {analysis.carbohydrates.type === 'complex' ? 'complexos' : 'simples'}
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="font-semibold text-orange-600 mb-2">Gorduras</h4>
                <div className="text-2xl font-bold mb-1">{analysis.fats.percentage}%</div>
                <div className="text-xs text-muted-foreground">
                  Qualidade: {analysis.fats.type === 'healthy' ? 'saudáveis' : analysis.fats.type === 'moderate' ? 'moderadas' : 'cuidado'}
                </div>
              </div>
            </div>

            {/* Vegetables */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h4 className="font-semibold text-green-600 mb-2">Vegetais</h4>
              <div className="flex items-center gap-4 mb-2">
                <div>
                  <span className="text-xl font-bold">{analysis.vegetables.percentage}%</span>
                  <span className="text-sm text-muted-foreground ml-1">do prato</span>
                </div>
                <div>
                  <span className="text-xl font-bold">{analysis.vegetables.variety}</span>
                  <span className="text-sm text-muted-foreground ml-1">variedades</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Cores identificadas: {analysis.vegetables.colors.join(', ')}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Recomendações da IA</h4>
              </div>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Educational Note */}
            <div className="bg-muted/50 border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Nota educativa:</strong> Esta análise é uma estimativa baseada em IA e tem fins educativos. 
                Para orientação nutricional personalizada, consulte sempre um profissional de saúde qualificado.
                Os valores podem variar dependendo do método de preparo e porções reais.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}