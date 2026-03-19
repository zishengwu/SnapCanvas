import { create } from 'zustand';
import type { EditorState, Tool, FillMode } from '../types/editor';

const initialState = {
  hasImage: false,
  imageScale: 1,
  imageWidth: 0,
  imageHeight: 0,
  currentTool: 'select' as Tool,
  isSelecting: false,
  hasSelection: false,
  isMovingImage: false,
  fillMode: 'auto' as FillMode,
  fillColor: '#ffffff',
  fontFamily: 'Microsoft YaHei',
  fontSize: 24,
  fontColor: '#000000',
  textWidth: 300,
  lineHeight: 1.4,
  statusMessage: '请上传图片',
  canUndo: false,
  canRedo: false,
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,
  
  setHasImage: (has, width = 0, height = 0) => set({ 
    hasImage: has, 
    imageWidth: width, 
    imageHeight: height,
    hasSelection: false,
    isSelecting: false,
    isMovingImage: false,
    currentTool: 'select',
    statusMessage: has ? '未选区' : '请上传图片',
    canUndo: false,
    canRedo: false,
  }),
  
  setImageScale: (scale) => set({ imageScale: scale }),
  setCurrentTool: (tool) => set({ currentTool: tool }),
  setIsSelecting: (selecting) => set((state) => ({ 
    isSelecting: selecting, 
    hasSelection: selecting ? false : state.hasSelection 
  })),
  setHasSelection: (has) => set({ hasSelection: has }),
  setIsMovingImage: (moving) => set({ isMovingImage: moving }),
  setFillMode: (mode) => set({ fillMode: mode }),
  setFillColor: (color) => set({ fillColor: color }),
  setFontFamily: (family) => set({ fontFamily: family }),
  setFontSize: (size) => set({ fontSize: size }),
  setFontColor: (color) => set({ fontColor: color }),
  setTextWidth: (width) => set({ textWidth: width }),
  setLineHeight: (height) => set({ lineHeight: height }),
  setStatusMessage: (message) => set({ statusMessage: message }),
  setCanUndo: (can) => set({ canUndo: can }),
  setCanRedo: (can) => set({ canRedo: can }),
  
  // These will be overridden by the component to interact with the fabric canvas
  undo: () => {},
  redo: () => {},
  
  reset: () => set(initialState),
}));
