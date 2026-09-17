export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface Space {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  project_count?: number;
  created_at: string;
}

export interface Project {
  id: string;
  space_id: string;
  space_name?: string;
  user_id: string;
  name: string;
  description: string;
  learning_goal: string;
  target_date?: string;
  material_count?: number;
  concept_count?: number;
  average_mastery?: number;
  created_at: string;
}

export interface Material {
  id: string;
  project_id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  stage: 'queued' | 'ocr_extract' | 'structure' | 'knowledge' | 'indexing' | 'ready' | 'failed';
  page_count: number;
  extracted_concepts_count: number;
  error_msg?: string;
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  material_id: string;
  project_id: string;
  page_number: number;
  content: string;
  token_count: number;
}

export interface ConceptMastery {
  id: string;
  project_id: string;
  concept_id: string;
  concept_name: string;
  mastery_score: number;
  confidence: number;
  status: 'improving' | 'stable' | 'needs_attention';
  history: { date: string; score: number }[];
  description?: string;
  category?: string;
  importance_score?: number;
  last_tested_at?: string;
}

export interface Citation {
  sourceDocId: string;
  sourceDocName: string;
  pageNumber: number;
  snippet: string;
  relevanceScore: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations: Citation[];
  tokens_used: number;
  is_unsupported_question?: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  project_id: string;
  title: string;
  message_count?: number;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quizId?: string;
  concept_id: string;
  concept_name: string;
  type: 'mcq' | 'open_ended';
  prompt: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Quiz {
  id: string;
  project_id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'generated' | 'in_progress' | 'completed';
  score?: number;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizAnswerEvaluation {
  isCorrect: boolean;
  aiScore: number;
  understanding: string;
  accuracy: string;
  relevance: string;
  keyConceptsCovered: string[];
  missingConcepts: string[];
  feedback: string;
}

export interface Recommendation {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string;
  action_type: 'review_material' | 'take_quiz' | 'tutor_drill' | 'explore_concept';
  priority: 'high' | 'medium' | 'low';
  concept_id?: string;
  concept_name?: string;
  target_page?: number;
  reason: string;
  is_dismissed: boolean;
  created_at: string;
}

export interface AiLog {
  id: string;
  user_id?: string;
  project_id?: string;
  feature: string;
  model: string;
  prompt_preview: string;
  response_preview: string;
  latency_ms: number;
  tokens_prompt: number;
  tokens_completion: number;
  estimated_cost: number;
  status: 'success' | 'failure';
  error_details?: string;
  created_at: string;
}
