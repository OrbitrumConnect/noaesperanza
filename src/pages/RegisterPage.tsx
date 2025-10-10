import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Specialty } from '../App'
import { consentService, ConsentType } from '../services/consentService'
import { supabase } from '../integrations/supabase/client'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient' as 'patient' | 'doctor' | 'admin',
    specialty: 'rim' as Specialty,
    crm: '',
    phone: ''
  })
  const [consents, setConsents] = useState({
    lgpd: false,
    termsOfUse: false,
    dataSharing: true, // Padrão: sim
    research: false,
    emailNotifications: true, // Padrão: sim
    smsNotifications: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (formData.role === 'doctor' && !formData.crm) {
      setError('CRM é obrigatório para médicos')
      return
    }

    // 🔐 Validar consentimentos obrigatórios
    if (!consents.lgpd || !consents.termsOfUse) {
      setError('Você precisa aceitar a Política de Privacidade e os Termos de Uso')
      return
    }

    try {
      setError('')
      setLoading(true)
      
      const userData = {
        name: formData.name,
        role: formData.role,
        specialty: formData.role === 'doctor' ? formData.specialty : undefined
      }

      await signUp(formData.email, formData.password, userData)
      
      // 🔐 Salvar consentimentos após criar usuário
      // Buscar usuário do Supabase
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await consentService.saveMultipleConsents(user.id, consents as Record<ConsentType, boolean>)
      }
      
      navigate('/app/')
    } catch (error: any) {
      setError(error.message || 'Erro ao criar conta')
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
            <h1 className="text-2xl font-bold text-premium mb-2">Criar Conta</h1>
            <p className="text-gray-400">Junte-se à plataforma NOA Esperanza</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Nome Completo *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Usuário *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                required
              >
                <option value="patient">Paciente</option>
                <option value="doctor">Médico</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {formData.role === 'doctor' && (
              <>
                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-300 mb-2">
                    Especialidade *
                  </label>
                  <select
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    required
                  >
                    <option value="rim">Nefrologia</option>
                    <option value="neuro">Neurologia</option>
                    <option value="cannabis">Cannabis Medicinal</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="crm" className="block text-sm font-medium text-gray-300 mb-2">
                    CRM *
                  </label>
                  <input
                    id="crm"
                    name="crm"
                    type="text"
                    value={formData.crm}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    placeholder="123456"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Telefone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar Senha *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                placeholder="••••••••"
                required
              />
            </div>

            {/* 🔐 CONSENTIMENTOS LGPD */}
            <div className="space-y-3 border-t border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">
                Consentimentos e Permissões
              </h3>
              
              {/* Obrigatórios */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents.lgpd}
                  onChange={(e) => setConsents(prev => ({ ...prev, lgpd: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-green-500 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                  required
                />
                <span className="text-sm text-gray-300">
                  Li e concordo com a Política de Privacidade e o tratamento dos meus dados conforme a LGPD *
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents.termsOfUse}
                  onChange={(e) => setConsents(prev => ({ ...prev, termsOfUse: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-green-500 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                  required
                />
                <span className="text-sm text-gray-300">
                  Li e aceito os Termos de Uso da plataforma *
                </span>
              </label>

              {/* Opcionais */}
              <div className="border-t border-gray-700 pt-3 mt-3">
                <p className="text-xs text-gray-400 mb-2">Permissões opcionais (você pode alterar depois):</p>
                
                <label className="flex items-start gap-3 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={consents.dataSharing}
                    onChange={(e) => setConsents(prev => ({ ...prev, dataSharing: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-green-500 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-300">
                    Autorizo compartilhar meus dados clínicos com médicos da plataforma
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={consents.research}
                    onChange={(e) => setConsents(prev => ({ ...prev, research: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-green-500 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-300">
                    Autorizo uso dos meus dados (anonimizados) para pesquisa científica
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={consents.emailNotifications}
                    onChange={(e) => setConsents(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-green-500 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-300">
                    Desejo receber notificações por email
                  </span>
                </label>
              </div>
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
                  Criando conta...
                </div>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
