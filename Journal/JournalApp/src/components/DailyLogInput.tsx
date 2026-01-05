/**
 * Daily log text input component
 */
import React, {useState, useEffect} from 'react';
import {View, TextInput, StyleSheet, Text} from 'react-native';
import {storageApiService as storageService} from '../services/storageApi';
import {format} from 'date-fns';

interface Props {
  date: Date;
  placeholder?: string;
}

export const DailyLogInput: React.FC<Props> = ({
  date,
  placeholder = "How was your day?",
}) => {
  const [text, setText] = useState('');

  useEffect(() => {
    const loadLog = async () => {
      const saved = await storageService.getDailyLog(date);
      setText(saved);
    };
    loadLog();
  }, [date]);

  const handleChangeText = (newText: string) => {
    setText(newText);
    // Save to backend (debounced in real implementation would use useDebounce hook)
    storageService.saveDailyLog(date, newText).catch(console.error);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Daily Reflection</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={text}
        onChangeText={handleChangeText}
        textAlignVertical="top"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#1e293b',
    minHeight: 100,
    maxHeight: 200,
  },
});

