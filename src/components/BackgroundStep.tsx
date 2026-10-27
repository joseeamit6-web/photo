/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Download,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Check,
  Zap,
  Loader2
} from 'lucide-react';
import { PassportPreset, ImageAdjustments } from '../types.ts';
import { PRESET_BACKGROUND_COLORS } from '../constants/presets.ts';
import {
  removeBackgroundWithAI,
  removeBackgroundColorKey,
  detectBackgroundColor,
  compositePassportPhoto,
  ProgressInfo
} from '../utils/backgroundRemoval.ts';
import { exportCanvasAsDpiImage } from '../utils/sheetGenerator.ts';

interface BackgroundStepProps {
  croppedCanvas: HTMLCanvasElement | null;
  selectedPreset: PassportPreset;
  onBackToCrop: () => void;
  onProceedToSheet: (finalCanvas: HTMLCanvasElement) => void;
}

export const BackgroundStep: React.FC<BackgroundStepProps> = ({
  croppedCanvas,
  selectedPreset,
  onBackToCrop,
  onProceedToSheet,
}) => {
  const [cutoutCanvas, setCutoutCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [aiProgress, setAiProgress] = useState<ProgressInfo | null>(null);
  const [selectedBgColor, setSelectedBgColor] = useState<string>('#FFFFFF');
  const [customColor, setCustomColor] = useState<string>('#FFFFFF');

  // Retouching adjustments
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 0,
    contrast: 5,
    saturation: 0,
    sharpness: 25, // default subtle sharpening for crisp eyes and hair
    rotation: 0,
    flipHorizontal: false,
  });

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Update composite preview whenever cutout, adjustments, or background color change
  useEffect(() => {
    if (!previewCanvasRef.current) return;
    const source = cutoutCanvas || croppedCanvas;
    if (!source) return;

    const composite = compositePassportPhoto(
      source,
      source.width,
      source.height,
      selectedBgColor,
      adjustments
    );

    const canvas = previewCanvasRef.current;
    canvas.width = composite.width;
    canvas.height = composite.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(composite, 0, 0);
    }
  }, [croppedCanvas, cutoutCanvas, selectedBgColor, adjustments]);

  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // AI Background Removal using WebAssembly
  const handleRemoveBackgroundAI = async () => {
    if (!croppedCanvas) return;
    setIsRemovingBg(true);
    setErrorNotice(null);
    setAiProgress({ phase: 'Initializing WebAssembly AI model...', percent: 10 });

    try {
      const blob = await new Promise<Blob>((resolve) =>
        croppedCanvas.toBlob((b) => resolve(b!), 'image/png')
      );

      const transparentBlob = await removeBackgroundWithAI(blob, (progress) => {
        setAiProgress(progress);
      });

      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          setCutoutCanvas(c);
        }
        setIsRemovingBg(false);
        setAiProgress(null);
      };
      img.src = URL.createObjectURL(transparentBlob);
    } catch (err) {
      console.error(err);
      setErrorNotice('AI processing encountered an issue. You can use the Instant Wall Keying tool below, or contact Support at admin@amitjoshi.info.np or WhatsApp at +977 9746241860.');
      setIsRemovingBg(false);
      setAiProgress(null);
    }
  };

  // Instant wall/solid background chroma keying
  const handleInstantColorKey = () => {
    if (!croppedCanvas) return;
    const detected = detectBackgroundColor(croppedCanvas);
    const keyed = removeBackgroundColorKey(croppedCanvas, detected, 40, 18);
    setCutoutCanvas(keyed);
  };

  // Download single photo
  const handleDownloadSingle = async (format: 'jpeg' | 'png') => {
    if (!previewCanvasRef.current) return;
    const filename = `passport-${selectedPreset.widthMm}x${selectedPreset.heightMm}mm-300dpi.${format === 'jpeg' ? 'jpg' : 'png'}`;
    await exportCanvasAsDpiImage(previewCanvasRef.current, format, filename, 300);
  };

  // Proceed to print sheet
  const handleProceed = () => {
    if (!previewCanvasRef.current) return;
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = previewCanvasRef.current.width;
    finalCanvas.height = previewCanvasRef.current.height;
    const ctx = finalCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(previewCanvasRef.current, 0, 0);
      onProceedToSheet(finalCanvas);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 7 Cols: Full Resolution Preview Display */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Passport Photo Preview</h3>
              <p className="text-[11px] font-mono text-zinc-400">
                {selectedPreset.name} · {croppedCanvas?.width} × {croppedCanvas?.height} px @ 300 DPI
              </p>
            </div>
            {cutoutCanvas && (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Subject Isolated</span>
              </span>
            )}
          </div>

          {/* Canvas Preview Container with checkerboard background for transparency */}
          <div
            className="relative max-w-sm w-full aspect-[35/45] rounded-lg overflow-hidden border-2 border-zinc-700/80 shadow-2xl flex items-center justify-center"
            style={{
              aspectRatio: `${selectedPreset.widthMm} / ${selectedPreset.heightMm}`,
              backgroundImage:
                'repeating-linear-gradient(45deg, #18181b 25%, transparent 25%, transparent 75%, #18181b 75%, #18181b), repeating-linear-gradient(45deg, #18181b 25%, #09090b 25%, #09090b 75%, #18181b 75%, #18181b)',
              backgroundSize: '16px 16px',
            }}
          >
            <canvas
              ref={previewCanvasRef}
              className="w-full h-full object-contain block"
            />

            {/* AI Loading Overlay */}
            {isRemovingBg && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
                <div className="text-xs font-semibold text-white mb-1">
                  {aiProgress?.phase || 'Processing WebAssembly AI...'}
                </div>
                <div className="w-48 bg-zinc-800 rounded-full h-1.5 overflow-hidden mt-2">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${aiProgress?.percent || 20}%` }}
                  />
                </div>
                <div className="text-[10px] text-zinc-400 mt-2 font-mono">
                  {aiProgress?.percent || 20}% complete · 0 API keys · zero data sent
                </div>
              </div>
            )}
          </div>

          {/* Quick Single Photo Download Row */}
          <div className="w-full mt-5 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onBackToCrop}
              className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Crop</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadSingle('jpeg')}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                title="Download 300 DPI JPEG"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Single 300 DPI JPEG</span>
              </button>
              <button
                onClick={() => handleDownloadSingle('png')}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                title="Download lossless PNG"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Lossless PNG</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right 5 Cols: AI Background Removal, Colors & Retouch Sliders */}
      <div className="lg:col-span-5 space-y-4">
        {/* 1. Background Isolation Panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              2. AI Background Removal
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              WebAssembly
            </span>
          </div>

          {errorNotice && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-200 space-y-1.5">
              <div className="font-semibold text-rose-300">Processing Error</div>
              <p className="text-[11px] leading-relaxed text-zinc-300">
                If any error occurs or AI processing fails, contact Support at{' '}
                <a href="mailto:admin@amitjoshi.info.np" className="text-indigo-400 font-semibold underline">
                  admin@amitjoshi.info.np
                </a>{' '}
                or WhatsApp at{' '}
                <a href="https://wa.me/9779746241860" target="_blank" rel="noreferrer" className="text-emerald-400 font-semibold underline">
                  +977 9746241860
                </a>.
              </p>
            </div>
          )}

          <div className="space-y-2.5">
            <button
              onClick={handleRemoveBackgroundAI}
              disabled={isRemovingBg}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                isRemovingBg
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>{cutoutCanvas ? 'Re-run AI Cutout' : 'Extract Subject with AI (Free)'}</span>
            </button>

            <button
              onClick={handleInstantColorKey}
              className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Wall Color Keying (0-second)</span>
            </button>
          </div>

          {cutoutCanvas && (
            <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
              <span>Subject mask active</span>
              <button
                onClick={() => setCutoutCanvas(null)}
                className="text-xs text-rose-400 hover:underline"
              >
                Reset to Original Background
              </button>
            </div>
          )}
        </div>

        {/* 2. Backdrop Color Palette */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            3. Backdrop Color
          </h3>

          <div className="grid grid-cols-4 gap-2">
            {PRESET_BACKGROUND_COLORS.map((bg) => {
              const isSelected = selectedBgColor.toLowerCase() === bg.hex.toLowerCase();
              return (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBgColor(bg.hex)}
                  className={`p-2 rounded-lg border text-left transition-all flex flex-col items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/30'
                      : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-md border border-zinc-700 shadow-inner flex items-center justify-center"
                    style={{
                      backgroundColor: bg.hex === 'transparent' ? '#18181b' : bg.hex,
                      backgroundImage:
                        bg.hex === 'transparent'
                          ? 'repeating-linear-gradient(45deg, #27272a 25%, transparent 25%, transparent 75%, #27272a 75%, #27272a)'
                          : undefined,
                      backgroundSize: '8px 8px',
                    }}
                  >
                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 ${bg.hex === '#FFFFFF' || bg.hex === '#F8FAFC' ? 'text-zinc-900' : 'text-white'}`} />
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-zinc-300 truncate w-full text-center">
                    {bg.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Hex Color Picker */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                setSelectedBgColor(e.target.value);
              }}
              className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
            />
            <div className="text-xs text-zinc-300 font-mono">
              Custom Hex: <span className="text-indigo-400 uppercase">{selectedBgColor}</span>
            </div>
          </div>
        </div>

        {/* 3. Retouching Sliders */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>4. Retouching & Lighting</span>
            </h3>
            <button
              onClick={() =>
                setAdjustments({
                  brightness: 0,
                  contrast: 0,
                  saturation: 0,
                  sharpness: 0,
                  rotation: 0,
                  flipHorizontal: false,
                })
              }
              className="text-[11px] text-zinc-400 hover:text-white transition-colors"
            >
              Reset All
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Brightness */}
            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span>Brightness</span>
                <span className="font-mono text-zinc-400">{adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness}%</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={adjustments.brightness}
                onChange={(e) => setAdjustments({ ...adjustments, brightness: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span>Contrast</span>
                <span className="font-mono text-zinc-400">{adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast}%</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={adjustments.contrast}
                onChange={(e) => setAdjustments({ ...adjustments, contrast: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span>Saturation</span>
                <span className="font-mono text-zinc-400">{adjustments.saturation > 0 ? `+${adjustments.saturation}` : adjustments.saturation}%</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={adjustments.saturation}
                onChange={(e) => setAdjustments({ ...adjustments, saturation: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Sharpness (Unsharp Mask) */}
            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span>Facial Sharpness (Unsharp Mask)</span>
                <span className="font-mono text-indigo-400">{adjustments.sharpness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.sharpness}
                onChange={(e) => setAdjustments({ ...adjustments, sharpness: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2 Completion Button */}
        <button
          onClick={handleProceed}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <span>Next: Generate Print Sheet</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
