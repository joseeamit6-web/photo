/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Printer,
  Download,
  FileText,
  Scissors,
  ArrowLeft,
  Maximize,
  Check,
  Grid,
  Layers,
  Unlock,
  Lock,
  Plus,
  Trash2,
  RotateCw,
  Copy,
  Move
} from 'lucide-react';
import { PaperSize, PassportPreset, SheetConfig, ManualPhotoPosition } from '../types.ts';
import { PAPER_SIZES } from '../constants/presets.ts';
import {
  calculateSheetLayout,
  generatePrintSheetCanvas,
  exportCanvasAsDpiImage,
  exportSheetAsPdf,
  LayoutCalculation
} from '../utils/sheetGenerator.ts';

interface PrintSheetStepProps {
  finalPhotoCanvas: HTMLCanvasElement | null;
  selectedPreset: PassportPreset;
  onBackToBackground: () => void;
}

export const PrintSheetStep: React.FC<PrintSheetStepProps> = ({
  finalPhotoCanvas,
  selectedPreset,
  onBackToBackground,
}) => {
  const [selectedPaper, setSelectedPaper] = useState<PaperSize>(PAPER_SIZES[0]); // 4x6 by default
  const [sheetConfig, setSheetConfig] = useState<SheetConfig>({
    paperSizeId: PAPER_SIZES[0].id,
    copyCount: 8,
    spacingMm: 3,
    marginMm: 6,
    showCutGuidelines: true,
    showBorder: true,
    borderColor: '#E4E4E7',
    orientation: 'auto',
  });

  // Manual placement state
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualItems, setManualItems] = useState<ManualPhotoPosition[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [layoutInfo, setLayoutInfo] = useState<LayoutCalculation | null>(null);
  const [sheetDataUrl, setSheetDataUrl] = useState<string | null>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  // Drag tracking state
  const draggingItemRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origXmm: number;
    origYmm: number;
  } | null>(null);

  // Initialize manual items from current auto grid
  const populateManualFromAuto = useCallback((layout: LayoutCalculation) => {
    const photoW = selectedPreset.widthMm;
    const photoH = selectedPreset.heightMm;
    const spacing = sheetConfig.spacingMm;
    const items: ManualPhotoPosition[] = [];

    let count = 0;
    for (let r = 0; r < layout.rows; r++) {
      for (let c = 0; c < layout.cols; c++) {
        if (count >= layout.actualCopies) break;
        items.push({
          id: `photo-${Date.now()}-${count}`,
          xMm: Math.round((layout.startXmm + c * (photoW + spacing)) * 10) / 10,
          yMm: Math.round((layout.startYmm + r * (photoH + spacing)) * 10) / 10,
          widthMm: photoW,
          heightMm: photoH,
          isRotated: false,
        });
        count++;
      }
    }
    return items;
  }, [selectedPreset, sheetConfig.spacingMm]);

  // Recalculate sheet layout and regenerate 300 DPI canvas
  useEffect(() => {
    if (!finalPhotoCanvas) return;

    const layout = calculateSheetLayout(selectedPreset, selectedPaper, sheetConfig);
    setLayoutInfo(layout);

    // If switching into manual mode with empty items, seed from auto layout
    if (isManualMode && manualItems.length === 0) {
      const seeded = populateManualFromAuto(layout);
      setManualItems(seeded);
      return;
    }

    const canvas = generatePrintSheetCanvas(
      finalPhotoCanvas,
      selectedPreset,
      selectedPaper,
      sheetConfig,
      300,
      isManualMode ? manualItems : undefined
    );

    sheetCanvasRef.current = canvas;
    setSheetDataUrl(canvas.toDataURL('image/jpeg', 0.95));
  }, [finalPhotoCanvas, selectedPreset, selectedPaper, sheetConfig, isManualMode, manualItems, populateManualFromAuto]);

  // Toggle Manual Placement Mode
  const handleToggleManualMode = () => {
    if (!isManualMode) {
      if (layoutInfo) {
        const seeded = populateManualFromAuto(layoutInfo);
        setManualItems(seeded);
      }
      setIsManualMode(true);
    } else {
      setIsManualMode(false);
      setSelectedItemId(null);
    }
  };

  // Add another photo instance in manual mode
  const handleAddManualPhoto = () => {
    if (!layoutInfo) return;
    const photoW = selectedPreset.widthMm;
    const photoH = selectedPreset.heightMm;

    // Place slightly offset from top-left or last item
    const lastItem = manualItems[manualItems.length - 1];
    let newX = sheetConfig.marginMm;
    let newY = sheetConfig.marginMm;

    if (lastItem) {
      newX = lastItem.xMm + photoW + sheetConfig.spacingMm;
      newY = lastItem.yMm;
      if (newX + photoW > layoutInfo.paperWidthMm - sheetConfig.marginMm) {
        newX = sheetConfig.marginMm;
        newY = lastItem.yMm + photoH + sheetConfig.spacingMm;
      }
      if (newY + photoH > layoutInfo.paperHeightMm - sheetConfig.marginMm) {
        newY = sheetConfig.marginMm;
      }
    }

    const newItem: ManualPhotoPosition = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      xMm: Math.max(0, Math.round(newX * 10) / 10),
      yMm: Math.max(0, Math.round(newY * 10) / 10),
      widthMm: photoW,
      heightMm: photoH,
      isRotated: false,
    };

    setManualItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
  };

  // Duplicate photo in manual mode
  const handleDuplicateItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = manualItems.find((it) => it.id === id);
    if (!item || !layoutInfo) return;

    const dup: ManualPhotoPosition = {
      ...item,
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      xMm: Math.min(layoutInfo.paperWidthMm - item.widthMm, item.xMm + 4),
      yMm: Math.min(layoutInfo.paperHeightMm - item.heightMm, item.yMm + 4),
    };

    setManualItems((prev) => [...prev, dup]);
    setSelectedItemId(dup.id);
  };

  // Rotate photo 90 deg in manual mode
  const handleRotateItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setManualItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const newRotated = !it.isRotated;
        return {
          ...it,
          isRotated: newRotated,
          widthMm: newRotated ? selectedPreset.heightMm : selectedPreset.widthMm,
          heightMm: newRotated ? selectedPreset.widthMm : selectedPreset.heightMm,
        };
      })
    );
  };

  // Delete photo in manual mode
  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setManualItems((prev) => prev.filter((it) => it.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  // Mouse & Touch Drag Event Handlers for Manual Placement
  const handleDragStart = (id: string, clientX: number, clientY: number) => {
    const item = manualItems.find((it) => it.id === id);
    if (!item) return;

    setSelectedItemId(id);
    draggingItemRef.current = {
      id,
      startX: clientX,
      startY: clientY,
      origXmm: item.xMm,
      origYmm: item.yMm,
    };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!draggingItemRef.current || !previewContainerRef.current || !layoutInfo) return;

    const containerRect = previewContainerRef.current.getBoundingClientRect();
    const mmPerPixelX = layoutInfo.paperWidthMm / containerRect.width;
    const mmPerPixelY = layoutInfo.paperHeightMm / containerRect.height;

    const deltaPixelX = clientX - draggingItemRef.current.startX;
    const deltaPixelY = clientY - draggingItemRef.current.startY;

    const deltaMmX = deltaPixelX * mmPerPixelX;
    const deltaMmY = deltaPixelY * mmPerPixelY;

    const item = manualItems.find((it) => it.id === draggingItemRef.current?.id);
    if (!item) return;

    const maxX = layoutInfo.paperWidthMm - item.widthMm;
    const maxY = layoutInfo.paperHeightMm - item.heightMm;

    const newXmm = Math.max(0, Math.min(maxX, draggingItemRef.current.origXmm + deltaMmX));
    const newYmm = Math.max(0, Math.min(maxY, draggingItemRef.current.origYmm + deltaMmY));

    setManualItems((prev) =>
      prev.map((it) =>
        it.id === draggingItemRef.current?.id
          ? { ...it, xMm: Math.round(newXmm * 10) / 10, yMm: Math.round(newYmm * 10) / 10 }
          : it
      )
    );
  };

  const handleDragEnd = () => {
    draggingItemRef.current = null;
  };

  // Global window listeners while dragging
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onEnd = () => handleDragEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [layoutInfo, manualItems]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSheet = async (format: 'jpeg' | 'png') => {
    if (!sheetCanvasRef.current) return;
    const filename = `passport-print-sheet-${selectedPaper.id}-300dpi.${format === 'jpeg' ? 'jpg' : 'png'}`;
    await exportCanvasAsDpiImage(sheetCanvasRef.current, format, filename, 300);
  };

  const handleDownloadPdf = () => {
    if (!sheetCanvasRef.current || !layoutInfo) return;
    const filename = `passport-print-sheet-${selectedPaper.id}.pdf`;
    exportSheetAsPdf(sheetCanvasRef.current, selectedPaper, layoutInfo, filename);
  };

  const photoPreviewDataUrl = finalPhotoCanvas?.toDataURL('image/jpeg', 0.9);

  return (
    <div>
      {/* Hidden container dedicated strictly for window.print() */}
      <div id="print-sheet-wrapper" className="hidden">
        {sheetDataUrl && (
          <img
            id="print-sheet-img"
            src={sheetDataUrl}
            alt="Print Sheet 300 DPI"
          />
        )}
      </div>

      {/* Main Studio View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start no-print">
        {/* Left 7 Cols: High-DPI Sheet Preview & Interactive Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xl flex flex-col items-center">
            <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>Print Sheet</span>
                  {isManualMode ? (
                    <span className="text-[10px] font-mono font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                      <Unlock className="w-3 h-3" />
                      <span>Unlocked · Manual Drag & Place</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                      Locked Grid
                    </span>
                  )}
                </h3>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  {selectedPaper.name} · {isManualMode ? manualItems.length : layoutInfo?.actualCopies} Photos · 300 DPI
                </p>
              </div>

              {/* Mode Switcher Button */}
              <button
                onClick={handleToggleManualMode}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                  isManualMode
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                {isManualMode ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Lock to Grid</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Unlock & Place Manually</span>
                  </>
                )}
              </button>
            </div>

            {/* Manual Placement Action Ribbon (when unlocked) */}
            {isManualMode && (
              <div className="w-full mb-3 p-2.5 bg-amber-950/20 border border-amber-800/40 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-amber-300 font-medium flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5" />
                  <span>Drag any photo directly on paper to reposition.</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddManualPhoto}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Photo</span>
                  </button>
                  <button
                    onClick={() => {
                      if (layoutInfo) setManualItems(populateManualFromAuto(layoutInfo));
                    }}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px]"
                  >
                    Reset Grid
                  </button>
                </div>
              </div>
            )}

            {/* Paper Sheet Preview Container */}
            <div className="w-full p-2 sm:p-4 bg-zinc-950 rounded-lg flex items-center justify-center min-h-[440px] overflow-hidden border border-zinc-800/80">
              {layoutInfo ? (
                <div
                  ref={previewContainerRef}
                  className="relative shadow-2xl rounded border border-zinc-700/60 overflow-hidden bg-white select-none"
                  style={{
                    width: '100%',
                    maxWidth: layoutInfo.paperWidthMm > layoutInfo.paperHeightMm ? '540px' : '390px',
                    aspectRatio: `${layoutInfo.paperWidthMm} / ${layoutInfo.paperHeightMm}`,
                  }}
                >
                  {/* Base rendered background sheet image */}
                  {sheetDataUrl && !isManualMode ? (
                    <img
                      src={sheetDataUrl}
                      alt="Passport Sheet Preview"
                      className="w-full h-full object-contain block pointer-events-none"
                    />
                  ) : (
                    /* Interactive Drag and Drop Surface in Manual Mode */
                    <div className="relative w-full h-full bg-white">
                      {/* Subtle margin border */}
                      <div
                        className="absolute border border-dashed border-zinc-300 pointer-events-none"
                        style={{
                          left: `${(sheetConfig.marginMm / layoutInfo.paperWidthMm) * 100}%`,
                          top: `${(sheetConfig.marginMm / layoutInfo.paperHeightMm) * 100}%`,
                          right: `${(sheetConfig.marginMm / layoutInfo.paperWidthMm) * 100}%`,
                          bottom: `${(sheetConfig.marginMm / layoutInfo.paperHeightMm) * 100}%`,
                        }}
                      />

                      {/* Render Draggable Photo Items */}
                      {manualItems.map((item) => {
                        const isSelected = selectedItemId === item.id;
                        const leftPercent = (item.xMm / layoutInfo.paperWidthMm) * 100;
                        const topPercent = (item.yMm / layoutInfo.paperHeightMm) * 100;
                        const widthPercent = (item.widthMm / layoutInfo.paperWidthMm) * 100;
                        const heightPercent = (item.heightMm / layoutInfo.paperHeightMm) * 100;

                        return (
                          <div
                            key={item.id}
                            onMouseDown={(e) => handleDragStart(item.id, e.clientX, e.clientY)}
                            onTouchStart={(e) => {
                              if (e.touches[0]) handleDragStart(item.id, e.touches[0].clientX, e.touches[0].clientY);
                            }}
                            className={`absolute cursor-move transition-shadow rounded-sm ${
                              isSelected
                                ? 'ring-2 ring-indigo-500 shadow-xl z-20'
                                : 'hover:ring-1 hover:ring-indigo-400/80 shadow-md z-10'
                            }`}
                            style={{
                              left: `${leftPercent}%`,
                              top: `${topPercent}%`,
                              width: `${widthPercent}%`,
                              height: `${heightPercent}%`,
                            }}
                          >
                            {/* The Photo itself */}
                            {photoPreviewDataUrl && (
                              <img
                                src={photoPreviewDataUrl}
                                alt="Passport copy"
                                className={`w-full h-full object-cover block pointer-events-none ${
                                  sheetConfig.showBorder ? 'border border-zinc-300' : ''
                                }`}
                              />
                            )}

                            {/* Coordinate tag */}
                            <span className="absolute bottom-0 left-0 bg-black/75 text-[8px] font-mono text-zinc-300 px-1 py-0.2 rounded-tr pointer-events-none">
                              {Math.round(item.xMm)}×{Math.round(item.yMm)}mm
                            </span>

                            {/* Floating Item Toolbar on selected photo */}
                            {isSelected && (
                              <div
                                onMouseDown={(e) => e.stopPropagation()}
                                className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 rounded-md p-1 flex items-center gap-1 shadow-lg z-30"
                              >
                                <button
                                  onClick={(e) => handleRotateItem(item.id, e)}
                                  className="p-1 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
                                  title="Rotate 90°"
                                >
                                  <RotateCw className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDuplicateItem(item.id, e)}
                                  className="p-1 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
                                  title="Duplicate"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteItem(item.id, e)}
                                  className="p-1 hover:bg-rose-900/60 rounded text-rose-400 hover:text-rose-200"
                                  title="Delete Photo"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-zinc-500">Generating print sheet...</div>
              )}
            </div>

            {/* Print Sheet Action Buttons */}
            <div className="w-full mt-4 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={onBackToBackground}
                className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Retouch</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Sheet (Ctrl+P)</span>
                </button>

                <button
                  onClick={() => handleDownloadSheet('jpeg')}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                  title="Download 300 DPI JPEG Sheet"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>300 DPI JPEG</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                  title="Download Print-Ready PDF"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Sheet Configuration Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Paper Size & Format</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">
                {layoutInfo?.paperWidthMm} × {layoutInfo?.paperHeightMm} mm
              </span>
            </div>

            {/* Paper Size Options */}
            <div className="space-y-2">
              {PAPER_SIZES.map((paper) => {
                const isSelected = selectedPaper.id === paper.id;
                return (
                  <button
                    key={paper.id}
                    onClick={() => {
                      setSelectedPaper(paper);
                      setSheetConfig({ ...sheetConfig, paperSizeId: paper.id });
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/80 text-white'
                        : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-white flex items-center gap-2">
                        <span>{paper.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {paper.standard}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Number of Copies / Layout Controls (when in Auto Grid) */}
            {!isManualMode ? (
              <div className="pt-2 border-t border-zinc-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Number of Copies</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {layoutInfo?.actualCopies} of max {layoutInfo?.totalFit} photos
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[4, 6, 8, 12].map((count) => {
                    const isSelected = sheetConfig.copyCount === count;
                    return (
                      <button
                        key={count}
                        onClick={() => setSheetConfig({ ...sheetConfig, copyCount: count })}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-zinc-950/50 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                        }`}
                      >
                        {count} Photos
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setSheetConfig({ ...sheetConfig, copyCount: -1 })}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                    sheetConfig.copyCount === -1
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-zinc-950/50 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  <Maximize className="w-3.5 h-3.5" />
                  <span>Auto Fill Maximum Fit ({layoutInfo?.totalFit} Photos)</span>
                </button>
              </div>
            ) : (
              /* Manual Mode Summary */
              <div className="pt-2 border-t border-zinc-800 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Manual Photo Manager</span>
                  </span>
                  <span className="font-mono text-white text-xs">{manualItems.length} Photos placed</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAddManualPhoto}
                    className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Photo</span>
                  </button>
                  <button
                    onClick={() => {
                      if (layoutInfo) setManualItems(populateManualFromAuto(layoutInfo));
                    }}
                    className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Snap / Reset
                  </button>
                </div>
              </div>
            )}

            {/* Spacing & Margin Sliders */}
            <div className="pt-2 border-t border-zinc-800 space-y-3 text-xs">
              {!isManualMode && (
                <div>
                  <div className="flex justify-between text-zinc-300 mb-1">
                    <span>Photo Spacing (gap)</span>
                    <span className="font-mono text-zinc-400">{sheetConfig.spacingMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    value={sheetConfig.spacingMm}
                    onChange={(e) => setSheetConfig({ ...sheetConfig, spacingMm: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Paper Edge Margin</span>
                  <span className="font-mono text-zinc-400">{sheetConfig.marginMm} mm</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={sheetConfig.marginMm}
                  onChange={(e) => setSheetConfig({ ...sheetConfig, marginMm: Number(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sheetConfig.showCutGuidelines}
                    onChange={(e) => setSheetConfig({ ...sheetConfig, showCutGuidelines: e.target.checked })}
                    className="accent-indigo-500 rounded"
                  />
                  <span className="text-zinc-300">Show Scissor Cutting Guidelines</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sheetConfig.showBorder}
                    onChange={(e) => setSheetConfig({ ...sheetConfig, showBorder: e.target.checked })}
                    className="accent-indigo-500 rounded"
                  />
                  <span className="text-zinc-300">Draw Fine Border Around Each Photo</span>
                </label>
              </div>
            </div>

            {/* Print Note */}
            <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg text-[11px] text-zinc-400 leading-relaxed">
              <strong>Printing Tip:</strong> In your browser print dialog, choose <code className="text-indigo-300 font-mono">Margins: None</code> and <code className="text-indigo-300 font-mono">Scale: 100%</code> (do not fit to printable area) to preserve true 300 DPI millimeter geometry.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
