/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Camera, FileCode, HelpCircle, Printer } from 'lucide-react';

interface HeaderProps {
  activeStep: 'crop' | 'background' | 'sheet';
  onSelectStep: (step: 'crop' | 'background' | 'sheet') => void;
  onOpenStandards: () => void;
  onOpenExportModal: () => void;
  onTriggerPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
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
