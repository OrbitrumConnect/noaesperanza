import React, { useState } from 'react'
import { aiLearningService } from '../services/aiLearningService'

interface DocumentUploadModalProps {
  onClose: () => void
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [category, setCategory] = useState('general')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [extractedText, setExtractedText] = useState('')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Simular extração de texto (em produção, usar uma biblioteca real)
      setExtractedText(`Texto extraído de ${file.name}...`)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return

    setUploading(true)
    try {
      // Simular processamento do documento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Extrair palavras-chave do texto
      const keywords = await aiLearningService.detectKeywords(extractedText)
      
      // Salvar como aprendizado
      await aiLearningService.saveInteraction(
        `Documento: ${title}`,
        `Conteúdo do documento: ${extractedText}`,
        category
      )

      // Adicionar palavras-chave específicas
      for (const keyword of keywords) {
        await aiLearningService.addKeyword(keyword, category, 0.8)
      }

      alert('Documento processado e conhecimento adicionado à IA!')
      onClose()
    } catch (error) {
      console.error('Erro ao processar documento:', error)
      alert('Erro ao processar documento')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">📄 Upload de Documentos</h2>
              <p className="text-orange-100">Adicionar conhecimento à IA através de documentos</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          
          {/* Informações do Documento */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Documento
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Guia de Cannabis Medicinal"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="general">Geral</option>
                <option value="medical">Médico</option>
                <option value="cannabis">Cannabis</option>
                <option value="neurology">Neurologia</option>
                <option value="nephrology">Nefrologia</option>
                <option value="evaluation">Avaliação</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição do conteúdo do documento..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Upload de Arquivo */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Selecionar Arquivo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                <span className="text-sm text-gray-600">
                  Clique para selecionar ou arraste o arquivo aqui
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX, TXT (máx. 10MB)
                </span>
              </label>
            </div>
            
            {selectedFile && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  <i className="fas fa-check-circle mr-2"></i>
                  Arquivo selecionado: {selectedFile.name}
                </p>
              </div>
            )}
          </div>

          {/* Texto Extraído */}
          {extractedText && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Texto Extraído (Preview)
              </label>
              <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-700">{extractedText}</p>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !title.trim() || uploading}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processando...
                </>
              ) : (
                <>
                  <i className="fas fa-upload mr-2"></i>
                  Processar Documento
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentUploadModal
