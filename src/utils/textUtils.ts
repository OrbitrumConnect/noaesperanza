// Utilitários para processamento de texto

/**
 * Limpa texto para áudio, removendo markdown e formatação mas preservando acentos
 */
export const cleanTextForAudio = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
    .replace(/\*(.*?)\*/g, '$1') // Remove *italic*
    .replace(/\[(.*?)\]/g, '$1') // Remove [brackets]
    .replace(/```[\s\S]*?```/g, '') // Remove blocos de código
    .replace(/`(.*?)`/g, '$1') // Remove código inline
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\n\n+/g, '. ') // Substitui múltiplas quebras por pontos
    .replace(/\n/g, ' ') // Remove quebras de linha simples
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .replace(/[^\w\s.,!?;:()-àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß]/g, '') // Remove caracteres especiais mas preserva acentos
    .trim()
}

/**
 * Normaliza texto removendo acentos para comparações
 */
export const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Formata texto para exibição, preservando quebras de linha
 */
export const formatTextForDisplay = (text: string): string => {
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .trim()
}
