import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { ReactTags } from "react-tag-autocomplete";

import { useSymptomCheckContext } from "../../hooks/useSymptomCheckContext";
import { useSymptomCheckActions } from "../../hooks/useSymptomCheckActions";

const CustomTag = ({ tag, classNames, ...tagProps }) => (
    <button type="button" {...tagProps} className={`${classNames.tag} flex items-center gap-1 focus:outline-none`}>
        <span className={classNames.tagName}>{tag.label}</span>
        <span aria-hidden className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-primary-content hover:bg-primary-content/20">
            <X size={12} strokeWidth={2} />
        </span>
    </button>
);

const SymptomsStep = () => {
    const { state, dispatch } = useSymptomCheckContext();
    const { loadSymptoms, submitInitialDiagnosis } = useSymptomCheckActions();

    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [localSymptoms, setLocalSymptoms] = useState([]);

    const didFetchRef = useRef(false);

    // load symptoms suggestions
    useEffect(() => {
        if (state.step !== "symptoms") return;
        if (didFetchRef.current) return;
        didFetchRef.current = true;

        const fetch = async () => {
            dispatch({ type: "SET_LOADING", payload: true });

            try {
                const loaded = await loadSymptoms();
                setSuggestions(Array.isArray(loaded) ? loaded : []);
            } catch (err) {
                if (import.meta.env.DEV) {
                    console.warn("Loading symptoms failed:", err);
                }
                dispatch({ type: "SET_ERROR", payload: "Failed to load symptoms" });
            } finally {
                dispatch({ type: "SET_LOADING", payload: false });
            }
        };

        fetch();
    }, [state.step, loadSymptoms, dispatch]);

    // filter symptom suggestions to exclude selected tags
    const visibleSuggestions = useMemo(() => {
        const q = query.trim().toLowerCase();
        const selected = new Set(localSymptoms.map((s) => s.value));

        return suggestions.filter((s) => {
            if (selected.has(s.value)) return false;
            if (!q) return true;
            return s.label.toLowerCase().includes(q);
        });
    }, [suggestions, localSymptoms, query]);

    // Add symptom to local state and evidence to global state
    const onAdd = (symptom) => {
        setLocalSymptoms(prev => [...prev, symptom]);

        dispatch({
            type: "ADD_EVIDENCE",
            payload: {
                id: symptom.value,
                choice_id: "present",
                source: "initial",
                name: symptom.label
            }
        });
    };

    // Remove symptom from local state and evidence from global state
    const onDelete = (index) => {
        const removed = localSymptoms[index];
        if (!removed) return; // guard against non-existent index (fast clicking, lag, etc)

        setLocalSymptoms(prev => prev.filter((_, i) => i !== index));

        dispatch({
            type: "REMOVE_EVIDENCE",
            payload: removed.value // id
        });
    };

    // submit symptoms
    const handleNext = async () => {
        if (!localSymptoms.length || state.loading) return;

        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({ type: "SET_ERROR", payload: null });

        try {
            const result = await submitInitialDiagnosis();

            dispatch({ type: "SET_QUESTION", payload: result.question });
            dispatch({ type: "SET_BROAD_CONDITIONS", payload: result.conditions });
            dispatch({ type: "SET_INTERVIEW_TOKEN", payload: result.interviewToken });

            dispatch({ type: "SET_STEP", payload: "questions" }); // go to next step
        } catch (err) {
            dispatch({ type: "SET_ERROR", payload: err?.message || "Failed to submit symptoms" });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Which symptoms are you experiencing?</h2>
            <p className="text-center text-sm text-gray-500">Please select at least one symptom. Selecting more will help us provide a more accurate assessment.</p>

            {state.error && (
                <div className="text-center text-red-500 mb-2">{state.error}</div>
            )}

            <div className="border border-base-300 rounded-lg p-2 bg-base-100 w-full">
                <ReactTags
                    selected={localSymptoms}
                    suggestions={visibleSuggestions}
                    onAdd={onAdd}
                    onDelete={onDelete}
                    placeholderText={state.loading ? "Loading..." : "Add a symptom"}
                    noOptionsText="No matching symptoms"
                    labelText=""
                    renderTag={CustomTag}
                    allowBackspace={false}
                    collapseOnSelect
                    handleInputChange={setQuery}
                    inline={true}
                    minQueryLength={1}
                    maxSuggestionsLength={50}
                    classNames={{
                        root: "relative cursor-text border-2 border-base-300 rounded-md bg-base-100 p-2",
                        tagList: "flex flex-wrap items-center gap-1",
                        tag: "px-2 py-1 rounded bg-base-200 text-sm flex items-center",
                        tagName: "mr-1",
                        comboBox: "flex flex-1 min-w-[120px]",
                        input: "w-full bg-transparent border-0 outline-none text-base",
                        listBox:
                            "absolute left-0 top-full z-50 w-full mt-1 max-h-52 overflow-y-auto bg-base-100 border border-base-300 rounded-md shadow-lg",
                        option: "px-2 py-1 cursor-pointer",
                        optionIsActive: "bg-primary text-primary-content",
                        optionIsDisabled: "opacity-50 cursor-not-allowed",
                        highlight: "bg-warning",
                    }}
                />
            </div>

            <div className="flex justify-end mt-4">
                <button
                    className="btn btn-primary w-full mt-4"
                    onClick={handleNext}
                    disabled={localSymptoms.length === 0 || state.loading}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default SymptomsStep;
