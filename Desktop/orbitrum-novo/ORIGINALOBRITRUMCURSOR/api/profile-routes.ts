import express from "express";
import { storage } from './storage';

export function setupProfileRoutes(app: express.Application) {
  // Rota para obter perfil do usuário
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(parseInt(userId));
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }

      res.json({
        success: true,
        profile: {
          id: user.id,
          username: user.username,
          email: user.email,
          userType: user.userType,
          plan: user.plan,
          tokens: user.tokens,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error("Erro ao obter perfil:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  });

  // Rota para atualizar perfil
  app.put("/api/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const updatedUser = await storage.updateUser(parseInt(userId), updates);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }

      res.json({
        success: true,
        message: "Perfil atualizado com sucesso",
        user: updatedUser
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  });

  console.log("✅ Rotas de perfil configuradas");
}