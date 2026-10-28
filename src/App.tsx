/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Camera, Printer, MessageCircle, AlertCircle, Phone, Mail, PlusCircle } from 'lucide-react';
import { HomeScreen } from './components/HomeScreen.tsx';
import { CropStep } from './components/CropStep.tsx';
import { BackgroundStep } from './components/BackgroundStep.tsx';
import { PrintSheetStep } from './components/PrintSheetStep.tsx';
import { PrivacyPolicyModal, TermsConditionsModal, SupportModal } from './components/LegalModals.tsx';
import { BrandLogoHorizontal, BrandAssetModal } from './components/BrandIdentity.tsx';
import brandConceptImg from './assets/images/photo_studio_brand_identity_1793158006074.jpg';
import { PASSPORT_PRESETS } from './constants/presets.ts';
import { PassportPreset } from './types.ts';

interface HeaderProps {
  activeStep: 'crop' | 'background' | 'sheet';
  hasImage: boolean;
  onSelectStep: (step: 'crop' | 'background' | 'sheet') => void;
  onNewPhoto: () => void;
  onOpenSupport: () => void;
  onOpenBrand: () => void;
  onTriggerPrint: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activeStep,
  hasImage,
  onSelectStep,
  onNewPhoto,
  onOpenSupport,
  onOpenBrand,
  onTriggerPrint,
}) => {
  return (
    <header id="app-header" className="border-b border-zinc-800 bg-[#0B1020]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark with precision geometric symbol */}
        <button
          onClick={onOpenBrand}
          className="flex items-center gap-3 shrink-0 text-left hover:opacity-90 transition-opacity cursor-pointer group"
          title="Click to view Photo Studio Brand Identity & Vector Assets"
        >
          <BrandLogoHorizontal size={32} />
        </button>

        {/* Zone 2: Navigation Links (when image loaded) */}
        {hasImage ? (
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-zinc-400">
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
          </nav>
        ) : (
          <div className="hidden sm:block text-xs text-zinc-400 font-mono">
            Biometric Standards · Free AI Studio
          </div>
        )}

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {hasImage && (
            <button
              onClick={onNewPhoto}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-lg transition-colors whitespace-nowrap"
              title="Add another photo from homescreen"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">New Photo</span>
            </button>
          )}

          <button
            onClick={onOpenSupport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800/60 rounded-lg transition-colors whitespace-nowrap"
            title="Need Help? Contact Support"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">WhatsApp Help</span>
            <span className="sm:hidden">Help</span>
          </button>

          {hasImage && (
            <button
              onClick={onTriggerPrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30 whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default function App() {
  const [activeStep, setActiveStep] = useState<'crop' | 'background' | 'sheet'>('crop');
  // Starts on Clean Homescreen with Add Image and Tips
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PassportPreset>(PASSPORT_PRESETS[0]);
  const [croppedCanvas, setCroppedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [finalCanvas, setFinalCanvas] = useState<HTMLCanvasElement | null>(null);

  // Legal & Support & Brand Modals
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);

  // User selects an image on Homescreen
  const handleImageSelected = (src: string) => {
    setImageSrc(src);
    setActiveStep('crop');
    setCroppedCanvas(null);
    setFinalCanvas(null);
  };

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
        hasImage={Boolean(imageSrc)}
        onSelectStep={setActiveStep}
        onNewPhoto={() => {
          setImageSrc(null);
          setCroppedCanvas(null);
          setFinalCanvas(null);
        }}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenBrand={() => setIsBrandOpen(true)}
        onTriggerPrint={handleTriggerPrint}
      />

      {/* Main Studio Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5">
        {/* Support Notification Banner */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-300 no-print">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              If any error occurs or AI processing fails, contact Support at{' '}
              <a href="mailto:admin@amitjoshi.info.np" className="text-indigo-400 font-semibold hover:underline">
                admin@amitjoshi.info.np
              </a>{' '}
              or WhatsApp at{' '}
              <a
                href="https://wa.me/9779746241860"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 font-semibold hover:underline"
              >
                +977 9746241860
              </a>.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="mailto:admin@amitjoshi.info.np"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-[11px] text-zinc-200 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Email</span>
            </a>
            <a
              href="https://wa.me/9779746241860"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900/80 border border-emerald-800/60 rounded text-[11px] text-emerald-300 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Condition: Show Homescreen if no image selected */}
        {!imageSrc ? (
          <HomeScreen onImageSelected={handleImageSelected} />
        ) : (
          <>
            {/* Step Indicator Bar */}
            <div id="studio-workflow-nav" className="flex items-center justify-between border-b border-zinc-850 pb-3 no-print">
              <div className="flex items-center gap-1 sm:gap-4 text-xs overflow-x-auto py-1">
                <button
                  onClick={() => setActiveStep('crop')}
                  className={`flex items-center gap-2 py-1.5 px-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeStep === 'crop'
                      ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-700/60 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-mono">1</span>
                  <span>1. Biometric Crop</span>
                </button>

                <span className="text-zinc-600">/</span>

                <button
                  onClick={() => {
                    if (croppedCanvas) setActiveStep('background');
                  }}
                  disabled={!croppedCanvas}
                  className={`flex items-center gap-2 py-1.5 px-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeStep === 'background'
                      ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-700/60 shadow-sm'
                      : croppedCanvas
                      ? 'text-zinc-400 hover:text-zinc-200'
                      : 'text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-mono">2</span>
                  <span>2. AI Background & Retouch</span>
                </button>

                <span className="text-zinc-600">/</span>

                <button
                  onClick={() => {
                    if (finalCanvas || croppedCanvas) setActiveStep('sheet');
                  }}
                  disabled={!croppedCanvas}
                  className={`flex items-center gap-2 py-1.5 px-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeStep === 'sheet'
                      ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-700/60 shadow-sm'
                      : croppedCanvas
                      ? 'text-zinc-400 hover:text-zinc-200'
                      : 'text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-mono">3</span>
                  <span>3. Print Sheet</span>
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
          </>
        )}

        {/* Dedicated Container / Slot for Future Google Ads */}
        <div
          id="ad-space"
          className="w-full my-6 min-h-[90px] bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 text-xs text-center p-4 no-print transition-all"
        >
          <span className="font-mono text-[11px] text-zinc-400">
            Advertisement Space · Google AdSense Responsive Banner Container
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer id="app-footer" className="border-t border-zinc-900 bg-zinc-950 py-5 px-4 sm:px-6 text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl w-full mx-auto no-print">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-center">
          <span>© 2026 Passport Photo Studio</span>
          <span>·</span>
          <span className="font-mono text-zinc-300">pic.amitjoshi.info.np</span>
          <span>·</span>
          <span>Support: <a href="mailto:admin@amitjoshi.info.np" className="text-indigo-400 hover:underline">admin@amitjoshi.info.np</a></span>
          <span>·</span>
          <span>WhatsApp: <a href="https://wa.me/9779746241860" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">+977 9746241860</a></span>
        </div>

        <div className="flex items-center gap-4 text-zinc-400">
          <button
            onClick={() => setIsPrivacyOpen(true)}
            className="hover:text-zinc-200 transition-colors"
          >
            Privacy Policy
          </button>
          <span>·</span>
          <button
            onClick={() => setIsTermsOpen(true)}
            className="hover:text-zinc-200 transition-colors"
          >
            Terms & Conditions
          </button>
          <span>·</span>
          <button
            onClick={() => setIsBrandOpen(true)}
            className="hover:text-cyan-300 text-cyan-400 font-medium transition-colors"
          >
            Brand Assets (SVG)
          </button>
          <span>·</span>
          <button
            onClick={() => setIsSupportOpen(true)}
            className="hover:text-zinc-200 transition-colors text-indigo-400"
          >
            Support
          </button>
        </div>
      </footer>

      {/* Modals */}
      <BrandAssetModal
        isOpen={isBrandOpen}
        onClose={() => setIsBrandOpen(false)}
        brandSheetUrl={brandConceptImg}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <TermsConditionsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
}
