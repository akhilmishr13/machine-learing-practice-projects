/**
 * Main App Navigator
 */
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {TodayScreen} from '../screens/TodayScreen';
import {CalendarScreen} from '../screens/CalendarScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {CreativeJournalScreen} from '../screens/CreativeJournalScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Today Stack (includes Creative Journal)
const TodayStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="TodayMain" component={TodayScreen} />
      <Stack.Screen
        name="CreativeJournal"
        component={CreativeJournalScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

// Calendar Stack (can add day detail view later)
const CalendarStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="CalendarMain" component={CalendarScreen} />
      <Stack.Screen
        name="CreativeJournal"
        component={CreativeJournalScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#1e293b',
        headerTitleStyle: {
          fontWeight: '600',
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Today"
        component={TodayStack}
        options={{
          headerShown: false,
          tabBarIcon: ({color, size}) => (
            <Icon name="today" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarStack}
        options={{
          headerShown: false,
          tabBarIcon: ({color, size}) => (
            <Icon name="calendar-month" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: 'Settings',
          tabBarIcon: ({color, size}) => (
            <Icon name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};


