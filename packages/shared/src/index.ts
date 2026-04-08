// Character types
export type CharacterId = 'Max' | 'Leo' | 'Nika' | 'Maya'
export type PlayerRoleId = 'ba' | 'pm' | 'dev' | 'qa'

// Relationship metrics per character (0-100)
export interface RelationMetrics {
  trust: number
  clarity: number
  comfort: number
  patience: number
}

export type RelationState = Record<CharacterId, RelationMetrics>

export const DEFAULT_RELATION_STATE: RelationState = {
  Max: { trust: 50, clarity: 50, comfort: 50, patience: 70 },
  Leo: { trust: 50, clarity: 50, comfort: 50, patience: 60 },
  Nika: { trust: 50, clarity: 50, comfort: 50, patience: 65 },
  Maya: { trust: 50, clarity: 50, comfort: 50, patience: 75 },
}

// Score from AI evaluation (-2 to +2 per criterion)
export interface EvaluationScores {
  clarification: number
  balance: number
  constraints: number
  tone: number
  structure: number
}

// What Claude returns after evaluating a student message
export interface EvaluationResult {
  scores: EvaluationScores
  reactions: Record<CharacterId, string>
  relationDelta: Partial<Record<CharacterId, Partial<RelationMetrics>>>
  coachNote: string
  triggerRecovery: boolean
}

// A single message in the chat
export interface ChatMessage {
  id: string
  from: CharacterId | 'player' | 'coach'
  text: string
  timestamp: number
}

// Game state stored per user
export interface GameState {
  userId: string
  roleId: PlayerRoleId
  chapterId: string
  sceneIndex: number
  relations: RelationState
  messages: ChatMessage[]
  completedChapters: string[]
}
