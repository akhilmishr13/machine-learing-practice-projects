/**
 * Screen 3: Creative Journal Canvas
 * Instagram Stories-like canvas with Skia rendering
 */
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import {Canvas, Path, Skia, useTouchHandler} from '@shopify/react-native-skia';
import {useNavigation, useRoute} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useJournalStore} from '../stores/journalStore';
import {CanvasToolbar} from '../components/CanvasToolbar';
import {StickerLibrary} from '../components/StickerLibrary';
import {CanvasLayer} from '../types';
import {v4 as uuidv4} from 'uuid';

const {width, height} = Dimensions.get('window');
const canvasWidth = width;
const canvasHeight = height - 200; // Account for toolbar and status bar

type Tool = 'pen' | 'eraser' | 'photo' | 'sticker' | 'text';

export const CreativeJournalScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const date = (route.params as any)?.date || new Date();

  const {
    currentEntry,
    canvasLayers,
    selectedLayerId,
    addLayer,
    updateLayer,
    deleteLayer,
    setSelectedLayer,
    saveEntry,
    loadEntries,
  } = useJournalStore();

  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showStickers, setShowStickers] = useState(false);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  const [paths, setPaths] = useState<Path[]>([]);

  useEffect(() => {
    loadEntries().catch(console.error);
  }, [date]);

  const handleSave = async () => {
    const entry = {
      id: currentEntry?.id || `entry_${date.getTime()}`,
      date,
      layers: canvasLayers,
      createdAt: currentEntry?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    await saveEntry(entry);
    navigation.goBack();
  };

  const handleToolSelect = (tool: Tool) => {
    if (tool === 'sticker') {
      setShowStickers(!showStickers);
      setSelectedTool(showStickers ? null : 'sticker');
    } else {
      setShowStickers(false);
      setSelectedTool(tool);
    }
  };

  const handleAddPhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      response => {
        if (response.assets && response.assets[0]) {
          const layer: CanvasLayer = {
            id: uuidv4(),
            type: 'image',
            x: canvasWidth / 2 - 100,
            y: canvasHeight / 2 - 100,
            width: 200,
            height: 200,
            rotation: 0,
            scale: 1,
            zIndex: canvasLayers.length,
            data: {uri: response.assets[0].uri},
          };
          addLayer(layer).catch(console.error);
        }
      },
    );
  };

  const handleAddSticker = (iconName: string) => {
    const layer: CanvasLayer = {
      id: uuidv4(),
      type: 'sticker',
      x: canvasWidth / 2 - 50,
      y: canvasHeight / 2 - 50,
      width: 100,
      height: 100,
      rotation: 0,
      scale: 1,
      zIndex: canvasLayers.length,
      data: {iconName, icon: iconName},
    };
    addLayer(layer).catch(console.error);
    setShowStickers(false);
    setSelectedTool(null);
  };

  // Sketch path handling
  const touchHandler = useTouchHandler({
    onStart: ({x, y}) => {
      if (selectedTool === 'pen') {
        const path = Skia.Path.Make();
        path.moveTo(x, y);
        setCurrentPath(path);
      }
    },
    onActive: ({x, y}) => {
      if (selectedTool === 'pen' && currentPath) {
        currentPath.lineTo(x, y);
        setCurrentPath(currentPath);
      }
    },
    onEnd: () => {
      if (selectedTool === 'pen' && currentPath) {
        setPaths([...paths, currentPath]);
        // Create sketch layer
        const layer: CanvasLayer = {
          id: uuidv4(),
          type: 'sketch',
          x: 0,
          y: 0,
          width: canvasWidth,
          height: canvasHeight,
          rotation: 0,
          scale: 1,
          zIndex: canvasLayers.length,
          data: {pathData: currentPath.toSVGString()},
        };
        addLayer(layer).catch(console.error);
        setCurrentPath(null);
      }
    },
  });

  const handleClear = () => {
    Alert.alert('Clear Canvas', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          setPaths([]);
          // Clear all sketch layers
          for (const layer of canvasLayers.filter(l => l.type === 'sketch')) {
            await deleteLayer(layer.id);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Creative Journal</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        <Canvas style={styles.canvas} onTouch={touchHandler}>
          {/* Render existing layers */}
          {canvasLayers.map(layer => {
            if (layer.type === 'image') {
              // Render image layers (simplified - would need Image component from Skia)
              return null;
            }
            return null;
          })}

          {/* Render current drawing path */}
          {currentPath && (
            <Path
              path={currentPath}
              color="#000000"
              style="stroke"
              strokeWidth={3}
            />
          )}

          {/* Render saved paths */}
          {paths.map((path, index) => (
            <Path
              key={index}
              path={path}
              color="#000000"
              style="stroke"
              strokeWidth={3}
            />
          ))}
        </Canvas>
      </View>

      {/* Sticker Library */}
      {showStickers && (
        <StickerLibrary
          visible={showStickers}
          onSelectSticker={handleAddSticker}
        />
      )}

      {/* Toolbar */}
      <CanvasToolbar
        selectedTool={selectedTool}
        onToolSelect={tool => {
          if (tool === 'photo') {
            handleAddPhoto();
          } else {
            handleToolSelect(tool);
          }
        }}
        onUndo={() => {
          // Implement undo
        }}
        onClear={handleClear}
        canUndo={paths.length > 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  canvas: {
    flex: 1,
    width: canvasWidth,
    height: canvasHeight,
  },
});

