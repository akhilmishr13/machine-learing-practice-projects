import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useHabitStore } from '../stores/habitStore';
import { useJournalStore } from '../stores/journalStore';
import { HabitCheck, HabitStreak } from '../types';
import { useNavigate } from 'react-router-dom';

export function TodayScreen() {
  const navigate = useNavigate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const {
    habits,
    loadHabits,
    toggleHabitCheck,
    getHabitChecksForDate,
    getStreak,
  } = useHabitStore();

  const { getEntryForDate, saveEntry } = useJournalStore();

  const [todaysChecks, setTodaysChecks] = useState<HabitCheck[]>([]);
  const [hasJournalEntry, setHasJournalEntry] = useState(false);
  const [dailyLogText, setDailyLogText] = useState('');
  const [streaks, setStreaks] = useState<Record<string, HabitStreak>>({});

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const checks = await getHabitChecksForDate(today);
      setTodaysChecks(checks);
      const entry = await getEntryForDate(today);
      setHasJournalEntry(!!entry && (entry.layers?.length > 0 || !!entry.text));
      setDailyLogText(entry?.text || '');
      
      // Load streaks for all habits
      const streakMap: Record<string, HabitStreak> = {};
      for (const habit of habits.filter(h => h.isActive)) {
        const streak = await getStreak(habit.id);
        streakMap[habit.id] = streak;
      }
      setStreaks(streakMap);
    };
    loadData();
  }, [today, habits]);

  const activeHabits = habits.filter((h) => h.isActive);

  const handleSaveDailyLog = async () => {
    try {
      await saveEntry({
        id: `entry_${format(today, 'yyyy-MM-dd')}`,
        date: today.toISOString(),
        text: dailyLogText,
        layers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      // Reload entry to ensure UI is updated
      const entry = await getEntryForDate(today);
      if (entry) {
        setDailyLogText(entry.text || '');
      }
    } catch (error) {
      console.error('Failed to save daily log:', error);
      alert('Failed to save daily log. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Today</h1>
        <p className="text-sm sm:text-base text-gray-600">{format(today, 'EEEE, MMMM d')}</p>
      </div>

      {/* Daily Log Section */}
      <div className="px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Daily Log
          </label>
          <textarea
            value={dailyLogText}
            onChange={(e) => setDailyLogText(e.target.value)}
            onBlur={handleSaveDailyLog}
            placeholder="What's on your mind today?"
            className="w-full h-28 sm:h-32 p-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Habit Checklist Section */}
      <div className="px-3 sm:px-4 py-4 sm:py-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Habits</h2>
        {activeHabits.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
            <p className="text-sm sm:text-base text-gray-500 mb-4">No habits tracked yet</p>
            <button
              onClick={() => navigate('/profile')}
              className="bg-primary-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-primary-700"
            >
              Add Habits
            </button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {activeHabits.map((habit) => {
              const check = todaysChecks.find((c) => c.habitId === habit.id);
              const isChecked = check?.completed || false;
              const streak = streaks[habit.id] || {
                habitId: habit.id,
                currentStreak: 0,
                longestStreak: 0,
              };

              return (
                <div
                  key={habit.id}
                  className="bg-white rounded-xl shadow-sm p-3 sm:p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleHabitCheck(habit.id, today)}
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                        isChecked
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {isChecked && (
                        <span className="text-white text-xs sm:text-sm">✓</span>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{habit.name}</p>
                      <div className="flex items-center space-x-2 sm:space-x-4 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500">
                          🔥 {streak.currentStreak} day streak
                        </span>
                        <span className="text-xs text-gray-500">
                          🏆 Best: {streak.longestStreak}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 ml-2"
                    style={{ backgroundColor: habit.color }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Creative Journal Entrypoint */}
      <div className="px-3 sm:px-4 py-4 sm:py-6">
        <button
          onClick={() => navigate('/journal')}
          className={`w-full rounded-xl p-4 sm:p-6 border-2 transition-all ${
            hasJournalEntry
              ? 'bg-primary-50 border-primary-500'
              : 'bg-white border-dashed border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="text-2xl sm:text-3xl flex-shrink-0">
              {hasJournalEntry ? '✏️' : '➕'}
            </span>
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-sm sm:text-base text-gray-900">
                {hasJournalEntry ? 'Edit Journal Entry' : 'Create Journal Entry'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {hasJournalEntry
                  ? 'Add photos, stickers, and sketches'
                  : 'Start your creative journal'}
              </p>
            </div>
            {hasJournalEntry && (
              <span className="bg-primary-600 text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-full flex-shrink-0">
                Saved
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}

