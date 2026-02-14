import { useEffect, useState } from "react";
import { useSymptomCheckContext } from "../../hooks/useSymptomCheckContext";
import { useSymptomCheckActions } from "../../hooks/useSymptomCheckActions";

const QuestionStep = () => {
    const { state, dispatch } = useSymptomCheckContext();
    const { submitFollowupDiagnosis } = useSymptomCheckActions();

    const [selectedChoice, setSelectedChoice] = useState(null);

    // Reset selection when a new question arrives
    useEffect(() => {
        setSelectedChoice(null);
    }, [state.question?.text]);

    // Part of returned question json that has symptom id, name, and applicable answers
    const questionItem = state.question?.items?.[0] ?? null;

    // Infermedica-provided instructions on how to determine is symptom is present (sometimes applicable).
    const hasInstructions =
        Array.isArray(state.question?.instruction) && state.question.instruction.length > 0;

    if (!state.question) {
        return (
            <div className="p-8 flex items-center justify-center gap-3">
                <span className="loading loading-spinner loading-md text-primary" />
                <p className="text-sm opacity-70">Loading question...</p>
            </div>
        );
    }

    // If question is malformed, fail (don’t crash)
    if (!questionItem || !Array.isArray(questionItem.choices)) {
        return (
            <div className="p-4">
                <p className="text-red-500 text-center">
                    Sorry — we couldn’t load the next question. Please restart the symptom check.
                </p>
            </div>
        );
    }

    const handleNext = async () => {
        if (!selectedChoice || state.loading) return;
        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({ type: "SET_ERROR", payload: null });

        try {
            const result = await submitFollowupDiagnosis({
                id: questionItem.id,
                choice_id: selectedChoice,
                name: questionItem.name
            });

            if (!result) {
                dispatch({ type: "SET_ERROR", payload: "No response from diagnosis service." });
                return;
            }

            // Emergency symptom detected
            if (result?.has_emergency_evidence === true) {
                dispatch({
                    type: "SET_RESULTS",
                    payload: {
                        emergency: true,
                        conditions: result.conditions ?? []
                    },
                });
                dispatch({ type: "SET_STEP", payload: "results" });
                return;
            }

            // Reached a result diagnosis
            if (result?.should_stop === true) {
                const topCondition = Array.isArray(result.conditions) ? result.conditions[0] : null;

                dispatch({
                    type: "SET_RESULTS",
                    payload: {
                        should_stop: true,
                        topCondition: topCondition,
                        conditions: result.conditions ?? [],
                    },
                });
                dispatch({ type: "SET_STEP", payload: "results" });
                return;
            }

            // Dead-end: no next question returned from API
            if (!result.question) {
                dispatch({
                    type: "SET_RESULTS",
                    payload: {
                        noDiagnosis: true,
                        conditions: result.conditions ?? [],
                    },
                });
                dispatch({ type: "SET_STEP", payload: "results" });
                return;
            }

            // Needs further questioning / continute to next follow-up question
            dispatch({ type: "SET_QUESTION", payload: result.question });
            dispatch({ type: "SET_BROAD_CONDITIONS", payload: result.conditions ?? [] });

        } catch (err) {
            if (import.meta.env.DEV) console.warn("Follow-up diagnosis failed:", err);
            dispatch({
                type: "SET_ERROR",
                payload: err?.message || "Failed to submit your answer",
            });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    return (
        <div className="space-y-6 px-4 sm:px-6 md:px-0">
            <h2 className="text-2xl font-bold text-center">Question</h2>

            <p className="text-center text-lg mt-4 font-medium">{state.question.text}</p>

            {state.loading && (
                <p className="text-center text-sm text-gray-500 animate-pulse">
                    Processing your answer...
                </p>
            )}

            {/* Explication */}
            {state.question.explication && (
                <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-md max-w-prose mx-auto mt-3 shadow">
                    <input type="checkbox" className="peer" />
                    <div className="collapse-title text-primary font-medium text-center">
                        Show more
                    </div>
                    <div className="collapse-content text-gray-700 italic leading-relaxed">
                        {state.question.explication}
                    </div>
                </div>
            )}

            {/* Instructions */}
            {hasInstructions && (
                <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-md max-w-md mx-auto mt-4 shadow">
                    <input type="checkbox" className="peer" />
                    <div className="collapse-title text-primary font-medium text-center">
                        How to check
                    </div>
                    <div className="collapse-content">
                        <ol className="list-decimal list-inside space-y-2">
                            {state.question.instruction.map((step, i) => (
                                <li
                                    key={i}
                                    className="bg-base-200 rounded-md p-2 text-base-content leading-relaxed shadow-sm"
                                >
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            )}


            {/* Choices */}
            <div className="flex flex-col gap-4 mt-6 max-w-sm mx-auto">
                {questionItem.choices.map(choice => (
                    <button
                        key={choice.id}
                        className={`btn btn-lg ${selectedChoice === choice.id ? "btn-secondary" : "btn-outline"}`}
                        onClick={() => setSelectedChoice(choice.id)}
                        disabled={state.loading}
                    >
                        {choice.label}
                    </button>
                ))}
            </div>

            <div className="flex justify-end mt-4 max-w-sm mx-auto">
                <button
                    className="btn btn-primary w-full mt-4"
                    onClick={handleNext}
                    disabled={!selectedChoice || state.loading}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default QuestionStep;
