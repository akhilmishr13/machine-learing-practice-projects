import { create } from 'zustand';
import { JournalEntry, CanvasLayer } from '../types';
import { apiService } from '../services/api';
import { format } from 'date-fns';

interface JournalStore {
  journalEntries: JournalEntry[];
  currentEntry: JournalEntry | null;
  canvasLayers: CanvasLayer[];
  selectedLayerId: string | null;
  loading: boolean;
  loadEntries: () => Promise<void>;
  getEntryForDate: (date: Date) => Promise<JournalEntry | null>;
  saveEntry: (entry: JournalEntry) => Promise<void>;
  addLayer: (layer: CanvasLayer) => Promise<void>;
  updateLayer: (id: string, updates: Partial<CanvasLayer>) => Promise<void>;
  deleteLayer: (id: string) => Promise<void>;
  setSelectedLayer: (id: string | null) => void;
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  journalEntries: [],
  currentEntry: null,
  canvasLayers: [],
  selectedLayerId: null,
  loading: false,

  loadEntries: async () => {
    set({ loading: true });
    try {
      const response = await apiService.getJournalEntries();
      set({ journalEntries: response.entries, loading: false });
    } catch (error) {
      console.error('Failed to load entries:', error);
      set({ loading: false });
    }
  },

  getEntryForDate: async (date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await apiService.getJournalEntry(dateStr);
      if (response.entry) {
        set({ currentEntry: response.entry, canvasLayers: response.entry.layers || [] });
        return response.entry;
      }
      return null;
    } catch (error) {
      console.error('Failed to get entry:', error);
      return null;
    }
  },

  saveEntry: async (entry) => {
    try {
      const dateStr = format(new Date(entry.date), 'yyyy-MM-dd');
      
      // If only text is provided, use the daily-log endpoint
      if (entry.text !== undefined && (!entry.layers || entry.layers.length === 0) && !entry.background) {
        await apiService.updateDailyLog(dateStr, entry.text || '');
      } else {
        // For full entries with layers/background, use the regular endpoint
        const existing = await apiService.getJournalEntry(dateStr);
        
        if (existing.entry) {
          await apiService.updateJournalEntry(dateStr, {
            text: entry.text,
            layers: entry.layers,
            background: entry.background,
          });
        } else {
          await apiService.createJournalEntry({
            date: dateStr,
            text: entry.text || '',
            layers: entry.layers || [],
            background: entry.background || null,
          });
        }
      }

      // Reload entries and update current entry
      await get().getEntryForDate(new Date(entry.date));
    } catch (error) {
      console.error('Failed to save entry:', error);
      throw error;
    }
  },

  addLayer: async (layer) => {
    set((state) => ({
      canvasLayers: [...state.canvasLayers, layer],
    }));
  },

  updateLayer: async (id, updates) => {
    set((state) => ({
      canvasLayers: state.canvasLayers.map((l) =>
        l.id === id ? { ...l, ...updates } : l,
      ),
    }));
  },

  deleteLayer: async (id) => {
    set((state) => ({
      canvasLayers: state.canvasLayers.filter((l) => l.id !== id),
    }));
  },

  setSelectedLayer: (id) => {
    set({ selectedLayerId: id });
  },
}));

