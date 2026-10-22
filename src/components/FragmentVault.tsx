/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Fragment, FragmentType } from '../types';
import { extractTextFromImage } from '../services/ocr';
import { 
  FileText, 
  Image, 
  PenTool, 
  FileCode, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  Upload, 
  X, 
  Loader2, 
  Eye, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface FragmentVaultProps {
  fragments: Fragment[];
  projectId: string;
  projectTitle: string;
  onSaveFragment: (fragment: Fragment) => Promise<void>;
  onDeleteFragment: (id: string) => Promise<void>;
  onProceedToIntentMap: () => void;
}

export const FragmentVault: React.FC<FragmentVaultProps> = ({
  fragments,
  projectId,
  projectTitle,
  onSaveFragment,
  onDeleteFragment,
  onProceedToIntentMap,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [verifyingFragment, setVerifyingFragment] = useState<Fragment | null>(null);

  // Add Fragment Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<FragmentType>('note');
  const [newText, setNewText] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isHandwriting, setIsHandwriting] = useState(false);
  const [isExtractingOCR, setIsExtractingOCR] = useState(false);
  const [ocrProgressText, setOcrProgressText] = useState('');
  const [ocrConfidence, setOcrConfidence] = useState<number | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredFragments = fragments.filter((f) => {
    if (filterType === 'all') return true;
    return f.type === filterType;
  });

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    if (file.size > 10 * 1024 * 1024) {
      setFormError('Image exceeds the 10MB safety limit. Please select a smaller file.');
      return;
    }

    setSelectedImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);

    // Auto-fill title if empty
    if (!newTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setNewTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Automatically trigger local client-side OCR
    runClientOCR(file, isHandwriting);
  };

  const runClientOCR = async (source: File | string, handwriting: boolean) => {
    setIsExtractingOCR(true);
    setOcrProgressText('Loading Tesseract.js worker locally...');
    try {
      const result = await extractTextFromImage(source, handwriting, (status, pct) => {
        setOcrProgressText(`${status} (${pct}%)`);
      });

      setNewText(result.text);
      setOcrConfidence(result.confidence);
      setIsExtractingOCR(false);
    } catch (err: any) {
      console.error('Local OCR failed:', err);
      setFormError('Local OCR encountered an error. You can still type or paste the extracted text manually.');
      setIsExtractingOCR(false);
    }
  };

  const handleSaveNewFragment = async () => {
    if (!newTitle.trim()) {
      setFormError('Please provide a title for this fragment.');
      return;
    }
    if (!newText.trim()) {
      setFormError('Extracted text or content cannot be empty.');
      return;
    }

    const fragment: Fragment = {
      id: `frag-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projectId,
      title: newTitle.trim(),
      type: newType,
      extractedText: newText.trim(),
      mediaUrl: imagePreviewUrl || undefined,
      isVerified: true, // User verified in the form before saving
      confidence: ocrConfidence,
      isHandwritingExperimental: isHandwriting,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await onSaveFragment(fragment);
    resetForm();
    setIsAddModalOpen(false);
  };

  const resetForm = () => {
    setNewTitle('');
    setNewType('note');
    setNewText('');
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setIsHandwriting(false);
    setIsExtractingOCR(false);
    setOcrConfidence(undefined);
    setFormError(null);
  };

  const handleUpdateVerifiedText = async () => {
    if (!verifyingFragment) return;
    await onSaveFragment({
      ...verifyingFragment,
      isVerified: true,
      updatedAt: Date.now(),
    });
    setVerifyingFragment(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Project</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-slate-800">{projectTitle}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Fragment Vault
          </h1>
          <p className="text-xs text-slate-600">
            Ingest and verify raw notes, whiteboard photos, code snippets, and sketches before running intent reconstruction.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Fragment</span>
          </button>

          {fragments.length > 0 && (
            <button
              onClick={onProceedToIntentMap}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shadow-xs"
            >
              <span>Reconstruct Intent</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs (Interactive button controls) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          {[
            { id: 'all', label: 'All Fragments' },
            { id: 'note', label: 'Notes' },
            { id: 'screenshot', label: 'Screenshots' },
            { id: 'handwriting', label: 'Handwriting' },
            { id: 'document', label: 'Documents' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterType === item.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-mono hidden sm:block">
          {filteredFragments.length} {filteredFragments.length === 1 ? 'fragment' : 'fragments'} ready
        </div>
      </div>

      {/* Empty State */}
      {filteredFragments.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center bg-white">
          <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            No fragments in this view
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
            Add your scattered notes, paste code snippets, or upload whiteboard photos. Each fragment serves as grounded evidence for Gemma 4.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Add Your First Fragment
          </button>
        </div>
      ) : (
        /* Fragment Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFragments.map((frag) => {
            const wordCount = frag.extractedText.split(/\s+/).filter(Boolean).length;

            return (
              <div
                key={frag.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs text-slate-500">
                    <span className="font-mono text-[11px] font-semibold text-slate-600">
                      ID: {frag.id}
                    </span>
                    <span className="capitalize">{frag.type}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{wordCount} words</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 font-display mb-2 group-hover:text-indigo-600 transition-colors">
                    {frag.title}
                  </h3>

                  {frag.mediaUrl && (
                    <div className="mb-3 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 aspect-video relative">
                      <img
                        src={frag.mediaUrl}
                        alt={frag.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="bg-slate-50/80 rounded-lg p-3 text-xs text-slate-700 font-mono leading-relaxed line-clamp-4 border border-slate-100">
                    {frag.extractedText}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {frag.isVerified ? (
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-700 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Unverified OCR</span>
                      </span>
                    )}

                    {frag.isHandwritingExperimental && (
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-mono ml-1">
                        Experimental OCR
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setVerifyingFragment(frag)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                      title="Inspect side-by-side & edit text"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteFragment(frag.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete fragment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Fragment Modal with Local Tesseract OCR */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-xl my-8 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Add Project Fragment
              </h3>
              <button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fragment Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Protocol V2 Architecture Notes"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fragment Format
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'note', label: 'Note / Markdown', icon: FileText },
                    { id: 'screenshot', label: 'Screenshot', icon: Image },
                    { id: 'handwriting', label: 'Handwriting', icon: PenTool },
                    { id: 'document', label: 'Document', icon: FileCode },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setNewType(t.id as FragmentType);
                          setIsHandwriting(t.id === 'handwriting');
                        }}
                        className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors ${
                          newType === t.id
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload image / file if type is screenshot or handwriting */}
              {(newType === 'screenshot' || newType === 'handwriting') && (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50/50">
                  {imagePreviewUrl ? (
                    <div className="space-y-3">
                      <img
                        src={imagePreviewUrl}
                        alt="Upload preview"
                        className="max-h-48 mx-auto rounded-lg border border-slate-200"
                      />
                      <div className="flex justify-center gap-2">
                        <label className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                          Change Image
                          <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                        </label>
                        <button
                          type="button"
                          onClick={() => runClientOCR(selectedImageFile!, isHandwriting)}
                          disabled={isExtractingOCR}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 flex items-center gap-1"
                        >
                          {isExtractingOCR && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>Re-run Local OCR</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-medium text-slate-700 mb-1">
                        Choose a screenshot or photo of handwritten notes
                      </p>
                      <p className="text-[11px] text-slate-500 mb-3">
                        Processed 100% locally with Tesseract.js. No image data leaves your browser.
                      </p>
                      <label className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors inline-block">
                        Select Image
                        <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Handwriting Experimental Warning */}
              {isHandwriting && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Experimental Handwriting Recognition:</span> Handwriting OCR is treated as experimental. Low-confidence words are labeled <code className="bg-amber-100 px-1 rounded">[unreadable]</code> instead of hallucinated. You can correct words in the box below before saving.
                  </div>
                </div>
              )}

              {/* OCR Progress Indicator */}
              {isExtractingOCR && (
                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                  <span>{ocrProgressText}</span>
                </div>
              )}

              {/* Extracted Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Content & Verified Extracted Text
                  </label>
                  {ocrConfidence !== undefined && (
                    <span className="text-[11px] font-mono text-slate-500">
                      OCR Confidence: {ocrConfidence}%
                    </span>
                  )}
                </div>
                <textarea
                  rows={6}
                  placeholder="Paste or review the extracted text here..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewFragment}
                disabled={isExtractingOCR}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                Verify & Save Fragment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Inspection & Correction Modal */}
      {verifyingFragment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 shadow-xl my-8 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <div className="text-xs text-slate-500">
                  Side-by-Side OCR Verification
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {verifyingFragment.title}
                </h3>
              </div>
              <button
                onClick={() => setVerifyingFragment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Original Media */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">
                  Original Source Image
                </h4>
                {verifyingFragment.mediaUrl ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-[380px] overflow-auto">
                    <img
                      src={verifyingFragment.mediaUrl}
                      alt={verifyingFragment.title}
                      className="w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-xs text-slate-500 font-mono">
                    Text-only fragment; no image attached.
                  </div>
                )}
              </div>

              {/* Right Column: Editable Extracted Text */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-700">
                    Correct Extracted Text (Before AI Processing)
                  </h4>
                  {verifyingFragment.confidence && (
                    <span className="text-[11px] font-mono text-slate-500">
                      OCR Confidence: {verifyingFragment.confidence}%
                    </span>
                  )}
                </div>
                <textarea
                  rows={14}
                  value={verifyingFragment.extractedText}
                  onChange={(e) =>
                    setVerifyingFragment({
                      ...verifyingFragment,
                      extractedText: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-6">
              <span className="text-xs text-slate-500">
                Correct any mistaken words or OCR inaccuracies.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setVerifyingFragment(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  onClick={handleUpdateVerifiedText}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Confirm Verified Text
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
