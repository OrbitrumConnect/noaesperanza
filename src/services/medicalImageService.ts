import { createWorker } from 'tesseract.js';

// Interface para dados médicos estruturados
export interface MedicalData {
  id?: string;
  exame: string;
  valor: number;
  unidade: string;
  referencia: string;
  status: 'normal' | 'alto' | 'baixo' | 'indefinido';
  data: Date;
  paciente_id: string;
  medico_id?: string;
  imagem_url?: string;
  texto_extraido: string;
  confianca_ocr: number;
  alertas?: MedicalAlert[];
}

export interface MedicalAlert {
  tipo: 'warning' | 'critical' | 'info';
  mensagem: string;
  recomendacao?: string;
}

// Base de dados de referências médicas
const REFERENCE_VALUES: Record<string, { min: number; max: number; unidade: string }> = {
  'creatinina': { min: 0.7, max: 1.3, unidade: 'mg/dL' },
  'glicose': { min: 70, max: 100, unidade: 'mg/dL' },
  'colesterol_total': { min: 0, max: 200, unidade: 'mg/dL' },
  'hdl': { min: 40, max: 999, unidade: 'mg/dL' },
  'ldl': { min: 0, max: 100, unidade: 'mg/dL' },
  'triglicerides': { min: 0, max: 150, unidade: 'mg/dL' },
  'hemoglobina': { min: 12, max: 16, unidade: 'g/dL' },
  'hematocrito': { min: 36, max: 46, unidade: '%' },
  'leucocitos': { min: 4000, max: 11000, unidade: '/mm³' },
  'plaquetas': { min: 150000, max: 450000, unidade: '/mm³' },
  'ureia': { min: 10, max: 50, unidade: 'mg/dL' },
  'acido_urico': { min: 3.5, max: 7.0, unidade: 'mg/dL' },
  'tsh': { min: 0.4, max: 4.0, unidade: 'mUI/L' },
  't4_livre': { min: 0.8, max: 1.8, unidade: 'ng/dL' },
  'vitamina_d': { min: 30, max: 100, unidade: 'ng/mL' },
  'b12': { min: 200, max: 900, unidade: 'pg/mL' },
  'ferritina': { min: 15, max: 200, unidade: 'ng/mL' },
  'proteina_c_reativa': { min: 0, max: 3, unidade: 'mg/L' },
  'velocidade_hemossedimentacao': { min: 0, max: 20, unidade: 'mm/h' },
  'albumina': { min: 3.5, max: 5.0, unidade: 'g/dL' }
};

export class MedicalImageService {
  
  // Extrai texto da imagem usando OCR
  static async extractTextFromImage(imageFile: File): Promise<{ text: string; confidence: number }> {
    try {
      console.log('🔍 Iniciando OCR...');
      
      const worker = await createWorker('por+eng'); // Português e Inglês
      
      const { data: { text, confidence } } = await worker.recognize(imageFile);
      
      await worker.terminate();

      console.log('✅ OCR concluído!');
      console.log('📝 Texto extraído:', text.substring(0, 200) + '...');
      console.log('🎯 Confiança:', Math.round(confidence), '%');

      return { text, confidence };
    } catch (error) {
      console.error('❌ Erro no OCR:', error);
      throw new Error('Falha ao processar imagem');
    }
  }

  // Processa texto extraído e estrutura dados médicos
  static async processMedicalText(text: string, confidence: number): Promise<MedicalData[]> {
    try {
      console.log('🤖 Processando texto com NOA GPT...');
      
      // Simula processamento com IA (aqui você integraria com OpenAI)
      const medicalData = this.parseMedicalText(text, confidence);
      
      console.log('✅ Dados médicos estruturados:', medicalData);
      return medicalData;
    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      throw new Error('Falha ao processar dados médicos');
    }
  }

  // Parser básico para extrair dados médicos do texto
  private static parseMedicalText(text: string, confidence: number): MedicalData[] {
    const results: MedicalData[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      // Procura por padrões de exames
      const examMatch = this.findExamPattern(line);
      if (examMatch) {
        const medicalData: MedicalData = {
          exame: examMatch.exame,
          valor: examMatch.valor,
          unidade: examMatch.unidade,
          referencia: examMatch.referencia,
          status: this.determineStatus(examMatch.exame, examMatch.valor),
          data: new Date(),
          paciente_id: 'current_user', // Será substituído pelo ID real
          texto_extraido: text,
          confianca_ocr: confidence,
          alertas: this.generateAlerts(examMatch.exame, examMatch.valor)
        };
        
        results.push(medicalData);
      }
    }
    
    return results;
  }

  // Encontra padrões de exames no texto
  private static findExamPattern(line: string): { exame: string; valor: number; unidade: string; referencia: string } | null {
    // Padrões comuns de exames
    const patterns = [
      // Creatinina: 1.2 mg/dL (0.7-1.3)
      /creatinina[:\s]*(\d+\.?\d*)\s*(mg\/dL|mg\/dl)[:\s]*\(?(\d+\.?\d*)-(\d+\.?\d*)\)?/i,
      // Glicose: 95 mg/dL (70-100)
      /glicose[:\s]*(\d+\.?\d*)\s*(mg\/dL|mg\/dl)[:\s]*\(?(\d+\.?\d*)-(\d+\.?\d*)\)?/i,
      // Colesterol: 180 mg/dL (<200)
      /colesterol[:\s]*(\d+\.?\d*)\s*(mg\/dL|mg\/dl)[:\s]*\(?<?(\d+\.?\d*)-?(\d+\.?\d*)?\)?/i,
      // HDL: 45 mg/dL (>40)
      /hdl[:\s]*(\d+\.?\d*)\s*(mg\/dL|mg\/dl)[:\s]*\(?>?(\d+\.?\d*)-?(\d+\.?\d*)?\)?/i,
      // LDL: 120 mg/dL (<100)
      /ldl[:\s]*(\d+\.?\d*)\s*(mg\/dL|mg\/dl)[:\s]*\(?<?(\d+\.?\d*)-?(\d+\.?\d*)?\)?/i,
      // Triglicérides: 150 mg/dL (<150)
      /triglic[eé]rides?[:\s]*(\d+\.?\d*)\s*(mg\/dL|mg\/dl)[:\s]*\(?<?(\d+\.?\d*)-?(\d+\.?\d*)?\)?/i,
      // Hemoglobina: 14 g/dL (12-16)
      /hemoglobina[:\s]*(\d+\.?\d*)\s*(g\/dL|g\/dl)[:\s]*\(?(\d+\.?\d*)-(\d+\.?\d*)\)?/i,
      // Hematócrito: 42% (36-46)
      /hemat[oó]crito[:\s]*(\d+\.?\d*)\s*%[:\s]*\(?(\d+\.?\d*)-(\d+\.?\d*)\)?/i,
      // Leucócitos: 8000 /mm³ (4000-11000)
      /leuc[oó]citos?[:\s]*(\d+\.?\d*)\s*\/mm³[:\s]*\(?(\d+\.?\d*)-(\d+\.?\d*)\)?/i,
      // Plaquetas: 250000 /mm³ (150000-450000)
      /plaquetas?[:\s]*(\d+\.?\d*)\s*\/mm³[:\s]*\(?(\d+\.?\d*)-(\d+\.?\d*)\)?/i
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const valor = parseFloat(match[1]);
        const unidade = match[2] || '%';
        const minRef = match[3] ? parseFloat(match[3]) : 0;
        const maxRef = match[4] ? parseFloat(match[4]) : 999;
        
        // Determina o nome do exame
        let exame = 'exame_desconhecido';
        if (line.toLowerCase().includes('creatinina')) exame = 'creatinina';
        else if (line.toLowerCase().includes('glicose')) exame = 'glicose';
        else if (line.toLowerCase().includes('colesterol')) exame = 'colesterol_total';
        else if (line.toLowerCase().includes('hdl')) exame = 'hdl';
        else if (line.toLowerCase().includes('ldl')) exame = 'ldl';
        else if (line.toLowerCase().includes('triglic')) exame = 'triglicerides';
        else if (line.toLowerCase().includes('hemoglobina')) exame = 'hemoglobina';
        else if (line.toLowerCase().includes('hemat')) exame = 'hematocrito';
        else if (line.toLowerCase().includes('leuc')) exame = 'leucocitos';
        else if (line.toLowerCase().includes('plaquet')) exame = 'plaquetas';

        return {
          exame,
          valor,
          unidade,
          referencia: `${minRef}-${maxRef}`
        };
      }
    }

    return null;
  }

  // Determina o status do exame (normal/alto/baixo)
  private static determineStatus(exame: string, valor: number): 'normal' | 'alto' | 'baixo' | 'indefinido' {
    const reference = REFERENCE_VALUES[exame];
    if (!reference) return 'indefinido';

    if (valor < reference.min) return 'baixo';
    if (valor > reference.max) return 'alto';
    return 'normal';
  }

  // Gera alertas baseados no status
  private static generateAlerts(exame: string, valor: number): MedicalAlert[] {
    const alerts: MedicalAlert[] = [];
    const status = this.determineStatus(exame, valor);
    const reference = REFERENCE_VALUES[exame];

    if (status === 'alto') {
      alerts.push({
        tipo: 'warning',
        mensagem: `${exame.toUpperCase()}: ${valor} - Acima do normal`,
        recomendacao: 'Consulte seu médico para avaliação'
      });
    } else if (status === 'baixo') {
      alerts.push({
        tipo: 'warning',
        mensagem: `${exame.toUpperCase()}: ${valor} - Abaixo do normal`,
        recomendacao: 'Consulte seu médico para avaliação'
      });
    } else if (status === 'normal') {
      alerts.push({
        tipo: 'info',
        mensagem: `${exame.toUpperCase()}: ${valor} - Dentro da normalidade`,
        recomendacao: 'Continue o acompanhamento regular'
      });
    }

    return alerts;
  }

  // Processa imagem completa (OCR + Estruturação)
  static async processMedicalImage(imageFile: File, userId: string): Promise<MedicalData[]> {
    try {
      console.log('🏥 Iniciando processamento de imagem médica...');
      
      // 1. Extrair texto com OCR
      const { text, confidence } = await this.extractTextFromImage(imageFile);
      
      // 2. Processar texto e estruturar dados
      const medicalData = await this.processMedicalText(text, confidence);
      
      // 3. Adicionar ID do usuário
      medicalData.forEach(data => {
        data.paciente_id = userId;
      });

      console.log('✅ Processamento concluído!', medicalData.length, 'exames encontrados');
      return medicalData;
      
    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      throw error;
    }
  }
}
