/**
 * API service client for backend communication
 */
import Config from 'react-native-config';

const API_BASE_URL = __DEV__
  ? 'http://localhost:8000/api/v1'
  : Config.API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(error.detail || 'Request failed');
      }

      return await response.json();
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Journal endpoints
  async getJournalEntries(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString();
    return this.request<{entries: any[]}>(`/journal/entries${query ? `?${query}` : ''}`);
  }

  async getJournalEntry(date: string) {
    return this.request<{entry: any}>(`/journal/entries/${date}`);
  }

  async createJournalEntry(data: any) {
    return this.request<{entry: any}>('/journal/entries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateJournalEntry(date: string, data: any) {
    return this.request<{entry: any}>(`/journal/entries/${date}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteJournalEntry(date: string) {
    return this.request<{message: string}>(`/journal/entries/${date}`, {
      method: 'DELETE',
    });
  }

  async updateDailyLog(date: string, text: string) {
    return this.request<{entry: any}>(`/journal/entries/${date}/daily-log`, {
      method: 'POST',
      body: JSON.stringify({text}),
    });
  }

  // Habit endpoints
  async getHabits(activeOnly: boolean = false) {
    return this.request<{habits: any[]}>(`/habits/habits?active_only=${activeOnly}`);
  }

  async createHabit(data: any) {
    return this.request<{habit: any}>('/habits/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHabit(habitId: string, data: any) {
    return this.request<{habit: any}>(`/habits/habits/${habitId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHabit(habitId: string) {
    return this.request<{message: string}>(`/habits/habits/${habitId}`, {
      method: 'DELETE',
    });
  }

  async getHabitChecks(habitId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString();
    return this.request<{checks: any[]}>(`/habits/habits/${habitId}/checks${query ? `?${query}` : ''}`);
  }

  async createHabitCheck(data: any) {
    return this.request<{check: any}>('/habits/habits/checks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getChecksForDate(date: string) {
    return this.request<{checks: any[]}>(`/habits/habits/checks/date/${date}`);
  }

  async getHabitStreak(habitId: string) {
    return this.request<{habitId: string; currentStreak: number; longestStreak: number; lastCompletedDate?: string}>(`/habits/habits/${habitId}/streak`);
  }

  // Event endpoints
  async getEvents(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString();
    return this.request<{events: any[]}>(`/calendar/events${query ? `?${query}` : ''}`);
  }

  async getEventsForDate(date: string) {
    return this.request<{events: any[]}>(`/calendar/events/date/${date}`);
  }

  async createEvent(data: any) {
    return this.request<{event: any}>('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(eventId: string, data: any) {
    return this.request<{event: any}>(`/calendar/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(eventId: string) {
    return this.request<{message: string}>(`/calendar/events/${eventId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();


