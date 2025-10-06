import { Request, Response, NextFunction } from "express";

export function secureErrorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Erro no servidor:", error);

  // Não expor detalhes do erro em produção
  const isDevelopment = process.env.NODE_ENV === "development";
  
  const errorResponse = {
    success: false,
    message: isDevelopment ? error.message : "Erro interno do servidor",
    ...(isDevelopment && { stack: error.stack })
  };

  res.status(500).json(errorResponse);
}