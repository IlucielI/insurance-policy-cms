"use client";

import { useState, useEffect, useCallback } from "react";

type EmailTemplateType = "welcome" | "policy" | "claim" | "reset";

interface EmailPreviewModalProps {
  open: boolean;
  onClose: () => void;
  templateType: EmailTemplateType;
  apiBaseUrl?: string;
}

const TEMPLATE_LABELS: Record<EmailTemplateType, string> = {
  welcome: "Selamat Datang",
  policy: "Polis Diterbitkan",
  claim: "Status Klaim",
  reset: "Reset Password",
};

export default function EmailPreviewModal({
  open,
  onClose,
  templateType,
  apiBaseUrl = "",
}: EmailPreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");

  const fetchPreview = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const url = `${apiBaseUrl}/api/v1/admin/email/preview/${templateType}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setSubject(data.subject);
      setHtml(data.html);
    } catch (err: any) {
      setError(err.message || "Gagal memuat pratinjau");
      setHtml("");
    } finally {
      setLoading(false);
    }
  }, [open, templateType, apiBaseUrl]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      alert("HTML disalin ke clipboard");
    } catch {
      alert("Gagal menyalin HTML");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pratinjau Email: {TEMPLATE_LABELS[templateType]}
            </h2>
            {subject && (
              <p className="text-sm text-gray-500 mt-0.5">
                Subjek: {subject}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {html && (
              <button
                onClick={handleCopyHtml}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                title="Salin HTML"
              >
                📋 Salin HTML
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
              <span className="ml-3 text-gray-500">Memuat pratinjau...</span>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-red-600 text-sm font-medium">⚠️ {error}</span>
              </div>
              <button
                onClick={fetchPreview}
                className="mt-2 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {html && !loading && !error && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Tab bar */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HTML Preview
                </span>
                <span className="text-xs text-gray-400">
                  • Variabel sudah disubstitusi dengan data contoh
                </span>
              </div>
              <div className="p-4 bg-white">
                <iframe
                  srcDoc={html}
                  title="Email Preview"
                  className="w-full border-0"
                  style={{ minHeight: "500px" }}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-500">
            Pratinjau ini menggunakan data contoh. Data aktual akan disubstitusi saat pengiriman.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}