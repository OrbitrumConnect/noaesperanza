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

    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
        // Timeout geral para evitar travamento
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout geral')), 2000)
        )
        
        const sessionPromise = supabase.auth.getSession()
        const { data, error } = await Promise.race([sessionPromise, timeoutPromise]) as any
        
        if (error) throw error
        
        // Se não há sessão, garantir que usuário é null
        if (!data.session) {
          setUser(null)
          setUserProfile(null)
          setLoading(false)
          return
        }
        
        setUser(data.session.user)
        
        if (data.session.user) {
          await loadUserProfile(data.session.user.id)
        }
      } catch (error) {
        console.error('Erro ao obter sessão inicial:', error)
        setUser(null)
        setUserProfile(null)
      } finally {
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
      // Timeout para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
      
      const profilePromise = authService.getUserProfile(userId)
      const profile: User = await Promise.race([profilePromise, timeoutPromise]) as User
      setUserProfile(profile)
    } catch (error) {
      console.warn('⚠️ Erro ao carregar perfil do usuário (modo local):', error)
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
      
      // Criar perfil do usuário
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: userData.name || '',
            role: userData.role || 'patient',
            specialty: userData.specialty
          })
        
        if (profileError) throw profileError
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
        setUserProfile({
          id: mockUser.id,
          email: email,
          name: email.split('@')[0],
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
      throw error
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
