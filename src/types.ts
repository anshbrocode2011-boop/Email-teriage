export type EmailCategory = 'URGENT' | 'WORTH_A_LOOK' | 'CAN_WAIT' | 'IGNORE';

export interface EmailItem {
  id: string;
  threadId: string;
  sender: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  date: string;
  snippet: string;
  category: EmailCategory;
  summary: string;
  suggestedAction: string;
  isHandled?: boolean;
  handledAt?: number;
  labels?: string[];
  analyzedAt?: number;
  isMockDemo?: boolean;
}

export interface DigestResponse {
  briefing: string;
  urgentCount: number;
  worthALookCount: number;
  canWaitCount: number;
  ignoreCount: number;
  timestamp: string;
}

export interface TriageStats {
  total: number;
  urgent: number;
  worthALook: number;
  canWait: number;
  ignore: number;
  handled: number;
  pending: number;
}
