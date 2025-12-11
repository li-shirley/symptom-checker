import React from "react";
import { useSymptomCheckContext } from "../../hooks/useSymptomCheckContext";

const IntroStep = () => {
    const { dispatch } = useSymptomCheckContext();

    return (
        <div className="space-y-6 text-center">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">
                    Feeling off?
                </h1>
                <p className="text-base text-base-content/70">
                    Let’s check your symptoms and see what might be going on.
                </p>
            </div>

            {/* Description */}
            <div className="space-y-3 text-sm text-base-content/70">
                <p>
                    This tool uses a medical triage system to suggest
                    possible causes based on your age, sex, and symptoms.
                </p>
                <p>
                    It is <strong>not</strong> a medical diagnosis, but a way
                    to better understand what you’re feeling.
                </p>
            </div>

            {/* CTA */}
            <div className="pt-4">
                <button
                    className="btn btn-primary btn-wide"
                    onClick={() => dispatch({ type: "SET_STEP", payload: "disclaimer" })}
                >
                    Start symptom check
                </button>
            </div>
        </div>
    );
};

export default IntroStep;
