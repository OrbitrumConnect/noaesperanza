import express from "express";
import { storage } from "./storage";

export function setupAdminRoutes(app: express.Application) {
  // Rota para estatísticas administrativas
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const totalUsers = await storage.getTotalUsers();
      const activeUsers = await storage.getActiveUsers();
      const offlineUsers = totalUsers - activeUsers;
      
      // Calcular receita total
      const allUsers = await storage.getAllUsers();
      const totalRevenue = allUsers.reduce((sum, user) => sum + (user.tokens || 0), 0);
      
      // Estatísticas de saque
      const pendingWithdrawals = 0; // Implementar quando necessário
      const totalWithdrawals = 0; // Implementar quando necessário
      
      // Estatísticas mensais
      const monthlyStats = {
        newUsers: Math.floor(totalUsers * 0.1), // 10% do total como exemplo
        revenue: Math.floor(totalRevenue * 0.15), // 15% do total como exemplo
        withdrawals: totalWithdrawals
      };

      res.json({
        totalUsers,
        activeUsers,
        offlineUsers,
        totalRevenue,
        pendingWithdrawals,
        totalWithdrawals,
        monthlyStats
      });
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  });

  // Rota para carteira administrativa
  app.get("/api/admin/wallet", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const totalTokens = allUsers.reduce((sum, user) => sum + (user.tokens || 0), 0);
      
      res.json({
        totalTokens,
        totalUsers: allUsers.length,
        averageTokensPerUser: Math.round(totalTokens / allUsers.length)
      });
    } catch (error) {
      console.error("Erro ao obter carteira admin:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  });

  // Rota para distribuição de planos
  app.get("/api/admin/plan-distribution", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      
      const planDistribution = {
        free: allUsers.filter(u => u.plan === 'free').length,
        basic: allUsers.filter(u => u.plan === 'basic').length,
        pro: allUsers.filter(u => u.plan === 'pro').length,
        max: allUsers.filter(u => u.plan === 'max').length
      };

      res.json(planDistribution);
    } catch (error) {
      console.error("Erro ao obter distribuição de planos:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  });

  console.log("✅ Rotas administrativas configuradas");
}