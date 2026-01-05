/**
 * Zustand store for habit management
 */
import {create} from 'zustand';
import {Habit, HabitCheck, HabitStreak} from '../types';
import {storageApiService as storageService} from '../services/storageApi';
import {format} from 'date-fns';

interface HabitStore {
  habits: Habit[];
  habitChecks: HabitCheck[];
  streaks: HabitStreak[];
  loadHabits: () => Promise<void>;
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  toggleHabitCheck: (habitId: string, date: Date) => Promise<void>;
  getHabitChecksForDate: (date: Date) => Promise<HabitCheck[]>;
  getStreak: (habitId: string) => Promise<HabitStreak>;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  habitChecks: [],
  streaks: [],

  loadHabits: async () => {
    const habits = await storageService.getHabits();
    const habitChecks = await storageService.getHabitChecks();
    // Load streaks for each habit
    const streaksPromises = habits.map(h => storageService.getStreak(h.id));
    const streaks = await Promise.all(streaksPromises);
    set({habits, habitChecks, streaks});
  },

  addHabit: async habit => {
    await storageService.addHabit(habit);
    await get().loadHabits();
  },

  updateHabit: async (habitId, updates) => {
    await storageService.updateHabit(habitId, updates);
    await get().loadHabits();
  },

  deleteHabit: async habitId => {
    await storageService.deleteHabit(habitId);
    await get().loadHabits();
  },

  toggleHabitCheck: async (habitId, date) => {
    const checks = await get().getHabitChecksForDate(date);
    const existing = checks.find(c => c.habitId === habitId);
    const newCheck: HabitCheck = {
      habitId,
      date,
      completed: existing ? !existing.completed : true,
    };
    await storageService.saveHabitCheck(newCheck);
    await get().loadHabits();
  },

  getHabitChecksForDate: async date => {
    return await storageService.getHabitChecksForDate(date);
  },

  getStreak: async habitId => {
    return await storageService.getStreak(habitId);
  },
}));

