/**
 * Storage service using backend API
 * Replaces MMKV with API calls for persistent backend storage
 */
import {apiService} from './api';
import {Habit, HabitCheck, Event, JournalEntry, HabitStreak} from '../types';
import {format, isSameDay, parseISO} from 'date-fns';

export const storageApiService = {
  // Habits
  async getHabits(): Promise<Habit[]> {
    try {
      const response = await apiService.getHabits();
      return response.habits.map((h: any) => ({
        ...h,
        createdAt: h.createdAt ? parseISO(h.createdAt) : new Date(),
        isActive: h.isActive ?? h.is_active ?? true,
      }));
    } catch (error) {
      console.error('Error loading habits:', error);
      return [];
    }
  },

  async saveHabits(habits: Habit[]): Promise<void> {
    // Save each habit individually
    for (const habit of habits) {
      try {
        if (habit.id) {
          await apiService.updateHabit(habit.id, {
            name: habit.name,
            color: habit.color,
            icon: habit.icon,
            is_active: habit.isActive,
            category: habit.category,
          });
        } else {
          await apiService.createHabit({
            name: habit.name,
            color: habit.color,
            icon: habit.icon,
            category: habit.category,
          });
        }
      } catch (error) {
        console.error('Error saving habit:', error);
      }
    }
  },

  async addHabit(habit: Habit): Promise<void> {
    try {
      await apiService.createHabit({
        name: habit.name,
        color: habit.color,
        icon: habit.icon,
        category: habit.category,
      });
    } catch (error) {
      console.error('Error adding habit:', error);
      throw error;
    }
  },

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<void> {
    try {
      await apiService.updateHabit(habitId, {
        name: updates.name,
        color: updates.color,
        icon: updates.icon,
        is_active: updates.isActive,
        category: updates.category,
      });
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  },

  async deleteHabit(habitId: string): Promise<void> {
    try {
      await apiService.deleteHabit(habitId);
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  },

  // Habit Checks
  async getHabitChecks(): Promise<HabitCheck[]> {
    try {
      // Get checks for today (can be extended to get all)
      const today = new Date();
      const response = await apiService.getChecksForDate(format(today, 'yyyy-MM-dd'));
      return response.checks.map((c: any) => ({
        ...c,
        date: c.date ? parseISO(c.date) : new Date(),
        habitId: c.habitId || c.habit_id,
      }));
    } catch (error) {
      console.error('Error loading habit checks:', error);
      return [];
    }
  },

  async saveHabitCheck(check: HabitCheck): Promise<void> {
    try {
      await apiService.createHabitCheck({
        habit_id: check.habitId,
        date: format(check.date, 'yyyy-MM-dd'),
        completed: check.completed,
      });
    } catch (error) {
      console.error('Error saving habit check:', error);
      throw error;
    }
  },

  async getHabitChecksForDate(date: Date): Promise<HabitCheck[]> {
    try {
      const response = await apiService.getChecksForDate(format(date, 'yyyy-MM-dd'));
      return (response.checks || []).map((c: any) => ({
        id: c.id || '',
        habitId: c.habitId || c.habit_id || '',
        date: c.date ? parseISO(c.date) : new Date(),
        completed: c.completed || false,
      }));
    } catch (error) {
      console.error('Error loading habit checks for date:', error);
      return [];
    }
  },

  // Habit Streaks
  async getStreak(habitId: string): Promise<HabitStreak> {
    try {
      const response = await apiService.getHabitStreak(habitId);
      return {
        habitId: response.habitId,
        currentStreak: response.currentStreak,
        longestStreak: response.longestStreak,
        lastCompletedDate: response.lastCompletedDate
          ? parseISO(response.lastCompletedDate)
          : undefined,
      };
    } catch (error) {
      console.error('Error loading streak:', error);
      return {
        habitId,
        currentStreak: 0,
        longestStreak: 0,
      };
    }
  },

  // Events
  async getEvents(): Promise<Event[]> {
    try {
      const response = await apiService.getEvents();
      return response.events.map((e: any) => ({
        ...e,
        date: e.date ? parseISO(e.date) : new Date(),
        startTime: e.startTime ? parseISO(e.startTime) : undefined,
        endTime: e.endTime ? parseISO(e.endTime) : undefined,
        syncedCalendars: e.syncedCalendars || e.synced_calendars,
        notionPageId: e.notionPageId || e.notion_page_id,
      }));
    } catch (error) {
      console.error('Error loading events:', error);
      return [];
    }
  },

  async addEvent(event: Event): Promise<void> {
    try {
      await apiService.createEvent({
        title: event.title,
        description: event.description,
        date: event.date.toISOString(),
        start_time: event.startTime?.toISOString(),
        end_time: event.endTime?.toISOString(),
        color: event.color,
        synced_calendars: event.syncedCalendars,
        notion_page_id: event.notionPageId,
      });
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  },

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
    try {
      await apiService.updateEvent(eventId, {
        title: updates.title,
        description: updates.description,
        date: updates.date?.toISOString(),
        start_time: updates.startTime?.toISOString(),
        end_time: updates.endTime?.toISOString(),
        color: updates.color,
        synced_calendars: updates.syncedCalendars,
        notion_page_id: updates.notionPageId,
      });
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await apiService.deleteEvent(eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  async getEventsForDate(date: Date): Promise<Event[]> {
    try {
      const response = await apiService.getEventsForDate(format(date, 'yyyy-MM-dd'));
      return response.events.map((e: any) => ({
        ...e,
        date: e.date ? parseISO(e.date) : new Date(),
        startTime: e.startTime ? parseISO(e.startTime) : undefined,
        endTime: e.endTime ? parseISO(e.endTime) : undefined,
        syncedCalendars: e.syncedCalendars || e.synced_calendars,
        notionPageId: e.notionPageId || e.notion_page_id,
      }));
    } catch (error) {
      console.error('Error loading events for date:', error);
      return [];
    }
  },

  // Journal Entries
  async getJournalEntries(): Promise<JournalEntry[]> {
    try {
      const response = await apiService.getJournalEntries();
      return response.entries.map((e: any) => ({
        ...e,
        date: e.date ? parseISO(e.date) : new Date(),
        createdAt: e.createdAt ? parseISO(e.createdAt) : new Date(),
        updatedAt: e.updatedAt ? parseISO(e.updatedAt) : new Date(),
      }));
    } catch (error) {
      console.error('Error loading journal entries:', error);
      return [];
    }
  },

  async getJournalEntry(date: Date): Promise<JournalEntry | null> {
    try {
      const response = await apiService.getJournalEntry(format(date, 'yyyy-MM-dd'));
      if (!response.entry) return null;
      const e = response.entry;
      return {
        ...e,
        date: e.date ? parseISO(e.date) : new Date(),
        createdAt: e.createdAt ? parseISO(e.createdAt) : new Date(),
        updatedAt: e.updatedAt ? parseISO(e.updatedAt) : new Date(),
      };
    } catch (error) {
      console.error('Error loading journal entry:', error);
      return null;
    }
  },

  async saveJournalEntry(entry: JournalEntry): Promise<void> {
    try {
      await apiService.updateJournalEntry(format(entry.date, 'yyyy-MM-dd'), {
        text: entry.text,
        layers: entry.layers,
        background: entry.background,
      });
    } catch (error) {
      // If entry doesn't exist, create it
      try {
        await apiService.createJournalEntry({
          date: format(entry.date, 'yyyy-MM-dd'),
          text: entry.text,
          layers: entry.layers,
          background: entry.background,
        });
      } catch (createError) {
        console.error('Error creating journal entry:', createError);
        throw createError;
      }
    }
  },

  async deleteJournalEntry(date: Date): Promise<void> {
    try {
      await apiService.deleteJournalEntry(format(date, 'yyyy-MM-dd'));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  },

  // Daily Logs
  async getDailyLog(date: Date): Promise<string> {
    try {
      const entry = await this.getJournalEntry(date);
      return entry?.text || '';
    } catch (error) {
      console.error('Error loading daily log:', error);
      return '';
    }
  },

  async saveDailyLog(date: Date, text: string): Promise<void> {
    try {
      await apiService.updateDailyLog(format(date, 'yyyy-MM-dd'), text);
    } catch (error) {
      console.error('Error saving daily log:', error);
      throw error;
    }
  },
};

