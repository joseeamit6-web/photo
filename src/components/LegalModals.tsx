/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ShieldCheck, FileText, MessageCircle, Mail, Phone, ExternalLink } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Privacy Policy</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-zinc-300 leading-relaxed">
          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-emerald-300 font-medium">
            🔒 <strong>Zero Server Upload:</strong> Your photos are processed 100% locally on your own computer or phone using WebAssembly and HTML5 Canvas. No biometric data or images are ever transmitted to any cloud server or database.
          </div>

          <h3 className="text-sm font-semibold text-white pt-2">1. Local Device Execution</h3>
          <p>
            Passport Photo Studio (pic.amitjoshi.info.np) is engineered as a client-side web application. All cropping, background extraction, color replacement, and 300 DPI sheet generation take place inside your web browser engine.
          </p>

          <h3 className="text-sm font-semibold text-white pt-2">2. Data Retention</h3>
          <p>
            We do not maintain user accounts, databases, tracking cookies, or server-side image logs. When you refresh or close the tab, all image buffers in browser memory are instantly wiped.
          </p>

          <h3 className="text-sm font-semibold text-white pt-2">3. Third-Party CDN Resources</h3>
          <p>
            Public libraries (Cropper.js and WASM AI models) are loaded via high-speed encrypted CDNs. These CDN requests do not send your photos to external providers.
          </p>

          <h3 className="text-sm font-semibold text-white pt-2">4. Support & Contact</h3>
          <p>
            If you have questions regarding privacy or application operation, email us at{' '}
            <a href="mailto:admin@amitjoshi.info.np" className="text-indigo-400 underline">
              admin@amitjoshi.info.np
            </a>{' '}
            or WhatsApp at{' '}
            <a href="https://wa.me/9779746241860" target="_blank" rel="noreferrer" className="text-emerald-400 underline">
              +977 9746241860
            </a>.
          </p>
        </div>

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

export const TermsConditionsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Terms & Conditions</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-zinc-300 leading-relaxed">
          <h3 className="text-sm font-semibold text-white">1. Service Provision</h3>
          <p>
            Passport Photo Studio (pic.amitjoshi.info.np) is provided free of charge for personal and professional preparation of biometric passport and ID photographs.
          </p>

          <h3 className="text-sm font-semibold text-white pt-2">2. Official Embassy Compliance</h3>
          <p>
            While our cropping and sheet grids follow recognized international standards (ICAO 9303, US State Dept, Schengen, UK Passport Office, etc.), users remain responsible for ensuring their subject expression, head coverings, attire, and lighting fulfill the specific requirements of their issuing government or visa authority.
          </p>

          <h3 className="text-sm font-semibold text-white pt-2">3. Printing Guidelines</h3>
          <p>
            For official submissions, users must print on photo-grade paper (glossy or matte) at 100% scale (no fit-to-page margins) using a calibrated color printer or commercial photo kiosk (e.g. 4×6 photo print).
          </p>

          <h3 className="text-sm font-semibold text-white pt-2">4. Support Inquiries</h3>
          <p>
            For assistance or issue reporting, contact administrator Amit Joshi at{' '}
            <a href="mailto:admin@amitjoshi.info.np" className="text-indigo-400 underline">
              admin@amitjoshi.info.np
            </a>{' '}
            or WhatsApp{' '}
            <a href="https://wa.me/9779746241860" target="_blank" rel="noreferrer" className="text-emerald-400 underline">
              +977 9746241860
            </a>.
          </p>
        </div>

        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export const SupportModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Support & Assistance</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-zinc-300">
          <p className="leading-relaxed">
            If any error occurs or AI background processing fails, our support team is ready to assist you immediately:
          </p>

          <div className="space-y-3">
            <a
              href="mailto:admin@amitjoshi.info.np"
              className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-indigo-500/80 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-950/70 text-indigo-400 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-zinc-400">Email Support</div>
                <div className="text-xs font-semibold text-white truncate">admin@amitjoshi.info.np</div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
            </a>

            <a
              href="https://wa.me/9779746241860"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-emerald-500/80 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-950/70 text-emerald-400 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-zinc-400">WhatsApp Instant Help</div>
                <div className="text-xs font-semibold text-emerald-400 truncate">+977 9746241860</div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </a>
          </div>
        </div>

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
