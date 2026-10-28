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
  CheckCircle2,
  FileCheck2,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Compass,
  ArrowRight,
  Sliders,
  Layers,
  Lock,
  Globe
} from 'lucide-react';
import { BrandSymbol } from './BrandIdentity.tsx';
import samplePortraitUrl from '../assets/images/passport_sample_portrait_1793111919167.jpg';
import { PASSPORT_PRESETS } from '../constants/presets.ts';
import { PassportPreset } from '../types.ts';

interface HomeScreenProps {
  onImageSelected: (src: string, file?: File) => void;
  selectedPreset?: PassportPreset;
  onSelectPreset?: (preset: PassportPreset) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onImageSelected,
  selectedPreset = PASSPORT_PRESETS[0],
  onSelectPreset,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    // Validate size (max 25MB)
    const MAX_SIZE_MB = 25;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`The selected file is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select an image under ${MAX_SIZE_MB} MB.`);
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Unsupported file format. Please upload a standard photograph (JPEG, PNG, WebP, or HEIC).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setIsProcessing(false);
      if (event.target?.result) {
        onImageSelected(event.target.result as string, file);
      }
    };
    reader.onerror = () => {
      setIsProcessing(false);
      setErrorMessage('Failed to read the image file. Please try another photo or device.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const startWebcam = async () => {
    try {
      setErrorMessage(null);
      setIsWebcamOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setErrorMessage('Could not access camera. Please allow camera permissions in your browser or upload a saved photo.');
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

  const scrollToTools = () => {
    document.getElementById('presets-guide-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    {
      q: 'What is the standard passport photo size for Nepal & internationally?',
      a: 'The international standard (ICAO 9303) and Department of Passports Nepal standard is 35 × 45 mm (3.5 × 4.5 cm). The United States requires 2 × 2 inches (51 × 51 mm). India accepts 35 × 45 mm for regular passports and 2 × 2 inches for OCI cards. Our studio provides verified size presets with biometric head-height ratio guides for all major destinations.',
    },
    {
      q: 'How do I print passport photos on standard A4 paper?',
      a: 'A4 (210 × 297 mm) is our default sheet option. Step 3 automatically arranges your photos on an A4 sheet (fitting up to 30 photos). You can choose any custom number of copies, and print directly via Ctrl+P with margins set to "None" and scale set to "100%", or download a 300 DPI JPEG or PDF.',
    },
    {
      q: 'Are my uploaded photographs stored on your servers?',
      a: 'No. All photo processing—cropping, biometric alignment, AI background removal, and print-sheet generation—executes 100% locally on your computer or mobile phone inside your browser engine. Zero images or biometric data are transmitted to any cloud database.',
    },
    {
      q: 'Can I print a custom number of photos on a single sheet?',
      a: 'Yes. In the Print Sheet step, you can select any exact number of photos you need (e.g. 1, 2, 4, 8, 12, or custom count) using the numeric stepper or quick preset buttons. You can also drag photos to reorder slots or click empty slots to toggle placement.',
    },
    {
      q: 'What does 300 DPI mean and why is it required for passport photos?',
      a: 'DPI (Dots Per Inch) determines print sharpness. Embassies and passport offices reject pixelated prints under 300 DPI. A standard 35×45 mm photo at 300 DPI has an exact canvas size of 413 × 531 pixels, ensuring facial features and eyes are crisp.',
    },
    {
      q: 'What background colors are accepted for visa and passport submissions?',
      a: 'Over 95% of countries (including Nepal, US, Schengen, UK, India, and Canada) require a plain white or light off-white background. Our AI tool isolates the subject and composites it onto official white or approved backdrop colors instantly.',
    },
  ];

  return (
    <div className="space-y-12 py-2 sm:py-6">
      {/* 1. Hero Section */}
      <section className="text-center space-y-4 max-w-4xl mx-auto px-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/50 border border-indigo-800/60 text-indigo-300 text-xs font-semibold shadow-sm">
          <BrandSymbol size={18} />
          <span>Passport Photo Studio · 300 DPI Biometric Lab</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Create Passport Photos Online in Minutes
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          Prepare official biometric passport, visa, and ID photos directly in your browser. Crop to exact millimeter specifications, replace backgrounds with local AI, and print custom quantities on A4 photo paper.
        </p>

        {/* Hero Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo Now</span>
          </button>

          <button
            type="button"
            onClick={scrollToTools}
            className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Explore Photo Presets</span>
          </button>
        </div>

        {/* Trust & Real Capability Indicators */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400 font-medium">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Private · Zero Cloud Uploads</span>
          </span>
          <span className="hidden sm:inline text-zinc-700">·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>300 DPI High-Resolution Export</span>
          </span>
          <span className="hidden sm:inline text-zinc-700">·</span>
          <span className="flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Custom Number of Copies on A4</span>
          </span>
        </div>
      </section>

      {/* 2. Main Photo Upload & Studio Area */}
      <section className="max-w-4xl mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-rose-300">File Notice: </span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {isWebcamOpen ? (
            <div className="relative w-full h-[380px] sm:h-[460px] bg-black rounded-xl overflow-hidden flex flex-col items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={captureWebcam}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
                <button
                  type="button"
                  onClick={stopWebcam}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg cursor-pointer"
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
              className="border-2 border-dashed border-zinc-700 hover:border-indigo-500/80 rounded-xl p-6 sm:p-12 text-center cursor-pointer transition-colors bg-zinc-950/40 hover:bg-zinc-950/70 group"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shadow-inner">
                {isProcessing ? (
                  <Sparkles className="w-8 h-8 animate-pulse text-indigo-300" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5">
                {isProcessing ? 'Processing Image...' : 'Drop Photo Here or Click to Browse'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">
                Upload a portrait taken against any wall or background. Supported formats: JPEG, PNG, WebP, HEIC (up to 25 MB).
              </p>

              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Select from Computer / Phone</span>
                </button>

                <button
                  type="button"
                  onClick={startWebcam}
                  className="w-full sm:w-auto px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Use Camera / Webcam</span>
                </button>
              </div>

              {/* Sample portrait quick launcher */}
              <div
                className="mt-6 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-center gap-1.5 text-xs text-zinc-400"
                onClick={(e) => e.stopPropagation()}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Want to test immediately without a photo?</span>
                <button
                  type="button"
                  onClick={() => onImageSelected(samplePortraitUrl)}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline ml-1 cursor-pointer"
                >
                  Try Sample Biometric Portrait
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
      </section>

      {/* 3. Photo Size Presets Guide Table & Quick Switcher */}
      <section id="presets-guide-section" className="max-w-5xl mx-auto space-y-4 px-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>International Passport & Visa Size Presets</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Verified dimensional standards with 300 DPI pixel rendering and ICAO chin-to-crown guides.
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Standard 300 DPI</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PASSPORT_PRESETS.map((preset) => {
            const isSelected = selectedPreset?.id === preset.id;
            const pxWidth = Math.round((preset.widthMm / 25.4) * 300);
            const pxHeight = Math.round((preset.heightMm / 25.4) * 300);

            return (
              <div
                key={preset.id}
                onClick={() => onSelectPreset?.(preset)}
                className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                    : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{preset.name}</span>
                    {isSelected && (
                      <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-950 border border-indigo-800/80 px-1.5 py-0.2 rounded">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-medium">{preset.country}</div>
                  <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed pt-1">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>{preset.widthMm} × {preset.heightMm} mm</span>
                  <span className="text-indigo-400">{pxWidth} × {pxHeight} px</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. How It Works (4 Simple Steps) */}
      <section className="max-w-5xl mx-auto space-y-4 px-2">
        <div className="border-b border-zinc-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>How Passport Photo Studio Works</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Four simple steps from smartphone snapshot to embassy-ready A4 print sheets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center font-mono font-bold text-xs text-indigo-400">
              01
            </div>
            <div className="font-semibold text-xs text-white">Upload or Capture</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Upload a front-facing portrait from your phone or use your webcam. Original pixel detail is preserved without lossy downscaling.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center font-mono font-bold text-xs text-cyan-400">
              02
            </div>
            <div className="font-semibold text-xs text-white">Biometric Crop</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Position your face inside the ICAO oval guide. Ensure eyes match the horizontal reference line and the face covers 70% to 80% of the height.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
              03
            </div>
            <div className="font-semibold text-xs text-white">Backdrop & Lighting</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Use local AI or color-keying to extract backgrounds and composite onto embassy-approved white or light blue. Adjust contrast and facial sharpness.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/50 flex items-center justify-center font-mono font-bold text-xs text-amber-400">
              04
            </div>
            <div className="font-semibold text-xs text-white">Custom A4 Print Sheet</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Choose your exact copy count on A4 or 4×6 photo paper. Download 300 DPI high-res JPEG/PDF or print immediately from your browser.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Essential Biometric Photo Guidelines Checklist */}
      <section className="max-w-5xl mx-auto space-y-4 px-2">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Photo Acceptance Guidelines</span>
          </h3>
          <span className="text-[11px] font-mono text-zinc-400">ICAO 9303 Compliant</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <Sun className="w-4 h-4" />
            </div>
            <div className="font-semibold text-xs text-white">1. Bright, Even Lighting</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Face a bright window or soft ambient light. Avoid harsh shadows on the side of the face or behind your neck.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
              <Smile className="w-4 h-4" />
            </div>
            <div className="font-semibold text-xs text-white">2. Neutral Facial Expression</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Look directly into the camera with both eyes open and mouth closed. Relax your expression without showing teeth.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400">
              <Glasses className="w-4 h-4" />
            </div>
            <div className="font-semibold text-xs text-white">3. No Glasses or Hats</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Remove eyeglasses and headwear (except religious attire). Keep hair tucked back so forehead and ears are visible.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="font-semibold text-xs text-white">4. Chest-Up Framing</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Stand approximately 1 meter from the camera, framed from chest to crown, giving headroom for precise biometric cropping.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Dedicated Advertisement Slot (Responsive & Transparently Labeled) */}
      <section className="max-w-5xl mx-auto px-2 no-print">
        <div
          id="ad-space-home"
          className="w-full min-h-[90px] bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500 text-xs text-center p-4 transition-all"
        >
          <span className="font-mono text-[11px] text-zinc-400">
            Advertisement Space · Google AdSense Responsive Display Banner
          </span>
          <span className="text-[10px] text-zinc-600 mt-0.5">
            Non-intrusive container reserved to prevent layout shifts.
          </span>
        </div>
      </section>

      {/* 7. Frequently Asked Questions (Accordion) */}
      <section className="max-w-4xl mx-auto space-y-4 px-2">
        <div className="border-b border-zinc-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Frequently Asked Questions</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Answers to common questions about passport photo requirements, paper dimensions, and printing.
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div
                key={index}
                className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
