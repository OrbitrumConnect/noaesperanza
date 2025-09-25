import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useValidation } from '../hooks/useValidation'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const { validateEmail, validatePassword, sanitizeInput } = useValidation()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação de entrada
    if (!email || !password) {
      setError('Por favor, preencha todos os campos')
      return
    }

    if (!validateEmail(email)) {
      setError('Por favor, insira um email válido')
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message)
      return
    }

    // Sanitizar entrada
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPassword = sanitizeInput(password)

    try {
      setError('')
      setLoading(true)
      await signIn(sanitizedEmail, sanitizedPassword)
      navigate('/')
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-hidden flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6">
        <div className="premium-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <img 
                src="/logo-noa-triangulo.gif" 
                alt="NOA Esperanza" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h1 className="text-2xl font-bold text-premium mb-2">Bem-vindo de volta</h1>
            <p className="text-gray-400">Faça login na sua conta NOA Esperanza</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                loading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transform hover:scale-105'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-green-400 hover:text-green-300 font-medium">
                Cadastre-se
              </Link>
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Contas de Demonstração:</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Admin:</span>
                <span className="text-yellow-400">phpg69@gmail.com / p6p7p8P9!</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Médico:</span>
                <span className="text-green-400">medico@noa.com / 123456</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Paciente:</span>
                <span className="text-blue-400">paciente@noa.com / 123456</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
