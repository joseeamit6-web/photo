/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PassportPreset } from '../types.ts';

interface BiometricOverlayProps {
  preset: PassportPreset;
  visible: boolean;
}

export const BiometricOverlay: React.FC<BiometricOverlayProps> = ({
  preset,
  visible,
}) => {
  if (!visible) return null;

  const isUsPassport = preset.id === 'us-passport';
  const ovalHeightPercent = isUsPassport ? 62 : 75; // 50-69% for US, 70-80% for EU/UK/Asia
  const ovalWidthPercent = isUsPassport ? 52 : 58;

  return (
    <div className="biometric-guide-container pointer-events-none absolute inset-0 z-20 flex items-center justify-center select-none overflow-hidden">
      {/* Central Biometric Alignment Box */}
      <div
        className="relative border border-indigo-400/40 rounded-[50%/60%_60%_40%_40%] flex items-center justify-center transition-all duration-300"
        style={{
          width: `${ovalWidthPercent}%`,
          height: `${ovalHeightPercent}%`,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.28)',
        }}
      >
        {/* Crown guide limit */}
        <div className="absolute top-2 w-full text-center">
          <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-indigo-300/80 bg-zinc-950/70 px-1.5 py-0.5 rounded">
            Crown Limit
          </span>
        </div>

        {/* Eye Level Line */}
        <div
          className="absolute left-2 right-2 border-t border-dashed border-emerald-400/80 flex items-center justify-between"
          style={{ top: '44%' }}
        >
          <span className="text-[9px] font-mono text-emerald-300 bg-zinc-950/70 px-1 rounded -translate-y-1/2">
            Eye Level
          </span>
          <span className="text-[9px] font-mono text-emerald-300 bg-zinc-950/70 px-1 rounded -translate-y-1/2">
            56-69%
          </span>
        </div>

        {/* Nose Center Crosshair */}
        <div
          className="absolute w-4 h-4 border-t border-b border-l border-r border-indigo-400/40"
          style={{ top: '56%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />

        {/* Chin guide line */}
        <div
          className="absolute left-4 right-4 border-t border-dashed border-amber-400/80 flex items-center justify-between"
          style={{ bottom: '12%' }}
        >
          <span className="text-[9px] font-mono text-amber-300 bg-zinc-950/70 px-1 rounded -translate-y-1/2">
            Chin Line
          </span>
          <span className="text-[9px] font-mono text-amber-300 bg-zinc-950/70 px-1 rounded -translate-y-1/2">
            {preset.faceHeightRatioMin * 100}%–{preset.faceHeightRatioMax * 100}%
          </span>
        </div>
      </div>

      {/* Floating Biometric Indicator */}
      <div className="absolute bottom-3 left-3 bg-zinc-900/90 border border-zinc-700/70 text-zinc-300 text-[11px] font-mono px-2 py-1 rounded shadow-md backdrop-blur-sm pointer-events-none">
        ICAO 9303 Biometric Grid Active
      </div>
    </div>
  );
};
