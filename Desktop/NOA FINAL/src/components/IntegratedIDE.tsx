/**
 * IDE Integrado - Ambiente de Desenvolvimento Completo
 * Estilo Cursor/VS Code dentro da plataforma Nôa Esperanza
 */

import React, { useState, useRef, useEffect } from 'react'
import { collaborativeDevelopmentService } from '../services/collaborativeDevelopmentService'

interface FileNode {
  name: string
  path: string
  type: 'file' | 'folder'
  content?: string
  children?: FileNode[]
  isOpen?: boolean
}

interface Terminal {
  id: string
  output: string[]
  input: string
}

const IntegratedIDE: React.FC = () => {
  const [files, setFiles] = useState<FileNode[]>([
    {
      name: 'src',
      path: 'src',
      type: 'folder',
      isOpen: true,
      children: [
        {
          name: 'components',
          path: 'src/components',
          type: 'folder',
          children: []
        },
        {
          name: 'services',
          path: 'src/services',
          type: 'folder',
          children: []
        }
      ]
    }
  ])
  
  const [openFiles, setOpenFiles] = useState<FileNode[]>([])
  const [activeFile, setActiveFile] = useState<FileNode | null>(null)
  const [code, setCode] = useState('')
  const [terminal, setTerminal] = useState<Terminal>({
    id: 'main',
    output: ['Nôa IDE v1.0 - Terminal integrado', '> '],
    input: ''
  })
  const [showTerminal, setShowTerminal] = useState(true)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    { role: 'assistant', content: '👨‍⚕️ **Dr. Ricardo Valença reconhecido!**\n\nOlá, Dr. Ricardo! Ambiente de desenvolvimento ativo.\n\n💻 **Comandos disponíveis:**\n- "criar arquivo [nome]"\n- "criar componente [nome]"\n- "executar código"\n- "abrir [arquivo]"\n\nO que vamos desenvolver?' }
  ])

  const codeEditorRef = useRef<HTMLTextAreaElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminal.output])

  const createFile = (name: string, path: string, content: string = '') => {
    const newFile: FileNode = {
      name,
      path: `${path}/${name}`,
      type: 'file',
      content
    }
    
    // Adicionar à árvore de arquivos
    const updateTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.path === path && node.type === 'folder') {
          return {
            ...node,
            children: [...(node.children || []), newFile]
          }
        }
        if (node.children) {
          return {
            ...node,
            children: updateTree(node.children)
          }
        }
        return node
      })
    }
    
    setFiles(updateTree(files))
    openFile(newFile)
    
    addTerminalOutput(`✅ Arquivo criado: ${newFile.path}`)
  }

  const openFile = (file: FileNode) => {
    if (!openFiles.find(f => f.path === file.path)) {
      setOpenFiles([...openFiles, file])
    }
    setActiveFile(file)
    setCode(file.content || '')
  }

  const closeFile = (file: FileNode) => {
    const newOpenFiles = openFiles.filter(f => f.path !== file.path)
    setOpenFiles(newOpenFiles)
    
    if (activeFile?.path === file.path) {
      setActiveFile(newOpenFiles[0] || null)
      setCode(newOpenFiles[0]?.content || '')
    }
  }

  const saveFile = () => {
    if (!activeFile) return
    
    // Atualizar conteúdo do arquivo
    const updateContent = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.path === activeFile.path) {
          return { ...node, content: code }
        }
        if (node.children) {
          return { ...node, children: updateContent(node.children) }
        }
        return node
      })
    }
    
    setFiles(updateContent(files))
    
    // Atualizar em openFiles
    setOpenFiles(openFiles.map(f => 
      f.path === activeFile.path ? { ...f, content: code } : f
    ))
    
    addTerminalOutput(`💾 Arquivo salvo: ${activeFile.name}`)
  }

  const addTerminalOutput = (text: string) => {
    setTerminal(prev => ({
      ...prev,
      output: [...prev.output, text, '> ']
    }))
  }

  const executeTerminalCommand = (command: string) => {
    addTerminalOutput(command)
    
    const parts = command.trim().split(' ')
    const cmd = parts[0].toLowerCase()
    
    switch(cmd) {
      case 'help':
        addTerminalOutput('Comandos disponíveis:')
        addTerminalOutput('  create <file> - Criar arquivo')
        addTerminalOutput('  run - Executar código')
        addTerminalOutput('  clear - Limpar terminal')
        addTerminalOutput('  ls - Listar arquivos')
        break
        
      case 'clear':
        setTerminal({ ...terminal, output: ['> '] })
        break
        
      case 'create':
        if (parts[1]) {
          createFile(parts[1], 'src', '// Novo arquivo criado\n')
        } else {
          addTerminalOutput('❌ Uso: create <nome-arquivo>')
        }
        break
        
      case 'run':
        addTerminalOutput('🚀 Executando código...')
        try {
          // Simular execução
          addTerminalOutput('✅ Código executado com sucesso')
        } catch (error) {
          addTerminalOutput(`❌ Erro: ${error}`)
        }
        break
        
      case 'ls':
        addTerminalOutput('📁 Arquivos:')
        files.forEach(file => {
          addTerminalOutput(`  ${file.type === 'folder' ? '📁' : '📄'} ${file.name}`)
        })
        break
        
      default:
        addTerminalOutput(`❌ Comando não reconhecido: ${cmd}`)
        addTerminalOutput('Digite "help" para ver comandos disponíveis')
    }
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return
    
    const userMessage = chatInput
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setChatInput('')
    
    // Processar comando de desenvolvimento
    const lower = userMessage.toLowerCase()
    
    if (lower.includes('criar arquivo')) {
      const match = userMessage.match(/criar arquivo (.+)/i)
      if (match) {
        const fileName = match[1].trim()
        createFile(fileName, 'src', `// Arquivo ${fileName} criado por comando\n`)
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `✅ Arquivo \`${fileName}\` criado com sucesso! Você pode editá-lo agora no editor.` 
        }])
      }
    } else if (lower.includes('criar componente')) {
      const match = userMessage.match(/criar componente (.+)/i)
      if (match) {
        const componentName = match[1].trim()
        const task = await collaborativeDevelopmentService.startDevelopmentTask(userMessage)
        const codeGens = await collaborativeDevelopmentService.generateCode(task)
        
        codeGens.forEach(gen => {
          const fileName = gen.fileName.split('/').pop() || 'component.tsx'
          createFile(fileName, 'src/components', gen.content)
        })
        
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `🚀 Componente \`${componentName}\` criado!\n\n📁 Arquivos gerados:\n${codeGens.map(g => `• ${g.fileName}`).join('\n')}\n\nVocê pode editá-los agora no editor.` 
        }])
      }
    } else {
      // Resposta genérica
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Dr. Ricardo, entendi "${userMessage}". Posso ajudar a:\n• Criar arquivos e componentes\n• Executar código\n• Debugar problemas\n\nO que gostaria de fazer?` 
      }])
    }
  }

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.path} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-slate-700 ${
            activeFile?.path === node.path ? 'bg-slate-700' : ''
          }`}
          onClick={() => {
            if (node.type === 'folder') {
              const updateTree = (nodes: FileNode[]): FileNode[] => {
                return nodes.map(n => {
                  if (n.path === node.path) {
                    return { ...n, isOpen: !n.isOpen }
                  }
                  if (n.children) {
                    return { ...n, children: updateTree(n.children) }
                  }
                  return n
                })
              }
              setFiles(updateTree(files))
            } else {
              openFile(node)
            }
          }}
        >
          <i className={`fas ${
            node.type === 'folder' 
              ? (node.isOpen ? 'fa-folder-open' : 'fa-folder')
              : 'fa-file-code'
          } text-gray-400`}></i>
          <span className="text-sm text-white">{node.name}</span>
        </div>
        {node.type === 'folder' && node.isOpen && node.children && (
          <div>{renderFileTree(node.children, level + 1)}</div>
        )}
      </div>
    ))
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <i className="fas fa-code text-emerald-400"></i>
            Nôa IDE - Dr. Ricardo Valença
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveFile}
            disabled={!activeFile}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm"
          >
            <i className="fas fa-save mr-2"></i>Salvar (Ctrl+S)
          </button>
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
          >
            <i className="fas fa-terminal mr-2"></i>Terminal
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Explorer */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-400 uppercase">Arquivos</h2>
              <button
                onClick={() => createFile('novo-arquivo.tsx', 'src')}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
            {renderFileTree(files)}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          {openFiles.length > 0 && (
            <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center overflow-x-auto">
              {openFiles.map(file => (
                <div
                  key={file.path}
                  className={`flex items-center gap-2 px-4 py-2 border-r border-slate-700 cursor-pointer ${
                    activeFile?.path === file.path ? 'bg-slate-700' : 'hover:bg-slate-700'
                  }`}
                  onClick={() => {
                    setActiveFile(file)
                    setCode(file.content || '')
                  }}
                >
                  <i className="fas fa-file-code text-xs text-gray-400"></i>
                  <span className="text-sm">{file.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      closeFile(file)
                    }}
                    className="text-gray-400 hover:text-white ml-2"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 flex overflow-hidden">
            {/* Code Editor */}
            <div className="flex-1 overflow-hidden">
              {activeFile ? (
                <div className="h-full flex flex-col">
                  <textarea
                    ref={codeEditorRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.ctrlKey && e.key === 's') {
                        e.preventDefault()
                        saveFile()
                      }
                    }}
                    className="flex-1 w-full p-4 bg-slate-900 text-white font-mono text-sm resize-none focus:outline-none"
                    style={{ tabSize: 2 }}
                    spellCheck={false}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <i className="fas fa-code text-6xl mb-4"></i>
                    <p>Nenhum arquivo aberto</p>
                    <p className="text-sm mt-2">Crie ou abra um arquivo para começar</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Assistant */}
            <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col">
              <div className="p-3 border-b border-slate-700">
                <h3 className="font-semibold flex items-center gap-2">
                  <i className="fas fa-robot text-emerald-400"></i>
                  Assistente Nôa
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`inline-block p-3 rounded-lg text-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-white'
                      }`}
                      style={{ maxWidth: '85%', whiteSpace: 'pre-wrap' }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 border-t border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                    placeholder="Digite um comando..."
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleChatSubmit}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal */}
          {showTerminal && (
            <div className="h-48 bg-black border-t border-slate-700 flex flex-col">
              <div className="h-8 bg-slate-800 flex items-center justify-between px-3 border-b border-slate-700">
                <span className="text-xs text-gray-400">Terminal</span>
                <button
                  onClick={() => setShowTerminal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
              <div
                ref={terminalRef}
                className="flex-1 overflow-y-auto p-2 font-mono text-sm text-green-400"
              >
                {terminal.output.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
                <div className="flex">
                  <span className="text-green-400">{'> '}</span>
                  <input
                    type="text"
                    value={terminal.input}
                    onChange={(e) => setTerminal({ ...terminal, input: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        executeTerminalCommand(terminal.input)
                        setTerminal({ ...terminal, input: '' })
                      }
                    }}
                    className="flex-1 bg-transparent border-none outline-none text-green-400 ml-1"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default IntegratedIDE
