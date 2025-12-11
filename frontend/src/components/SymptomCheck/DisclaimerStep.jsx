import React from 'react';
import { useSymptomCheckContext } from '../../hooks/useSymptomCheckContext';

const DisclaimerStep = () => {
    const { dispatch } = useSymptomCheckContext();

    const handleAgree = () => {
        // Move to the next step in the flow
        dispatch({ type: 'SET_STEP', payload: 'demographics' });
    };

    return (
        <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold">Disclaimer</h2>
            <p className="text-base-content/70 text-center">
                The symptom checker is intended for informational purposes only and does not replace professional medical advice.
                Do not use this tool to self-diagnose or delay seeking care from a healthcare provider.
                Always consult a qualified medical professional for any health concerns.
            </p>

            <button
                className="btn btn-primary mt-4"
                onClick={handleAgree}
            >
                I Agree
            </button>
        </div>
    );
};

export default DisclaimerStep;
