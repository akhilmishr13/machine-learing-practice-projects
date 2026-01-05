/**
 * Sticker library component with 50+ basic stickers
 */
import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const STICKER_ICONS = [
  // Emojis/Expressions
  'favorite', 'star', 'thumb-up', 'mood', 'sentiment-satisfied',
  'sentiment-dissatisfied', 'tag-faces', 'emoji-emotions',
  
  // Shapes
  'circle', 'square', 'triangle', 'hexagon', 'pentagon',
  'radio-button-unchecked', 'radio-button-checked',
  
  // Objects
  'home', 'flight', 'car', 'local-cafe', 'restaurant',
  'beach-access', 'pool', 'fitness-center', 'spa',
  
  // Nature
  'eco', 'park', 'local-florist', 'waves', 'cloud',
  'wb-sunny', 'brightness-2', 'wb-cloudy',
  
  // Events
  'cake', 'card-giftcard', 'celebration', 'party-mode',
  'confirmation-number', 'event', 'event-available',
  
  // Symbols
  'add-circle', 'check-circle', 'cancel', 'help',
  'info', 'warning', 'error', 'check', 'close',
  
  // Activities
  'sports-soccer', 'sports-basketball', 'sports-tennis',
  'music-note', 'movie', 'book', 'school', 'work',
];

interface Props {
  onSelectSticker: (iconName: string) => void;
  visible: boolean;
}

export const StickerLibrary: React.FC<Props> = ({onSelectSticker, visible}) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stickers</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {STICKER_ICONS.map(iconName => (
            <TouchableOpacity
              key={iconName}
              style={styles.stickerItem}
              onPress={() => onSelectSticker(iconName)}>
              <Icon name={iconName} size={32} color="#6366f1" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  stickerItem: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
});


