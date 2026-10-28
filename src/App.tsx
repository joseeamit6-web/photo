/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Printer,
  MessageCircle,
  AlertCircle,
  Phone,
  Mail,
  PlusCircle,
  Menu,
  X,
  Compass,
  ShieldCheck,
  Sun,
  Moon,
  Sparkles,
  Layers,
  Lock
} from 'lucide-react';
import { HomeScreen } from './components/HomeScreen.tsx';
import { CropStep } from './components/CropStep.tsx';
import { BackgroundStep } from './components/BackgroundStep.tsx';
import { PrintSheetStep } from './components/PrintSheetStep.tsx';
import { PrivacyPolicyModal, TermsConditionsModal, SupportModal } from './components/LegalModals.tsx';
import { BrandLogoHorizontal } from './components/BrandIdentity.tsx';
import { PASSPORT_PRESETS } from './constants/presets.ts';
import { PassportPreset } from './types.ts';

interface HeaderProps {
  activeStep: 'crop' | 'background' | 'sheet';
  hasImage: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSelectStep: (step: 'crop' | 'background' | 'sheet') => void;
  onNewPhoto: () => void;
  onOpenSupport: () => void;
  onOpenPrivacy: () => void;
  onTriggerPrint: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activeStep,
  hasImage,
  theme,
  onToggleTheme,
  onSelectStep,
  onNewPhoto,
  onOpenSupport,
  onOpenPrivacy,
  onTriggerPrint,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="app-header"
      className="border-b border-zinc-800 bg-[#0B1020]/95 backdrop-blur-md sticky top-0 z-40 w-full max-w-full"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark with precision geometric symbol */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onNewPhoto}
            className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity cursor-pointer group"
            title="Passport Photo Studio · Home"
            aria-label="Passport Photo Studio Home"
          >
            <BrandLogoHorizontal size={28} />
          </button>
        </div>

        {/* Zone 2: Navigation Links & Nepal Live Clock */}
        <div className="hidden lg:flex items-center gap-5 text-xs font-medium text-zinc-400">
          {hasImage ? (
            <nav className="flex items-center gap-4 text-xs font-medium text-zinc-400" aria-label="Editor Workflow Steps">
              <button
                type="button"
                onClick={() => onSelectStep('crop')}
                className={`whitespace-nowrap transition-colors py-1 hover:text-white cursor-pointer ${
                  activeStep === 'crop' ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500' : ''
                }`}
              >
                1. Biometric Crop
              </button>
              <button
                type="button"
                onClick={() => onSelectStep('background')}
                className={`whitespace-nowrap transition-colors py-1 hover:text-white cursor-pointer ${
                  activeStep === 'background' ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500' : ''
                }`}
              >
                2. AI Backdrop & Retouch
              </button>
              <button
                type="button"
                onClick={() => onSelectStep('sheet')}
                className={`whitespace-nowrap transition-colors py-1 hover:text-white cursor-pointer ${
                  activeStep === 'sheet' ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500' : ''
                }`}
              >
                3. A4 Print Sheet
              </button>
            </nav>
          ) : (
            <nav className="flex items-center gap-5 text-xs text-zinc-400 font-medium" aria-label="Main Navigation">
              <button
                type="button"
                onClick={() => scrollToSection('presets-guide-section')}
                className="hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Photo Presets
              </button>
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Privacy & Security
              </button>
              <button
                type="button"
                onClick={onOpenSupport}
                className="hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Help & Contact
              </button>
            </nav>
          )}
        </div>

        {/* Zone 3: Primary Actions, Theme Toggle & Mobile Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* New Photo Action (when photo loaded) */}
          {hasImage && (
            <button
              type="button"
              onClick={onNewPhoto}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              title="Add a new photo from the homescreen"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">New Photo</span>
            </button>
          )}

          {/* WhatsApp Support Action */}
          <button
            type="button"
            onClick={onOpenSupport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/70 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Need Help? Contact Support via WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">WhatsApp Help</span>
            <span className="sm:hidden">Help</span>
          </button>

          {/* Primary Print Trigger (when photo loaded) */}
          {hasImage && (
            <button
              type="button"
              onClick={onTriggerPrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30 whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Toggle mobile navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-[#0B1020] px-4 py-3 space-y-3 no-print max-w-full">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
            <span className="font-semibold text-zinc-300">Studio Menu</span>
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </button>
          </div>

          <div className="flex flex-col gap-2 text-xs font-medium text-zinc-300">
            {hasImage ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onSelectStep('crop');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left py-2 px-3 rounded-lg ${activeStep === 'crop' ? 'bg-indigo-950 text-indigo-300' : 'hover:bg-zinc-900'}`}
                >
                  1. Biometric Crop
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectStep('background');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left py-2 px-3 rounded-lg ${activeStep === 'background' ? 'bg-indigo-950 text-indigo-300' : 'hover:bg-zinc-900'}`}
                >
                  2. AI Backdrop & Retouch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectStep('sheet');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left py-2 px-3 rounded-lg ${activeStep === 'sheet' ? 'bg-indigo-950 text-indigo-300' : 'hover:bg-zinc-900'}`}
                >
                  3. A4 Print Sheet
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => scrollToSection('presets-guide-section')}
                  className="text-left py-2 px-3 rounded-lg hover:bg-zinc-900"
                >
                  International Size Presets
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenPrivacy();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 px-3 rounded-lg hover:bg-zinc-900"
                >
                  Privacy Policy & Zero Cloud Uploads
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenSupport();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 px-3 rounded-lg hover:bg-zinc-900 text-emerald-400"
                >
                  Contact Support (WhatsApp / Email)
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default function App() {
  const [activeStep, setActiveStep] = useState<'crop' | 'background' | 'sheet'>('crop');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PassportPreset>(PASSPORT_PRESETS[0]);
  const [croppedCanvas, setCroppedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [finalCanvas, setFinalCanvas] = useState<HTMLCanvasElement | null>(null);

  // Theme Management (Defaults to dark, safely persisted in localStorage)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('passport_studio_theme');
        if (stored === 'light' || stored === 'dark') return stored;
      }
    } catch {
      // Sandboxed iframes may restrict localStorage access
    }
    return 'dark';
  });

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.body.style.backgroundColor = '#09090b';
        document.body.style.color = '#f4f4f5';
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.body.style.backgroundColor = '#f8fafc';
        document.body.style.color = '#0f172a';
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('passport_studio_theme', theme);
      }
    } catch {
      // Sandboxed iframes safe
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Local Session Photo Counter (Private in-memory session count with safe fallback)
  const [sessionPhotosCount, setSessionPhotosCount] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = window.sessionStorage.getItem('passport_session_photos');
        return stored ? parseInt(stored, 10) : 0;
      }
    } catch {
      // Sandboxed iframes safe
    }
    return 0;
  });

  const incrementSessionCount = () => {
    setSessionPhotosCount((prev) => {
      const updated = prev + 1;
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem('passport_session_photos', updated.toString());
        }
      } catch {
        // Sandboxed iframes safe
      }
      return updated;
    });
  };

  // Legal & Support Modals
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // User selects an image on Homescreen
  const handleImageSelected = (src: string) => {
    setImageSrc(src);
    setActiveStep('crop');
    setCroppedCanvas(null);
    setFinalCanvas(null);
    incrementSessionCount();
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden w-full max-w-full">
      {/* Responsive Top Navigation Header with Theme Toggle */}
      <Header
        activeStep={activeStep}
        hasImage={Boolean(imageSrc)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSelectStep={setActiveStep}
        onNewPhoto={() => {
          setImageSrc(null);
          setCroppedCanvas(null);
          setFinalCanvas(null);
        }}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onTriggerPrint={handleTriggerPrint}
      />

      {/* Main Studio Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 overflow-x-hidden">
        {/* Support Notification Banner with direct WhatsApp and Email */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-300 no-print">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Direct assistance & troubleshooting: contact Support at{' '}
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
          <HomeScreen
            onImageSelected={handleImageSelected}
            selectedPreset={selectedPreset}
            onSelectPreset={setSelectedPreset}
          />
        ) : (
          <>
            {/* Step Indicator Bar with responsive layout locking */}
            <div id="studio-workflow-nav" className="flex items-center justify-between border-b border-zinc-800 pb-3 no-print max-w-full overflow-hidden">
              <div className="flex items-center gap-1 sm:gap-3 text-xs overflow-x-auto py-1 max-w-full">
                <button
                  type="button"
                  onClick={() => setActiveStep('crop')}
                  className={`flex items-center gap-2 py-1.5 px-3 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
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
                  type="button"
                  onClick={() => {
                    if (croppedCanvas) setActiveStep('background');
                  }}
                  disabled={!croppedCanvas}
                  className={`flex items-center gap-2 py-1.5 px-3 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeStep === 'background'
                      ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-700/60 shadow-sm'
                      : croppedCanvas
                      ? 'text-zinc-400 hover:text-zinc-200'
                      : 'text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-mono">2</span>
                  <span>2. AI Backdrop & Retouch</span>
                </button>

                <span className="text-zinc-600">/</span>

                <button
                  type="button"
                  onClick={() => {
                    if (finalCanvas || croppedCanvas) setActiveStep('sheet');
                  }}
                  disabled={!croppedCanvas}
                  className={`flex items-center gap-2 py-1.5 px-3 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeStep === 'sheet'
                      ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-700/60 shadow-sm'
                      : croppedCanvas
                      ? 'text-zinc-400 hover:text-zinc-200'
                      : 'text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-mono">3</span>
                  <span>3. A4 Print Sheet</span>
                </button>
              </div>

              <div className="text-xs text-zinc-400 font-mono hidden md:flex items-center gap-2">
                <span>Default: A4 Paper</span>
                <span className="text-zinc-600">·</span>
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

            {/* Step 3: Print Sheet Generator with Custom Copies & Default A4 */}
            {activeStep === 'sheet' && (
              <PrintSheetStep
                finalPhotoCanvas={finalCanvas || croppedCanvas}
                selectedPreset={selectedPreset}
                onBackToBackground={() => setActiveStep('background')}
              />
            )}
          </>
        )}

        {/* Dedicated Container / Slot for Advertisements (Non-intrusive container reserved to prevent layout shifts) */}
        <div
          id="ad-space"
          className="w-full my-6 min-h-[90px] bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500 text-xs text-center p-4 no-print transition-all"
        >
          <span className="font-mono text-[11px] text-zinc-400">
            Advertisement Space · Google AdSense Responsive Display Banner
          </span>
          <span className="text-[10px] text-zinc-600 mt-0.5">
            Clear placement reserved away from interactive editing controls.
          </span>
        </div>
      </main>

      {/* Footer with Trust Info, Session Counter & Legal Links */}
      <footer id="app-footer" className="border-t border-zinc-900 bg-zinc-950 py-6 px-4 sm:px-6 text-xs text-zinc-400 max-w-7xl w-full mx-auto no-print space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-center">
            <span className="font-semibold text-zinc-300">Passport Photo Studio</span>
            <span>·</span>
            <span className="font-mono text-zinc-400">pic.amitjoshi.info.np</span>
            <span>·</span>
            <span>Support: <a href="mailto:admin@amitjoshi.info.np" className="text-indigo-400 hover:underline">admin@amitjoshi.info.np</a></span>
            <span>·</span>
            <span>WhatsApp: <a href="https://wa.me/9779746241860" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">+977 9746241860</a></span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Online Studio Active</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-between gap-3 pt-3 border-t border-zinc-900 text-[11px] text-zinc-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-400">
              <Lock className="w-3 h-3" />
              <span>100% Client-Side Processing</span>
            </span>
            <span>·</span>
            <span>Zero server uploads</span>
            {sessionPhotosCount > 0 && (
              <>
                <span>·</span>
                <span className="font-mono text-indigo-400">
                  {sessionPhotosCount} photo{sessionPhotosCount > 1 ? 's' : ''} prepared this session
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsTermsOpen(true)}
              className="hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsSupportOpen(true)}
              className="hover:text-indigo-300 text-indigo-400 transition-colors cursor-pointer"
            >
              Support Help
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
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
