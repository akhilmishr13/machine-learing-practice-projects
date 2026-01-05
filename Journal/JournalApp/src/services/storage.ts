/**
 * Storage service using MMKV for high-performance local persistence
 */
import {MMKV} from 'react-native-mmkv';
import {Habit, HabitCheck, Event, JournalEntry, HabitStreak} from '../types';
import {format, isSameDay} from 'date-fns';

const storage = new MMKV();

const STORAGE_KEYS = {
  HABITS: 'habits',
  HABIT_CHECKS: 'habit_checks',
  HABIT_STREAKS: 'habit_streaks',
  EVENTS: 'events',
  JOURNAL_ENTRIES: 'journal_entries',
  DAILY_LOGS: 'daily_logs',
  THEME: 'theme',
  SYNC_SETTINGS: 'sync_settings',
} as const;

// Helper functions for JSON serialization
const getJSON = <T>(key: string, defaultValue: T): T => {
  const value = storage.getString(key);
  if (!value) return defaultValue;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
};

const setJSON = (key: string, value: any): void => {
  storage.set(key, JSON.stringify(value));
};

export const storageService = {
  // Habits
  getHabits(): Habit[] {
    return getJSON<Habit[]>(STORAGE_KEYS.HABITS, []).map(h => ({
      ...h,
      createdAt: new Date(h.createdAt),
    }));
  },

  saveHabits(habits: Habit[]): void {
    setJSON(STORAGE_KEYS.HABITS, habits);
  },

  addHabit(habit: Habit): void {
    const habits = this.getHabits();
    habits.push(habit);
    this.saveHabits(habits);
  },

  updateHabit(habitId: string, updates: Partial<Habit>): void {
    const habits = this.getHabits();
    const index = habits.findIndex(h => h.id === habitId);
    if (index !== -1) {
      habits[index] = {...habits[index], ...updates};
      this.saveHabits(habits);
    }
  },

  deleteHabit(habitId: string): void {
    const habits = this.getHabits().filter(h => h.id !== habitId);
    this.saveHabits(habits);
  },

  // Habit Checks
  getHabitChecks(): HabitCheck[] {
    return getJSON<HabitCheck[]>(STORAGE_KEYS.HABIT_CHECKS, []).map(c => ({
      ...c,
      date: new Date(c.date),
    }));
  },

  saveHabitCheck(check: HabitCheck): void {
    const checks = this.getHabitChecks();
    const index = checks.findIndex(
      c => c.habitId === check.habitId && isSameDay(c.date, check.date),
    );
    if (index !== -1) {
      checks[index] = check;
    } else {
      checks.push(check);
    }
    setJSON(STORAGE_KEYS.HABIT_CHECKS, checks);
    this.updateStreak(check.habitId);
  },

  getHabitChecksForDate(date: Date): HabitCheck[] {
    return this.getHabitChecks().filter(c => isSameDay(c.date, date));
  },

  // Habit Streaks
  getStreaks(): HabitStreak[] {
    return getJSON<HabitStreak[]>(STORAGE_KEYS.HABIT_STREAKS, []).map(s => ({
      ...s,
      lastCompletedDate: s.lastCompletedDate
        ? new Date(s.lastCompletedDate)
        : undefined,
    }));
  },

  getStreak(habitId: string): HabitStreak {
    const streaks = this.getStreaks();
    return (
      streaks.find(s => s.habitId === habitId) || {
        habitId,
        currentStreak: 0,
        longestStreak: 0,
      }
    );
  },

  updateStreak(habitId: string): void {
    const checks = this.getHabitChecks()
      .filter(c => c.habitId === habitId && c.completed)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate current streak
    for (let i = 0; i < checks.length; i++) {
      const checkDate = new Date(checks[i].date);
      checkDate.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (isSameDay(checkDate, expectedDate)) {
        currentStreak++;
      } else {
        break;
      }
    }

    const streaks = this.getStreaks();
    const existingIndex = streaks.findIndex(s => s.habitId === habitId);
    const longestStreak = Math.max(
      existingIndex >= 0 ? streaks[existingIndex].longestStreak : 0,
      currentStreak,
    );

    const streak: HabitStreak = {
      habitId,
      currentStreak,
      longestStreak,
      lastCompletedDate: checks[0]?.date,
    };

    if (existingIndex >= 0) {
      streaks[existingIndex] = streak;
    } else {
      streaks.push(streak);
    }

    setJSON(STORAGE_KEYS.HABIT_STREAKS, streaks);
  },

  // Events
  getEvents(): Event[] {
    return getJSON<Event[]>(STORAGE_KEYS.EVENTS, []).map(e => ({
      ...e,
      date: new Date(e.date),
      startTime: e.startTime ? new Date(e.startTime) : undefined,
      endTime: e.endTime ? new Date(e.endTime) : undefined,
    }));
  },

  saveEvents(events: Event[]): void {
    setJSON(STORAGE_KEYS.EVENTS, events);
  },

  addEvent(event: Event): void {
    const events = this.getEvents();
    events.push(event);
    this.saveEvents(events);
  },

  updateEvent(eventId: string, updates: Partial<Event>): void {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      events[index] = {...events[index], ...updates};
      this.saveEvents(events);
    }
  },

  deleteEvent(eventId: string): void {
    const events = this.getEvents().filter(e => e.id !== eventId);
    this.saveEvents(events);
  },

  getEventsForDate(date: Date): Event[] {
    return this.getEvents().filter(e => isSameDay(e.date, date));
  },

  // Journal Entries
  getJournalEntries(): JournalEntry[] {
    return getJSON<JournalEntry[]>(STORAGE_KEYS.JOURNAL_ENTRIES, []).map(
      e => ({
        ...e,
        date: new Date(e.date),
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt),
      }),
    );
  },

  getJournalEntry(date: Date): JournalEntry | null {
    const entries = this.getJournalEntries();
    return entries.find(e => isSameDay(e.date, date)) || null;
  },

  saveJournalEntry(entry: JournalEntry): void {
    const entries = this.getJournalEntries();
    const index = entries.findIndex(e => isSameDay(e.date, entry.date));
    const now = new Date();

    if (index !== -1) {
      entries[index] = {...entry, updatedAt: now};
    } else {
      entries.push({...entry, createdAt: now, updatedAt: now});
    }

    setJSON(STORAGE_KEYS.JOURNAL_ENTRIES, entries);
  },

  deleteJournalEntry(date: Date): void {
    const entries = this.getJournalEntries().filter(
      e => !isSameDay(e.date, date),
    );
    setJSON(STORAGE_KEYS.JOURNAL_ENTRIES, entries);
  },

  // Daily Logs (quick text reflections)
  getDailyLog(date: Date): string {
    const logs = getJSON<Record<string, string>>(STORAGE_KEYS.DAILY_LOGS, {});
    const dateKey = format(date, 'yyyy-MM-dd');
    return logs[dateKey] || '';
  },

  saveDailyLog(date: Date, text: string): void {
    const logs = getJSON<Record<string, string>>(STORAGE_KEYS.DAILY_LOGS, {});
    const dateKey = format(date, 'yyyy-MM-dd');
    logs[dateKey] = text;
    setJSON(STORAGE_KEYS.DAILY_LOGS, logs);
  },
};


