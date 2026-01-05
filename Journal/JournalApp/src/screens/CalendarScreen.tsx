/**
 * Screen 2: Dynamic Masonry Calendar
 */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {Calendar, DateData} from 'react-native-calendars';
import {format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay} from 'date-fns';
import {useJournalStore} from '../stores/journalStore';
import {storageApiService as storageService} from '../services/storageApi';
import {DayData} from '../types';
import {CalendarDayCell} from '../components/CalendarDayCell';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width} = Dimensions.get('window');

type ViewMode = 'month' | 'week' | 'day';

export const CalendarScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [markedDates, setMarkedDates] = useState<any>({});

  const {journalEntries, loadEntries, setSelectedDate} = useJournalStore();

  useEffect(() => {
    loadEntries().catch(console.error);
  }, []);

  useEffect(() => {
    updateMarkedDates().catch(console.error);
  }, [journalEntries]);

  const updateMarkedDates = async () => {
    const events = await storageService.getEvents();
    const marked: any = {};

    // Mark days with events
    events.forEach(event => {
      const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
      const eventCount = events.filter(e =>
        isSameDay(new Date(e.date), new Date(event.date)),
      ).length;

      marked[dateKey] = {
        marked: true,
        dotColor: '#6366f1',
        customStyles: {
          container: {
            backgroundColor: eventCount > 3 ? '#c7d2fe' : '#e0e7ff',
          },
        },
      };
    });

    // Mark days with journal entries
    journalEntries.forEach(entry => {
      const dateKey = format(new Date(entry.date), 'yyyy-MM-dd');
      if (marked[dateKey]) {
        marked[dateKey].customStyles.container.borderWidth = 2;
        marked[dateKey].customStyles.container.borderColor = '#f59e0b';
      } else {
        marked[dateKey] = {
          marked: true,
          dotColor: '#f59e0b',
          customStyles: {
            container: {
              borderWidth: 2,
              borderColor: '#f59e0b',
            },
          },
        };
      }
    });

    setMarkedDates(marked);
  };

  const getDayData = async (date: Date): Promise<DayData> => {
    const [events, journalEntry, habitChecks] = await Promise.all([
      storageService.getEventsForDate(date),
      storageService.getJournalEntry(date),
      storageService.getHabitChecksForDate(date),
    ]);

    return {
      date,
      events,
      journalEntry: journalEntry || undefined,
      habitChecks,
      eventCount: events.length,
    };
  };

  const getSelectedDayData = async (date: Date): Promise<DayData> => {
    return await getDayData(date);
  };

  const renderMonthView = () => {
    const [daysData, setDaysData] = React.useState<Map<string, DayData>>(new Map());
    
    React.useEffect(() => {
      const loadData = async () => {
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        const days = eachDayOfInterval({start: monthStart, end: monthEnd});
        const dataMap = new Map<string, DayData>();
        
        for (const day of days) {
          const data = await getDayData(day);
          dataMap.set(day.toISOString(), data);
        }
        setDaysData(dataMap);
      };
      loadData();
    }, [selectedDate]);

    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const days = eachDayOfInterval({start: monthStart, end: monthEnd});
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <ScrollView style={styles.monthContainer}>
        <View style={styles.monthGrid}>
          {days.map(day => {
            const dayData = daysData.get(day.toISOString()) || {
              date: day,
              events: [],
              habitChecks: [],
              eventCount: 0,
            };
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDay = isSameDay(day, today);

            return (
              <CalendarDayCell
                key={day.toISOString()}
                dayData={dayData}
                isSelected={isSelected}
                isToday={isTodayDay}
                onPress={async () => {
                  setSelectedDate(day);
                  setViewMode('day');
                }}
              />
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderWeekView = () => {
    const [weekData, setWeekData] = React.useState<Map<string, DayData>>(new Map());
    
    React.useEffect(() => {
      const loadWeekData = async () => {
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        const weekDays = Array.from({length: 7}, (_, i) => {
          const day = new Date(weekStart);
          day.setDate(weekStart.getDate() + i);
          return day;
        });
        const dataMap = new Map<string, DayData>();
        
        for (const day of weekDays) {
          const data = await getDayData(day);
          dataMap.set(day.toISOString(), data);
        }
        setWeekData(dataMap);
      };
      loadWeekData();
    }, [selectedDate]);

    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
    const weekDays = Array.from({length: 7}, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day;
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.weekContainer}>
          {weekDays.map(day => {
            const dayData = weekData.get(day.toISOString()) || {
              date: day,
              events: [],
              habitChecks: [],
              eventCount: 0,
            };
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDay = isSameDay(day, today);

            return (
              <View key={day.toISOString()} style={styles.weekDayWrapper}>
                <Text style={styles.weekDayName}>{format(day, 'EEE')}</Text>
                <CalendarDayCell
                  dayData={dayData}
                  isSelected={isSelected}
                  isToday={isTodayDay}
                  onPress={() => {
                  setSelectedDate(day);
                  setViewMode('day');
                  await setSelectedDate(day);
                  }}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderDayView = () => {
    const [dayData, setDayData] = React.useState<DayData>({
      date: selectedDate,
      events: [],
      habitChecks: [],
      eventCount: 0,
    });

    React.useEffect(() => {
      const loadDayData = async () => {
        const data = await getDayData(selectedDate);
        setDayData(data);
      };
      loadDayData();
    }, [selectedDate]);

    return (
      <ScrollView style={styles.dayContainer}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>{format(selectedDate, 'EEEE, MMMM d')}</Text>
        </View>

        {dayData.events.length > 0 && (
          <View style={styles.eventsSection}>
            <Text style={styles.sectionTitle}>Events</Text>
            {dayData.events.map(event => (
              <View key={event.id} style={styles.eventItem}>
                <View style={[styles.eventColor, {backgroundColor: event.color}]} />
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.description && (
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {dayData.journalEntry && (
          <View style={styles.journalSection}>
            <Text style={styles.sectionTitle}>Journal Entry</Text>
            <TouchableOpacity
              style={styles.journalCard}
              onPress={() => {
                // Navigate to creative journal
              }}>
              <Icon name="edit" size={24} color="#6366f1" />
              <Text style={styles.journalCardText}>View/Edit Entry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.viewModeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, viewMode === 'month' && styles.modeButtonActive]}
          onPress={() => setViewMode('month')}>
          <Text
            style={[
              styles.modeButtonText,
              viewMode === 'month' && styles.modeButtonTextActive,
            ]}>
            Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, viewMode === 'week' && styles.modeButtonActive]}
          onPress={() => setViewMode('week')}>
          <Text
            style={[
              styles.modeButtonText,
              viewMode === 'week' && styles.modeButtonTextActive,
            ]}>
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, viewMode === 'day' && styles.modeButtonActive]}
          onPress={() => setViewMode('day')}>
          <Text
            style={[
              styles.modeButtonText,
              viewMode === 'day' && styles.modeButtonTextActive,
            ]}>
            Day
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  viewModeSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  modeButtonActive: {
    backgroundColor: '#6366f1',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  monthContainer: {
    flex: 1,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  weekContainer: {
    flexDirection: 'row',
    padding: 8,
  },
  weekDayWrapper: {
    width: width / 7 - 16,
    marginHorizontal: 4,
  },
  weekDayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  dayContainer: {
    flex: 1,
  },
  dayHeader: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dayTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  eventsSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 16,
    borderRadius: 12,
  },
  journalSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  eventItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  eventColor: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  journalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
  },
  journalCardText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
});

