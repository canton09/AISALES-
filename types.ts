export interface TranscriptSegment {
  speaker: 'Salesperson' | 'Prospect' | string;
  text: string;
  timestamp: string;
}

export interface SentimentPoint {
  timeOffset: number; // in seconds or minutes representation
  label: string; // e.g., "0:30"
  engagementScore: number; // 0-100
}

export interface CoachingAnalysis {
  strengths: string[];
  missedOpportunities: string[];
}

export interface AnalysisResult {
  transcript: TranscriptSegment[];
  sentimentGraph: SentimentPoint[];
  coaching: CoachingAnalysis;
  summary: string;
  keyInsight: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}