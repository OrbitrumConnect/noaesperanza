// CARREGAR VARIÁVEIS DE AMBIENTE PRIMEIRO
import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { setupAuthRoutes } from "./auth-routes";
import { setupAdminRoutes } from "./admin-routes";
import { setupProfileRoutes } from "./profile-routes";
import paymentRoutes from "./payment-routes";
import { initializeWebSocket } from "./websocket";
import { secureErrorHandler } from "./error-handler";
import { startHealthMonitoring } from "./health-monitor";
import { log } from "./log-optimizer";
import { initializeSupabase } from './supabase-auth';

// SUPABASE DESABILITADO TEMPORARIAMENTE PARA RESOLVER LOOPS INFINITOS
// import { initializeSupabase } from "./supabase-auth";

// Inicializar Supabase se as keys estiverem disponíveis
if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
  initializeSupabase(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  console.log('🔐 Supabase Auth inicializado ANTES do storage');
  console.log('🔑 URL:', process.env.VITE_SUPABASE_URL);
  console.log('🔑 KEY:', process.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
} else {
  console.log('⚠️ Supabase Auth não configurado - usando autenticação local');
  console.log('🔍 VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
  console.log('🔍 VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'EXISTE' : 'NÃO EXISTE');
}

// Importar storage APÓS inicializar Supabase
import { storage } from "./storage";

// Importar rotas organizadas
import { freePlanRouter } from "./routes/free-plan";
import chatRouter from "./routes/chat";
import analyticsRouter from "./routes/analytics";
import serviceCalendarRouter from "./routes/service-calendar";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Servir arquivos estáticos em produção
function serveStatic(app: express.Application) {
  app.use(express.static(join(__dirname, "../client/dist")));
  app.use(express.static(join(__dirname, "../dist/public")));
  
  // Fallback para SPA
  app.get("*", (req, res) => {
    res.sendFile(join(__dirname, "../client/dist/index.html"));
  });
}

// Registrar todas as rotas
async function registerRoutes(app: express.Application) {
  // Middleware para parsing JSON
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // CORS headers
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
    
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      console.log('🔍 Health check solicitado');
      const totalUsers = await storage.getTotalUsers();
      const activeUsers = await storage.getActiveUsers();
      
      console.log('✅ Health check - Total users:', totalUsers, 'Active:', activeUsers);
      
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        users: {
          total: totalUsers,
          active: activeUsers
        },
        dataSource: "hybrid", // Supabase + MemStorage
        version: "2.0.0",
        message: "🚀 Backend funcionando no Railway!",
        codigoAtualizado: true,
        rotasDisponiveis: [
          "/api/free-plan/consume/ai-search",
          "/api/free-plan/consume/planet-view", 
          "/api/free-plan/consume/profile-view",
          "/api/free-plan/consume/message",
          "/api/payment/pix"
        ]
      });
    } catch (error) {
      console.error('❌ Health check error:', error);
      res.status(500).json({
        status: "error",
        message: "Health check failed",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Endpoint de teste para verificar código
  app.get("/api/teste-codigo", (req, res) => {
    res.json({
      success: true,
      message: "✅ Código atualizado funcionando!",
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      rotas: [
        "/api/free-plan/consume/ai-search",
        "/api/free-plan/consume/planet-view",
        "/api/free-plan/consume/profile-view", 
        "/api/free-plan/consume/message",
        "/api/payment/pix"
      ]
    });
  });

  // Configurar rotas de autenticação
  setupAuthRoutes(app);
  
  // Configurar rotas administrativas
  setupAdminRoutes(app);
  
  // Configurar rotas de perfil
  setupProfileRoutes(app);
  
  // Configurar rotas de pagamento
  app.use("/api/payment", paymentRoutes);

  // Registrar rotas organizadas
  app.use("/api/free-plan", freePlanRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/service-calendar", serviceCalendarRouter);

  // Rota para profissionais (crítica para o sistema orbital)
  app.get("/api/professionals", async (req, res) => {
    try {
      const allProfessionals = await storage.getAllProfessionals();
      const realProfessionals = allProfessionals.filter(p => !p.isDemo);
      const demoProfessionals = allProfessionals.filter(p => p.isDemo);

      if (req.query.search) {
        const search = req.query.search as string;
        const realResults = await storage.searchProfessionals(search);
        const demoResults = demoProfessionals.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.profession?.toLowerCase().includes(search.toLowerCase())
        );
        
        const combinedResults = [...realResults, ...demoResults];
        res.json(combinedResults);
        return;
      }

      // Retornar profissionais para visualização orbital
      const professionals = await storage.getAllProfessionals();
      const realProfessionals2 = professionals.filter(p => !p.isDemo);
      const demoProfessionals2 = professionals.filter(p => p.isDemo);

      if (realProfessionals2.length >= 10) {
        // Se temos muitos profissionais reais, retornar apenas os melhores
        const topRealProfessionals = realProfessionals2
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 20);
        res.json(topRealProfessionals);
      } else if (realProfessionals2.length > 0) {
        // Combinar reais com demo para ter pelo menos 20
        const combinedProfessionals = [
          ...realProfessionals2.sort((a, b) => b.rating - a.rating),
          ...demoProfessionals2.slice(0, 20 - realProfessionals2.length)
        ];
        res.json(combinedProfessionals);
      } else {
        // Apenas demo se não há reais
        const orbsForVisualization = demoProfessionals2.slice(0, 20);
        res.json(orbsForVisualization);
      }
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
      res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
  });

  // Rota para tornar usuário admin (apenas para desenvolvimento)
  app.post("/api/admin/make-admin", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: "Email é obrigatório" 
        });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "Usuário não encontrado" 
        });
      }

      const updatedUser = await storage.updateUserType(user.id, "admin");
      
      if (updatedUser) {
        console.log(`👑 USUÁRIO TORNADO ADMIN: ${email}`);
        res.json({
          success: true,
          message: "Usuário tornado admin com sucesso",
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            userType: updatedUser.userType
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Erro ao atualizar usuário"
        });
      }
    } catch (error) {
      console.error("Erro ao tornar usuário admin:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  });
}

export async function createServer() {
  const app = express();
  
  // Configurar rotas
  await registerRoutes(app);
  
  // Criar servidor HTTP sem iniciar ainda
  const http = await import('http');
  const server = http.createServer(app);
  
  const dashboardWS = initializeWebSocket(server);
  console.log("🔗 WebSocket inicializado para comunicação em tempo real dos dashboards");

  // Importar e inicializar sistema de expiração de planos
  const { planExpirySystem } = await import("./plan-expiry-system");
  planExpirySystem.initialize();

  // Inicializar sincronização automática com Supabase
  // const { supabaseSync } = await import("./supabase-sync");
  // supabaseSync.start();
  // console.log("🔄 Sincronização automática Supabase ativa (a cada 5 minutos)");
  console.log("⚠️ Sincronização automática DESABILITADA devido a problemas de RLS");
  
  // Inicializar sistema de notificações em tempo real
  const { notificationSystem } = await import("./notification-system");
  console.log("📧 Sistema de notificações em tempo real inicializado");

  // 🤖 Telegram Bot TEMPORARIAMENTE DESABILITADO para estabilizar servidor
  console.log("⚠️ Telegram Bot desabilitado temporariamente para estabilidade");

  // 🛡️ Error handler seguro que não expõe detalhes
  app.use(secureErrorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    // await setupVite(app, server); // REMOVIDO
  } else {
    serveStatic(app);
  }

  // Use PORT from environment (Railway) or default to 5000
  const port = process.env.PORT || 5000;
  
  // Configurar CORS e headers para aceitar domínio customizado ANTES do listen
  app.use((req, res, next) => {
    // CORS headers for cross-origin requests
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
    
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    
    next();
  });
  
  app.use((req, res, next) => {
    // Headers necessários para funcionamento adequado do domínio
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    
    // Permitir orbitrum.com.br
    if (req.headers.host?.includes("orbitrum.com.br")) {
      const protocol = req.secure ? "https" : "http";
      res.setHeader("Access-Control-Allow-Origin", `${protocol}://${req.headers.host}`);
    }
    
    next();
  });
  
  // Para Vercel, retornar o app configurado
  if (process.env.VERCEL) {
    return app;
  }
  
  // Para desenvolvimento local, iniciar o servidor
  server.listen({
    port,
    host: "localhost",
  }, async () => {
    console.log("🚀 Servidor HTTP inicializado");
    log(`serving on port ${port}`);
    console.log(`🌐 Servidor ativo em: http://0.0.0.0:${port}`);
    console.log(`🌐 Domínio customizado: www.orbitrum.com.br`);
    console.log(`🌐 Replit URL: ${process.env.REPLIT_DOMAINS}`);
    
    // Verificar SSL e configuração do domínio (temporariamente desabilitado)
    console.log("✅ SERVIDOR INICIALIZADO - OAuth Google pronto para teste!");
  
    // INICIAR MONITORAMENTO CONTÍNUO DO HEALTH ENDPOINT
    // startHealthMonitoring(); // DESABILITADO PERMANENTEMENTE para parar loops infinitos
  });
}

// Inicializar servidor se não estiver no Vercel
if (!process.env.VERCEL) {
  createServer();
}