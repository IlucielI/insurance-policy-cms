"use client";

import { useState, useMemo } from "react";

export type BulkAction = {
  id: string;
  label: string;
  icon?: string;
  confirmTitle: string;
  confirmMessage: string;
  confirmLabel: string;
  requireNotes?: boolean;
  notesLabel?: string;
  danger?: boolean;
};

type BulkActionBarProps = {
  selectedIds: string[];
  totalItems: number;
  actions: BulkAction[];
  onAction: (
    actionId: string,
    ids: string[],
    notes?: string,
    rejectionReason?: string
  ) => Promise<void>;
  onSelectAll: () => void;
  onClearSelection: () => void;
  progress?: {
    current: number;
    total: number;
  } | null;
};

export default function BulkActionBar({
  selectedIds,
  totalItems,
  actions,
  onAction,
  onSelectAll,
  onClearSelection,
  progress,
}: BulkActionBarProps) {
  const [showModal, setShowModal] = useState(false);
  const [activeAction, setActiveAction] = useState<BulkAction | null>(null);
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCount = selectedIds.length;
  const allSelected = totalItems > 0 && selectedCount === totalItems;
  const someSelected = selectedCount > 0;

  const handleActionClick = (action: BulkAction) => {
    setActiveAction(action);
    setNotes("");
    setRejectionReason("");
    setError("");
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!activeAction) return;

    if (activeAction.requireNotes && !notes.trim() && !rejectionReason.trim()) {
      setError("Mohon isi catatan");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onAction(activeAction.id, selectedIds, notes, rejectionReason);
      setShowModal(false);
      setNotes("");
      setRejectionReason("");
      onClearSelection();
    } catch (err: any) {
      setError(err?.message || "Gagal menjalankan aksi");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = useMemo(() => {
    if (activeAction?.id === "claim-bulk-status") {
      return [
        { value: "new", label: "Baru" },
        { value: "under_investigation", label: "Dalam Investigasi" },
        { value: "assigned", label: "Ditugaskan" },
        { value: "pending_approval", label: "Menunggu Persetujuan" },
        { value: "approved", label: "Disetujui" },
        { value: "rejected", label: "Ditolak" },
        { value: "paid", label: "Dibayar" },
        { value: "partially_paid", label: "Dibayar Sebagian" },
      ];
    }
    return [];
  }, [activeAction]);

  return (
    <>
      {/* Selection bar */}
      {someSelected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-800">
              {selectedCount} dari {totalItems} terpilih
            </span>
            <button
              onClick={onSelectAll}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {allSelected ? "Batal pilih semua" : "Pilih semua"}
            </button>
            <button
              onClick={onClearSelection}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Bersihkan
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => {
                const action = actions.find((a) => a.id === e.target.value);
                if (action) handleActionClick(action);
                e.target.value = "";
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Aksi massal...
              </option>
              {actions.map((action) => (
                <option key={action.id} value={action.id}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {progress && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-600">
              Proses {progress.current}/{progress.total}
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(progress.current / progress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && activeAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => !loading && setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 z-10">
            <div className="flex items-start gap-3 mb-4">
              {activeAction.danger ? (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              ) : (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeAction.confirmTitle}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {activeAction.confirmMessage.replace(
                    "{count}",
                    String(selectedCount)
                  )}
                </p>
              </div>
            </div>

            {/* Notes / rejection reason */}
            {activeAction.id === "bulk-reject" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alasan penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Masukkan alasan penolakan..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {activeAction.id === "claim-bulk-status" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status baru <span className="text-red-500">*</span>
                </label>
                <select
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih status...</option>
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeAction.requireNotes &&
              activeAction.id !== "bulk-reject" &&
              activeAction.id !== "claim-bulk-status" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {activeAction.notesLabel || "Catatan"}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Masukkan catatan... (opsional)"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

            {error && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 ${
                  activeAction.danger
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  activeAction.confirmLabel
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
