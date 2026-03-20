import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CanvasEditor, CanvasEditorHandlers } from './components/CanvasEditor';
import { useEditorStore } from './stores/editorStore';
import { LanguageSwitcher } from './components/LanguageSwitcher';

const FONTS = [
  { value: 'Microsoft YaHei', label: '微软雅黑', en: 'Microsoft YaHei' },
  { value: 'PingFang SC', label: '苹方', en: 'PingFang SC' },
  { value: 'Noto Sans SC', label: 'Noto Sans SC', en: 'Noto Sans SC' },
  { value: 'SimHei', label: '黑体', en: 'SimHei' },
  { value: 'sans-serif', label: 'Sans', en: 'Sans' },
  { value: 'serif', label: 'Serif', en: 'Serif' },
];

interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fill: string;
  width: number;
  lineHeight: number;
}

function App() {
  const { t, i18n } = useTranslation();
  const {
    hasImage,
    imageScale,
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
    statusMessage,
    canUndo,
    canRedo,
    setFillMode,
    setFillColor,
    setFontFamily,
    setFontSize,
    setFontColor,
    setTextWidth,
    setLineHeight,
  } = useEditorStore();

  const handlersRef = useRef<CanvasEditorHandlers>({
    handleImageUpload: () => {},
    handleScaleChange: () => {},
    handleSelectRegion: () => {},
    handleMoveImage: () => {},
    handleFillRegion: () => {},
    handleAddText: () => {},
    handleSaveImage: () => {},
    applyTextStyleToActive: () => {},
    undo: () => {},
    redo: () => {},
  });

  const handleTextStyleChange = useCallback((style: TextStyle) => {
    setFontFamily(style.fontFamily);
    setFontSize(style.fontSize);
    setFontColor(style.fill);
    setTextWidth(style.width);
    setLineHeight(style.lineHeight);
  }, [setFontFamily, setFontSize, setFontColor, setTextWidth, setLineHeight]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlersRef.current.handleImageUpload(file);
    }
  };

  const handleScaleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    handlersRef.current.handleScaleChange(value / 100);
  };

  const handleTextWidthInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setTextWidth(value);
    handlersRef.current.applyTextStyleToActive();
  };

  const handleLineHeightInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setLineHeight(value);
    handlersRef.current.applyTextStyleToActive();
  };

  const isSelectDisabled = !hasImage || isSelecting || isMovingImage;
  const isFillDisabled = !hasSelection || isMovingImage;
  const isTextDisabled = !hasImage || isMovingImage;
  const isMoveDisabled = !hasImage;
  const isSaveDisabled = !hasImage;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col overflow-y-auto max-h-screen">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              AI Editor
            </h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{t('common.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="space-y-6">
          {/* File Upload Section */}
          <section>
            <label className="label-text">{t('common.upload')}</label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center group-hover:border-blue-400 group-hover:bg-blue-50 transition-all">
                <p className="text-sm text-slate-600">{t('common.clickOrDrag')}</p>
                <p className="text-xs text-slate-400 mt-1">{t('common.fileSupport')}</p>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Tools Section */}
          <section className="space-y-3">
            <label className="label-text">{t('common.tools')}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handlersRef.current.handleSelectRegion()}
                disabled={isSelectDisabled}
                className={`btn-secondary ${isSelecting ? 'border-blue-500 ring-2 ring-blue-100' : ''}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                {t('common.select')}
              </button>
              
              <button
                onClick={() => handlersRef.current.handleFillRegion()}
                disabled={isFillDisabled}
                className={`btn-secondary ${hasSelection && !isMovingImage ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : ''}`}
              >
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {t('common.fill')}
              </button>
              
              <button
                onClick={() => handlersRef.current.handleAddText()}
                disabled={isTextDisabled}
                className="btn-secondary"
              >
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9v3h6l5 4V5z" />
                </svg>
                {t('common.text')}
              </button>
              
              <button
                onClick={() => handlersRef.current.handleMoveImage()}
                disabled={isMoveDisabled}
                className={`btn-secondary ${isMovingImage ? 'border-orange-500 bg-orange-50' : ''}`}
              >
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                {isMovingImage ? t('common.end') : t('common.move')}
              </button>
            </div>
          </section>

          {/* Settings Section */}
          <section className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="label-text">{t('common.imageScale')}</label>
                <span className="text-xs font-bold text-slate-400 mb-1">{Math.round(imageScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                value={Math.round(imageScale * 100)}
                onChange={handleScaleInput}
                disabled={!hasImage}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-2">
              <label className="label-text">{t('common.fillMode')}</label>
              <select
                value={fillMode}
                onChange={(e) => setFillMode(e.target.value as 'auto' | 'solid')}
                className="input-field"
              >
                <option value="auto">{t('common.autoColor')}</option>
                <option value="solid">{t('common.solidColor')}</option>
              </select>
            </div>

            {fillMode === 'solid' && (
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600 font-medium">{t('common.color')}</label>
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                  className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer bg-transparent"
                />
                <span className="text-xs text-slate-400 font-mono uppercase">{fillColor}</span>
              </div>
            )}
          </section>

          <hr className="border-slate-100" />

          {/* Typography Section */}
          <section className="space-y-4">
            <label className="label-text">{t('common.textStyle')}</label>
            
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold">{t('common.font')}</label>
              <select
                value={fontFamily}
                onChange={(e) => {
                  setFontFamily(e.target.value);
                  handlersRef.current.applyTextStyleToActive();
                }}
                className="input-field"
              >
                {FONTS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {i18n.language.startsWith('zh') ? font.label : font.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">{t('common.fontSize')}</label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(parseInt(e.target.value, 10) || 24);
                    handlersRef.current.applyTextStyleToActive();
                  }}
                  className="input-field"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">{t('common.fontColor')}</label>
                <div className="flex items-center gap-2 h-[38px]">
                  <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => {
                      setFontColor(e.target.value);
                      handlersRef.current.applyTextStyleToActive();
                    }}
                    className="w-8 h-8 p-0 border-0 rounded cursor-pointer bg-transparent"
                  />
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{fontColor}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">{t('common.textWidth')}</label>
                <input
                  type="number"
                  value={textWidth}
                  onChange={handleTextWidthInput}
                  className="input-field"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">{t('common.lineHeight')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={lineHeight}
                  onChange={handleLineHeightInput}
                  className="input-field"
                />
              </div>
            </div>
          </section>

          <div className="mt-auto pt-6 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => handlersRef.current.undo()}
                disabled={!canUndo}
                className="btn-secondary flex-1 py-2.5"
                title={t('common.undo')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                {t('common.undo')}
              </button>
              <button
                onClick={() => handlersRef.current.redo()}
                disabled={!canRedo}
                className="btn-secondary flex-1 py-2.5"
                title={t('common.redo')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
                {t('common.redo')}
              </button>
            </div>

            <button
              onClick={() => handlersRef.current.handleSaveImage()}
              disabled={isSaveDisabled}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t('common.save')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 flex flex-col items-center justify-center gap-6 overflow-auto">
        {/* Toolbar Top */}
        <div className="flex items-center gap-4 p-2 bg-white rounded-xl shadow-sm border border-slate-100 sticky top-0 z-10">
          <div className="flex items-center gap-1 border-r border-slate-100 pr-4">
            <button 
              onClick={() => handlersRef.current.undo()} 
              disabled={!canUndo}
              className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-all active:scale-90"
              title={t('common.undoTitle')}
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button 
              onClick={() => handlersRef.current.redo()} 
              disabled={!canRedo}
              className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-all active:scale-90"
              title={t('common.redoTitle')}
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className={`w-2 h-2 rounded-full ${hasImage ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
            <span className="text-sm font-medium text-slate-600">{statusMessage}</span>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="canvas-container bg-slate-200 p-8 flex items-center justify-center min-h-[500px] min-w-[800px] transition-all">
          <CanvasEditor handlers={handlersRef.current} onTextStyleChange={handleTextStyleChange} />
        </div>

        {/* Tips Area */}
        <div className="max-w-md text-center">
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            {t('common.tips.main')}
            <br />
            {t('common.tips.shortcuts')}
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
