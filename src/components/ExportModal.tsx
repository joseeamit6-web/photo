/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Download, Globe, Check, Copy } from 'lucide-react';
import { generateStandaloneIndexHtml } from '../utils/standaloneHtmlGenerator.ts';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownloadStandalone = () => {
    const htmlContent = generateStandaloneIndexHtml();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handleCopyDns = () => {
    navigator.clipboard.writeText('pic.amitjoshi.info.np CNAME <your-github-username>.github.io');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              GitHub Pages Deployment & Standalone Export
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
        <div className="p-6 space-y-5 text-sm text-zinc-300">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your single-file, production-ready Passport Photo Studio is designed to run directly from a single <code className="text-indigo-300 font-mono">index.html</code> file with ZERO build step, hosted at your domain <strong className="text-white font-mono">pic.amitjoshi.info.np</strong>.
          </p>

          <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-white">1-Click Single-File Package</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Includes all embedded CSS, Cropper.js CDN, local WebAssembly AI background remover, and 300 DPI sheet generator.
              </div>
            </div>
            <button
              onClick={handleDownloadStandalone}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 shrink-0 shadow-sm shadow-indigo-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Download index.html</span>
            </button>
          </div>

          <div>
            <h3 className="font-semibold text-white text-xs tracking-wider uppercase mb-2">
              Setup Instructions for pic.amitjoshi.info.np
            </h3>
            <ol className="space-y-2.5 text-xs text-zinc-300 list-decimal list-inside">
              <li>
                <strong>Push to GitHub:</strong> Create a new repository on GitHub (e.g. <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-200">passport-photo-studio</code>) and upload the downloaded <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-200">index.html</code>.
              </li>
              <li>
                <strong>Enable Pages:</strong> Navigate to <em>Settings &rarr; Pages &rarr; Build and deployment</em>, set Source to <em>Deploy from a branch</em> and choose <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-200">main / root</code>.
              </li>
              <li>
                <strong>Set Custom Domain:</strong> Under <em>Custom domain</em>, enter <strong className="text-white font-mono">pic.amitjoshi.info.np</strong> and check <em>Enforce HTTPS</em>.
              </li>
              <li>
                <strong>Configure DNS CNAME:</strong> In your DNS manager for <code className="text-zinc-200">amitjoshi.info.np</code>, add a CNAME record:
              </li>
            </ol>

            <div className="mt-3 p-2.5 bg-zinc-950 border border-zinc-800 rounded font-mono text-[11px] text-zinc-300 flex items-center justify-between">
              <span>CNAME: pic &rarr; &lt;your-username&gt;.github.io</span>
              <button
                onClick={handleCopyDns}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 transition-colors"
                title="Copy DNS record"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
