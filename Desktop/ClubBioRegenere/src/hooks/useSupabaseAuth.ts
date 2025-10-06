import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  userType: 'patient' | 'admin';
  profile?: any;
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Defer data fetching to prevent deadlocks
          setTimeout(async () => {
            await loadUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      // Get user role and profile data
      const [roleResponse, profileResponse] = await Promise.all([
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
      ]);

      const userType = roleResponse?.data?.role === 'admin' ? 'admin' : 'patient';
      const profile = profileResponse?.data;
      
      const userData: UserProfile = {
        id: userId,
        email: user?.email || '',
        name: profile?.name || profile?.full_name || user?.email?.split('@')[0] || '',
        userType,
        profile
      };
      
      setUserProfile(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-') || key === 'user') {
          localStorage.removeItem(key);
        }
      });

      await supabase.auth.signOut({ scope: 'global' });
      
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Force reload even if signOut fails
      window.location.href = '/';
    }
  };

  return {
    user,
    session,
    userProfile,
    loading,
    signOut,
    isAuthenticated: !!session?.user,
    isAdmin: userProfile?.userType === 'admin'
  };
}