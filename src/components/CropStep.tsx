/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import Cropper from 'cropperjs';
import {
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Upload,
  Camera,
  Sparkles,
  ArrowRight,
  Maximize2,
  Check,
  Info
} from 'lucide-react';
import { PassportPreset } from '../types.ts';
import { PASSPORT_PRESETS } from '../constants/presets.ts';
import { BiometricOverlay } from './BiometricOverlay.tsx';
import samplePortraitUrl from '../assets/images/passport_sample_portrait_1793111919167.jpg';

interface CropStepProps {
  imageSrc: string | null;
  onImageLoaded: (src: string, file?: File) => void;
  selectedPreset: PassportPreset;
  onPresetChange: (preset: PassportPreset) => void;
  onCropComplete: (croppedCanvas: HTMLCanvasElement) => void;
}

export const CropStep: React.FC<CropStepProps> = ({
  imageSrc,
  onImageLoaded,
  selectedPreset,
  onPresetChange,
  onCropComplete,
}) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showBiometricGuide, setShowBiometricGuide] = useState(true);
  const [customWidth, setCustomWidth] = useState(35);
  const [customHeight, setCustomHeight] = useState(45);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize or re-configure Cropper when imageSrc changes
  useEffect(() => {
    if (!imageRef.current || !imageSrc) return;

    if (cropperRef.current) {
      cropperRef.current.destroy();
      cropperRef.current = null;
    }

    const cropper = new Cropper(imageRef.current, {
      aspectRatio: selectedPreset.widthMm / selectedPreset.heightMm,
      viewMode: 1,
      autoCropArea: 0.82,
      responsive: true,
      background: false,
      zoomable: true,
      rotatable: true,
      scalable: true,
      ready() {
        const img = imageRef.current;
        if (img) {
          setNaturalDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        }
      },
    });

    cropperRef.current = cropper;

    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }
    };
  }, [imageSrc]);

  // Update aspect ratio when preset changes
  useEffect(() => {
    if (!cropperRef.current) return;
    const ratio = selectedPreset.widthMm / selectedPreset.heightMm;
    cropperRef.current.setAspectRatio(ratio);
  }, [selectedPreset]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImageLoaded(event.target.result as string, file);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImageLoaded(event.target.result as string, file);
      }
    };
    reader.readAsDataURL(file);
  };

  // Webcam capture
  const startWebcam = async () => {
    try {
      setIsWebcamActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Could not access camera. Please allow camera permissions or upload a photo.');
      setIsWebcamActive(false);
    }
  };

  const captureWebcam = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
      onImageLoaded(dataUrl);
    }
    stopWebcam();
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  // Handle preset selection
  const handleSelectPreset = (preset: PassportPreset) => {
    if (preset.id === 'custom') {
      const customP = {
        ...preset,
        widthMm: customWidth,
        heightMm: customHeight,
      };
      onPresetChange(customP);
    } else {
      onPresetChange(preset);
    }
  };

  const handleCustomDimensionsChange = (w: number, h: number) => {
    setCustomWidth(w);
    setCustomHeight(h);
    const customP = {
      ...selectedPreset,
      id: 'custom',
      name: `Custom (${w} × ${h} mm)`,
      widthMm: w,
      heightMm: h,
    };
    onPresetChange(customP);
  };

  // Perform High-Resolution Crop (ZERO QUALITY LOSS)
  const handleProceedToBackground = () => {
    if (!cropperRef.current) return;

    // Calculate exact target pixel size at 300 DPI
    const dpi = 300;
    const targetW = Math.round((selectedPreset.widthMm / 25.4) * dpi);
    const targetH = Math.round((selectedPreset.heightMm / 25.4) * dpi);

    // Get high-res cropped canvas from Cropper.js operating on full native pixels
    const canvas = cropperRef.current.getCroppedCanvas({
      width: targetW,
      height: targetH,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    onCropComplete(canvas);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 8 Cols: Interactive Viewport with Cropper.js and Biometric Guide */}
      <div className="lg:col-span-8 space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-xl">
          {/* Viewport Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="relative w-full h-[520px] bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800/80 flex items-center justify-center"
          >
            {isWebcamActive ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 flex items-center gap-3">
                  <button
                    onClick={captureWebcam}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Snap</span>
                  </button>
                  <button
                    onClick={stopWebcam}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : imageSrc ? (
              <div className="relative w-full h-full">
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Passport source"
                  className="max-w-full max-h-full block"
                />
                <BiometricOverlay
                  preset={selectedPreset}
                  visible={showBiometricGuide}
                />
              </div>
            ) : (
              <div className="text-center p-8 max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">
                  Upload Passport Photo
                </h3>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  Drag & drop your portrait photo here, or capture directly with your camera. Natural camera resolution is preserved with zero compression.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Browse Image</span>
                  </button>

                  <button
                    onClick={startWebcam}
                    className="w-full sm:w-auto px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Use Webcam</span>
                  </button>
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-800/80">
                  <button
                    onClick={() => onImageLoaded(samplePortraitUrl)}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Try with Studio Sample Portrait</span>
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Viewport Toolbar Controls */}
          {imageSrc && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1 text-xs text-zinc-300">
                <button
                  onClick={() => cropperRef.current?.rotate(-90)}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-colors"
                  title="Rotate Left 90°"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => cropperRef.current?.rotate(90)}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-colors"
                  title="Rotate Right 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const cropper = cropperRef.current;
                    if (!cropper) return;
                    const data = cropper.getData();
                    cropper.scaleX(data.scaleX === -1 ? 1 : -1);
                  }}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-colors"
                  title="Flip Horizontally"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <div className="h-4 w-px bg-zinc-800 mx-1" />
                <button
                  onClick={() => cropperRef.current?.zoom(0.1)}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => cropperRef.current?.zoom(-0.1)}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => cropperRef.current?.reset()}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-colors text-[11px]"
                  title="Reset Crop Position"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBiometricGuide(!showBiometricGuide)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    showBiometricGuide
                      ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {showBiometricGuide ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>Biometric Overlay</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors"
                >
                  Change Photo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resolution Metadata Bar */}
        {naturalDimensions && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-2.5 flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>
                Input Resolution:{' '}
                <strong className="text-zinc-200 font-mono">
                  {naturalDimensions.width} × {naturalDimensions.height} px
                </strong>{' '}
                ({((naturalDimensions.width * naturalDimensions.height) / 1000000).toFixed(1)} MP)
              </span>
            </div>
            <div className="font-mono text-emerald-400">
              Output: {Math.round((selectedPreset.widthMm / 25.4) * 300)} × {Math.round((selectedPreset.heightMm / 25.4) * 300)} px @ 300 DPI
            </div>
          </div>
        )}
      </div>

      {/* Right 4 Cols: Passport Presets and Progression */}
      <div className="lg:col-span-4 space-y-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              1. Passport Dimension Presets
            </h3>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/70 border border-indigo-800/60 px-2 py-0.5 rounded">
              300 DPI Standard
            </span>
          </div>

          {/* Preset Buttons Grid */}
          <div className="space-y-2">
            {PASSPORT_PRESETS.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/80 text-white shadow-sm shadow-indigo-500/10'
                      : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="pr-2">
                    <div className="font-semibold text-xs text-white flex items-center gap-2">
                      <span>{preset.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                      {preset.country}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-1">
                      Target: {Math.round((preset.widthMm / 25.4) * 300)} × {Math.round((preset.heightMm / 25.4) * 300)} px
                    </div>
                  </div>
                  <div className="font-mono text-xs text-indigo-400 whitespace-nowrap bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                    {preset.widthMm}×{preset.heightMm} mm
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Dimension Inputs if Custom selected */}
          {selectedPreset.id === 'custom' && (
            <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg space-y-3">
              <div className="text-xs font-semibold text-zinc-200">Custom Dimensions (mm)</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Width (mm)</label>
                  <input
                    type="number"
                    min="15"
                    max="150"
                    value={customWidth}
                    onChange={(e) => handleCustomDimensionsChange(Number(e.target.value), customHeight)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Height (mm)</label>
                  <input
                    type="number"
                    min="15"
                    max="150"
                    value={customHeight}
                    onChange={(e) => handleCustomDimensionsChange(customWidth, Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1 Completion Button */}
          <div className="pt-3 border-t border-zinc-800">
            <button
              onClick={handleProceedToBackground}
              disabled={!imageSrc}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                imageSrc
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <span>Next: AI Background & Retouch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
