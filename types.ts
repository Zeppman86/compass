
export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

export interface LifeValue {
  id: string;
  name: string;
  description: string;
  importance: number; // 1-10
}

export interface ValueImpact {
  valueId: string;
  impact: number;
}

export interface ActionTemplate {
  id: string;
  description: string;
  impacts: ValueImpact[];
  isCustom?: boolean;
  usageCount: number;
}

export interface DailyAction {
  id: string;
  timestamp: number;
  description: string;
  impacts: ValueImpact[];
  mood?: Mood;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  valueId: string;
  acceptedAt: number;
  completed: boolean;
}

export interface ReminderSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  time: string; // HH:mm
  lastNotified?: number;
}

export interface AppState {
  values: LifeValue[];
  actions: DailyAction[];
  templates: ActionTemplate[];
  isInitialized: boolean;
  activeMission?: DailyMission;
  chatHistory: ChatMessage[];
  reminderSettings: ReminderSettings;
}

export interface BehavioralPattern {
  description: string;
  type: 'negative' | 'positive';
  count: number;
  advice: string;
}

export interface GeminiInsight {
  analysis: string;
  suggestions: string[];
  alignmentScore: number;
  patterns: BehavioralPattern[];
  ideaOfDay?: {
    title: string;
    description: string;
    valueId: string;
  };
}

export interface SmartLogAction {
  description: string;
  impacts: ValueImpact[];
  confidence: number;
}

export interface SmartLogResult {
  actions: SmartLogAction[];
}
