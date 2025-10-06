// Tipos temporários para tabelas PvP
export interface PvPQueueEntry {
  id: string;
  user_id: string; // UUID
  plan_type: 'basic' | 'standard' | 'premium';
  bet_amount: number;
  selected_character_id: number; // ID do personagem selecionado
  created_at: string;
  expires_at: string;
}

export interface PvPRoom {
  id: string;
  player1_id: string; // UUID
  player2_id: string; // UUID
  player1_character_id: number; // ID do personagem do jogador 1
  player2_character_id: number; // ID do personagem do jogador 2
  status: 'waiting' | 'confirming' | 'playing' | 'finished';
  questions: any[];
  current_question: number;
  player1_score: number;
  player2_score: number;
  player1_answers: number[];
  player2_answers: number[];
  winner_id: string | null;
  plan_type: string;
  bet_amount: number;
  total_perguntas: number;
  created_at: string;
  updated_at: string;
}

export interface PvPConfirmation {
  id: string;
  room_id: string;
  user_id: string; // UUID
  confirmed: boolean;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PvPMove {
  id: string;
  room_id: string;
  user_id: string; // UUID
  question_id: string;
  answer: number;
  is_correct: boolean;
  time_taken: number;
  created_at: string;
}

export interface PvPMatch {
  id: string;
  room_id: string;
  player1_id: string; // UUID
  player2_id: string; // UUID
  winner_id: string | null;
  player1_score: number;
  player2_score: number;
  total_questions: number;
  duration_seconds: number;
  bet_amount: number;
  created_at: string;
}
