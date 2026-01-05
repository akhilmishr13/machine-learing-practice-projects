/**
 * Screen 4: User Profile & Configuration
 */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useHabitStore} from '../stores/habitStore';
import {useThemeStore} from '../stores/themeStore';
import {Habit} from '../types';
import {v4 as uuidv4} from 'uuid';
import {haptics} from '../utils/haptics';

export const ProfileScreen: React.FC = () => {
  const {
    habits,
    loadHabits,
    addHabit,
    updateHabit,
    deleteHabit,
  } = useHabitStore();

  const {theme, setThemeMode} = useThemeStore();

  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    loadHabits().catch(console.error);
  }, []);

  const handleAddHabit = async () => {
    if (newHabitName.trim()) {
      const habit: Habit = {
        id: uuidv4(),
        name: newHabitName.trim(),
        color: '#6366f1',
        isActive: true,
        createdAt: new Date(),
      };
      await addHabit(habit);
      setNewHabitName('');
      setShowAddHabit(false);
      haptics.success();
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    Alert.alert('Delete Habit', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteHabit(habitId);
          haptics.medium();
        },
      },
    ]);
  };

  const habitColors = [
    '#6366f1', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.themeOptions}>
          {(['light', 'dark', 'sepia', 'paper'] as const).map(mode => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.themeOption,
                theme.mode === mode && styles.themeOptionActive,
              ]}
              onPress={() => {
                setThemeMode(mode);
                haptics.light();
              }}>
              <Text
                style={[
                  styles.themeOptionText,
                  theme.mode === mode && styles.themeOptionTextActive,
                ]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Habits Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Habits</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddHabit(true)}>
            <Icon name="add" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {/* Add Habit Form */}
        {showAddHabit && (
          <View style={styles.addHabitForm}>
            <TextInput
              style={styles.input}
              placeholder="Habit name"
              value={newHabitName}
              onChangeText={setNewHabitName}
              autoFocus
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddHabit(false);
                  setNewHabitName('');
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddHabit}>
                <Text style={styles.saveButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Habits List */}
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No habits yet</Text>
            <Text style={styles.emptySubtext}>
              Add habits to track your daily progress
            </Text>
          </View>
        ) : (
          habits.map(habit => (
            <View key={habit.id} style={styles.habitItem}>
              <View style={styles.habitContent}>
                <View
                  style={[styles.habitColorDot, {backgroundColor: habit.color}]}
                />
                <View style={styles.habitInfo}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <Text style={styles.habitStatus}>
                    {habit.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
              <View style={styles.habitActions}>
                <Switch
                  value={habit.isActive}
                  onValueChange={async value => {
                    await updateHabit(habit.id, {isActive: value});
                    haptics.light();
                  }}
                />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteHabit(habit.id)}>
                  <Icon name="delete-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Sync Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Settings</Text>

        <View style={styles.syncItem}>
          <View style={styles.syncItemContent}>
            <Icon name="description" size={24} color="#6366f1" />
            <View style={styles.syncItemText}>
              <Text style={styles.syncItemTitle}>Notion Sync</Text>
              <Text style={styles.syncItemSubtitle}>
                Sync entries to Notion workspace
              </Text>
            </View>
          </View>
          <Switch value={false} onValueChange={() => {}} />
        </View>

        <View style={styles.syncItem}>
          <View style={styles.syncItemContent}>
            <Icon name="event" size={24} color="#6366f1" />
            <View style={styles.syncItemText}>
              <Text style={styles.syncItemTitle}>Google Calendar</Text>
              <Text style={styles.syncItemSubtitle}>
                Sync events with Google Calendar
              </Text>
            </View>
          </View>
          <Switch value={false} onValueChange={() => {}} />
        </View>

        <View style={styles.syncItem}>
          <View style={styles.syncItemContent}>
            <Icon name="calendar-today" size={24} color="#6366f1" />
            <View style={styles.syncItemText}>
              <Text style={styles.syncItemTitle}>Apple Calendar</Text>
              <Text style={styles.syncItemSubtitle}>
                Sync with device calendar
              </Text>
            </View>
          </View>
          <Switch value={false} onValueChange={() => {}} />
        </View>
      </View>

      {/* Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity style={styles.dataItem}>
          <Icon name="cloud-upload" size={24} color="#6366f1" />
          <Text style={styles.dataItemText}>Export Data</Text>
          <Icon name="chevron-right" size={24} color="#94a3b8" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataItem}>
          <Icon name="backup" size={24} color="#6366f1" />
          <Text style={styles.dataItemText}>Backup to Local</Text>
          <Icon name="chevron-right" size={24} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  themeOptionTextActive: {
    color: '#6366f1',
  },
  addButton: {
    padding: 4,
  },
  addHabitForm: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  habitStatus: {
    fontSize: 14,
    color: '#64748b',
  },
  habitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  syncItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  syncItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  syncItemText: {
    marginLeft: 12,
    flex: 1,
  },
  syncItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  syncItemSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dataItemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
  },
});

