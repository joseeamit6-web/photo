/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Camera, FileCode, HelpCircle, Printer } from 'lucide-react';
import { CropStep } from './components/CropStep.tsx';
import { BackgroundStep } from './components/BackgroundStep.tsx';
import { PrintSheetStep } from './components/PrintSheetStep.tsx';
import { StandardsGuideModal } from './components/StandardsGuideModal.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { PASSPORT_PRESETS } from './constants/presets.ts';
import { PassportPreset } from './types.ts';
import samplePortraitUrl from './assets/images/passport_sample_portrait_1793111919167.jpg';

interface HeaderProps {
  activeStep: 'crop' | 'background' | 'sheet';
  onSelectStep: (step: 'crop' | 'background' | 'sheet') => void;
  onOpenStandards: () => void;
  onOpenExportModal: () => void;
  onTriggerPrint: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activeStep,
  onSelectStep,
  onOpenStandards,
  onOpenExportModal,
  onTriggerPrint,
}) => {
  return (
    <header id="app-header" className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap block">
              Passport Photo Studio
            </span>
            <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap block">
              pic.amitjoshi.info.np · 300 DPI
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
          <button
            onClick={() => onSelectStep('crop')}
            className={`whitespace-nowrap transition-colors py-1 hover:text-white ${
              activeStep === 'crop' ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500' : ''
            }`}
          >
            1. Crop & Biometrics
          </button>
          <button
            onClick={() => onSelectStep('background')}
            className={`whitespace-nowrap transition-colors py-1 hover:text-white ${
              activeStep === 'background' ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500' : ''
            }`}
          >
            2. AI Background & Retouch
          </button>
          <button
            onClick={() => onSelectStep('sheet')}
            className={`whitespace-nowrap transition-colors py-1 hover:text-white ${
              activeStep === 'sheet' ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500' : ''
            }`}
          >
            3. Multi-Photo Sheet
          </button>
          <button
            onClick={onOpenStandards}
            className="flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-white text-zinc-400"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Embassy Specs</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenExportModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-lg transition-colors whitespace-nowrap"
            title="Download standalone single HTML file for GitHub Pages"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>GitHub Pages HTML</span>
          </button>

          <button
            onClick={onTriggerPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30 whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default function App() {
  const [activeStep, setActiveStep] = useState<'crop' | 'background' | 'sheet'>('crop');
  // Initialize with sample portrait so the app is instantly testable and visually rich!
  const [imageSrc, setImageSrc] = useState<string | null>(samplePortraitUrl);
  const [selectedPreset, setSelectedPreset] = useState<PassportPreset>(PASSPORT_PRESETS[0]);
  const [croppedCanvas, setCroppedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [finalCanvas, setFinalCanvas] = useState<HTMLCanvasElement | null>(null);

  // Modals
  const [isStandardsModalOpen, setIsStandardsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Crop completion callback
  const handleCropComplete = (canvas: HTMLCanvasElement) => {
    setCroppedCanvas(canvas);
    setActiveStep('background');
  };

  // Background step completion callback
  const handleProceedToSheet = (canvas: HTMLCanvasElement) => {
    setFinalCanvas(canvas);
    setActiveStep('sheet');
  };

  // Print trigger
  const handleTriggerPrint = () => {
    if (activeStep !== 'sheet') {
      setActiveStep('sheet');
      setTimeout(() => {
        window.print();
      }, 400);
    } else {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 3-Zone Top Navigation Bar */}
      <Header
        activeStep={activeStep}
        onSelectStep={setActiveStep}
        onOpenStandards={() => setIsStandardsModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onTriggerPrint={handleTriggerPrint}
      />

      {/* Main Studio Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Step Indicator Bar */}
        <div id="studio-workflow-nav" className="flex items-center justify-between border-b border-zinc-850 pb-4 no-print">
          <div className="flex items-center gap-1 sm:gap-4 text-xs">
            <button
              onClick={() => setActiveStep('crop')}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-lg font-medium transition-all ${
                activeStep === 'crop'
                  ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-700/60 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-mono">1</span>
              <span className="hidden sm:inline">Biometric Crop</span>
            </button>

            <span className="text-zinc-600">/</span>

            <button
              onClick={() => {
                if (croppedCanvas) setActiveStep('background');
              }}
              disabled={!croppedCanvas}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-lg font-medium transition-all ${
                activeStep === 'background'
                  ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-700/60 shadow-sm'
                  : croppedCanvas
                  ? 'text-zinc-400 hover:text-zinc-200'
                  : 'text-zinc-600 cursor-not-allowed'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-mono">2</span>
              <span className="hidden sm:inline">AI Background & Retouch</span>
            </button>

            <span className="text-zinc-600">/</span>

            <button
              onClick={() => {
                if (finalCanvas || croppedCanvas) setActiveStep('sheet');
              }}
              disabled={!croppedCanvas}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-lg font-medium transition-all ${
                activeStep === 'sheet'
                  ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-700/60 shadow-sm'
                  : croppedCanvas
                  ? 'text-zinc-400 hover:text-zinc-200'
                  : 'text-zinc-600 cursor-not-allowed'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-mono">3</span>
              <span className="hidden sm:inline">Print Sheet Generator</span>
            </button>
          </div>

          <div className="text-xs text-zinc-400 font-mono hidden md:block">
            <span>ICAO 9303 Standard</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span className="text-emerald-400">300 DPI Lossless</span>
          </div>
        </div>

        {/* Step 1: Crop & Biometrics */}
        {activeStep === 'crop' && (
          <CropStep
            imageSrc={imageSrc}
            onImageLoaded={(src) => {
              setImageSrc(src);
              setCroppedCanvas(null);
              setFinalCanvas(null);
            }}
            selectedPreset={selectedPreset}
            onPresetChange={setSelectedPreset}
            onCropComplete={handleCropComplete}
          />
        )}

        {/* Step 2: AI Background Removal & Retouching */}
        {activeStep === 'background' && (
          <BackgroundStep
            croppedCanvas={croppedCanvas}
            selectedPreset={selectedPreset}
            onBackToCrop={() => setActiveStep('crop')}
            onProceedToSheet={handleProceedToSheet}
          />
        )}

        {/* Step 3: Print Sheet Generator */}
        {activeStep === 'sheet' && (
          <PrintSheetStep
            finalPhotoCanvas={finalCanvas || croppedCanvas}
            selectedPreset={selectedPreset}
            onBackToBackground={() => setActiveStep('background')}
          />
        )}
      </main>

      {/* Footer */}
      <footer id="app-footer" className="border-t border-zinc-900 bg-zinc-950 py-4 px-6 text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl w-full mx-auto no-print">
        <div className="flex items-center gap-2">
          <span>Passport Photo Studio</span>
          <span>·</span>
          <span className="font-mono text-zinc-300">pic.amitjoshi.info.np</span>
          <span>·</span>
          <span>100% In-Browser Privacy</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <button
            onClick={() => setIsStandardsModalOpen(true)}
            className="hover:text-zinc-200 transition-colors"
          >
            Embassy Guidelines
          </button>
          <span>·</span>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="hover:text-zinc-200 transition-colors text-indigo-400"
          >
            GitHub Pages Deploy
          </button>
        </div>
      </footer>

      {/* Standards & Embassy Specs Modal */}
      <StandardsGuideModal
        isOpen={isStandardsModalOpen}
        onClose={() => setIsStandardsModalOpen(false)}
        onSelectPreset={(presetId) => {
          const p = PASSPORT_PRESETS.find((item) => item.id === presetId);
          if (p) setSelectedPreset(p);
        }}
      />

      {/* GitHub Pages Standalone Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
