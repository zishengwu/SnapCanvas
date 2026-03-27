import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EditorState, Tool, FillMode, ExportFormat } from '../types/editor';

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
  exportFormat: 'png' as ExportFormat,
  exportQuality: 0.9,
  statusMessage: '请上传图片',
  canUndo: false,
  canRedo: false,
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
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
      
      setExportFormat: (format) => set({ exportFormat: format }),
      setExportQuality: (quality) => set({ exportQuality: quality }),
      
      setStatusMessage: (message) => set({ statusMessage: message }),
      setCanUndo: (can) => set({ canUndo: can }),
      setCanRedo: (can) => set({ canRedo: can }),
      
      undo: () => {},
      redo: () => {},
      
      reset: () => set(initialState),
    }),
    {
      name: 'image-editor-storage',
      partialize: (state) => ({
        fillMode: state.fillMode,
        fillColor: state.fillColor,
        fontFamily: state.fontFamily,
        fontSize: state.fontSize,
        fontColor: state.fontColor,
        textWidth: state.textWidth,
        lineHeight: state.lineHeight,
        exportFormat: state.exportFormat,
        exportQuality: state.exportQuality,
      }),
    }
  )
);
