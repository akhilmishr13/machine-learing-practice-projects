import { create } from 'zustand';
import { Habit, HabitCheck, HabitStreak } from '../types';
import { apiService } from '../services/api';
import { format } from 'date-fns';

interface HabitStore {
  habits: Habit[];
  habitChecks: HabitCheck[];
  loading: boolean;
  loadHabits: () => Promise<void>;
  createHabit: (data: Partial<Habit>) => Promise<void>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCheck: (habitId: string, date: Date) => Promise<void>;
  getHabitChecksForDate: (date: Date) => Promise<HabitCheck[]>;
  getStreak: (habitId: string) => Promise<HabitStreak>;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  habitChecks: [],
  loading: false,

  loadHabits: async () => {
    set({ loading: true });
    try {
      const response = await apiService.getHabits(false);
      set({ habits: response.habits, loading: false });
    } catch (error) {
      console.error('Failed to load habits:', error);
      set({ loading: false });
    }
  },

  createHabit: async (data) => {
    try {
      const response = await apiService.createHabit(data);
      // Reload habits to ensure we have the latest data from server
      await get().loadHabits();
      return response.habit;
    } catch (error) {
      console.error('Failed to create habit:', error);
      throw error;
    }
  },

  updateHabit: async (id, data) => {
    try {
      const response = await apiService.updateHabit(id, data);
      // Reload habits to ensure we have the latest data
      await get().loadHabits();
      return response.habit;
    } catch (error) {
      console.error('Failed to update habit:', error);
      throw error;
    }
  },

  deleteHabit: async (id) => {
    try {
      await apiService.deleteHabit(id);
      // Reload habits to ensure we have the latest data
      await get().loadHabits();
    } catch (error) {
      console.error('Failed to delete habit:', error);
      throw error;
    }
  },

  toggleHabitCheck: async (habitId, date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const checks = await apiService.getChecksForDate(dateStr);
      const existing = checks.checks.find(
        (c: any) => c.habitId === habitId && c.date === dateStr,
      );
      const completed = existing ? !existing.completed : true;

      await apiService.createHabitCheck({
        habit_id: habitId,
        date: dateStr,
        completed,
      });

      // Reload checks for the date
      const updated = await apiService.getChecksForDate(dateStr);
      set((state) => ({
        habitChecks: [
          ...state.habitChecks.filter(
            (c) => !(c.habitId === habitId && c.date === dateStr),
          ),
          ...updated.checks,
        ],
      }));
    } catch (error) {
      console.error('Failed to toggle habit check:', error);
      throw error;
    }
  },

  getHabitChecksForDate: async (date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await apiService.getChecksForDate(dateStr);
      return response.checks;
    } catch (error) {
      console.error('Failed to get habit checks:', error);
      return [];
    }
  },

  getStreak: async (habitId) => {
    try {
      return await apiService.getHabitStreak(habitId);
    } catch (error) {
      console.error('Failed to get streak:', error);
      return {
        habitId,
        currentStreak: 0,
        longestStreak: 0,
      };
    }
  },
}));

