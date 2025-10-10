// 📤 DOCUMENT UPLOAD MODAL - SISTEMA HÍBRIDO
// Upload de DOCX/PDF com extração automática
// ==============================================================================

import { useState } from 'react'
import { gptBuilderService, DocumentMaster } from '../services/gptBuilderService'

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (document: DocumentMaster) => void
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [type, setType] = useState<DocumentMaster['type']>('knowledge')
  const [category, setCategory] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [error, setError] = useState<string>('')

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validar tipo de arquivo
      const validTypes = ['.docx', '.pdf', '.txt']
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'))
      
      if (!validTypes.includes(fileExtension)) {
        setError('Formato não suportado. Use DOCX, PDF ou TXT.')
        return
      }
      
      setFile(selectedFile)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Selecione um arquivo')
      return
    }

    if (!category.trim()) {
      setError('Digite uma categoria')
      return
    }

    try {
      setIsUploading(true)
      setProgress('📤 Fazendo upload...')
      setError('')

      // Upload e extração automática
      setProgress('🔍 Extraindo texto do documento...')
      const document = await gptBuilderService.uploadAndExtractDocument(
        file,
        type,
        category
      )

      if (!document) {
        throw new Error('Falha ao processar documento')
      }

      setProgress('✅ Documento processado com sucesso!')
      
      // Limpar formulário
      setFile(null)
      setCategory('')
      
      // Callback de sucesso
      onSuccess(document)
      
      // Fechar após 1 segundo
      setTimeout(() => {
        onClose()
        setProgress('')
      }, 1000)

    } catch (err: any) {
      console.error('❌ Erro no upload:', err)
      setError(err.message || 'Erro ao fazer upload')
      setProgress('')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      setFile(null)
      setCategory('')
      setError('')
      setProgress('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📤</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Upload de Documento</h2>
                <p className="text-white/80 text-sm">Extraia conhecimento de DOCX, PDF ou TXT</p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Seleção de Arquivo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              📄 Arquivo
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".docx,.pdf,.txt"
                disabled={isUploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <span className="text-lg">✅</span>
                <span className="font-medium">{file.name}</span>
                <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Formatos suportados: DOCX, PDF, TXT (máximo 10MB)
            </p>
          </div>

          {/* Tipo de Documento */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              📚 Tipo de Conhecimento
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DocumentMaster['type'])}
              disabled={isUploading}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <option value="knowledge">🧠 Conhecimento Médico</option>
              <option value="personality">💭 Personalidade/Comportamento</option>
              <option value="instructions">📋 Instruções/Protocolos</option>
              <option value="examples">💡 Exemplos/Casos</option>
            </select>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              🏷️ Categoria
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Cannabis Medicinal, Neurologia, IMRE..."
              disabled={isUploading}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
            <p className="text-xs text-gray-500">
              Ajuda a organizar e buscar o conhecimento depois
            </p>
          </div>

          {/* Progresso */}
          {progress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm font-medium flex items-center gap-2">
                {progress.includes('✅') ? (
                  <span className="text-lg">✅</span>
                ) : (
                  <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {progress}
              </p>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm font-medium flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {error}
              </p>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <span>💡</span>
              O que acontece após o upload:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-start gap-2">
                <span>1️⃣</span>
                <span>O texto é extraído automaticamente do documento</span>
              </li>
              <li className="flex items-start gap-2">
                <span>2️⃣</span>
                <span>É salvo na base de conhecimento da Nôa</span>
              </li>
              <li className="flex items-start gap-2">
                <span>3️⃣</span>
                <span>A IA passa a usar esse conhecimento nas respostas</span>
              </li>
              <li className="flex items-start gap-2">
                <span>4️⃣</span>
                <span>Você pode editar ou remover depois</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || !category.trim() || isUploading}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processando...
              </span>
            ) : (
              '📤 Fazer Upload'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
