import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

const AlertBox: React.FC<{
  variant?: 'default' | 'destructive'
  icon: React.ReactNode
  message: string
}> = ({ variant = 'default', icon, message }) => {
  const variantClasses =
    variant === 'destructive'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-amber-200 bg-amber-50 text-amber-800'

  return (
    <div
      className={`flex items-start gap-2 rounded-md border p-3 text-sm ${variantClasses}`}
      role="alert"
    >
      <span className="mt-0.5">{icon}</span>
      <p className="leading-snug">{message}</p>
    </div>
  )
}

interface QualityMetrics {
  codeCoverage: number
  testPassRate: number
  lintErrors: number
  securityIssues: number
  performanceScore: number
  accessibilityScore: number
  lastUpdated: string
}

interface QualityDashboardProps {
  className?: string
}

export const QualityDashboard: React.FC<QualityDashboardProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<QualityMetrics>({
    codeCoverage: 0,
    testPassRate: 0,
    lintErrors: 0,
    securityIssues: 0,
    performanceScore: 0,
    accessibilityScore: 0,
    lastUpdated: new Date().toISOString(),
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching quality metrics
    const fetchMetrics = async () => {
      try {
        // In a real implementation, this would fetch from your CI/CD system
        const mockMetrics: QualityMetrics = {
          codeCoverage: 85,
          testPassRate: 92,
          lintErrors: 3,
          securityIssues: 1,
          performanceScore: 88,
          accessibilityScore: 95,
          lastUpdated: new Date().toISOString(),
        }

        setMetrics(mockMetrics)
      } catch (error) {
        console.error('Error fetching quality metrics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()

    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600'
    if (value >= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (value >= thresholds.warning) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard de Qualidade</h2>
        <Badge variant="outline" className="text-sm">
          Atualizado: {new Date(metrics.lastUpdated).toLocaleString()}
        </Badge>
      </div>

      {/* Alerts */}
      {metrics.lintErrors > 0 && (
        <AlertBox
          icon={<AlertTriangle className="h-4 w-4" />}
          message={`${metrics.lintErrors} erro(s) de lint encontrado(s). Execute \`npm run lint:fix\` para corrigir.`}
        />
      )}

      {metrics.securityIssues > 0 && (
        <AlertBox
          variant="destructive"
          icon={<XCircle className="h-4 w-4" />}
          message={`${metrics.securityIssues} problema(s) de segurança encontrado(s). Verifique o relatório de segurança.`}
        />
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Code Coverage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cobertura de Código</CardTitle>
            {getStatusIcon(metrics.codeCoverage, { good: 80, warning: 70 })}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.codeCoverage}%</div>
            <Progress value={metrics.codeCoverage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Meta: 80% | Atual: {metrics.codeCoverage}%
            </p>
          </CardContent>
        </Card>

        {/* Test Pass Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso dos Testes</CardTitle>
            {getStatusIcon(metrics.testPassRate, { good: 95, warning: 90 })}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.testPassRate}%</div>
            <Progress value={metrics.testPassRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Meta: 95% | Atual: {metrics.testPassRate}%
            </p>
          </CardContent>
        </Card>

        {/* Lint Errors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros de Lint</CardTitle>
            {getStatusIcon(100 - metrics.lintErrors, { good: 100, warning: 95 })}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.lintErrors}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Meta: 0 | Atual: {metrics.lintErrors}
            </p>
          </CardContent>
        </Card>

        {/* Security Issues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problemas de Segurança</CardTitle>
            {getStatusIcon(100 - metrics.securityIssues, { good: 100, warning: 95 })}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.securityIssues}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Meta: 0 | Atual: {metrics.securityIssues}
            </p>
          </CardContent>
        </Card>

        {/* Performance Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontuação de Performance</CardTitle>
            {getStatusIcon(metrics.performanceScore, { good: 90, warning: 80 })}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.performanceScore}</div>
            <Progress value={metrics.performanceScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Meta: 90 | Atual: {metrics.performanceScore}
            </p>
          </CardContent>
        </Card>

        {/* Accessibility Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontuação de Acessibilidade</CardTitle>
            {getStatusIcon(metrics.accessibilityScore, { good: 95, warning: 90 })}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.accessibilityScore}</div>
            <Progress value={metrics.accessibilityScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Meta: 95 | Atual: {metrics.accessibilityScore}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => window.open('/quality-report', '_blank')}
              className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Info className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm">Relatório Completo</span>
            </button>
            <button
              onClick={() => window.open('/sonar', '_blank')}
              className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CheckCircle className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm">SonarQube</span>
            </button>
            <button
              onClick={() => window.open('/coverage', '_blank')}
              className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm">Cobertura</span>
            </button>
            <button
              onClick={() => window.open('/security', '_blank')}
              className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <XCircle className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm">Segurança</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
