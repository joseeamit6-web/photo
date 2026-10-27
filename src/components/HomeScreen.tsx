/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Upload,
  Camera,
  Sun,
  Smile,
  Glasses,
  UserCheck,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import samplePortraitUrl from '../assets/images/passport_sample_portrait_1793111919167.jpg';

interface HomeScreenProps {
  onImageSelected: (src: string, file?: File) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImageSelected(event.target.result as string, file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImageSelected(event.target.result as string, file);
      }
    };
    reader.readAsDataURL(file);
  };

  const startWebcam = async () => {
    try {
      setIsWebcamOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Could not access camera. Please allow camera permissions or upload a photo.');
      setIsWebcamOpen(false);
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
      onImageSelected(dataUrl);
    }
    stopWebcam();
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsWebcamOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8">
      {/* Hero Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Create Official Passport & Visa Photos
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Crop to exact international dimensions at 300 DPI, remove or change background with local AI, and print multiple photos on photo paper.
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {isWebcamOpen ? (
          <div className="relative w-full h-[400px] bg-black rounded-xl overflow-hidden flex flex-col items-center justify-center">
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
                <span>Capture Photo</span>
              </button>
              <button
                onClick={stopWebcam}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 hover:border-indigo-500/80 rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-colors bg-zinc-950/40 hover:bg-zinc-950/70 group"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shadow-inner">
              <Upload className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-bold text-white mb-1">
              Add Passport Photo
            </h2>
            <p className="text-xs text-zinc-400 mb-6 max-w-sm mx-auto">
              Drag and drop your photo here, or browse from your phone/computer. Original resolution is preserved with zero compression.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload from Device</span>
              </button>

              <button
                type="button"
                onClick={startWebcam}
                className="w-full sm:w-auto px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Take with Webcam</span>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-center gap-1.5 text-xs text-zinc-400" onClick={(e) => e.stopPropagation()}>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Want to test quickly?</span>
              <button
                type="button"
                onClick={() => onImageSelected(samplePortraitUrl)}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline ml-1"
              >
                Use Sample Studio Portrait
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

      {/* Helpful Tips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Essential Tips for a Valid Passport Photo</span>
          </h3>
          <span className="text-[11px] font-mono text-zinc-400">ICAO & Embassy Approved</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tip 1 */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <Sun className="w-4 h-4" />
            </div>
            <div className="font-semibold text-xs text-white">1. Bright, Even Lighting</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Face natural light or a window. Avoid strong shadows on either side of the face or behind your neck.
            </p>
          </div>

          {/* Tip 2 */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
              <Smile className="w-4 h-4" />
            </div>
            <div className="font-semibold text-xs text-white">2. Neutral Expression</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Look straight into the lens with both eyes open and mouth closed. Relaxed, natural expression without teeth showing.
            </p>
          </div>

          {/* Tip 3 */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400">
              <Glasses className="w-4 h-4" />
            </div>
            <div className="font-semibold text-xs text-white">3. No Glasses or Hats</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Remove all eyeglasses and hats (except religious coverings). Keep hair tucked behind ears so full face is visible.
            </p>
          </div>

          {/* Tip 4 */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="font-semibold text-xs text-white">4. Leave Head Space</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Frame from the chest up. Leaving margin above hair allows the biometric guide to align chin to crown accurately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
