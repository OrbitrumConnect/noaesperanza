import { useState, useEffect, useCallback } from 'react'
import scientificWorksData from '@/data/scientificWorks.json'
import { ScientificWork } from '@/lib/supabase-client'

export const useScientificWorks = () => {
  const [works, setWorks] = useState<ScientificWork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar todos os trabalhos do arquivo local
  const loadWorks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Usar dados locais em vez do Supabase
      setWorks(scientificWorksData as ScientificWork[])
    } catch (err) {
      setError('Erro ao carregar trabalhos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar por categoria
  const getByCategory = useCallback(async (category: string) => {
    try {
      setLoading(true)
      const data = await scientificWorksService.getByCategory(category)
      return data
    } catch (err) {
      setError('Erro ao buscar por categoria')
      console.error(err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar por modalidade
  const getByModality = useCallback(async (modality: string) => {
    try {
      setLoading(true)
      const data = await scientificWorksService.getByModality(modality)
      return data
    } catch (err) {
      setError('Erro ao buscar por modalidade')
      console.error(err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar por dia
  const getByDay = useCallback(async (day: number) => {
    try {
      setLoading(true)
      const data = await scientificWorksService.getByDay(day)
      return data
    } catch (err) {
      setError('Erro ao buscar por dia')
      console.error(err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Busca por texto
  const search = useCallback(async (query: string) => {
    if (!query.trim()) return works

    try {
      setLoading(true)
      const data = await scientificWorksService.search(query)
      return data
    } catch (err) {
      setError('Erro na busca')
      console.error(err)
      return []
    } finally {
      setLoading(false)
    }
  }, [works])

  // Buscar por palavra-chave
  const getByKeyword = useCallback(async (keyword: string) => {
    try {
      setLoading(true)
      const data = await scientificWorksService.getByKeyword(keyword)
      return data
    } catch (err) {
      setError('Erro ao buscar por palavra-chave')
      console.error(err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar dados iniciais
  useEffect(() => {
    loadWorks()
  }, [loadWorks])

  return {
    works,
    loading,
    error,
    loadWorks,
    getByCategory,
    getByModality,
    getByDay,
    search,
    getByKeyword
  }
}

// Hook para busca com debounce
export const useSearchWorks = (works: ScientificWork[]) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredWorks, setFilteredWorks] = useState<ScientificWork[]>(works)
  const [isSearching, setIsSearching] = useState(false)

  // Debounce da busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        setIsSearching(true)
        const filtered = works.filter(work => {
          const term = searchTerm.toLowerCase()
          return (
            work.title.toLowerCase().includes(term) ||
            work.abstract.toLowerCase().includes(term) ||
            work.authors.some(author => author.name.toLowerCase().includes(term)) ||
            work.keywords.some(keyword => keyword.toLowerCase().includes(term))
          )
        })
        setFilteredWorks(filtered)
        setIsSearching(false)
      } else {
        setFilteredWorks(works)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, works])

  return {
    searchTerm,
    setSearchTerm,
    filteredWorks,
    isSearching
  }
}
