/**
 * Type definitions for JournalApp
 */

export interface Habit {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  category?: string;
}

export interface HabitCheck {
  habitId: string;
  date: Date;
  completed: boolean;
}

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: Date;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: Date;
  endTime?: Date;
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
  data: any; // Type-specific data (uri for images, path data for sketches, etc.)
}

export interface JournalEntry {
  id: string;
  date: Date;
  text?: string;
  layers: CanvasLayer[];
  background?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DayData {
  date: Date;
  events: Event[];
  journalEntry?: JournalEntry;
  habitChecks: HabitCheck[];
  eventCount: number;
}

export interface AppTheme {
  mode: 'light' | 'dark' | 'sepia' | 'paper';
  primaryColor: string;
  backgroundColor: string;
}

export interface SyncSettings {
  notionEnabled: boolean;
  googleCalendarEnabled: boolean;
  appleCalendarEnabled: boolean;
  lastSync?: Date;
}


