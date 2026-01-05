/**
 * Screen 1: Daily Summary & Habit Tracker
 */
import React, {useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import {useHabitStore} from '../stores/habitStore';
import {useJournalStore} from '../stores/journalStore';
import {HabitCheckbox} from '../components/HabitCheckbox';
import {DailyLogInput} from '../components/DailyLogInput';
import {HabitStreak, HabitCheck} from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width} = Dimensions.get('window');

export const TodayScreen: React.FC = () => {
  const navigation = useNavigation();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const {
    habits,
    habitChecks,
    loadHabits,
    toggleHabitCheck,
    getHabitChecksForDate,
    getStreak,
  } = useHabitStore();

  const {getEntryForDate} = useJournalStore();

  useEffect(() => {
    loadHabits().catch(console.error);
  }, []);

  const activeHabits = habits.filter(h => h.isActive);
  const [todaysChecks, setTodaysChecks] = React.useState<HabitCheck[]>([]);
  const [hasJournalEntry, setHasJournalEntry] = React.useState(false);

  React.useEffect(() => {
    const loadData = async () => {
      const checks = await getHabitChecksForDate(today);
      setTodaysChecks(checks);
      const entry = await getEntryForDate(today);
      setHasJournalEntry(!!entry && entry.layers.length > 0);
    };
    loadData();
  }, [today]);

  const handleOpenJournal = () => {
    navigation.navigate('CreativeJournal' as never, {date: today} as never);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.date}>{format(today, 'EEEE, MMMM d')}</Text>
      </View>

      {/* Daily Log Section */}
      <View style={styles.section}>
        <DailyLogInput date={today} />
      </View>

      {/* Habit Checklist Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Habits</Text>
        {activeHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No habits tracked yet</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('Profile' as never)}>
              <Text style={styles.addButtonText}>Add Habits</Text>
            </TouchableOpacity>
          </View>
        ) : (
          activeHabits.map(habit => {
            const check = todaysChecks.find(c => c.habitId === habit.id);
            const isChecked = check?.completed || false;
            const [streak, setStreak] = React.useState<HabitStreak>({
              habitId: habit.id,
              currentStreak: 0,
              longestStreak: 0,
            });
            
            React.useEffect(() => {
              getStreak(habit.id).then(setStreak).catch(console.error);
            }, [habit.id, isChecked]); // Reload when checked changes

            return (
              <HabitCheckbox
                key={habit.id}
                habit={habit}
                checked={isChecked}
                streak={streak}
                onToggle={() => toggleHabitCheck(habit.id, today).catch(console.error)}
              />
            );
          })
        )}
      </View>

      {/* Creative Journal Entrypoint */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.journalButton, hasJournalEntry && styles.journalButtonActive]}
          onPress={handleOpenJournal}>
          <View style={styles.journalButtonContent}>
            <Icon
              name={hasJournalEntry ? 'edit' : 'add-circle-outline'}
              size={32}
              color={hasJournalEntry ? '#6366f1' : '#94a3b8'}
            />
            <View style={styles.journalButtonText}>
              <Text style={styles.journalButtonTitle}>
                {hasJournalEntry ? 'Edit Journal Entry' : 'Create Journal Entry'}
              </Text>
              <Text style={styles.journalButtonSubtitle}>
                {hasJournalEntry
                  ? 'Add photos, stickers, and sketches'
                  : 'Start your creative journal'}
              </Text>
            </View>
          </View>
          {hasJournalEntry && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Saved</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Events Section - Placeholder for now */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Events</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No events scheduled</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  journalButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  journalButtonActive: {
    borderColor: '#6366f1',
    borderStyle: 'solid',
    backgroundColor: '#eef2ff',
  },
  journalButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  journalButtonText: {
    marginLeft: 16,
    flex: 1,
  },
  journalButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  journalButtonSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  badge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

