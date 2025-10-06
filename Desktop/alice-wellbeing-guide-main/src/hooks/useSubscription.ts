import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

interface SubscriptionState {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  loading: boolean;
  error: string | null;
}

export const useSubscription = () => {
  const { session } = useSupabaseAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    loading: true,
    error: null,
  });

  const checkSubscription = async () => {
    if (!session?.access_token) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setState({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to check subscription',
      }));
    }
  };

  const createCheckout = async () => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    
    // Open Stripe checkout in a new tab
    window.open(data.url, '_blank');
  };

  const openCustomerPortal = async () => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('customer-portal', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    
    // Open customer portal in a new tab
    window.open(data.url, '_blank');
  };

  useEffect(() => {
    checkSubscription();
  }, [session?.access_token]);

  // Auto-refresh every 30 seconds when on a subscription-related page
  useEffect(() => {
    const interval = setInterval(() => {
      if (session?.access_token) {
        checkSubscription();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [session?.access_token]);

  return {
    ...state,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};