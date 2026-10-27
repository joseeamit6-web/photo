/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { PaperSize, PassportPreset, SheetConfig } from '../types.ts';
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

  const [layoutInfo, setLayoutInfo] = useState<LayoutCalculation | null>(null);
  const [sheetDataUrl, setSheetDataUrl] = useState<string | null>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Recalculate and generate 300 DPI sheet whenever inputs change
  useEffect(() => {
    if (!finalPhotoCanvas) return;

    const layout = calculateSheetLayout(selectedPreset, selectedPaper, sheetConfig);
    setLayoutInfo(layout);

    const canvas = generatePrintSheetCanvas(
      finalPhotoCanvas,
      selectedPreset,
      selectedPaper,
      sheetConfig,
      300
    );

    sheetCanvasRef.current = canvas;
    setSheetDataUrl(canvas.toDataURL('image/jpeg', 0.95));
  }, [finalPhotoCanvas, selectedPreset, selectedPaper, sheetConfig]);

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
        {/* Left 7 Cols: High-DPI Sheet Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-semibold text-white">Print Sheet Preview (300 DPI)</h3>
                <p className="text-[11px] font-mono text-zinc-400">
                  {selectedPaper.name} · {layoutInfo?.actualCopies} Photos · {layoutInfo?.cols} × {layoutInfo?.rows} Grid
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
                <Scissors className="w-3.5 h-3.5" />
                <span>Cut Guides Active</span>
              </div>
            </div>

            {/* Paper Sheet Preview Container */}
            <div className="w-full p-4 bg-zinc-950 rounded-lg flex items-center justify-center min-h-[460px] overflow-hidden border border-zinc-800/80">
              {sheetDataUrl ? (
                <div className="relative max-h-[500px] shadow-2xl rounded border border-zinc-700/60 overflow-hidden bg-white">
                  <img
                    src={sheetDataUrl}
                    alt="Passport Sheet Preview"
                    className="max-h-[500px] w-auto object-contain block"
                  />
                </div>
              ) : (
                <div className="text-xs text-zinc-500">Generating print sheet...</div>
              )}
            </div>

            {/* Print Sheet Action Buttons */}
            <div className="w-full mt-5 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
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

            {/* Number of Copies */}
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
