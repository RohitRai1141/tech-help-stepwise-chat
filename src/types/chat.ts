
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
  showActionButtons?: boolean;
  showSendMailOption?: boolean;
}

export interface ChatSession {
  currentQA: QAItem | null;
  currentStep: number;
  isInProgress: boolean;
}

export interface SubmittedIssue {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  originalQuestion?: string;
  status: "pending" | "resolved";
  timestamp: Date;
}
