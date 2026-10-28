import React, { useState } from 'react';
import { Copy, Check, Download, Sparkles, X, Layers, Image as ImageIcon } from 'lucide-react';

interface BrandSymbolProps {
  className?: string;
  size?: number;
  monochrome?: boolean;
}

export const BrandSymbol: React.FC<BrandSymbolProps> = ({ className = '', size = 36, monochrome = false }) => {
  const cyan = monochrome ? '#FFFFFF' : '#67E8F9';
  const violet = monochrome ? '#FFFFFF' : '#8B5CF6';
  const frameBorder = monochrome ? '#FFFFFF' : '#67E8F9';
  const irisStroke = monochrome ? '#FFFFFF' : '#8B5CF6';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Photo Studio Brand Symbol"
    >
      {/* 1. Four Precision Crop Corners (Biometric reticle) */}
      <path d="M 12 36 L 12 18 A 6 6 0 0 1 18 12 L 36 12" stroke={cyan} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 84 12 L 102 12 A 6 6 0 0 1 108 18 L 108 36" stroke={violet} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 12 84 L 12 102 A 6 6 0 0 0 18 108 L 36 108" stroke={cyan} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 84 108 L 102 108 A 6 6 0 0 0 108 102 L 108 84" stroke={violet} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

      {/* 2. Square Photograph Frame */}
      <rect x="24" y="24" width="72" height="72" rx="10" fill="#0B1020" stroke={frameBorder} strokeWidth="6" />

      {/* 3. Camera Lens Aperture Ring */}
      <circle cx="60" cy="60" r="22" fill="#0E1726" stroke={irisStroke} strokeWidth="5" />
      
      {/* 6 Iris Blades */}
      <g transform="translate(60, 60)">
        <path d="M 0 -20 L 12 -7 L 6 -4 Z" fill={monochrome ? '#FFFFFF' : '#8B5CF6'} />
        <path d="M 17 -10 L 14 7 L 8 3 Z" fill={monochrome ? '#FFFFFF' : '#67E8F9'} />
        <path d="M 17 10 L 2 14 L 3 7 Z" fill={monochrome ? '#FFFFFF' : '#8B5CF6'} />
        <path d="M 0 20 L -12 7 L -6 4 Z" fill={monochrome ? '#FFFFFF' : '#67E8F9'} />
        <path d="M -17 10 L -14 -7 L -8 -3 Z" fill={monochrome ? '#FFFFFF' : '#8B5CF6'} />
        <path d="M -17 -10 L -2 -14 L -3 -7 Z" fill={monochrome ? '#FFFFFF' : '#67E8F9'} />
        
        {/* Core Aperture Opening */}
        <circle cx="0" cy="0" r="6" fill="#0B1020" stroke={cyan} strokeWidth="2.5" />
        <circle cx="-2" cy="-2" r="1.5" fill="#FFFFFF" />
      </g>
    </svg>
  );
};

export const BrandLogoHorizontal: React.FC<{ className?: string; size?: number; monochrome?: boolean }> = ({
  className = '',
  size = 36,
  monochrome = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className="shrink-0 p-1 rounded-xl bg-[#0B1020] border border-cyan-900/40 shadow-inner flex items-center justify-center">
        <BrandSymbol size={size} monochrome={monochrome} />
      </div>
      <div className="flex flex-col text-left">
        <div className="flex items-center font-bold tracking-tight text-white leading-none text-base sm:text-lg">
          <span>Photo</span>
          <span className={`ml-1 font-semibold ${monochrome ? 'text-zinc-300' : 'text-cyan-400'}`}>Studio</span>
          <span className={monochrome ? 'text-white' : 'text-violet-500'}>.</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 tracking-wider uppercase mt-1">
          Precision Passport &amp; Print
        </span>
      </div>
    </div>
  );
};

interface BrandAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandSheetUrl?: string;
}

export const BrandAssetModal: React.FC<BrandAssetModalProps> = ({ isOpen, onClose, brandSheetUrl }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (filename: string, path: string) => {
    const a = document.createElement('a');
    a.href = path;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0B1020] border border-cyan-900/50 rounded-2xl shadow-2xl p-6 sm:p-8 text-zinc-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 border border-cyan-500/30">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Photo Studio <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">Brand Identity</span>
              </h2>
              <p className="text-xs text-zinc-400">Minimalist geometric symbol &amp; production-ready vector assets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Color Palette Specifications */}
        <div className="mb-6 p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Visual Identity Color Palette
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="w-6 h-6 rounded-md bg-[#0B1020] border border-zinc-700 shadow-sm" />
              <div>
                <div className="font-semibold text-white">Midnight Navy</div>
                <div className="font-mono text-[10px] text-zinc-400">#0B1020 (Base)</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="w-6 h-6 rounded-md bg-[#67E8F9] shadow-sm" />
              <div>
                <div className="font-semibold text-white">Cyan Glow</div>
                <div className="font-mono text-[10px] text-zinc-400">#67E8F9 (Primary)</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="w-6 h-6 rounded-md bg-[#8B5CF6] shadow-sm" />
              <div>
                <div className="font-semibold text-white">Restrained Violet</div>
                <div className="font-mono text-[10px] text-zinc-400">#8B5CF6 (Accent)</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="w-6 h-6 rounded-md bg-[#FFFFFF] shadow-sm" />
              <div>
                <div className="font-semibold text-white">Pure White</div>
                <div className="font-mono text-[10px] text-zinc-400">#FFFFFF (High-DPI)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Sheet Visual Image if available */}
        {brandSheetUrl && (
          <div className="mb-6 rounded-xl overflow-hidden border border-zinc-800">
            <div className="p-2.5 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> Vector Identity Concept Board</span>
              <a
                href={brandSheetUrl}
                download="photo_studio_brand_concept.jpg"
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <Download className="w-3 h-3" /> Download High-Res Board
              </a>
            </div>
            <img src={brandSheetUrl} alt="Photo Studio Brand Identity Concept Board" className="w-full object-cover max-h-72" />
          </div>
        )}

        {/* 4 Deliverables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Standalone Square App Icon */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white">1. Standalone App Icon</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">512×512 SVG</span>
              </div>
              <div className="py-6 flex items-center justify-center bg-[#070A14] rounded-lg border border-zinc-900">
                <div className="w-24 h-24 rounded-2xl bg-[#0B1020] border border-cyan-900/40 p-2 shadow-xl flex items-center justify-center">
                  <BrandSymbol size={80} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-900">
              <button
                onClick={() => handleDownload('brand-icon.svg', '/brand-icon.svg')}
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center gap-1.5 transition-colors border border-zinc-800"
              >
                <Download className="w-3.5 h-3.5" /> Download SVG
              </button>
            </div>
          </div>

          {/* 2. Horizontal Logo Lockup */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white">2. Horizontal Logo Lockup</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">Vector Lockup</span>
              </div>
              <div className="py-6 px-4 flex items-center justify-center bg-[#070A14] rounded-lg border border-zinc-900">
                <BrandLogoHorizontal size={40} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-900">
              <button
                onClick={() => handleDownload('brand-logo-horizontal.svg', '/brand-logo-horizontal.svg')}
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center gap-1.5 transition-colors border border-zinc-800"
              >
                <Download className="w-3.5 h-3.5" /> Download SVG
              </button>
            </div>
          </div>

          {/* 3. Monochrome Variant */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white">3. Monochrome Variant</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">White on Navy</span>
              </div>
              <div className="py-6 px-4 flex items-center justify-center bg-[#070A14] rounded-lg border border-zinc-900">
                <BrandLogoHorizontal size={40} monochrome={true} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-900">
              <button
                onClick={() => handleDownload('brand-logo-monochrome.svg', '/brand-logo-monochrome.svg')}
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center gap-1.5 transition-colors border border-zinc-800"
              >
                <Download className="w-3.5 h-3.5" /> Download SVG
              </button>
            </div>
          </div>

          {/* 4. Multi-Scale Favicon Concept */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white">4. Favicon Scale Tests</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">16×16 · 32×32 · 48×48</span>
              </div>
              <div className="py-6 px-4 flex items-center justify-around bg-[#070A14] rounded-lg border border-zinc-900">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-4 h-4 rounded-[3px] bg-[#0B1020] border border-cyan-500/50 flex items-center justify-center overflow-hidden">
                    <BrandSymbol size={14} />
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500">16px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0B1020] border border-cyan-500/50 flex items-center justify-center overflow-hidden">
                    <BrandSymbol size={26} />
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500">32px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-xl bg-[#0B1020] border border-cyan-500/50 flex items-center justify-center overflow-hidden shadow-lg">
                    <BrandSymbol size={40} />
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500">48px</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-900">
              <button
                onClick={() => handleDownload('favicon.svg', '/favicon.svg')}
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center gap-1.5 transition-colors border border-zinc-800"
              >
                <Download className="w-3.5 h-3.5" /> Download Favicon
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <span>Design Concept: Precision Biometric Reticle &amp; Optical Diaphragm</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
