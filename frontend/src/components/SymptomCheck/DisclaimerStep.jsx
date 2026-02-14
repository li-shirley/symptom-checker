import { useSymptomCheckContext } from "../../hooks/useSymptomCheckContext";

const DisclaimerStep = () => {
    const { dispatch } = useSymptomCheckContext();

    const goNext = () => dispatch({ type: "SET_STEP", payload: "demographics" });

    return (
        <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold">Disclaimer</h2>

            <div className="text-base-content/70 space-y-3">
                <p>
                    This symptom checker is for informational purposes only and does not
                    replace professional medical advice.
                </p>
                <p>
                    Do not use this tool to self-diagnose or delay seeking care from a
                    healthcare provider.
                </p>
                <p>
                    Always consult a qualified medical professional for any health
                    concerns.
                </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
                <button type="button" className="btn btn-primary" onClick={goNext}>
                    I Agree
                </button>
            </div>
        </div>
    );
};

export default DisclaimerStep;
