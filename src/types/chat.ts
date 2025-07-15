export interface QAItem {
  id: number;
  question: string;
  answer: string[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isStep?: boolean;
  stepNumber?: number;
  totalSteps?: number;
}

export interface ChatSession {
  currentQA: QAItem | null;
  currentStep: number;
  isInProgress: boolean;
}