/**
 * Canvas toolbar for drawing tools and actions
 */
import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Tool = 'pen' | 'eraser' | 'photo' | 'sticker' | 'text';

interface Props {
  selectedTool: Tool | null;
  onToolSelect: (tool: Tool) => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
}

export const CanvasToolbar: React.FC<Props> = ({
  selectedTool,
  onToolSelect,
  onUndo,
  onClear,
  canUndo,
}) => {
  const tools: {tool: Tool; icon: string}[] = [
    {tool: 'pen', icon: 'edit'},
    {tool: 'eraser', icon: 'clear'},
    {tool: 'photo', icon: 'photo-library'},
    {tool: 'sticker', icon: 'emoji-emotions'},
    {tool: 'text', icon: 'text-fields'},
  ];

  return (
    <View style={styles.container}>
      {tools.map(({tool, icon}) => (
        <TouchableOpacity
          key={tool}
          style={[
            styles.toolButton,
            selectedTool === tool && styles.toolButtonActive,
          ]}
          onPress={() => onToolSelect(tool)}>
          <Icon
            name={icon}
            size={24}
            color={selectedTool === tool ? '#6366f1' : '#64748b'}
          />
        </TouchableOpacity>
      ))}

      <View style={styles.separator} />

      <TouchableOpacity
        style={[styles.toolButton, !canUndo && styles.toolButtonDisabled]}
        onPress={onUndo}
        disabled={!canUndo}>
        <Icon
          name="undo"
          size={24}
          color={canUndo ? '#64748b' : '#cbd5e1'}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.toolButton} onPress={onClear}>
        <Icon name="delete-outline" size={24} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  toolButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  toolButtonActive: {
    backgroundColor: '#eef2ff',
  },
  toolButtonDisabled: {
    opacity: 0.5,
  },
  separator: {
    width: 1,
    height: 30,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
});


