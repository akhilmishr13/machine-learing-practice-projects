/**
 * Zustand store for journal entries and canvas state
 */
import {create} from 'zustand';
import {JournalEntry, CanvasLayer, Event} from '../types';
import {storageApiService as storageService} from '../services/storageApi';
import {isSameDay} from 'date-fns';

interface JournalStore {
  journalEntries: JournalEntry[];
  selectedDate: Date;
  currentEntry: JournalEntry | null;
  canvasLayers: CanvasLayer[];
  selectedLayerId: string | null;

  loadEntries: () => Promise<void>;
  setSelectedDate: (date: Date) => Promise<void>;
  getEntryForDate: (date: Date) => Promise<JournalEntry | null>;
  saveEntry: (entry: JournalEntry) => Promise<void>;
  addLayer: (layer: CanvasLayer) => Promise<void>;
  updateLayer: (layerId: string, updates: Partial<CanvasLayer>) => Promise<void>;
  deleteLayer: (layerId: string) => Promise<void>;
  setSelectedLayer: (layerId: string | null) => void;
  reorderLayers: (layerIds: string[]) => Promise<void>;
  clearCanvas: () => Promise<void>;
  syncCanvasToEntry: () => Promise<void>;
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  journalEntries: [],
  selectedDate: new Date(),
  currentEntry: null,
  canvasLayers: [],
  selectedLayerId: null,

  loadEntries: async () => {
    const entries = await storageService.getJournalEntries();
    set({journalEntries: entries});
    const currentDate = get().selectedDate;
    const entry = entries.find(e => isSameDay(e.date, currentDate)) || null;
    set({currentEntry: entry, canvasLayers: entry?.layers || []});
  },

  setSelectedDate: async date => {
    set({selectedDate: date});
    const entry = await get().getEntryForDate(date);
    set({currentEntry: entry, canvasLayers: entry?.layers || []});
  },

  getEntryForDate: async date => {
    return await storageService.getJournalEntry(date);
  },

  saveEntry: async entry => {
    await storageService.saveJournalEntry(entry);
    await get().loadEntries();
  },

  addLayer: async layer => {
    const layers = [...get().canvasLayers, layer];
    set({canvasLayers: layers});
    await get().syncCanvasToEntry();
  },

  updateLayer: async (layerId, updates) => {
    const layers = get().canvasLayers.map(l =>
      l.id === layerId ? {...l, ...updates} : l,
    );
    set({canvasLayers: layers});
    await get().syncCanvasToEntry();
  },

  deleteLayer: async layerId => {
    const layers = get().canvasLayers.filter(l => l.id !== layerId);
    set({canvasLayers: layers});
    await get().syncCanvasToEntry();
  },

  setSelectedLayer: layerId => {
    set({selectedLayerId: layerId});
  },

  reorderLayers: async layerIds => {
    const currentLayers = get().canvasLayers;
    const reordered = layerIds
      .map(id => currentLayers.find(l => l.id === id))
      .filter(Boolean) as CanvasLayer[];
    set({canvasLayers: reordered});
    await get().syncCanvasToEntry();
  },

  clearCanvas: async () => {
    set({canvasLayers: [], selectedLayerId: null});
    await get().syncCanvasToEntry();
  },

  syncCanvasToEntry: async () => {
    const {selectedDate, canvasLayers, currentEntry} = get();
    const entry: JournalEntry = currentEntry || {
      id: `entry_${selectedDate.getTime()}`,
      date: selectedDate,
      layers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedEntry: JournalEntry = {
      ...entry,
      layers: canvasLayers.map((layer, index) => ({
        ...layer,
        zIndex: index,
      })),
      updatedAt: new Date(),
    };

    await storageService.saveJournalEntry(updatedEntry);
    set({currentEntry: updatedEntry});
  },
}));

