import { useRef, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import { useEditorStore } from '../stores/editorStore';
import { getAverageColor } from '../utils/colorUtils';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

export interface CanvasEditorHandlers {
  handleImageUpload: (file: File) => void;
  handleScaleChange: (scale: number) => void;
  handleSelectRegion: () => void;
  handleMoveImage: () => void;
  handleFillRegion: () => void;
  handleAddText: () => void;
  handleSaveImage: () => void;
  applyTextStyleToActive: () => void;
  undo: () => void;
  redo: () => void;
}

interface CanvasEditorProps {
  handlers: CanvasEditorHandlers;
  onTextStyleChange?: (style: { fontFamily: string; fontSize: number; fill: string; width: number; lineHeight: number }) => void;
}

export function CanvasEditor({ handlers, onTextStyleChange }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjectRef = useRef<fabric.Image | null>(null);
  const selectionRectRef = useRef<fabric.Rect | null>(null);
  const isDrawingRef = useRef(false);
  const startPointRef = useRef({ x: 0, y: 0 });
  const imageFitScaleRef = useRef(1);
  const isInitializedRef = useRef(false);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isHistoryActionRef = useRef(false);

  const {
    hasImage,
    isSelecting,
    isMovingImage,
    hasSelection,
    fillMode,
    fillColor,
    fontFamily,
    fontSize,
    fontColor,
    textWidth,
    lineHeight,
    setHasImage,
    setImageScale,
    setIsSelecting,
    setHasSelection,
    setIsMovingImage,
    setStatusMessage,
    setCanUndo,
    setCanRedo,
  } = useEditorStore();

  const saveHistory = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || isHistoryActionRef.current) return;

    const json = JSON.stringify(canvas.toJSON());
    
    // If state is the same as current history, don't save
    if (historyIndexRef.current >= 0 && historyRef.current[historyIndexRef.current] === json) {
      return;
    }

    // Remove any redo states
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(json);
    
    // Limit history size
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      historyIndexRef.current++;
    }
    
    historyRef.current = newHistory;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, [setCanUndo, setCanRedo]);

  const undo = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyIndexRef.current <= 0) return;

    isHistoryActionRef.current = true;
    historyIndexRef.current--;
    const state = historyRef.current[historyIndexRef.current];
    
    canvas.loadFromJSON(state, () => {
      // After loading, we need to find the image object again
      canvas.getObjects().forEach(obj => {
        if (obj.type === 'image') {
          imageObjectRef.current = obj as fabric.Image;
        }
      });
      canvas.renderAll();
      isHistoryActionRef.current = false;
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
    });
  }, [setCanUndo, setCanRedo]);

  const redo = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return;

    isHistoryActionRef.current = true;
    historyIndexRef.current++;
    const state = historyRef.current[historyIndexRef.current];
    
    canvas.loadFromJSON(state, () => {
      canvas.getObjects().forEach(obj => {
        if (obj.type === 'image') {
          imageObjectRef.current = obj as fabric.Image;
        }
      });
      canvas.renderAll();
      isHistoryActionRef.current = false;
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    });
  }, [setCanUndo, setCanRedo]);

  // Use a separate effect to update status message when state changes
  useEffect(() => {
    if (isSelecting) {
      setStatusMessage('拖拽框选区域');
    } else if (hasSelection) {
      setStatusMessage('已选中区域');
    } else if (hasImage) {
      setStatusMessage('未选区');
    } else {
      setStatusMessage('请上传图片');
    }
  }, [isSelecting, hasSelection, hasImage, setStatusMessage]);

  const applyTextStyleToActive = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'textbox') return;
    
    (activeObject as fabric.Textbox).set({
      fontFamily,
      fontSize,
      fill: fontColor,
      width: textWidth,
      lineHeight,
    });
    canvas.renderAll();
  }, [fontFamily, fontSize, fontColor, textWidth, lineHeight]);

  const handleImageUpload = useCallback((file: File) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      console.error('Canvas not initialized!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (!result || typeof result !== 'string') return;

      fabric.Image.fromURL(result, (img: fabric.Image) => {
        if (!canvas) return;

        canvas.clear();

        const imgWidth = img.width || 1;
        const imgHeight = img.height || 1;
        imageFitScaleRef.current = Math.min(
          CANVAS_WIDTH / imgWidth,
          CANVAS_HEIGHT / imgHeight
        );

        img.set({
          left: 0,
          top: 0,
          originX: 'left',
          originY: 'top',
          scaleX: imageFitScaleRef.current,
          scaleY: imageFitScaleRef.current,
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
        });

        imageObjectRef.current = img;

        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = imgWidth;
        sourceCanvas.height = imgHeight;
        const sourceCtx = sourceCanvas.getContext('2d');
        if (sourceCtx) {
          sourceCtx.drawImage(img.getElement(), 0, 0);
        }
        sourceCanvasRef.current = sourceCanvas;

        canvas.add(imageObjectRef.current);
        canvas.sendToBack(imageObjectRef.current);
        canvas.renderAll();

        setHasImage(true, imgWidth, imgHeight);
        setImageScale(1);

        // Initial history save
        historyRef.current = [JSON.stringify(canvas.toJSON())];
        historyIndexRef.current = 0;
        setCanUndo(false);
        setCanRedo(false);

        if (selectionRectRef.current) {
          canvas.remove(selectionRectRef.current);
          selectionRectRef.current = null;
        }
      }, { crossOrigin: 'anonymous' });
    };
    reader.readAsDataURL(file);
  }, [setHasImage, setImageScale, setCanUndo, setCanRedo]);

  const handleScaleChange = useCallback((scale: number) => {
    if (!imageObjectRef.current) return;
    const newScale = scale;
    imageObjectRef.current.set({
      scaleX: imageFitScaleRef.current * newScale,
      scaleY: imageFitScaleRef.current * newScale,
    });
    fabricCanvasRef.current?.renderAll();
    setImageScale(newScale);
  }, [setImageScale]);

  const handleSelectRegion = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !hasImage) return;

    setIsSelecting(true);
    setIsMovingImage(false);

    if (imageObjectRef.current) {
      imageObjectRef.current.set({ selectable: false, evented: false });
    }
    canvas.discardActiveObject();
    canvas.selection = true;
  }, [hasImage, setIsSelecting, setIsMovingImage]);

  const handleMoveImage = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !imageObjectRef.current) return;

    const newMovingState = !isMovingImage;
    setIsMovingImage(newMovingState);
    setIsSelecting(false);

    if (selectionRectRef.current) {
      canvas.remove(selectionRectRef.current);
      selectionRectRef.current = null;
    }
    setHasSelection(false);

    imageObjectRef.current.set({ selectable: newMovingState, evented: newMovingState });
    canvas.selection = !newMovingState;
    
    if (newMovingState) {
      canvas.setActiveObject(imageObjectRef.current);
      canvas.defaultCursor = 'grab';
    } else {
      canvas.discardActiveObject();
      canvas.defaultCursor = 'default';
    }
    canvas.renderAll();
  }, [isMovingImage, setIsMovingImage, setIsSelecting, setHasSelection]);

  const handleFillRegion = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const rect = selectionRectRef.current;
    if (!canvas || !rect) return;

    const width = (rect.width || 0) * (rect.scaleX || 1);
    const height = (rect.height || 0) * (rect.scaleY || 1);
    if (width <= 0 || height <= 0) return;

    let fillColorValue: string = fillColor;
    if (fillMode === 'auto' && sourceCanvasRef.current) {
      const ctx = sourceCanvasRef.current.getContext('2d');
      if (ctx && imageObjectRef.current) {
        const imgObj = imageObjectRef.current;
        const scaleX = imgObj.scaleX || 1;
        const scaleY = imgObj.scaleY || 1;
        const imgLeft = imgObj.left || 0;
        const imgTop = imgObj.top || 0;

        const imageX = Math.max(0, Math.floor((rect.left! - imgLeft) / scaleX));
        const imageY = Math.max(0, Math.floor((rect.top! - imgTop) / scaleY));
        const imageW = Math.max(1, Math.floor(width / scaleX));
        const imageH = Math.max(1, Math.floor(height / scaleY));

        fillColorValue = getAverageColor(ctx, imageX, imageY, imageW, imageH);
      }
    }

    const fillRect = new fabric.Rect({
      left: rect.left,
      top: rect.top,
      width,
      height,
      fill: fillColorValue,
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
    });

    canvas.add(fillRect);
    canvas.setActiveObject(fillRect);
    canvas.remove(rect);
    selectionRectRef.current = null;
    setHasSelection(false);
    canvas.renderAll();
    saveHistory();
  }, [fillMode, fillColor, setHasSelection, saveHistory]);

  const handleAddText = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !hasImage) return;

    const text = new fabric.Textbox('输入文字', {
      left: 100,
      top: 100,
      fontSize,
      fontFamily,
      fill: fontColor,
      width: textWidth,
      lineHeight,
      splitByGrapheme: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
  }, [hasImage, fontSize, fontFamily, fontColor, textWidth, lineHeight]);

  const handleSaveImage = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !imageObjectRef.current) return;

    canvas.discardActiveObject();
    canvas.renderAll();

    const imgObj = imageObjectRef.current;
    const originalWidth = imgObj.width || CANVAS_WIDTH;
    const originalHeight = imgObj.height || CANVAS_HEIGHT;

    const multiplier = Math.max(1, Math.min(originalWidth / CANVAS_WIDTH, originalHeight / CANVAS_HEIGHT) * 2);

    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: multiplier,
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'edited-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Expose handlers to parent via the handlers prop
  useEffect(() => {
    if (handlers) {
      handlers.handleImageUpload = handleImageUpload;
      handlers.handleScaleChange = handleScaleChange;
      handlers.handleSelectRegion = handleSelectRegion;
      handlers.handleMoveImage = handleMoveImage;
      handlers.handleFillRegion = handleFillRegion;
      handlers.handleAddText = handleAddText;
      handlers.handleSaveImage = handleSaveImage;
      handlers.applyTextStyleToActive = applyTextStyleToActive;
      handlers.undo = undo;
      handlers.redo = redo;
    }
  }, [handlers, handleImageUpload, handleScaleChange, handleSelectRegion, handleMoveImage, handleFillRegion, handleAddText, handleSaveImage, applyTextStyleToActive, undo, redo]);

  // Refs for state values to be used in event listeners without re-binding
  const isSelectingRef = useRef(isSelecting);
  const hasImageRef = useRef(hasImage);
  useEffect(() => { isSelectingRef.current = isSelecting; }, [isSelecting]);
  useEffect(() => { hasImageRef.current = hasImage; }, [hasImage]);

  const saveHistoryRef = useRef(saveHistory);
  useEffect(() => { saveHistoryRef.current = saveHistory; }, [saveHistory]);

  useEffect(() => {
    if (!canvasRef.current || isInitializedRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      selection: true,
    });

    fabricCanvasRef.current = canvas;
    isInitializedRef.current = true;

    canvas.on('object:selected', (e) => {
      const obj = e.target;
      if (obj && obj.type === 'textbox') {
        const textbox = obj as fabric.Textbox;
        onTextStyleChange?.({
          fontFamily: textbox.fontFamily || 'Microsoft YaHei',
          fontSize: textbox.fontSize || 24,
          fill: textbox.fill as string || '#000000',
          width: textbox.width || 300,
          lineHeight: textbox.lineHeight || 1.4,
        });
      }
    });

    canvas.on('selection:cleared', () => {
      if (isMovingImage && imageObjectRef.current) {
        canvas.setActiveObject(imageObjectRef.current);
      }
    });

    const handleMouseDown = (opt: fabric.IEvent) => {
      if (!isSelectingRef.current || !hasImageRef.current) return;
      
      const pointer = canvas.getPointer(opt.e);
      startPointRef.current = { x: pointer.x, y: pointer.y };

      // Clear existing selection rect or active objects
      if (selectionRectRef.current) {
        canvas.remove(selectionRectRef.current);
      }
      canvas.discardActiveObject();
      canvas.renderAll();
      setHasSelection(false);

      selectionRectRef.current = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        fill: 'rgba(37, 99, 235, 0.15)', // Light blue fill
        stroke: '#2563eb',             // Primary blue stroke
        strokeWidth: 2,
        strokeDashArray: [5, 5],       // Dashed border
        selectable: false,
        evented: false,
      });

      canvas.add(selectionRectRef.current);
      isDrawingRef.current = true;
      setHasSelection(false);
    };

    const handleMouseMove = (opt: fabric.IEvent) => {
      if (!isDrawingRef.current || !selectionRectRef.current) return;
      
      const pointer = canvas.getPointer(opt.e);
      const left = Math.min(startPointRef.current.x, pointer.x);
      const top = Math.min(startPointRef.current.y, pointer.y);
      const width = Math.abs(pointer.x - startPointRef.current.x);
      const height = Math.abs(pointer.y - startPointRef.current.y);

      selectionRectRef.current.set({ left, top, width, height });
      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      const rect = selectionRectRef.current;
      if (rect && (rect.width || 0) > 2 && (rect.height || 0) > 2) {
        // Selection is valid
        setHasSelection(true);
        setIsSelecting(false);
      } else if (rect) {
        // Selection is too small, remove it
        const canvas = fabricCanvasRef.current;
        if (canvas) {
          canvas.remove(rect);
        }
        selectionRectRef.current = null;
        setHasSelection(false);
      }
    };

    const handleObjectModified = () => {
      saveHistoryRef.current();
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('object:added', handleObjectModified);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:removed', handleObjectModified);

    return () => {
      canvas.dispose();
      isInitializedRef.current = false;
    };
  }, []); // Empty dependency array: only initialize once

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't undo/redo if user is typing in a textbox or input
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA' ||
          (fabricCanvasRef.current?.getActiveObject() as any)?.isEditing) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
      } else if (e.key === 'ArrowLeft') {
        undo();
      } else if (e.key === 'ArrowRight') {
        redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObjects = fabricCanvasRef.current?.getActiveObjects();
        if (activeObjects && activeObjects.length > 0) {
          activeObjects.forEach(obj => {
            if (obj !== imageObjectRef.current) {
              fabricCanvasRef.current?.remove(obj);
            }
          });
          fabricCanvasRef.current?.discardActiveObject();
          fabricCanvasRef.current?.renderAll();
          saveHistoryRef.current();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !imageObjectRef.current) return;

    if (isSelecting) {
      imageObjectRef.current.set({ selectable: false, evented: false });
      canvas.discardActiveObject();
      canvas.selection = true;
      canvas.defaultCursor = 'crosshair';
    } else if (isMovingImage) {
      imageObjectRef.current.set({ selectable: true, evented: true });
      canvas.selection = false;
      canvas.setActiveObject(imageObjectRef.current);
      canvas.defaultCursor = 'grab';
    } else {
      imageObjectRef.current.set({ selectable: false, evented: false });
      canvas.selection = true;
      canvas.defaultCursor = 'default';
    }
    canvas.renderAll();
  }, [isSelecting, isMovingImage]);

  return (
    <div className="inline-block border border-gray-300 bg-white shadow-sm">
      <canvas ref={canvasRef} />
    </div>
  );
}
