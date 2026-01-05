import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useJournalStore } from '../stores/journalStore';
import { CanvasLayer } from '../types';
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore - fabric types not available
import { fabric } from 'fabric';

type Tool = 'pen' | 'eraser' | 'photo' | 'sticker' | 'text';

export function CreativeJournalScreen() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const {
    currentEntry,
    canvasLayers,
    addLayer,
    saveEntry,
    getEntryForDate,
  } = useJournalStore();

  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showStickers, setShowStickers] = useState(false);

  useEffect(() => {
    loadEntry();
  }, []);

  useEffect(() => {
    let updateCanvasSize: (() => void) | null = null;
    let handleOrientationChange: (() => void) | null = null;
    let preventDefaults: ((e: Event) => void) | null = null;
    let canvasElement: HTMLCanvasElement | null = null;

    if (canvasRef.current && !fabricCanvasRef.current) {
      const calculateCanvasSize = () => {
        const isMobile = window.innerWidth < 640;
        const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
        
        let width, height;
        if (isMobile) {
          // Mobile: full width minus padding, account for header (60px) + toolbar (80px) + safe area
          width = window.innerWidth - 16;
          height = Math.max(window.innerHeight - 200, 400); // Minimum height for usability
        } else if (isTablet) {
          // Tablet: centered with max width
          width = Math.min(window.innerWidth - 64, 700);
          height = Math.min(window.innerHeight - 300, 500);
        } else {
          // Desktop: larger canvas
          width = Math.min(window.innerWidth - 64, 800);
          height = Math.min(window.innerHeight - 300, 600);
        }
        
        return { width, height, isMobile };
      };

      updateCanvasSize = () => {
        if (fabricCanvasRef.current) {
          const { width, height } = calculateCanvasSize();
          fabricCanvasRef.current.setDimensions({ width, height });
          fabricCanvasRef.current.renderAll();
        }
      };

      const { width, height, isMobile } = calculateCanvasSize();

      const canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: '#ffffff',
        enableRetinaScaling: true, // Better quality on high-DPI screens
        selection: false, // Disable selection for better drawing experience
        preserveObjectStacking: true,
      });
      
      // Configure for touch devices - thicker brush on mobile for better visibility
      const brushWidth = isMobile ? 4 : 3;
      canvas.freeDrawingBrush.width = brushWidth;
      canvas.freeDrawingBrush.color = '#000000';
      
      // Prevent default touch behaviors that interfere with drawing
      preventDefaults = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      };
      
      // Add touch event listeners to canvas element
      canvasElement = canvasRef.current;
      if (canvasElement && preventDefaults) {
        canvasElement.addEventListener('touchstart', preventDefaults, { passive: false });
        canvasElement.addEventListener('touchmove', preventDefaults, { passive: false });
        canvasElement.addEventListener('touchend', preventDefaults, { passive: false });
        canvasElement.addEventListener('touchcancel', preventDefaults, { passive: false });
      }

      // Handle canvas events
      canvas.on('mouse:down', (e: any) => {
        if (e.e) {
          e.e.preventDefault();
          e.e.stopPropagation();
        }
      });

      canvas.on('mouse:move', (e: any) => {
        if (e.e && canvas.isDrawingMode) {
          e.e.preventDefault();
        }
      });

      canvas.on('path:created', (e: any) => {
        const path = e.path;
        const layer: CanvasLayer = {
          id: uuidv4(),
          type: 'sketch',
          x: path.left || 0,
          y: path.top || 0,
          width: path.width || 0,
          height: path.height || 0,
          rotation: path.angle || 0,
          scale: 1,
          zIndex: canvasLayers.length,
          data: { pathData: path.path },
        };
        addLayer(layer);
      });
      
      if (updateCanvasSize) {
        window.addEventListener('resize', updateCanvasSize);
      }
      
      // Handle orientation changes on mobile
      handleOrientationChange = () => {
        if (updateCanvasSize) {
          setTimeout(updateCanvasSize, 100);
        }
      };
      if (handleOrientationChange) {
        window.addEventListener('orientationchange', handleOrientationChange);
      }
      
      fabricCanvasRef.current = canvas;
    }

    // Cleanup function
    return () => {
      if (canvasElement && preventDefaults) {
        canvasElement.removeEventListener('touchstart', preventDefaults);
        canvasElement.removeEventListener('touchmove', preventDefaults);
        canvasElement.removeEventListener('touchend', preventDefaults);
        canvasElement.removeEventListener('touchcancel', preventDefaults);
      }
      if (updateCanvasSize) {
        window.removeEventListener('resize', updateCanvasSize);
      }
      if (handleOrientationChange) {
        window.removeEventListener('orientationchange', handleOrientationChange);
      }
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  const loadEntry = async () => {
    const entry = await getEntryForDate(today);
    if (entry && fabricCanvasRef.current) {
      // Load layers onto canvas
      entry.layers.forEach((layer) => {
        if (layer.type === 'sketch' && layer.data.pathData) {
          fabric.Path.fromObject(layer.data.pathData, (path: any) => {
            fabricCanvasRef.current?.add(path);
          });
        }
      });
    }
  };

  const handleSave = async () => {
    if (!fabricCanvasRef.current) return;

    const objects = fabricCanvasRef.current.getObjects();
    const layers: CanvasLayer[] = objects.map((obj: any, index: number) => ({
      id: uuidv4(),
      type: 'sketch',
      x: obj.left || 0,
      y: obj.top || 0,
      width: obj.width || 0,
      height: obj.height || 0,
      rotation: obj.angle || 0,
      scale: obj.scaleX || 1,
      zIndex: index,
      data: { pathData: obj.toObject() },
    }));

    const entry = {
      id: currentEntry?.id || `entry_${format(today, 'yyyy-MM-dd')}`,
      date: today.toISOString(),
      text: currentEntry?.text || '',
      layers,
      createdAt: currentEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveEntry(entry);
    navigate('/');
  };

  const handleToolSelect = (tool: Tool) => {
    if (!fabricCanvasRef.current) return;

    if (tool === 'pen') {
      fabricCanvasRef.current.isDrawingMode = true;
      // Adjust brush width based on screen size
      const isMobile = window.innerWidth < 640;
      fabricCanvasRef.current.freeDrawingBrush.width = isMobile ? 4 : 3;
      fabricCanvasRef.current.freeDrawingBrush.color = '#000000';
      setSelectedTool('pen');
    } else if (tool === 'eraser') {
      fabricCanvasRef.current.isDrawingMode = false;
      setSelectedTool('eraser');
    } else if (tool === 'sticker') {
      setShowStickers(!showStickers);
      setSelectedTool(showStickers ? null : 'sticker');
    } else if (tool === 'photo') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            const imgUrl = event.target?.result as string;
            fabric.Image.fromURL(imgUrl, (img: any) => {
              // Scale image appropriately for mobile
              const isMobile = window.innerWidth < 640;
              img.scale(isMobile ? 0.3 : 0.5);
              fabricCanvasRef.current?.add(img);
              fabricCanvasRef.current?.renderAll();
            });
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else if (tool === 'text') {
      const isMobile = window.innerWidth < 640;
      const text = new fabric.IText('Double tap to edit', {
        left: isMobile ? 50 : 100,
        top: isMobile ? 50 : 100,
        fontFamily: 'Arial',
        fontSize: isMobile ? 16 : 20,
      });
      fabricCanvasRef.current?.add(text);
      fabricCanvasRef.current?.renderAll();
      setSelectedTool(null);
    }
  };

  const handleAddSticker = (emoji: string) => {
    if (!fabricCanvasRef.current) return;
    const isMobile = window.innerWidth < 640;
    const text = new fabric.Text(emoji, {
      left: isMobile ? 100 : 150,
      top: isMobile ? 100 : 150,
      fontSize: isMobile ? 48 : 60,
    });
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.renderAll();
    setShowStickers(false);
    setSelectedTool(null);
  };

  const handleClear = () => {
    if (confirm('Clear canvas? This cannot be undone.')) {
      fabricCanvasRef.current?.clear();
      fabricCanvasRef.current?.setBackgroundColor('#ffffff', () => {});
    }
  };

  const stickers = ['😊', '❤️', '⭐', '🎉', '🌟', '💫', '✨', '🎨', '📸', '🎵'];

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-16 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-gray-900 text-lg sm:text-xl touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close"
        >
          ✕
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-gray-900">Creative Journal</h1>
        <button
          onClick={handleSave}
          className="text-sm sm:text-base text-primary-600 font-semibold hover:text-primary-700 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Save"
        >
          Save
        </button>
      </div>

      {/* Canvas Container - Prevent scrolling while drawing */}
      <div className="p-2 sm:p-4 flex justify-center overflow-hidden" style={{ touchAction: 'pan-y' }}>
        <canvas 
          ref={canvasRef} 
          className="border border-gray-200 rounded-lg max-w-full touch-none select-none"
          style={{ 
            touchAction: 'none',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          }}
        />
      </div>

      {/* Sticker Library */}
      {showStickers && (
        <div className="fixed bottom-20 sm:bottom-24 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-lg z-40 safe-area-inset-bottom">
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {stickers.map((sticker) => (
              <button
                key={sticker}
                onClick={() => handleAddSticker(sticker)}
                className="text-3xl sm:text-4xl hover:scale-110 active:scale-95 transition-transform touch-manipulation min-h-[60px] min-w-[60px] flex items-center justify-center"
                aria-label={`Add ${sticker} sticker`}
              >
                {sticker}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="fixed bottom-16 sm:bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-2 sm:p-4 z-30 safe-area-inset-bottom shadow-lg">
        <div className="flex justify-around items-center">
          <button
            onClick={() => handleToolSelect('pen')}
            className={`p-3 sm:p-4 rounded-lg touch-manipulation min-h-[56px] min-w-[56px] flex items-center justify-center ${
              selectedTool === 'pen'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 active:bg-gray-200'
            }`}
            aria-label="Pen tool"
          >
            <span className="text-xl sm:text-2xl">✏️</span>
          </button>
          <button
            onClick={() => handleToolSelect('photo')}
            className="p-3 sm:p-4 rounded-lg bg-gray-100 text-gray-700 touch-manipulation min-h-[56px] min-w-[56px] flex items-center justify-center active:bg-gray-200"
            aria-label="Photo tool"
          >
            <span className="text-xl sm:text-2xl">📷</span>
          </button>
          <button
            onClick={() => handleToolSelect('sticker')}
            className={`p-3 sm:p-4 rounded-lg touch-manipulation min-h-[56px] min-w-[56px] flex items-center justify-center ${
              selectedTool === 'sticker'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 active:bg-gray-200'
            }`}
            aria-label="Sticker tool"
          >
            <span className="text-xl sm:text-2xl">⭐</span>
          </button>
          <button
            onClick={() => handleToolSelect('text')}
            className="p-3 sm:p-4 rounded-lg bg-gray-100 text-gray-700 touch-manipulation min-h-[56px] min-w-[56px] flex items-center justify-center active:bg-gray-200"
            aria-label="Text tool"
          >
            <span className="text-base sm:text-lg font-bold">T</span>
          </button>
          <button
            onClick={handleClear}
            className="p-3 sm:p-4 rounded-lg bg-red-100 text-red-700 touch-manipulation min-h-[56px] min-w-[56px] flex items-center justify-center active:bg-red-200"
            aria-label="Clear canvas"
          >
            <span className="text-xl sm:text-2xl">🗑️</span>
          </button>
        </div>
      </div>
    </div>
  );
}

