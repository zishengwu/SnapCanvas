export type Tool = 'select' | 'fill' | 'text' | 'move';
export type FillMode = 'auto' | 'solid';
export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface EditorState {
  hasImage: boolean;
  imageScale: number;
  imageWidth: number;
  imageHeight: number;
  
  currentTool: Tool;
  isSelecting: boolean;
  hasSelection: boolean;
  isMovingImage: boolean;
  
  fillMode: FillMode;
  fillColor: string;
  
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  textWidth: number;
  lineHeight: number;
  
  // Export Settings
  exportFormat: ExportFormat;
  exportQuality: number;
  
  statusMessage: string;
  
  // History
  canUndo: boolean;
  canRedo: boolean;

  undo: () => void;
  redo: () => void;
  
  setHasImage: (has: boolean, width?: number, height?: number) => void;
  setImageScale: (scale: number) => void;
  setCurrentTool: (tool: Tool) => void;
  setIsSelecting: (selecting: boolean) => void;
  setHasSelection: (has: boolean) => void;
  setIsMovingImage: (moving: boolean) => void;
  setFillMode: (mode: FillMode) => void;
  setFillColor: (color: string) => void;
  setFontFamily: (family: string) => void;
  setFontSize: (size: number) => void;
  setFontColor: (color: string) => void;
  setTextWidth: (width: number) => void;
  setLineHeight: (height: number) => void;
  
  // Export Setters
  setExportFormat: (format: ExportFormat) => void;
  setExportQuality: (quality: number) => void;
  
  setStatusMessage: (message: string) => void;
  
  setCanUndo: (can: boolean) => void;
  setCanRedo: (can: boolean) => void;
  
  reset: () => void;
}
