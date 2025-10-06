import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://shngrwkqgasdpokdomhh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobmdyd2txZ2FzZHBva2RvbWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzY5MDEsImV4cCI6MjA3MzYxMjkwMX0.ikvHEGYSsGITc0H96lVllMjMmp7ME_f5Y1YqpIFdgUE'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos para os trabalhos científicos
export interface ScientificWork {
  id: string
  title: string
  authors: Array<{
    name: string
    institution: string
    email: string
    country: string
  }>
  category: 'científico' | 'relato_experiencia' | 'relato_caso'
  modality: 'oral' | 'pôster' | 'vídeo'
  presentationType: 'pesquisa' | 'relato' | 'case' | 'revisao'
  abstract: string
  keywords: string[]
  schedule: {
    day: number
    time: string
    room: string
    duration: number
  }
  location: {
    type: string
    name: string
    coordinates: { x: number; y: number }
  }
  media: {
    pdf?: string
    video?: string
    podcast?: string
  }
  status: string
  institution: string
  region: string
  language: string
  created_at?: string
  updated_at?: string
}
