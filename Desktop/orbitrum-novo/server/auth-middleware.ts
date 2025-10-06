import { Request, Response, NextFunction } from 'express';
import { getSupabase } from './supabase-auth';
import { RealDataSystem } from './real-data-system';
import { storage } from './storage';

export interface AuthenticatedRequest extends Request {
  user?: any;
  isAuthenticated?: boolean;
  dataSource?: 'real' | 'demo' | 'none' | 'error';
}

/**
 * Middleware de autenticação que tenta usar dados reais do Supabase
 * e fallback para dados de demonstração
 */
export async function authenticateUser(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) {
  try {
    // Tentar obter usuário autenticado via Supabase
    const currentUser = await RealDataSystem.getCurrentUser();
    
    if (currentUser) {
      // Usuário autenticado via Supabase - dados reais
      req.user = currentUser;
      req.isAuthenticated = true;
      req.dataSource = 'real';
      
      console.log('✅ Usuário autenticado via Supabase:', currentUser.email);
    } else {
      // Fallback para dados de demonstração
      const demoUserId = 1;
      const demoUser = await storage.getUser(demoUserId);
      
      if (demoUser) {
        req.user = demoUser;
        req.isAuthenticated = true;
        req.dataSource = 'demo';
        
        console.log('📋 Usando dados de demonstração para usuário');
      } else {
        req.isAuthenticated = false;
        req.dataSource = 'none';
      }
    }
    
    next();
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    req.isAuthenticated = false;
    req.dataSource = 'error';
    next();
  }
}

/**
 * Middleware para verificar se o usuário está autenticado
 */
export function requireAuth(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) {
  if (!req.isAuthenticated || !req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado',
      dataSource: req.dataSource
    });
  }
  
  next();
}

/**
 * Middleware para verificar se o usuário é admin
 */
export function requireAdmin(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) {
  if (!req.isAuthenticated || !req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }
  
  if (req.user.userType !== 'admin' && req.user.adminLevel < 1) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - requer permissões de administrador'
    });
  }
  
  next();
}

/**
 * Middleware para verificar se o usuário é profissional
 */
export function requireProfessional(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) {
  if (!req.isAuthenticated || !req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }
  
  if (req.user.userType !== 'professional') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - requer perfil de profissional'
    });
  }
  
  next();
}

/**
 * Middleware para adicionar informações do sistema de dados na resposta
 */
export function addDataSourceInfo(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    const enhancedData = {
      ...data,
      _system: {
        dataSource: req.dataSource || 'unknown',
        authenticated: req.isAuthenticated || false,
        timestamp: new Date().toISOString()
      }
    };
    
    return originalJson.call(this, enhancedData);
  };
  
  next();
} 