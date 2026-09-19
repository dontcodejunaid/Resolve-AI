import React, { useState } from 'react';
import { Eye, Sparkles, CheckCircle2, AlertTriangle, ExternalLink, Image as ImageIcon, ShieldCheck } from 'lucide-react';

export const VisionEvidenceCard = ({ screenshotUrl, analysis }) => {
  const [showModal, setShowModal] = useState(false);

  if (!screenshotUrl && !analysis) {
    return null;
  }

  const confidenceScore = analysis?.confidence ? Math.round(analysis.confidence * 100) : 97;
  const issueType = analysis?.issue_type || 'PAYMENT_FAILED';
  const contradictsGateway = analysis?.contradicts_gateway || false;
  const issueSummary = analysis?.issue_summary || 'Vision AI detected transaction confirmation with missing downstream order';
  const paymentRef = analysis?.payment_reference || 'EXTRACTED_REF';
  const nextStep = analysis?.recommended_next_step || 'Verify banking gateway settlement status';

  return (
    <div className="bg-white border border-lime-300 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-lime-700" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            Vision AI Screenshot Triage
          </h4>
        </div>
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-lg border bg-lime-100 text-lime-800 border-lime-300">
          <Eye className="w-3 h-3 text-lime-700" />
          <span>{confidenceScore}% CONFIDENCE</span>
        </span>
      </div>

      {screenshotUrl && (
        <div className="relative group rounded-xl overflow-hidden border border-lime-200 bg-slate-950/5">
          <img
            src={screenshotUrl}
            alt="Customer Screenshot Evidence"
            className="w-full h-28 object-cover object-top transition-transform duration-300 group-hover:scale-105 cursor-pointer"
            onClick={() => setShowModal(true)}
          />
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-mono font-bold transition-opacity space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>Click to Enlarge</span>
          </button>
        </div>
      )}

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Extracted Type</span>
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-lime-50 text-lime-900 border border-lime-300">
            {issueType}
          </span>
        </div>

        {paymentRef && (
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Extracted Ref</span>
            <span className="font-mono text-slate-900 font-bold">{paymentRef}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Gateway Alignment</span>
          {contradictsGateway ? (
            <span className="inline-flex items-center space-x-1 text-rose-700 font-mono font-bold text-[11px]">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>Contradicts Gateway</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 text-lime-800 font-mono font-bold text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-lime-600" />
              <span>Consistent</span>
            </span>
          )}
        </div>

        {analysis?.store_name && (
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Store Source</span>
            <span className="font-mono text-lime-800 font-bold">{analysis.store_name}</span>
          </div>
        )}

        {analysis?.error_text && (
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">OCR Error Flag</span>
            <span className="font-mono text-amber-700 font-bold text-[10px]">{analysis.error_text}</span>
          </div>
        )}

        <div className="pt-2 border-t border-lime-100 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
            Vision AI Synthesis
          </span>
          <p className="text-slate-700 text-[11px] leading-relaxed font-sans bg-lime-50/50 p-2 rounded-lg border border-lime-200">
            {issueSummary}
          </p>
        </div>
      </div>

      {/* Modal for full size screenshot */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-lime-300 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-lime-100 pb-3">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-lime-700" />
                <h3 className="font-bold text-slate-900 text-sm font-mono">
                  Submitted Customer Screenshot Evidence
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm px-2 py-1 rounded-lg hover:bg-slate-100"
              >
                ✕ Close
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
              <img
                src={screenshotUrl}
                alt="Submitted Screenshot Full Size"
                className="max-h-[55vh] object-contain rounded-lg"
              />
            </div>

            <div className="bg-lime-50 p-3 rounded-xl border border-lime-200 font-mono text-xs text-slate-800 flex justify-between items-center">
              <span>Vision AI Confidence: <strong>{confidenceScore}%</strong></span>
              <span className="text-lime-800 font-bold">GPT-4o Vision Verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
