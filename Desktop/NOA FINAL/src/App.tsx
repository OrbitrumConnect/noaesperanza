import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Header from './components/Header'
// Sidebar removido - chat limpo sem sidebar
import Footer from './components/Footer'
import HomeFooter from './components/HomeFooter'
import PremiumBackground from './components/PremiumBackground'
import Home from './pages/Home'
import HomeNew from './pages/HomeNew'
import HomeIntegrated from './pages/HomeIntegrated'
import DashboardMedico from './pages/DashboardMedico'
import DashboardPaciente from './pages/DashboardPaciente'
import DashboardProfissional from './pages/DashboardProfissional'
import AdminDashboard from './pages/AdminDashboard'
import IntegratedIDE from './components/IntegratedIDE'
import RelatorioNarrativo from './pages/RelatorioNarrativo'
import Configuracoes from './pages/Configuracoes'
import Perfil from './pages/Perfil'
import PaymentPage from './pages/PaymentPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LandingPage from './pages/LandingPage'
import NotFound from './pages/NotFound'
import MeusExames from './pages/MeusExames'
import Prescricoes from './pages/Prescricoes'
import Prontuario from './pages/Prontuario'
import PagamentosPaciente from './pages/PagamentosPaciente'
import Ensino from './pages/Ensino'
import Pesquisa from './pages/Pesquisa'
import MedCannLab from './pages/MedCannLab'
import AvaliacaoClinicaInicial from './pages/AvaliacaoClinicaInicial'
import TriagemClinica from './pages/triagem'

export type Specialty = 'rim' | 'neuro' | 'cannabis'

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{
          background:
            'linear-gradient(135deg, #000000 0%, #011d15 25%, #022f43 50%, #022f43 70%, #450a0a 85%, #78350f 100%)',
        }}
      >
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/landing" replace />
  }

  return <>{children}</>
}

function App() {
  const [currentSpecialty, setCurrentSpecialty] = useState<Specialty>('rim')
  const [isVoiceListening, setIsVoiceListening] = useState(false)
  const [notifications, setNotifications] = useState<
    Array<{
      id: string
      message: string
      type: 'info' | 'success' | 'warning' | 'error'
      timestamp: Date
    }>
  >([])

  // Adiciona notificação (memoizada para evitar re-renders desnecessários)
  const addNotification = useCallback(
    (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      const newNotification = {
        id: Date.now().toString(),
        message,
        type,
        timestamp: new Date(),
      }
      setNotifications(prev => [newNotification, ...prev.slice(0, 2)]) // Máximo 3 notificações

      // Auto-remove notificação após 4 segundos (exceto erros)
      if (type !== 'error') {
        setTimeout(() => {
          removeNotification(newNotification.id)
        }, 4000)
      }
    },
    []
  )

  // Remove notificação
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  // Removido: Notificações automáticas que poluíam a tela
  // Agora apenas notificações importantes são mostradas

  // Contexto global da aplicação
  const appContext = {
    currentSpecialty,
    setCurrentSpecialty,
    isVoiceListening,
    setIsVoiceListening,
    notifications,
    addNotification,
    removeNotification,
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* Rota inicial - LandingPage */}
          <Route path="/" element={<LandingPage />} />

          {/* Rotas de autenticação - SEM header/footer */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Home Integrada - Chat Noa + Vídeo + Avaliação Clínica - COM header/footer */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <div
                  className="h-screen overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(135deg, #000000 0%, #011d15 25%, #022f43 50%, #022f43 70%, #450a0a 85%, #78350f 100%)',
                  }}
                >
                  {/* Header */}
                  <Header
                    currentSpecialty={currentSpecialty}
                    setCurrentSpecialty={setCurrentSpecialty}
                  />

                  {/* Container Principal */}
                  <div className="pt-16 pb-20 h-full overflow-hidden">
                    <HomeIntegrated 
                      currentSpecialty={currentSpecialty} 
                      isVoiceListening={isVoiceListening}
                      setIsVoiceListening={setIsVoiceListening}
                      addNotification={addNotification} 
                    />
                  </div>

                  {/* Footer Compacto - Fixo na parte inferior */}
                  <div className="fixed bottom-0 left-0 right-0 z-30">
                    <HomeFooter />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Home Antiga (Backup) - Chat original com todas as features */}
          <Route
            path="/home-old"
            element={
              <ProtectedRoute>
                <div
                  className="h-screen overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(135deg, #000000 0%, #011d15 25%, #022f43 50%, #022f43 70%, #450a0a 85%, #78350f 100%)',
                  }}
                >
                  {/* Header */}
                  <Header
                    currentSpecialty={currentSpecialty}
                    setCurrentSpecialty={setCurrentSpecialty}
                  />

                  {/* Container Principal */}
                  <div className="pt-16 pb-20 h-full overflow-hidden">
                    <Home 
                      currentSpecialty={currentSpecialty} 
                      addNotification={addNotification}
                      isVoiceListening={isVoiceListening}
                      setIsVoiceListening={setIsVoiceListening}
                    />
                  </div>

                  {/* Footer Compacto - Fixo na parte inferior */}
                  <div className="fixed bottom-0 left-0 right-0 z-30">
                    <HomeFooter />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Home New - Layout completo estilo ChatGPT - PROTEGIDA */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <HomeNew />
              </ProtectedRoute>
            }
          />

          {/* Rotas do app - COM header/footer - PROTEGIDAS */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <div
                  className="h-screen overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(135deg, #000000 0%, #011d15 25%, #022f43 50%, #022f43 70%, #450a0a 85%, #78350f 100%)',
                  }}
                >
                  {/* Header */}
                  <Header
                    currentSpecialty={currentSpecialty}
                    setCurrentSpecialty={setCurrentSpecialty}
                  />

                  {/* Container Principal */}
                  <div className="pt-16 pb-20 h-full overflow-hidden">
                    <Routes>
                      {/* Página inicial do app - REDIRECT para /app/paciente */}
                      <Route path="/" element={<Navigate to="/app/paciente" replace />} />

                      {/* Páginas específicas */}

                      <Route
                        path="/medico"
                        element={
                          <DashboardMedico
                            currentSpecialty={currentSpecialty}
                            addNotification={addNotification}
                          />
                        }
                      />

                      <Route
                        path="/paciente"
                        element={
                          <DashboardPaciente
                            currentSpecialty={currentSpecialty}
                            addNotification={addNotification}
                          />
                        }
                      />

                      <Route
                        path="/profissional"
                        element={
                          <DashboardProfissional
                            currentSpecialty={currentSpecialty}
                            addNotification={addNotification}
                          />
                        }
                      />

                      <Route
                        path="/admin"
                        element={<AdminDashboard addNotification={addNotification} />}
                      />
                      <Route path="/ide" element={<IntegratedIDE />} />
                      <Route
                        path="/patient-dashboard"
                        element={<Navigate to="/app/paciente" replace />}
                      />
                      <Route path="/patient" element={<Navigate to="/app/paciente" replace />} />

                      <Route path="/payment" element={<PaymentPage />} />

                      <Route
                        path="/checkout"
                        element={<CheckoutPage addNotification={addNotification} />}
                      />

                      <Route
                        path="/relatorio"
                        element={
                          <RelatorioNarrativo
                            currentSpecialty={currentSpecialty}
                            addNotification={addNotification}
                          />
                        }
                      />

                      <Route
                        path="/config"
                        element={<Configuracoes addNotification={addNotification} />}
                      />

                      <Route
                        path="/perfil"
                        element={<Perfil addNotification={addNotification} />}
                      />

                      {/* Páginas do Paciente */}
                      <Route path="/exames" element={<MeusExames />} />
                      <Route path="/prescricoes" element={<Prescricoes />} />
                      <Route path="/prontuario" element={<Prontuario />} />
                      <Route path="/pagamentos-paciente" element={<PagamentosPaciente />} />
                      <Route path="/avaliacao-inicial" element={<AvaliacaoClinicaInicial />} />
                      <Route path="/triagem" element={<TriagemClinica />} />

                      {/* Páginas de Ensino e Pesquisa */}
                      <Route path="/ensino" element={<Ensino />} />
                      <Route path="/pesquisa" element={<Pesquisa />} />
                      <Route path="/medcann-lab" element={<MedCannLab />} />

                      {/* 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>

                  {/* Footer Compacto para Home - Fixo na parte inferior */}
                  <div className="fixed bottom-0 left-0 right-0 z-30">
                    <HomeFooter />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>

        {/* Notificações desabilitadas para melhor UX - não atrapalham mais a experiência do usuário */}
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
