export type TriageAuthor = 'noa' | 'paciente'

export interface TriageMessage {
  id: string
  author: TriageAuthor
  content: string
  timestamp: string
  stageId: string
}

export interface TriageStage {
  id: string
  label: string
  prompt: string
  description: string
  followUps?: string[]
  exitMessage?: string
  suggestions?: string[]
  focusTopics?: string[]
}
