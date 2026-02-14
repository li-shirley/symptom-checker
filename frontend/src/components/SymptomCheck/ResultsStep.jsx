import { useState, useEffect } from "react";
import { useSymptomCheckContext } from "../../hooks/useSymptomCheckContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { apiRequest } from "../../utils/api";

const htmlToText = (html = "") => {
    try {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return (doc.body.textContent || "").trim();
    } catch {
        return "";
    }
};

const ResultsStep = () => {
    const { state } = useSymptomCheckContext();
    const { user, refreshAccessToken } = useAuthContext();
    const accessToken = user?.token;

    const results = state.results;
    const topCondition = results?.topCondition ?? null;
    const details = topCondition?.condition_details ?? null;

    // Local state for MedlinePlus info
    const [conditionInfo, setConditionInfo] = useState([]);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [expandedEntries, setExpandedEntries] = useState(false);
    const [expandedSummaries, setExpandedSummaries] = useState(() => new Set());

    // Local state for saving results info to DB
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // Reset save UI when result changes
    useEffect(() => {
        setNotes("");
        setSaving(false);
        setSaved(false);
        setSaveError(null);
    }, [topCondition?.id]);

    // Fetch MedlinePlus info for the final ICD-10 code
    useEffect(() => {
        const icd10 = details?.icd10_code;
        if (!icd10) return;

        let cancelled = false;

        (async () => {
            setLoadingInfo(true);
            try {
                const code = icd10.trim().toUpperCase();
                const res = await apiRequest(`/api/medlineplus/${encodeURIComponent(code)}`);

                if (!res.ok) {
                    if (!cancelled) setConditionInfo([]);
                    return;
                }

                const entries = res.data?.feed?.entry;
                if (!cancelled) setConditionInfo(Array.isArray(entries) ? entries : []);
            } finally {
                if (!cancelled) setLoadingInfo(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [details?.icd10_code]);

    const displayedEntries = expandedEntries ? conditionInfo : conditionInfo.slice(0, 5);

    const toggleSummary = (key) => {
        setExpandedSummaries((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    // save triage record to DB
    const handleSave = async () => {
        if (!user || !results?.topCondition) return;

        setSaving(true);
        setSaveError(null);

        const payload = {
            diagnosisCommon: topCondition.common_name || topCondition.name,
            diagnosisMedical: topCondition.name,
            probability: topCondition.probability,
            symptoms: state.evidence
                .filter(e => e.choice_id === "present" && e.name)
                .map(e => e.name),
            notes,
        };

        const res = await apiRequest(
            "/api/triage",
            {
                method: "POST",
                body: payload,
            },
            { accessToken, refreshAccessToken }
        );

        if (!res.ok) {
            setSaveError(res.error?.message || "Failed to save result.");
            setSaving(false);
            return;
        }

        setSaved(true);
        setSaving(false);
    };

    // no results in state at all
    if (!results) return <div className="text-center">No results available.</div>;

    // Emergency case
    if (results.emergency) {
        return (
            <div className="max-w-lg mx-auto space-y-6 text-center">
                <h2 className="text-3xl font-bold text-red-500">Seek Emergency Care</h2>

                <div className="alert alert-error text-center">
                    <span>
                        We ended the symptom check early because some of your answers may indicate a serious medical emergency.
                        Please seek immediate help by calling <strong>911</strong> or your local emergency services.
                    </span>
                </div>

                {Array.isArray(results.conditions) && results.conditions.length > 0 && (
                    <div className="card bg-base-100 shadow border border-base-300 text-left">
                        <div className="card-body">
                            <h4 className="card-title text-sm">Related conditions considered</h4>
                            <ul className="list-disc list-inside text-sm">
                                {results.conditions.map((cond) => (
                                    <li key={cond.id}>
                                        {cond.name}
                                        {cond.common_name && cond.common_name !== cond.name && (
                                            <span className="opacity-60"> ({cond.common_name})</span>
                                        )}
                                        {cond.probability != null && (
                                            <span className="opacity-60"> – {(cond.probability * 100).toFixed(1)}%</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <p className="text-xs opacity-50 mt-4">This tool does not provide medical advice.</p>
            </div>
        );
    }

    // No diagnosis case
    if (results.noDiagnosis) {
        return (
            <div className="max-w-lg mx-auto space-y-6 text-center">
                <h2 className="text-2xl font-bold text-center">No Diagnosis Found</h2>
                <p className="text-center text-lg mt-4">
                    We could not determine a clear condition based on the information provided.
                    Please consult a healthcare professional for further guidance.
                </p>
                <p className="text-xs opacity-50 mt-6">
                    This tool is for educational purposes only and does not provide a medical diagnosis.
                </p>
            </div>
        );
    }

    // Normal diagnosis case: if topCondition missing, show a gentle fallback
    if (!topCondition) {
        return (
            <div className="max-w-lg mx-auto space-y-4 text-center p-4">
                <p className="text-red-500">Sorry — we couldn’t load the final condition.</p>
                <p className="text-sm opacity-70">Please restart the symptom check.</p>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-center">Most Likely Condition</h2>

            <div className="card bg-base-100 shadow border border-base-300">
                <div className="card-body">
                    <h3 className="card-title">
                        {topCondition.name}
                        {topCondition.common_name && topCondition.common_name !== topCondition.name && (
                            <span className="text-base-content/60 ml-1">({topCondition.common_name})</span>
                        )}
                    </h3>

                    {details?.hint && <div className="alert alert-warning mt-2">{details.hint}</div>}

                    <ul className="mt-3 space-y-1 text-sm">
                        {details?.severity && <li><strong>Severity:</strong> {details.severity}</li>}
                        {details?.acuteness && <li><strong>Course:</strong> {details.acuteness}</li>}
                        {details?.prevalence && (
                            <li><strong>Prevalence:</strong> {String(details.prevalence).replace("_", " ")}</li>
                        )}
                    </ul>

                    {topCondition.probability != null && (
                        <div className="mt-4">
                            <progress
                                className="progress progress-primary w-full"
                                value={topCondition.probability * 100}
                                max="100"
                            />
                            <p className="text-xs text-center opacity-60 mt-1">
                                Estimated likelihood: {(topCondition.probability * 100).toFixed(1)}%
                            </p>
                        </div>
                    )}

                    {/* MedlinePlus Loading */}
                    {loadingInfo && (
                        <div className="mt-3 flex items-center gap-2 justify-center">
                            <span className="loading loading-spinner loading-sm text-primary" />
                            <p className="text-sm opacity-70">Loading additional info from MedlinePlus...</p>
                        </div>
                    )}

                    {/* MedlinePlus Info */}
                    {displayedEntries.length > 0 && (
                        <div className="mt-4 space-y-4">
                            <h4 className="font-semibold text-lg">Additional Info from MedlinePlus</h4>

                            {displayedEntries.map((entry) => {
                                const href = entry.link?.[0]?.href || "";
                                const key = href || entry.id || entry.title?._value || `${topCondition.id}-${String(entry.title?._value ?? "")}`;

                                const rawHtml = entry.summary?._value || "";
                                const fullText = htmlToText(rawHtml);
                                const previewText =
                                    fullText.length > 300 ? fullText.slice(0, 300) + "..." : fullText;

                                const isExpanded = expandedSummaries.has(key);

                                return (
                                    <div key={key} className="p-2 border border-base-300 rounded">
                                        {href ? (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-primary"
                                            >
                                                {entry.title?._value || "MedlinePlus article"}
                                            </a>
                                        ) : (
                                            <div className="font-medium">{entry.title?._value || "MedlinePlus article"}</div>
                                        )}

                                        {fullText && (
                                            <div className="text-sm mt-1 whitespace-pre-line">
                                                {isExpanded ? fullText : previewText}
                                                {fullText.length > 300 && (
                                                    <button
                                                        className="btn btn-xs btn-link mt-1"
                                                        onClick={() => toggleSummary(key)}
                                                        type="button"
                                                    >
                                                        {isExpanded ? "Show Less" : "Read More"}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {conditionInfo.length > 5 && (
                                <button
                                    className="btn btn-xs btn-outline mt-2"
                                    onClick={() => setExpandedEntries((v) => !v)}
                                    type="button"
                                >
                                    {expandedEntries
                                        ? "Show Less Entries"
                                        : `See More Entries (${conditionInfo.length - 5} more)`}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Save result section */}
            {user && !saved && (
                <div className="card bg-base-100 border border-base-300 shadow mt-6">
                    <div className="card-body space-y-4">
                        <h4 className="font-semibold text-lg">Save this result?</h4>

                        <p className="text-sm opacity-70">
                            Would you like to save this result to your symptoms history for reference in the future?
                        </p>

                        <textarea
                            className="textarea textarea-bordered w-full"
                            placeholder="Optional notes (e.g. how you were feeling, what you plan to do next)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            maxLength={5000}
                        />

                        {saveError && <p className="text-red-500 text-sm">{saveError}</p>}

                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : "Save Result"}
                        </button>
                    </div>
                </div>
            )}

            {user && saved && (
                <div className="alert alert-success mt-6">
                    This result has been saved to your symptoms history.
                </div>
            )}
        </div>
    );
};

export default ResultsStep;
