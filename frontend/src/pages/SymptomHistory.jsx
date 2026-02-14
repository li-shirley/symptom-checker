import { useEffect, useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import toast from 'react-hot-toast';

import { useAuthContext } from "../hooks/useAuthContext";
import { apiRequest } from "../utils/api";
import Modal from "../components/Modal";

const SymptomHistory = () => {
    const { user, refreshAccessToken } = useAuthContext();
    const accessToken = user?.token;

    const [triages, setTriages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState(null);

    const [deleteTarget, setDeleteTarget] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [editedNotes, setEditedNotes] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            setPageError(null);

            const res = await apiRequest("/api/triage", {}, { accessToken, refreshAccessToken });

            if (!res.ok) {
                setPageError(res.error);
                setTriages([]);
                setLoading(false);
                return;
            }

            setTriages(res.data?.triages ?? []);
            setLoading(false);
        };

        fetchData();
    }, [user, accessToken, refreshAccessToken]);

    const startEditing = (triage) => {
        setEditingId(triage._id);
        setEditedNotes(triage.notes || "");
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditedNotes("");
    };

    const saveNotes = async (triageId) => {
        setSavingEdit(true);

        const res = await apiRequest(
            `/api/triage/${triageId}`,
            { method: "PATCH", body: { notes: editedNotes } },
            { accessToken, refreshAccessToken }
        );

        if (!res.ok) {
            toast.error(res.error?.message || "Request failed");
            setSavingEdit(false);
            return;
        }

        // backend returns { triage }
        const updated = res.data?.triage;
        if (updated?._id) {
            setTriages((prev) => prev.map((t) => (t._id === triageId ? updated : t)));
        }

        toast.success("Notes updated");
        cancelEditing();
        setSavingEdit(false);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        const id = deleteTarget._id;

        const res = await apiRequest(
            `/api/triage/${id}`,
            { method: "DELETE" },
            { accessToken, refreshAccessToken }
        );

        if (!res.ok) {
            toast.error(res.error?.message || "Request failed");
            setDeleteTarget(null);
            return;
        }

        setTriages((prev) => prev.filter((t) => t._id !== id));
        toast.success("Record deleted successfully!");
        setDeleteTarget(null);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-sm opacity-70">Loading symptom history...</p>
            </div>
        );
    }

    if (pageError) {
        return (
            <div className="p-4">
                <p className="text-red-500">{pageError?.message} || "Failed to load symptom history."</p>
            </div>
        );
    }

    if (!triages.length) return <div className="p-4">No symptom records yet.</div>;

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold mb-4">Your Symptom History</h2>

            {triages.map((t) => {
                const displayCondition =
                    t.diagnosisCommon || t.diagnosisMedical || "Unknown condition";

                return (
                    <div
                        key={t._id}
                        className="p-5 border rounded-lg shadow-md bg-base-100 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-base-content/70">
                                Symptoms felt on:{" "}
                                <strong>{new Date(t.createdAt).toLocaleDateString()}</strong>
                            </span>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => startEditing(t)}
                                    className="btn btn-sm btn-secondary"
                                    aria-label="Edit notes"
                                >
                                    <Pencil size={16} />
                                </button>

                                <button
                                    onClick={() => setDeleteTarget(t)}
                                    className="btn btn-sm btn-error"
                                    aria-label="Delete record"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <p className="text-base mb-1">
                            <strong>Suggested Condition:</strong>{" "}
                            <span className="font-bold italic text-primary">
                                {displayCondition}
                            </span>
                            {t.diagnosisCommon && t.diagnosisMedical && (
                                <> ({t.diagnosisMedical})</>
                            )}
                            {typeof t.probability === "number" && (
                                <>
                                    <span>, </span>
                                    <span className="text-accent">
                                        suggested with {(t.probability * 100).toFixed(0)}% confidence
                                    </span>
                                </>
                            )}
                        </p>

                        {Array.isArray(t.symptoms) && t.symptoms.length > 0 && (
                            <p className="mb-1">
                                <strong>Symptoms:</strong> {t.symptoms.join(", ")}
                            </p>
                        )}

                        {editingId === t._id ? (
                            <div className="mt-3 space-y-2">
                                <textarea
                                    className="textarea textarea-bordered w-full"
                                    rows={3}
                                    maxLength={5000}
                                    value={editedNotes}
                                    onChange={(e) => setEditedNotes(e.target.value)}
                                    placeholder="Add your notes here..."
                                />

                                <div className="flex gap-2 justify-end">
                                    <button
                                        className="btn btn-sm"
                                        onClick={cancelEditing}
                                        disabled={savingEdit}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => saveNotes(t._id)}
                                        disabled={savingEdit}
                                    >
                                        {savingEdit ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            t.notes && (
                                <p className="text-base-content/70 mt-2">
                                    <strong>Notes:</strong> {t.notes}
                                </p>
                            )
                        )}
                    </div>
                );
            })}

            <Modal
                isOpen={!!deleteTarget}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this symptom record? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

export default SymptomHistory;