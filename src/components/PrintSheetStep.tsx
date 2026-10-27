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
  RotateCw,
  Plus,
  Trash2,
  Move,
  Sparkles,
  RefreshCw,
  LayoutGrid
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

  const [layoutInfo, setLayoutInfo] = useState<LayoutCalculation | null>(null);
  const [gridSlots, setGridSlots] = useState<GridSlot[]>([]);
  const [sheetDataUrl, setSheetDataUrl] = useState<string | null>(null);
  const [draggedSlotId, setDraggedSlotId] = useState<string | null>(null);
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);

  const sheetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize or re-calculate grid slots when paper, preset, or layout configuration changes
  useEffect(() => {
    if (!finalPhotoCanvas) return;

    const layout = calculateSheetLayout(selectedPreset, selectedPaper, sheetConfig);
    setLayoutInfo(layout);

    const slots = calculateGridSlots(selectedPreset, selectedPaper, sheetConfig);
    setGridSlots(slots);
  }, [finalPhotoCanvas, selectedPreset, selectedPaper, sheetConfig]);

  // Regenerate high-res 300 DPI canvas whenever grid slots change
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

  // Drag and Drop Handlers
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

      // Swap the photo presence and rotation state between source and target slots
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

  // Toggle single slot state on click (if empty, fill it; if filled, toggle select)
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

  // Fill all slots
  const handleFillAllSlots = () => {
    setGridSlots((prev) => prev.map((s) => ({ ...s, hasPhoto: true })));
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

  // Clear all slots
  const handleClearAllSlots = () => {
    setGridSlots((prev) => prev.map((s) => ({ ...s, hasPhoto: false })));
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
        {/* Left 7 Cols: Interactive Drag-and-Drop Print Sheet Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xl flex flex-col items-center">
            <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>Interactive Print Sheet</span>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/70 border border-indigo-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                    <Move className="w-3 h-3" />
                    <span>Drag & Drop Enabled</span>
                  </span>
                </h3>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  {selectedPaper.name} · {activePhotosCount} Photos Placed · 300 DPI
                </p>
              </div>

              {/* Quick Grid Actions */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={handleFillAllSlots}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] font-medium transition-colors"
                  title="Fill all printable slots"
                >
                  Fill All ({gridSlots.length})
                </button>
                <button
                  onClick={handleCompactToTop}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] font-medium transition-colors"
                  title="Compact photos to top without gaps"
                >
                  Compact
                </button>
                <button
                  onClick={handleResetToAuto}
                  className="px-2 py-1 text-zinc-400 hover:text-white rounded text-[11px] transition-colors"
                  title="Reset to default copies"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="w-full mb-3 p-2 bg-indigo-950/20 border border-indigo-800/40 rounded-lg text-xs text-indigo-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Drag photos to rearrange slots or click empty slots to toggle placement.</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
                Top-to-Bottom Flow
              </span>
            </div>

            {/* Paper Sheet Preview Container */}
            <div className="w-full p-2 sm:p-4 bg-zinc-950 rounded-lg flex items-center justify-center min-h-[440px] overflow-hidden border border-zinc-800/80">
              {layoutInfo ? (
                <div
                  ref={previewContainerRef}
                  className="relative shadow-2xl rounded border border-zinc-700/60 overflow-hidden bg-white select-none transition-all"
                  style={{
                    width: '100%',
                    maxWidth: layoutInfo.paperWidthMm > layoutInfo.paperHeightMm ? '540px' : '390px',
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
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm rounded p-0.5 flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={(e) => handleRotateSlot(slot.id, e)}
                                className="p-0.5 hover:bg-zinc-700 rounded text-zinc-200"
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
                                className="p-0.5 hover:bg-rose-900 rounded text-rose-300"
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
                            <span className="text-[7px] font-mono text-zinc-400 group-hover:text-indigo-600 mt-0.5">
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

            {/* Number of Copies Preset Buttons */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Number of Copies</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  {activePhotosCount} of {gridSlots.length} slots active
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[4, 6, 8, 12].map((count) => {
                  const isSelected = activePhotosCount === count;
                  return (
                    <button
                      key={count}
                      onClick={() => {
                        setSheetConfig({ ...sheetConfig, copyCount: count });
                        setGridSlots((prev) =>
                          prev.map((s, idx) => ({ ...s, hasPhoto: idx < count }))
                        );
                      }}
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

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleFillAllSlots}
                  className="py-2 px-3 rounded-lg text-xs font-semibold transition-all border border-indigo-500/80 bg-indigo-950/40 text-indigo-200 hover:bg-indigo-900/50 flex items-center justify-center gap-1.5"
                >
                  <Maximize className="w-3.5 h-3.5" />
                  <span>Fill All Slots ({gridSlots.length})</span>
                </button>
                <button
                  onClick={handleClearAllSlots}
                  className="py-2 px-3 rounded-lg text-xs font-semibold transition-all border border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:bg-zinc-800 flex items-center justify-center gap-1.5"
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
                  className="w-full accent-indigo-500"
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

            {/* Print Tip */}
            <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg text-[11px] text-zinc-400 leading-relaxed">
              <strong>Printing Tip:</strong> In your browser print dialog, choose <code className="text-indigo-300 font-mono">Margins: None</code> and <code className="text-indigo-300 font-mono">Scale: 100%</code> (do not fit to printable area) to preserve true 300 DPI millimeter geometry.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
