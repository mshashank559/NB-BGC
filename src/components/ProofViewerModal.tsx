'use client';

import React from 'react';
import { X, Download, FileText, ExternalLink } from 'lucide-react';

interface ProofViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  dataUrl?: string;
}

export const ProofViewerModal: React.FC<ProofViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  dataUrl,
}) => {
  if (!isOpen || !dataUrl) return null;

  const isImage = dataUrl.startsWith('data:image/') || /\.(png|jpe?g|webp|gif)$/i.test(title);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
              {title}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              Verified BGC Proof
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={dataUrl}
              download={title}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Viewer Canvas */}
        <div className="p-6 flex items-center justify-center overflow-auto bg-slate-100/50 dark:bg-slate-950/50 flex-1">
          {isImage ? (
            <img
              src={dataUrl}
              alt={title}
              className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-800"
            />
          ) : (
            <div className="p-10 text-center flex flex-col items-center">
              <div className="h-16 w-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-3">
                <FileText className="h-8 w-8" />
              </div>
              <p className="font-extrabold text-slate-900 dark:text-white text-base mb-1">{title}</p>
              <p className="text-xs text-slate-400 mb-4">Document / PDF Attachment</p>
              <a
                href={dataUrl}
                download={title}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Document
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
