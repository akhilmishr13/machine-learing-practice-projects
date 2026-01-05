export interface Habit {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  category?: string;
}

export interface HabitCheck {
  habitId: string;
  date: string;
  completed: boolean;
}

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  color: string;
  syncedCalendars?: string[];
  notionPageId?: string;
}

export interface CanvasLayer {
  id: string;
  type: 'image' | 'sticker' | 'text' | 'sketch';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  zIndex: number;
  data: any;
}

export interface JournalEntry {
  id: string;
  date: string;
  text?: string;
  layers: CanvasLayer[];
  background?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DayData {
  date: Date;
  events: Event[];
  journalEntry?: JournalEntry;
  habitChecks: HabitCheck[];
  eventCount: number;
}

