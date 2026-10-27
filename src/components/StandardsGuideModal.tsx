/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PASSPORT_PRESETS } from '../constants/presets.ts';

interface StandardsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (presetId: string) => void;
}

export const StandardsGuideModal: React.FC<StandardsGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Official Passport & Visa Photo Standards
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-300">
          {/* Universal Requirements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Strict Biometric Requirements</span>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-300 leading-relaxed">
                <li>• <strong>Neutral Expression:</strong> Mouth closed, eyes open and looking directly at camera.</li>
                <li>• <strong>Even Studio Lighting:</strong> No shadows on face or backdrop.</li>
                <li>• <strong>No Eyeglasses:</strong> Eyeglasses are strictly banned by US, UK, Schengen, and India.</li>
                <li>• <strong>Full Face Visibility:</strong> Forehead, ears, and eyebrows must not be covered by hair.</li>
              </ul>
            </div>

            <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Printing & Resolution Rules</span>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-300 leading-relaxed">
                <li>• <strong>Zero Quality Loss (300 DPI):</strong> Embassies reject low-resolution or pixelated photos.</li>
                <li>• <strong>True Dimensions:</strong> Never stretch or compress aspect ratio.</li>
                <li>• <strong>Glossy or Matte Paper:</strong> Printed on photographic paper, not plain copy paper.</li>
                <li>• <strong>Freshness:</strong> Taken within the past 6 months reflecting current appearance.</li>
              </ul>
            </div>
          </div>

          {/* Preset Matrix Table */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-xs tracking-wider uppercase">
              Country & Embassy Dimensions Matrix
            </h3>
            <div className="border border-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                    <th className="py-2.5 px-3 font-semibold">Standard</th>
                    <th className="py-2.5 px-3 font-semibold">Dimensions</th>
                    <th className="py-2.5 px-3 font-semibold">Countries / Usage</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {PASSPORT_PRESETS.filter(p => p.id !== 'custom').map((preset) => (
                    <tr key={preset.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white">{preset.name}</td>
                      <td className="py-2.5 px-3 font-mono text-indigo-400">
                        {preset.widthMm} × {preset.heightMm} mm
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300">{preset.country}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            onSelectPreset(preset.id);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium bg-zinc-800 hover:bg-indigo-600 hover:text-white rounded transition-colors text-zinc-200"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
