/**
 * Calendar day cell component with dynamic height based on events
 */
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {DayData} from '../types';
import {format, isSameDay} from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  dayData: DayData;
  isSelected: boolean;
  onPress: () => void;
  isToday: boolean;
}

export const CalendarDayCell: React.FC<Props> = ({
  dayData,
  isSelected,
  onPress,
  isToday,
}) => {
  const {date, events, journalEntry, eventCount} = dayData;
  const hasEntry = !!journalEntry && journalEntry.layers.length > 0;
  
  // Calculate cell height based on content
  const baseHeight = 80;
  const eventHeight = Math.min(eventCount * 20, 60);
  const entryHeight = hasEntry ? 30 : 0;
  const cellHeight = baseHeight + eventHeight + entryHeight;

  // Get first image from journal entry for preview
  const previewImage = journalEntry?.layers.find(l => l.type === 'image');

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        {height: cellHeight},
        isSelected && styles.cellSelected,
        isToday && styles.cellToday,
      ]}
      onPress={onPress}>
      <View style={styles.header}>
        <Text
          style={[
            styles.dayNumber,
            isToday && styles.dayNumberToday,
            isSelected && styles.dayNumberSelected,
          ]}>
          {format(date, 'd')}
        </Text>
        {hasEntry && (
          <View style={styles.entryIndicator}>
            <Icon name="edit" size={12} color="#f59e0b" />
          </View>
        )}
      </View>

      {/* Event previews */}
      {events.length > 0 && (
        <View style={styles.eventsContainer}>
          {events.slice(0, 3).map(event => (
            <View key={event.id} style={styles.eventDot}>
              <View
                style={[styles.eventColor, {backgroundColor: event.color}]}
              />
              <Text style={styles.eventTitle} numberOfLines={1}>
                {event.title}
              </Text>
            </View>
          ))}
          {events.length > 3 && (
            <Text style={styles.moreEvents}>+{events.length - 3} more</Text>
          )}
        </View>
      )}

      {/* Journal entry preview */}
      {previewImage && (
        <View style={styles.imagePreview}>
          <Image
            source={{uri: previewImage.data.uri}}
            style={styles.previewImage}
            resizeMode="cover"
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    margin: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 80,
  },
  cellSelected: {
    borderColor: '#6366f1',
    borderWidth: 2,
    backgroundColor: '#eef2ff',
  },
  cellToday: {
    borderColor: '#10b981',
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  dayNumberToday: {
    color: '#10b981',
  },
  dayNumberSelected: {
    color: '#6366f1',
  },
  entryIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsContainer: {
    flex: 1,
    marginTop: 4,
  },
  eventDot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  eventColor: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  eventTitle: {
    fontSize: 10,
    color: '#64748b',
    flex: 1,
  },
  moreEvents: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 2,
  },
  imagePreview: {
    marginTop: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 20,
  },
});


