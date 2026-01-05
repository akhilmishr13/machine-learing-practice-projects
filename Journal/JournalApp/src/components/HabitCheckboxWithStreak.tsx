/**
 * Habit checkbox component with async streak loading
 */
import React, {useEffect, useState} from 'react';
import {HabitCheckbox} from './HabitCheckbox';
import {Habit, HabitCheck, HabitStreak} from '../types';

interface Props {
  habit: Habit;
  checked: boolean;
  getStreak: (habitId: string) => Promise<HabitStreak>;
}

export const HabitCheckboxWithStreak: React.FC<Props> = ({
  habit,
  checked,
  getStreak,
}) => {
  const [streak, setStreak] = useState<HabitStreak>({
    habitId: habit.id,
    currentStreak: 0,
    longestStreak: 0,
  });

  useEffect(() => {
    getStreak(habit.id).then(setStreak).catch(console.error);
  }, [habit.id, checked]); // Reload streak when checked changes

  return <HabitCheckbox habit={habit} checked={checked} streak={streak} onToggle={() => {}} />;
};


