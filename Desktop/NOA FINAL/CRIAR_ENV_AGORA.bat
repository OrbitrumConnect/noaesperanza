@echo off
echo ========================================
echo CRIANDO ARQUIVO .ENV
echo ========================================
echo.

(
echo VITE_SUPABASE_URL=https://lhclqebtkyfftkevumix.supabase.co
echo VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY2xxZWJ0a3lmZnRrZXZ1bWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1MTc5MjEsImV4cCI6MjA0NzA5MzkyMX0.7J1QcP5z-EYEEFRs9lCy9RQnYZFRaEWLxJVgVPZIE8I
echo VITE_OPENAI_API_KEY=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
echo VITE_APP_ENVIRONMENT=production
echo VITE_APP_VERSION=3.0.0
) > .env

echo.
echo ========================================
echo ARQUIVO .ENV CRIADO COM SUCESSO!
echo ========================================
echo.
echo Agora:
echo 1. Parar servidor: Ctrl+C
echo 2. Rodar: npm run dev
echo 3. Aguardar mensagem de sucesso
echo.
echo ========================================
pause

