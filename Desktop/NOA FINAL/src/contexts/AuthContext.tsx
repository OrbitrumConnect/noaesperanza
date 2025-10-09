import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../integrations/supabase/client'
import { authService, User } from '../services/supabaseService'

interface AuthContextType {
  user: SupabaseUser | null
  userProfile: User | null
  loading: boolean
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se Supabase está configurado
    const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                                 import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co' &&
                                 import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY &&
                                 import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY !== 'your_anon_key'

    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase não configurado - usando modo local')
      setUser(null)
      setUserProfile(null)
      setLoading(false)
      return
    }

    // Obter sessão inicial (não bloqueante)
    const getInitialSession = async () => {
      try {
        // Timeout adequado para conexão
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout geral')), 10000)
        )
        
        const sessionPromise = supabase.auth.getSession()
        const result = await Promise.race([sessionPromise, timeoutPromise]) as any
        
        if (!result || result.error) {
          // Se é erro de token inválido, limpar e continuar
          if (result?.error?.message?.includes('Invalid Refresh Token')) {
            console.log('🔄 Token inválido, limpando sessão...')
            await supabase.auth.signOut()
            setUser(null)
            setUserProfile(null)
            setLoading(false)
            return
          }
          throw result?.error || new Error('Sem resposta')
        }
        
        // Se não há sessão, garantir que usuário é null
        if (!result.data?.session) {
          setUser(null)
          setUserProfile(null)
          setLoading(false)
          return
        }
        
        setUser(result.data.session.user)
        
        if (result.data.session.user) {
          // Carregar perfil sem bloquear (em background)
          loadUserProfile(result.data.session.user.id).catch(err => {
            console.warn('⚠️ Perfil será carregado localmente:', err)
          })
        }
      } catch (error) {
        console.warn('⚠️ Sessão não encontrada (modo local):', error)
        setUser(null)
        setUserProfile(null)
      } finally {
        // Sempre liberar loading rapidamente
        setLoading(false)
      }
    }

    getInitialSession()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      // 1. Buscar de noa_users primeiro (nova estrutura) com timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout profile')), 8000)
      )
      
      const noaUserPromise = supabase
        .from('noa_users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      
      const { data: noaUser, error: noaError } = await Promise.race([
        noaUserPromise,
        timeoutPromise
      ]) as any
      
      if (noaUser && !noaError) {
        console.log('✅ Perfil carregado de noa_users:', noaUser)
        setUserProfile({
          id: userId,
          email: noaUser.profile_data?.email || '',
          name: noaUser.name || '',
          role: noaUser.user_type === 'profissional' ? 'doctor' : 'patient',
          user_type: noaUser.user_type,
          created_at: noaUser.created_at,
          updated_at: noaUser.updated_at
        } as any)
        return
      }
      
      // 2. Fallback para tabela users (legada)
      const profilePromise = authService.getUserProfile(userId)
      const profile: User = await Promise.race([
        profilePromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout legacy')), 2000))
      ]) as User
      
      if (profile) {
        setUserProfile(profile)
        return
      }
      
      throw new Error('Nenhum perfil encontrado')
    } catch (error) {
      console.warn('⚠️ Perfil não encontrado, usando modo local:', error)
      // Cria perfil local se não conseguir carregar do Supabase
      const localProfile: User = {
        id: userId,
        email: 'usuario@local.com',
        name: 'Usuário Local',
        role: 'patient',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setUserProfile(localProfile)
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setLoading(true)
      const data = await authService.signUp(email, password, userData)
      
      // Criar perfil do usuário na tabela noa_users
      if (data.user) {
        // Determinar user_type baseado em userData
        const userType = (userData as any).user_type || 'paciente'
        
        // Verificar se Supabase está configurado
        const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                                     import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co'
        
        if (isSupabaseConfigured) {
          const { error: noaUserError } = await supabase
            .from('noa_users')
            .insert({
              user_id: data.user.id,
              user_type: userType,
              name: userData.name || '',
              profile_data: {
                email: data.user.email,
                created_at: new Date().toISOString()
              }
            })
          
          if (noaUserError) {
            console.error('❌ Erro ao criar noa_users:', noaUserError)
          } else {
            console.log('✅ Usuário criado em noa_users:', userType)
          }
          
          // Também criar na tabela users (compatibilidade)
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              name: userData.name || '',
              role: userData.role || 'patient',
              specialty: userData.specialty
            })
          
          if (profileError) {
            console.warn('⚠️ Erro ao criar users (tabela legada):', profileError)
          }
        } else {
          console.log('🔧 Supabase não configurado - perfil será criado localmente no login')
        }
      }
    } catch (error) {
      console.error('Erro no cadastro:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Verificar se Supabase está configurado
      const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                                   import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co'
      
      if (!isSupabaseConfigured) {
        // Modo local - simular login
        console.log('🔧 Modo local: simulando login')
        const mockUser = {
          id: 'local-user-' + Date.now(),
          email: email,
          user_metadata: { role: 'patient' }
        } as any
        
        setUser(mockUser)
        
        // Criar perfil local com nome baseado no email
        const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        setUserProfile({
          id: mockUser.id,
          email: email,
          name: nameFromEmail,
          role: 'patient',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        return
      }
      
      // Login normal com Supabase
      const data = await authService.signIn(email, password)
      
      if (data.user) {
        await loadUserProfile(data.user.id)
      }
    } catch (error) {
      console.error('Erro no login:', error)
      
      // Se der erro no Supabase, tentar modo local como fallback
      console.log('🔄 Tentando fallback local após erro Supabase')
      const mockUser = {
        id: 'fallback-user-' + Date.now(),
        email: email,
        user_metadata: { role: 'patient' }
      } as any
      
      setUser(mockUser)
      const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      setUserProfile({
        id: mockUser.id,
        email: email,
        name: nameFromEmail,
        role: 'patient',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      // Verificar se Supabase está configurado
      const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                                   import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co'
      
      if (!isSupabaseConfigured) {
        // Modo local - apenas limpar estado
        console.log('🔧 Modo local: fazendo logout')
        setUser(null)
        setUserProfile(null)
        return
      }
      
      await authService.signOut()
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error('Erro no logout:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado')
      
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
      
      if (error) throw error
      
      // Recarregar perfil
      await loadUserProfile(user.id)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
