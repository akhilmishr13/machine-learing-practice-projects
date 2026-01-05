/**
 * Habit checkbox component with streak indicator
 */
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Habit, HabitCheck, HabitStreak} from '../types';
import {haptics} from '../utils/haptics';

interface Props {
  habit: Habit;
  checked: boolean;
  streak: HabitStreak;
  onToggle: () => void;
}

export const HabitCheckbox: React.FC<Props> = ({
  habit,
  checked,
  streak,
  onToggle,
}) => {
  const handlePress = () => {
    haptics.light();
    onToggle();
    if (!checked) {
      haptics.success();
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <View style={styles.checkmark} />}
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{habit.name}</Text>
        {streak.currentStreak > 0 && (
          <View style={styles.streakContainer}>
            <Text style={styles.streakText}>
              🔥 {streak.currentStreak} day streak
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  checkmark: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  streakContainer: {
    marginTop: 4,
  },
  streakText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },
});


