// 💡 INTELLIGENT EDITOR - Dr. Ricardo Valença
// Editor com sugestões da Nôa Esperanza

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { openAIService } from '../services/openaiService'
import { activeContextService } from '../services/activeContextService'

interface IntelligentEditorProps {
  initialContent?: string
  onContentChange: (content: string) => void
  documentType?: string
  onSave?: (content: string) => void
}

interface Suggestion {
  id: string
  type: 'complement' | 'improvement' | 'continuation'
  text: string
  confidence: number
}

const IntelligentEditor: React.FC<IntelligentEditorProps> = ({
  initialContent = '',
  onContentChange,
  documentType = 'geral',
  onSave
}) => {
  const [content, setContent] = useState(initialContent)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionTimeoutRef = useRef<NodeJS.Timeout>()

  // 📝 ATUALIZAR CONTEÚDO
  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    onContentChange(newContent)
    
    // Debounce para gerar sugestões
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current)
    }
    
    suggestionTimeoutRef.current = setTimeout(() => {
      if (newContent.length > 50) {
        generateSuggestions(newContent)
      }
    }, 2000)
  }

  // 💡 GERAR SUGESTÕES DA NÔA ESPERANZA
  const generateSuggestions = async (text: string) => {
    setIsGenerating(true)
    
    try {
      const activeContext = await activeContextService.getActiveContext()
      const contextPrompt = await activeContextService.generateContextPrompt()
      
      const suggestionsPrompt = `
Você é Nôa Esperanza, mentora especializada em medicina e desenvolvimento tecnológico.

${contextPrompt}

TEXTO ATUAL:
${text}

TAREFA: Analise o texto e gere 3 sugestões para melhorar, complementar ou continuar o raciocínio:

1. **COMPLEMENTO:** Sugestão para enriquecer o conteúdo atual
2. **MELHORIA:** Reformulação para tornar mais claro/preciso
3. **CONTINUAÇÃO:** Próximo parágrafo ou ideia que seguiria naturalmente

IMPORTANTE:
- Mantenha o estilo da Nôa Esperanza (ritmo simbólico, escuta clínica, método ético)
- Seja específica e útil
- Considere o contexto ativo da sessão
- Cada sugestão deve ter 1-2 parágrafos

FORMATO DE RESPOSTA:
COMPLEMENTO: [sugestão de complemento]
MELHORIA: [sugestão de melhoria]
CONTINUAÇÃO: [sugestão de continuação]
`

      const response = await openAIService.getNoaResponse(suggestionsPrompt, [])
      
      // Processar resposta e extrair sugestões
      const newSuggestions = parseSuggestions(response)
      setSuggestions(newSuggestions)
      setShowSuggestions(true)
      
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // 🔍 PROCESSAR SUGESTÕES DA RESPOSTA
  const parseSuggestions = (response: string): Suggestion[] => {
    const suggestions: Suggestion[] = []
    
    // Extrair sugestões baseado nos marcadores
    const complementMatch = response.match(/COMPLEMENTO:\s*(.+?)(?=MELHORIA:|$)/s)
    const improvementMatch = response.match(/MELHORIA:\s*(.+?)(?=CONTINUAÇÃO:|$)/s)
    const continuationMatch = response.match(/CONTINUAÇÃO:\s*(.+?)$/s)
    
    if (complementMatch) {
      suggestions.push({
        id: 'complement_' + Date.now(),
        type: 'complement',
        text: complementMatch[1].trim(),
        confidence: 0.8
      })
    }
    
    if (improvementMatch) {
      suggestions.push({
        id: 'improvement_' + Date.now(),
        type: 'improvement',
        text: improvementMatch[1].trim(),
        confidence: 0.9
      })
    }
    
    if (continuationMatch) {
      suggestions.push({
        id: 'continuation_' + Date.now(),
        type: 'continuation',
        text: continuationMatch[1].trim(),
        confidence: 0.7
      })
    }
    
    return suggestions
  }

  // ✅ APLICAR SUGESTÃO
  const applySuggestion = (suggestion: Suggestion) => {
    let newContent = content
    
    switch (suggestion.type) {
      case 'complement':
        newContent += '\n\n' + suggestion.text
        break
      case 'improvement':
        // Substituir o último parágrafo pela melhoria
        const paragraphs = content.split('\n\n')
        paragraphs[paragraphs.length - 1] = suggestion.text
        newContent = paragraphs.join('\n\n')
        break
      case 'continuation':
        newContent += '\n\n' + suggestion.text
        break
    }
    
    setContent(newContent)
    onContentChange(newContent)
    setShowSuggestions(false)
    setSuggestions([])
  }

  // 💾 SALVAR DOCUMENTO
  const handleSave = () => {
    if (onSave) {
      onSave(content)
    }
  }

  // 🎯 DETECTAR POSIÇÃO DO CURSOR
  const handleCursorMove = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* 🎯 HEADER COM BOTÕES */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-blue-400">
          💡 Editor Inteligente da Nôa Esperanza
        </h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => generateSuggestions(content)}
            disabled={isGenerating || content.length < 50}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <i className="fas fa-lightbulb"></i>
            {isGenerating ? 'Gerando...' : 'Sugerir com Nôa'}
          </button>
          
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <i className="fas fa-save"></i>
            Salvar
          </button>
        </div>
      </div>

      {/* 📝 ÁREA DE EDIÇÃO */}
      <div className="flex-1 flex">
        <div className="flex-1 p-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onSelect={handleCursorMove}
            onKeyUp={handleCursorMove}
            placeholder="Comece a escrever... A Nôa Esperanza irá sugerir melhorias, complementos e continuações baseadas no contexto ativo da sessão."
            className="w-full h-full bg-transparent border-none outline-none resize-none text-gray-100 placeholder-gray-500 text-base leading-relaxed"
            style={{ minHeight: '400px' }}
          />
        </div>

        {/* 💡 PAINEL DE SUGESTÕES */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-96 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-purple-400">
                  💡 Sugestões da Nôa
                </h4>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-700 p-4 rounded-lg border border-gray-600"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-blue-400 uppercase">
                        {suggestion.type === 'complement' && '🔄 Complemento'}
                        {suggestion.type === 'improvement' && '✨ Melhoria'}
                        {suggestion.type === 'continuation' && '➡️ Continuação'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {Math.round(suggestion.confidence * 100)}% confiança
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-200 mb-3 leading-relaxed">
                      {suggestion.text}
                    </p>
                    
                    <button
                      onClick={() => applySuggestion(suggestion)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Aplicar Sugestão
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 📊 STATUS BAR */}
      <div className="flex justify-between items-center p-3 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>Caracteres: {content.length}</span>
          <span>Palavras: {content.split(/\s+/).filter(w => w.length > 0).length}</span>
          {isGenerating && (
            <span className="text-purple-400 flex items-center gap-1">
              <i className="fas fa-spinner fa-spin"></i>
              Gerando sugestões...
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span>Tipo: {documentType}</span>
          {suggestions.length > 0 && (
            <span className="text-purple-400">
              {suggestions.length} sugestões disponíveis
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default IntelligentEditor
