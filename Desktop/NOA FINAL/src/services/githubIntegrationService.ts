/**
 * Serviço de Integração com GitHub
 * Permite à Nôa interagir com o repositório diretamente
 */

export interface GitHubFile {
  path: string
  content: string
  sha?: string
  message: string
}

export interface GitHubCommit {
  message: string
  files: GitHubFile[]
}

class GitHubIntegrationService {
  private token: string
  private repo: string
  private owner: string
  private apiUrl = 'https://api.github.com'

  constructor() {
    this.token = import.meta.env.VITE_GITHUB_TOKEN || ''
    const repoFull = import.meta.env.VITE_GITHUB_REPO || 'noaesperanza/noaesperanza-appB'
    const [owner, repo] = repoFull.split('/')
    this.owner = owner
    this.repo = repo

    if (!this.token) {
      console.warn('⚠️ GitHub token não configurado - funcionalidades limitadas')
    }
  }

  /**
   * Verifica se GitHub está configurado
   */
  isConfigured(): boolean {
    return !!this.token && !!this.owner && !!this.repo
  }

  /**
   * Lista arquivos do repositório
   */
  async listFiles(path: string = ''): Promise<any[]> {
    if (!this.isConfigured()) {
      throw new Error('GitHub não configurado')
    }

    try {
      const url = `${this.apiUrl}/repos/${this.owner}/${this.repo}/contents/${path}`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao listar arquivos do GitHub:', error)
      throw error
    }
  }

  /**
   * Lê conteúdo de um arquivo
   */
  async readFile(path: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('GitHub não configurado')
    }

    try {
      const url = `${this.apiUrl}/repos/${this.owner}/${this.repo}/contents/${path}`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Decodificar conteúdo Base64
      return atob(data.content)
    } catch (error) {
      console.error('Erro ao ler arquivo do GitHub:', error)
      throw error
    }
  }

  /**
   * Cria ou atualiza um arquivo
   */
  async writeFile(file: GitHubFile): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('GitHub não configurado')
    }

    try {
      const url = `${this.apiUrl}/repos/${this.owner}/${this.repo}/contents/${file.path}`
      
      // Codificar conteúdo em Base64
      const contentBase64 = btoa(unescape(encodeURIComponent(file.content)))

      const body: any = {
        message: file.message,
        content: contentBase64,
        branch: 'main'
      }

      // Se tiver SHA, é update
      if (file.sha) {
        body.sha = file.sha
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`GitHub API error: ${error.message}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao escrever arquivo no GitHub:', error)
      throw error
    }
  }

  /**
   * Cria um commit com múltiplos arquivos
   */
  async createCommit(commit: GitHubCommit): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('GitHub não configurado')
    }

    try {
      // Para múltiplos arquivos, usar a API Git diretamente
      // (mais complexo, mas permite commit atômico)
      
      console.log('📝 Criando commit:', commit.message)
      
      // Simplificado: fazer commits individuais
      const results = []
      for (const file of commit.files) {
        const result = await this.writeFile({
          ...file,
          message: commit.message
        })
        results.push(result)
      }

      return results
    } catch (error) {
      console.error('Erro ao criar commit:', error)
      throw error
    }
  }

  /**
   * Cria uma branch
   */
  async createBranch(branchName: string, fromBranch: string = 'main'): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('GitHub não configurado')
    }

    try {
      // 1. Pegar SHA da branch base
      const refUrl = `${this.apiUrl}/repos/${this.owner}/${this.repo}/git/ref/heads/${fromBranch}`
      const refResponse = await fetch(refUrl, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!refResponse.ok) {
        throw new Error('Erro ao buscar branch base')
      }

      const refData = await refResponse.json()
      const sha = refData.object.sha

      // 2. Criar nova branch
      const createUrl = `${this.apiUrl}/repos/${this.owner}/${this.repo}/git/refs`
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: sha
        })
      })

      if (!createResponse.ok) {
        const error = await createResponse.json()
        throw new Error(`Erro ao criar branch: ${error.message}`)
      }

      return await createResponse.json()
    } catch (error) {
      console.error('Erro ao criar branch:', error)
      throw error
    }
  }

  /**
   * Lista branches
   */
  async listBranches(): Promise<any[]> {
    if (!this.isConfigured()) {
      throw new Error('GitHub não configurado')
    }

    try {
      const url = `${this.apiUrl}/repos/${this.owner}/${this.repo}/branches`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao listar branches:', error)
      throw error
    }
  }

  /**
   * Cria um Pull Request
   */
  async createPullRequest(
    title: string,
    body: string,
    head: string,
    base: string = 'main'
  ): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('GitHub não configurado')
    }

    try {
      const url = `${this.apiUrl}/repos/${this.owner}/${this.repo}/pulls`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          body,
          head,
          base
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Erro ao criar PR: ${error.message}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao criar Pull Request:', error)
      throw error
    }
  }

  /**
   * Status do serviço
   */
  getStatus(): {
    configured: boolean
    owner: string
    repo: string
    hasToken: boolean
  } {
    return {
      configured: this.isConfigured(),
      owner: this.owner,
      repo: this.repo,
      hasToken: !!this.token
    }
  }
}

export const githubIntegrationService = new GitHubIntegrationService()

export default githubIntegrationService
