import { useMemo, useEffect, useRef, useState } from "react";
import { useSymptomCheckContext } from "../hooks/useSymptomCheckContext";
import Modal from "../components/Modal";

// steps
import IntroStep from "../components/SymptomCheck/IntroStep";
import DisclaimerStep from "../components/SymptomCheck/DisclaimerStep";
import DemographicsStep from "../components/SymptomCheck/DemographicsStep";
import SymptomsStep from "../components/SymptomCheck/SymptomsStep";
import QuestionStep from "../components/SymptomCheck/QuestionStep";
import ResultsStep from "../components/SymptomCheck/ResultsStep";

const STEP_COMPONENTS = {
    intro: IntroStep,
    disclaimer: DisclaimerStep,
    demographics: DemographicsStep,
    symptoms: SymptomsStep,
    questions: QuestionStep,
    results: ResultsStep,
}

const SymptomCheck = () => {
    const { state, dispatch } = useSymptomCheckContext();
    const [leaveOpen, setLeaveOpen] = useState(false);

    // allow back navigation when user confirms
    const allowBackRef = useRef(false);
    // track if a guard entry is present
    const guardActiveRef = useRef(false);

    const shouldWarn = useMemo(() => {
        return (
            Boolean(state.age) ||
            Boolean(state.sex) ||
            (Array.isArray(state.evidence) && state.evidence.length > 0) ||
            Boolean(state.question) ||
            Boolean(state.broadConditions) ||
            Boolean(state.results) ||
            Boolean(state.interviewToken)
        );
    }, [
        state.age,
        state.sex,
        state.evidence,
        state.question,
        state.broadConditions,
        state.results,
        state.interviewToken,
    ]);

    // Warn user before closing tab, refreshing, or external nav. (Uses native browser warning/UI)
    useEffect(() => {
        if (!shouldWarn) return;

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [shouldWarn]);

    // Warn user on in-app route changes & browser's back/forward button (via popstate)
    // App is using BrowserRouter (not a data router), so useBlocker isn’t available.
    useEffect(() => {
        if (!shouldWarn) {
            // if progress is cleared, drop guard behavior
            guardActiveRef.current = false;
            return;
        }

        // Install a guard entry once per "warn session"
        if (!guardActiveRef.current) {
            window.history.pushState({ __symptomcheck_guard: true }, "");
            guardActiveRef.current = true;
        }

        const onPopState = (event) => {
            // If user already confirmed leaving, allow real back
            if (allowBackRef.current) return;

            // Only block if we're popping the guard entry
            if (event.state?.__symptomcheck_guard) {
                // keep them here and show modal
                setLeaveOpen(true);
                // Re-add the guard entry so they don't actually leave
                window.history.pushState({ __symptomcheck_guard: true }, "");
                guardActiveRef.current = true;
            }
        };

        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, [shouldWarn]);

    const cancelLeave = () => {
        setLeaveOpen(false);
    };

    const confirmLeave = () => {
        setLeaveOpen(false);

        // allow one back navigation through
        allowBackRef.current = true;

        // go back once (this will trigger popstate, but allowBackRef lets it pass)
        window.history.back();

        // reset after a tick (so future back presses elsewhere behave normally)
        setTimeout(() => {
            allowBackRef.current = false;
            guardActiveRef.current = false;
        }, 0);
    };

    // Reset state when component unmounts (user navigates away)
    useEffect(() => {
        return () => {
            dispatch({ type: "RESET" });
        };
    }, [dispatch]);

    const Step = STEP_COMPONENTS[state.step];

    return (
        <div className="min-h-screen flex flex-col items-center bg-base-200 p-6">
            <div className="w-full max-w-xl bg-base-100 rounded-xl shadow-lg p-6">
                {Step ? <Step /> : <div>Step not found</div>}
            </div>

            <p className="text-xs opacity-50 text-center mt-6">
                These results are informational only and are not a diagnosis.
            </p>

            <p className="text-sm opacity-60 mt-3">
                Powered by{" "}
                <a
                    href="https://infermedica.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-80"
                >
                    Infermedica
                </a>
            </p>

            <Modal
                isOpen={leaveOpen}
                onCancel={cancelLeave}
                onConfirm={confirmLeave}
                title="Leave symptom check?"
                message="If you leave now, your progress will be lost and you’ll need to start over."
                confirmText="Leave"
                cancelText="Stay"
            />
        </div>
    );
};

export default SymptomCheck;
