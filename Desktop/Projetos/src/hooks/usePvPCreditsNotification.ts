import { useState, useEffect } from 'react';
import { useDashboard } from './useDashboard';
import { useUserType } from './useUserType';

export const usePvPCreditsNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [hasShownNotification, setHasShownNotification] = useState(false);
  const { profile } = useDashboard();
  const { userType } = useUserType();

  useEffect(() => {
    // Verificar se o usuário virou PAID e ainda não mostrou a notificação
    if (userType === 'paid' && !hasShownNotification && profile?.display_name) {
      // Verificar se é a primeira vez que o usuário vira PAID
      const lastNotificationShown = localStorage.getItem('pvp_credits_notification_shown');
      const userPaidDate = localStorage.getItem('user_paid_date');
      
      if (!lastNotificationShown || !userPaidDate) {
        // Primeira vez que o usuário vira PAID
        setShowNotification(true);
        setHasShownNotification(true);
        
        // Marcar que já mostrou a notificação
        localStorage.setItem('pvp_credits_notification_shown', 'true');
        localStorage.setItem('user_paid_date', new Date().toISOString());
      }
    }
  }, [userType, hasShownNotification, profile?.display_name]);

  const closeNotification = () => {
    setShowNotification(false);
  };

  return {
    showNotification,
    closeNotification,
    userName: profile?.display_name || 'Guerreiro(a)'
  };
};
