import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { useJournalStore } from '../stores/journalStore';
import { useHabitStore } from '../stores/habitStore';
import { apiService } from '../services/api';
import { DayData, Event } from '../types';

type ViewMode = 'month' | 'week' | 'day';

export function CalendarScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [dayData, setDayData] = useState<DayData | null>(null);

  const { journalEntries, loadEntries } = useJournalStore();

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    updateMarkedDates();
  }, [journalEntries, selectedDate]);

  const updateMarkedDates = async () => {
    try {
      const eventsResponse = await apiService.getEvents();
      const events = eventsResponse.events || [];
      const marked: Record<string, any> = {};

      // Mark days with events
      events.forEach((event: Event) => {
        const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
        marked[dateKey] = {
          marked: true,
          dotColor: '#6366f1',
          className: 'event-day',
        };
      });

      // Mark days with journal entries
      journalEntries.forEach((entry) => {
        const dateKey = format(new Date(entry.date), 'yyyy-MM-dd');
        if (marked[dateKey]) {
          marked[dateKey].className = 'event-and-journal-day';
        } else {
          marked[dateKey] = {
            marked: true,
            dotColor: '#f59e0b',
            className: 'journal-day',
          };
        }
      });

      setMarkedDates(marked);
    } catch (error) {
      console.error('Failed to update marked dates:', error);
    }
  };

  const loadDayData = async (date: Date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const { getEntryForDate } = useJournalStore.getState();
      const { getHabitChecksForDate } = useHabitStore.getState();
      
      const [eventsResponse, entry] = await Promise.all([
        apiService.getEventsForDate(dateStr),
        getEntryForDate(date),
      ]);

      const checks = await getHabitChecksForDate(date);

      return {
        date,
        events: eventsResponse.events || [],
        journalEntry: entry || undefined,
        habitChecks: checks,
        eventCount: eventsResponse.events?.length || 0,
      };
    } catch (error) {
      console.error('Failed to load day data:', error);
      return {
        date,
        events: [],
        habitChecks: [],
        eventCount: 0,
      };
    }
  };

  useEffect(() => {
    if (viewMode === 'day') {
      loadDayData(selectedDate).then(setDayData);
    }
  }, [selectedDate, viewMode]);

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add days from previous month to fill the week
    const weekStart = startOfWeek(monthStart);
    const weekEnd = endOfWeek(monthEnd);
    const allDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="p-2 sm:p-4">
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs sm:text-sm font-semibold text-gray-600 py-1 sm:py-2">
              {day}
            </div>
          ))}
          {allDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const marked = markedDates[dateKey];
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = day >= monthStart && day <= monthEnd;

            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day);
                  setViewMode('day');
                }}
                className={`aspect-square rounded-lg p-1 sm:p-2 text-xs sm:text-sm transition-all ${
                  !isCurrentMonth
                    ? 'text-gray-300'
                    : isToday
                    ? 'bg-primary-600 text-white font-bold'
                    : isSelected
                    ? 'bg-primary-100 text-primary-900 font-semibold'
                    : 'bg-white text-gray-900 hover:bg-gray-50'
                } ${marked ? 'border-2 border-primary-400' : 'border border-gray-200'}`}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="leading-tight">{format(day, 'd')}</span>
                  {marked && (
                    <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                      {marked.className?.includes('event') ? '📅' : '📝'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(selectedDate),
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="p-2 sm:p-4 overflow-x-auto">
        <div className="flex space-x-1 sm:space-x-2 min-w-max">
          {weekDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const marked = markedDates[dateKey];
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDate);

            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day);
                  setViewMode('day');
                }}
                className={`flex-shrink-0 w-16 sm:w-24 rounded-lg p-2 sm:p-4 text-center transition-all ${
                  isToday
                    ? 'bg-primary-600 text-white'
                    : isSelected
                    ? 'bg-primary-100 text-primary-900'
                    : 'bg-white text-gray-900 hover:bg-gray-50'
                } ${marked ? 'border-2 border-primary-400' : 'border border-gray-200'}`}
              >
                <div className="text-[10px] sm:text-xs text-gray-500 mb-1">
                  {format(day, 'EEE')}
                </div>
                <div className="text-lg sm:text-2xl font-bold mb-1">
                  {format(day, 'd')}
                </div>
                {marked && (
                  <div className="text-[10px] sm:text-xs mt-1">
                    {marked.className?.includes('event') ? '📅' : '📝'}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    if (!dayData) {
      return <div className="p-4 text-center text-sm sm:text-base text-gray-500">Loading...</div>;
    }

    return (
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h2>

          {dayData.events.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                Events
              </h3>
              <div className="space-y-2">
                {dayData.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className="w-1 h-full rounded flex-shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base text-gray-900 break-words">{event.title}</p>
                      {event.description && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dayData.journalEntry && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                Journal Entry
              </h3>
              <div className="p-3 sm:p-4 bg-primary-50 rounded-lg">
                <p className="text-sm sm:text-base text-gray-700 break-words">
                  {dayData.journalEntry.text || 'Creative journal entry'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* View Mode Selector */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex">
          {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-2 sm:py-3 text-center text-sm sm:text-base font-medium capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Views */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </div>
  );
}

