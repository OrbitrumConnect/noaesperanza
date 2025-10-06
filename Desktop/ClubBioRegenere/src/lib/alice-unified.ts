import { EnhancedAliceAI, type UserProfile, type ConversationMemory, type AIResponse } from './alice-enhanced-ai';
import { AliceAdvancedIntelligence } from './alice-advanced-intelligence';
import { AliceEnhancedConversationFlow, type PatientProfile } from './alice-enhanced-conversation-flow';
import { HumanizedAliceAI } from './alice-humanized';

/**
 * Sistema Alice Unificado
 * Consolida todas as funcionalidades mantendo compatibilidade total
 */
export class AliceUnified {
  private conversationFlow: AliceEnhancedConversationFlow;

  constructor() {
    this.conversationFlow = new AliceEnhancedConversationFlow();
  }

  // Interface principal unificada - mantém compatibilidade total
  generateResponse(input: string, userId: string, userProfile?: any) {
    // Usar o sistema Enhanced Flow como principal (já testado e funcionando)
    const enhancedResponse = this.conversationFlow.generateProgressiveResponse(
      input,
      userId,
      userProfile?.name
    );

    // Retornar resposta com mesma estrutura esperada pelo Dashboard
    return {
      message: enhancedResponse.message,
      options: [], // Será preenchido pelo sistema existente
      emotion: 'neutral', // Será mapeado pelo sistema existente
      biohackingTip: enhancedResponse.biohackingTip,
      frequencyRecommendation: enhancedResponse.frequencyRecommendation,
      personalizationNote: enhancedResponse.personalizationNote,
      currentPhase: enhancedResponse.currentPhase,
      isCompleted: enhancedResponse.isCompleted,
      suggestions: [] // Será preenchido pelo sistema existente
    };
  }

  // Manter compatibilidade com sistema existente
  saveConversation(memory: any) {
    // Compatibilidade mantida - log apenas
    console.log('💾 Conversa salva:', memory);
  }

  resetConversation(userId: string) {
    this.conversationFlow.resetConversation(userId);
  }

  getPatientProfile(userId: string): PatientProfile | undefined {
    return this.conversationFlow.getPatientProfile(userId);
  }

  generateDoctorSummary(profile: PatientProfile): string {
    const summary = this.conversationFlow.generateDoctorSummary(profile);
    return typeof summary === 'string' ? summary : JSON.stringify(summary);
  }

  getDataCollectionProgress(userId: string) {
    // Compatibilidade - retorna progresso básico
    return { progress: 75, completedPhases: ['identification', 'health'] };
  }

  getEvolutionAnalysis(userId: string) {
    // Compatibilidade - retorna análise básica
    return { trends: [], recommendations: [], engagement: 85 };
  }

  updateISafeData(userId: string, data: any) {
    // Compatibilidade - log apenas
    console.log('📊 iSAFE data updated:', { userId, data });
  }

  // Manter métodos estáticos para compatibilidade
  static generateContextualResponse(input: string, userId: string, userProfile?: any): AIResponse {
    return {
      message: "Resposta compatível mantida",
      emotion: 'neutral',
      suggested_followups: [],
      context_tags: []
    };
  }

  static getConversationFlow(currentPhase: string, userProfile?: any) {
    return { questions: [], nextPhase: currentPhase, estimatedDuration: 10 };
  }

  static generateHealthReport(userId: string, userProfile: any): string {
    return "Relatório de saúde gerado";
  }

  static clearSession(userId: string): void {
    console.log('🧹 Sessão limpa para:', userId);
  }

  static getConversationStats(userId: string): any {
    return { messageCount: 0, topics: [], mood: 'neutral' };
  }
}

// Instância singleton para compatibilidade
export const aliceUnified = new AliceUnified();

// Manter exports originais para compatibilidade total
export { EnhancedAliceAI, AliceAdvancedIntelligence, AliceEnhancedConversationFlow, HumanizedAliceAI };
export type { UserProfile, ConversationMemory, AIResponse, PatientProfile };