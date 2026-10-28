/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Printer,
  Download,
  FileText,
  ArrowLeft,
  Maximize,
  Check,
  Grid,
  Layers,
  RotateCw,
  Plus,
  Minus,
  Trash2,
  Move,
  LayoutGrid,
  Image as ImageIcon
} from 'lucide-react';
import { PaperSize, PassportPreset, SheetConfig, GridSlot } from '../types.ts';
import { PAPER_SIZES } from '../constants/presets.ts';
import {
  calculateSheetLayout,
  calculateGridSlots,
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
  // Default to A4 paper as requested
  const defaultA4 = PAPER_SIZES.find((p) => p.id === 'a4') || PAPER_SIZES[0];
  const [selectedPaper, setSelectedPaper] = useState<PaperSize>(defaultA4);

  const [sheetConfig, setSheetConfig] = useState<SheetConfig>({
    paperSizeId: defaultA4.id,
    copyCount: 8,
    spacingMm: 3,
    marginMm: 6,
    showCutGuidelines: true,
    showBorder: true,
    borderColor: '#E4E4E7',
    orientation: 'auto',
  });

  const [layoutInfo, setLayoutInfo] = useState<LayoutCalculation | null>(null);
  const [gridSlots, setGridSlots] = useState<GridSlot[]>([]);
  const [sheetDataUrl, setSheetDataUrl] = useState<string | null>(null);
  const [draggedSlotId, setDraggedSlotId] = useState<string | null>(null);
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);

  const sheetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  // Recalculate layout and slots when paper, preset, or sheetConfig changes
  useEffect(() => {
    if (!finalPhotoCanvas) return;

    const layout = calculateSheetLayout(selectedPreset, selectedPaper, sheetConfig);
    setLayoutInfo(layout);

    const slots = calculateGridSlots(selectedPreset, selectedPaper, sheetConfig);
    setGridSlots(slots);
  }, [finalPhotoCanvas, selectedPreset, selectedPaper, sheetConfig]);

  // Regenerate high-resolution 300 DPI canvas whenever grid slots change
  useEffect(() => {
    if (!finalPhotoCanvas) return;

    const canvas = generatePrintSheetCanvas(
      finalPhotoCanvas,
      selectedPreset,
      selectedPaper,
      sheetConfig,
      300,
      gridSlots
    );

    sheetCanvasRef.current = canvas;
    setSheetDataUrl(canvas.toDataURL('image/jpeg', 0.95));
  }, [finalPhotoCanvas, selectedPreset, selectedPaper, sheetConfig, gridSlots]);

  // Drag and Drop Handlers for rearranging photos
  const handleDragStart = (e: React.DragEvent, slotId: string) => {
    const slot = gridSlots.find((s) => s.id === slotId);
    if (!slot || !slot.hasPhoto) {
      e.preventDefault();
      return;
    }
    setDraggedSlotId(slotId);
    e.dataTransfer.setData('text/plain', slotId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlotId !== slotId) {
      setDragOverSlotId(slotId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, slotId: string) => {
    if (dragOverSlotId === slotId) {
      setDragOverSlotId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetSlotId: string) => {
    e.preventDefault();
    setDragOverSlotId(null);
    const sourceSlotId = draggedSlotId || e.dataTransfer.getData('text/plain');
    if (!sourceSlotId || sourceSlotId === targetSlotId) {
      setDraggedSlotId(null);
      return;
    }

    setGridSlots((prev) => {
      const sourceSlot = prev.find((s) => s.id === sourceSlotId);
      const targetSlot = prev.find((s) => s.id === targetSlotId);
      if (!sourceSlot || !targetSlot) return prev;

      return prev.map((s) => {
        if (s.id === targetSlotId) {
          return {
            ...s,
            hasPhoto: sourceSlot.hasPhoto,
            isRotated: sourceSlot.isRotated,
          };
        }
        if (s.id === sourceSlotId) {
          return {
            ...s,
            hasPhoto: targetSlot.hasPhoto,
            isRotated: targetSlot.isRotated,
          };
        }
        return s;
      });
    });

    setDraggedSlotId(null);
  };

  // Toggle single slot state on click
  const handleToggleSlotPhoto = (slotId: string) => {
    setGridSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, hasPhoto: !s.hasPhoto } : s))
    );
  };

  // Rotate photo 90° inside its slot
  const handleRotateSlot = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGridSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, isRotated: !s.isRotated } : s))
    );
  };

  // User sets exact custom number of photos
  const handleSetCustomCount = (newCount: number) => {
    const total = gridSlots.length;
    const clamped = Math.max(0, Math.min(newCount, total));
    setSheetConfig((prev) => ({ ...prev, copyCount: clamped }));
    setGridSlots((prev) =>
      prev.map((s, idx) => ({
        ...s,
        hasPhoto: idx < clamped,
        isRotated: false,
      }))
    );
  };

  // Fill all slots on the page
  const handleFillAllSlots = () => {
    setSheetConfig((prev) => ({ ...prev, copyCount: gridSlots.length }));
    setGridSlots((prev) => prev.map((s) => ({ ...s, hasPhoto: true })));
  };

  // Clear all slots
  const handleClearAllSlots = () => {
    setSheetConfig((prev) => ({ ...prev, copyCount: 0 }));
    setGridSlots((prev) => prev.map((s) => ({ ...s, hasPhoto: false })));
  };

  // Compact active photos towards the top-left slots without gaps
  const handleCompactToTop = () => {
    setGridSlots((prev) => {
      const activeCount = prev.filter((s) => s.hasPhoto).length;
      return prev.map((s, idx) => ({
        ...s,
        hasPhoto: idx < activeCount,
        isRotated: false,
      }));
    });
  };

  // Reset to auto layout
  const handleResetToAuto = () => {
    const slots = calculateGridSlots(selectedPreset, selectedPaper, sheetConfig);
    setGridSlots(slots);
  };

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
  const activePhotosCount = gridSlots.filter((s) => s.hasPhoto).length;

  return (
    <div className="w-full max-w-full overflow-hidden">
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

      {/* Main Studio View with responsive layout locking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start no-print max-w-full">
        {/* Left 7 Cols: Interactive Drag-and-Drop Print Sheet Preview */}
        <div className="w-full max-w-full lg:col-span-7 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 sm:p-5 shadow-xl flex flex-col items-center max-w-full overflow-hidden">
            <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>Interactive Print Sheet</span>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/70 border border-indigo-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                    <Move className="w-3 h-3" />
                    <span className="hidden xs:inline">Drag & Drop</span>
                  </span>
                </h3>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  {selectedPaper.name} · <span className="text-emerald-400 font-semibold">{activePhotosCount} Photos</span> · 300 DPI
                </p>
              </div>

              {/* Quick Grid Actions */}
              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                <button
                  type="button"
                  onClick={handleFillAllSlots}
                  className="px-2.5 py-1 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/60 text-indigo-300 rounded text-[11px] font-medium transition-colors cursor-pointer"
                  title="Fill all printable slots"
                >
                  Fill Page ({gridSlots.length})
                </button>
                <button
                  type="button"
                  onClick={handleCompactToTop}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] font-medium transition-colors cursor-pointer"
                  title="Compact photos to top-left without gaps"
                >
                  Compact
                </button>
                <button
                  type="button"
                  onClick={handleClearAllSlots}
                  className="px-2 py-1 text-rose-400 hover:text-rose-300 rounded text-[11px] transition-colors cursor-pointer"
                  title="Clear all photos from sheet"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleResetToAuto}
                  className="px-2 py-1 text-zinc-400 hover:text-white rounded text-[11px] transition-colors cursor-pointer"
                  title="Reset to default copies"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="w-full mb-3 p-2.5 bg-indigo-950/30 border border-indigo-800/40 rounded-lg text-xs text-indigo-300 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-[11px] sm:text-xs">
                  Click any slot to add/remove photo, or drag to reorder.
                </span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline shrink-0">
                A4 Millimeter Precision
              </span>
            </div>

            {/* Paper Sheet Preview Container (Strictly locked to fit any viewport down to 320px) */}
            <div className="w-full p-2 sm:p-4 bg-zinc-950 rounded-lg flex items-center justify-center min-h-[360px] sm:min-h-[440px] overflow-hidden border border-zinc-800/80">
              {layoutInfo ? (
                <div
                  ref={previewContainerRef}
                  className="relative shadow-2xl rounded border border-zinc-700/60 overflow-hidden bg-white select-none transition-all mx-auto"
                  style={{
                    width: '100%',
                    maxWidth:
                      layoutInfo.paperWidthMm > layoutInfo.paperHeightMm
                        ? 'min(540px, 100%)'
                        : 'min(390px, 100%)',
                    aspectRatio: `${layoutInfo.paperWidthMm} / ${layoutInfo.paperHeightMm}`,
                  }}
                >
                  {/* Subtle paper margin guideline */}
                  <div
                    className="absolute border border-dashed border-zinc-300 pointer-events-none z-0"
                    style={{
                      left: `${(sheetConfig.marginMm / layoutInfo.paperWidthMm) * 100}%`,
                      top: `${(sheetConfig.marginMm / layoutInfo.paperHeightMm) * 100}%`,
                      right: `${(sheetConfig.marginMm / layoutInfo.paperWidthMm) * 100}%`,
                      bottom: `${(sheetConfig.marginMm / layoutInfo.paperHeightMm) * 100}%`,
                    }}
                  />

                  {/* Interactive Drag & Drop Grid Slots */}
                  {gridSlots.map((slot) => {
                    const isDragging = draggedSlotId === slot.id;
                    const isDragOver = dragOverSlotId === slot.id;
                    const leftPercent = (slot.xMm / layoutInfo.paperWidthMm) * 100;
                    const topPercent = (slot.yMm / layoutInfo.paperHeightMm) * 100;
                    const widthPercent = (slot.widthMm / layoutInfo.paperWidthMm) * 100;
                    const heightPercent = (slot.heightMm / layoutInfo.paperHeightMm) * 100;

                    return (
                      <div
                        key={slot.id}
                        draggable={slot.hasPhoto}
                        onDragStart={(e) => handleDragStart(e, slot.id)}
                        onDragOver={(e) => handleDragOver(e, slot.id)}
                        onDragLeave={(e) => handleDragLeave(e, slot.id)}
                        onDrop={(e) => handleDrop(e, slot.id)}
                        onClick={() => handleToggleSlotPhoto(slot.id)}
                        className={`absolute rounded-sm transition-all group ${
                          slot.hasPhoto ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                        } ${
                          isDragging
                            ? 'opacity-40 scale-95 ring-2 ring-indigo-500 z-30'
                            : isDragOver
                            ? 'ring-2 ring-emerald-400 bg-emerald-500/20 scale-102 z-20 shadow-lg'
                            : 'hover:ring-1 hover:ring-indigo-400 z-10'
                        }`}
                        style={{
                          left: `${leftPercent}%`,
                          top: `${topPercent}%`,
                          width: `${widthPercent}%`,
                          height: `${heightPercent}%`,
                        }}
                      >
                        {slot.hasPhoto ? (
                          <div className="relative w-full h-full overflow-hidden shadow-sm">
                            {/* Passport Photo */}
                            {photoPreviewDataUrl && (
                              <img
                                src={photoPreviewDataUrl}
                                alt={`Passport photo slot ${slot.slotIndex + 1}`}
                                className={`w-full h-full object-cover block pointer-events-none transition-transform duration-200 ${
                                  slot.isRotated ? 'rotate-90 scale-125' : ''
                                } ${sheetConfig.showBorder ? 'border border-zinc-300' : ''}`}
                              />
                            )}

                            {/* Slot Index Badge */}
                            <span className="absolute bottom-0 left-0 bg-black/75 text-[8px] font-mono text-zinc-300 px-1 py-0.2 rounded-tr pointer-events-none">
                              #{slot.slotIndex + 1}
                            </span>

                            {/* Quick Slot Actions overlay */}
                            <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm rounded p-0.5 flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={(e) => handleRotateSlot(slot.id, e)}
                                className="p-0.5 hover:bg-zinc-700 rounded text-zinc-200 cursor-pointer"
                                title="Rotate 90°"
                              >
                                <RotateCw className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSlotPhoto(slot.id);
                                }}
                                className="p-0.5 hover:bg-rose-900 rounded text-rose-300 cursor-pointer"
                                title="Remove photo"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Empty Drop Slot */
                          <div
                            className={`w-full h-full border border-dashed rounded flex flex-col items-center justify-center transition-colors ${
                              isDragOver
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-zinc-300/80 bg-zinc-50/60 hover:bg-indigo-50/60 hover:border-indigo-400'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 transition-colors" />
                            <span className="text-[7px] font-mono text-zinc-400 group-hover:text-indigo-600 mt-0.2">
                              #{slot.slotIndex + 1}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-zinc-500">Generating print sheet...</div>
              )}
            </div>

            {/* Print Sheet Action Buttons */}
            <div className="w-full mt-4 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBackToBackground}
                className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Retouch</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Sheet (Ctrl+P)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSheet('jpeg')}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Download 300 DPI JPEG Sheet"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JPEG</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSheet('png')}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Download Lossless PNG Sheet"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Download Print-Ready PDF"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Sheet Configuration & Custom Copies Panel */}
        <div className="w-full max-w-full lg:col-span-5 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
            {/* Header: Paper Selection */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Paper Size & Dimensions</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">
                {layoutInfo?.paperWidthMm} × {layoutInfo?.paperHeightMm} mm
              </span>
            </div>

            {/* Paper Size Options (A4 is highlighted as Default Standard) */}
            <div className="space-y-2">
              {PAPER_SIZES.map((paper) => {
                const isSelected = selectedPaper.id === paper.id;
                const isA4 = paper.id === 'a4';
                return (
                  <button
                    key={paper.id}
                    type="button"
                    onClick={() => {
                      setSelectedPaper(paper);
                      setSheetConfig({ ...sheetConfig, paperSizeId: paper.id });
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-start justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/80 text-white'
                        : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-white flex items-center gap-2">
                        <span>{paper.name}</span>
                        {isA4 && (
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                            Default Standard
                          </span>
                        )}
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

            {/* USER CUSTOM NUMBER OF PHOTOS SELECTION */}
            <div className="pt-3 border-t border-zinc-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Choose Custom Number of Photos</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {activePhotosCount} of {gridSlots.length} active
                </span>
              </div>

              {/* Stepper + Direct Numeric Input */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSetCustomCount(activePhotosCount - 1)}
                  disabled={activePhotosCount <= 0}
                  className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 flex items-center justify-center transition-colors border border-zinc-700 shrink-0 cursor-pointer"
                  aria-label="Decrease photo count by 1"
                  title="Decrease copies"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="number"
                    min="0"
                    max={gridSlots.length}
                    value={activePhotosCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      handleSetCustomCount(isNaN(val) ? 0 : val);
                    }}
                    className="w-full h-10 px-3 bg-zinc-950 border border-zinc-700 rounded-lg text-center font-mono text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    aria-label="Enter exact custom number of photos"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-mono pointer-events-none">
                    max {gridSlots.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSetCustomCount(activePhotosCount + 1)}
                  disabled={activePhotosCount >= gridSlots.length}
                  className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 flex items-center justify-center transition-colors border border-zinc-700 shrink-0 cursor-pointer"
                  aria-label="Increase photo count by 1"
                  title="Increase copies"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Preset Count Pills (1, 2, 4, 6, 8, 12, 16, 20, 24, 30) */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-zinc-400">Quick selection:</div>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 4, 6, 8, 12, 16, 20, 24, 30]
                    .filter((c) => c <= gridSlots.length)
                    .map((count) => {
                      const isSelected = activePhotosCount === count;
                      return (
                        <button
                          key={count}
                          type="button"
                          onClick={() => handleSetCustomCount(count)}
                          className={`py-1 px-2.5 rounded-md text-xs font-semibold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                              : 'bg-zinc-950/60 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                          }`}
                        >
                          {count}
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleFillAllSlots}
                  className="py-2 px-3 rounded-lg text-xs font-semibold transition-all border border-indigo-500/80 bg-indigo-950/40 text-indigo-200 hover:bg-indigo-900/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Maximize className="w-3.5 h-3.5" />
                  <span>Fill Page ({gridSlots.length})</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAllSlots}
                  className="py-2 px-3 rounded-lg text-xs font-semibold transition-all border border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:bg-zinc-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* Spacing & Margin Sliders */}
            <div className="pt-2 border-t border-zinc-800 space-y-3 text-xs">
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
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

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
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sheetConfig.showCutGuidelines}
                    onChange={(e) => setSheetConfig({ ...sheetConfig, showCutGuidelines: e.target.checked })}
                    className="accent-indigo-500 rounded cursor-pointer"
                  />
                  <span className="text-zinc-300">Show Scissor Cutting Guidelines</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sheetConfig.showBorder}
                    onChange={(e) => setSheetConfig({ ...sheetConfig, showBorder: e.target.checked })}
                    className="accent-indigo-500 rounded cursor-pointer"
                  />
                  <span className="text-zinc-300">Draw Fine Border Around Each Photo</span>
                </label>
              </div>
            </div>

            {/* Print Tip */}
            <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg text-[11px] text-zinc-400 leading-relaxed">
              <strong>A4 Printing Tip:</strong> In your browser print dialog (Ctrl+P), select <code className="text-indigo-300 font-mono">Paper: A4</code>, <code className="text-indigo-300 font-mono">Margins: None</code>, and <code className="text-indigo-300 font-mono">Scale: 100%</code> to preserve true 300 DPI millimeter geometry.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
