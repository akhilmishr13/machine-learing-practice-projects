/**
 * JournalApp - Main Entry Point
 */
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StatusBar} from 'react-native';
import {AppNavigator} from './src/navigation/AppNavigator';
import {useHabitStore} from './src/stores/habitStore';
import {useJournalStore} from './src/stores/journalStore';
import {useThemeStore} from './src/stores/themeStore';

const App: React.FC = () => {
  const {loadHabits} = useHabitStore();
  const {loadEntries} = useJournalStore();
  const {theme} = useThemeStore();

  useEffect(() => {
    // Initialize data
    loadHabits().catch(console.error);
    loadEntries().catch(console.error);
  }, [loadHabits, loadEntries]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.backgroundColor}
      />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;

