import React from "react";
import { useSymptomCheckContext } from "../hooks/useSymptomCheckContext";

// steps
import IntroStep from "../components/SymptomCheck/IntroStep";
import DisclaimerStep from "../components/SymptomCheck/DisclaimerStep";
import DemographicsStep from "../components/SymptomCheck/DemographicsStep";
import SymptomsStep from "../components/SymptomCheck/SymptomsStep";
import QuestionStep from "../components/SymptomCheck/QuestionStep";
import ResultsStep from "../components/SymptomCheck/ResultsStep";

const SymptomCheck = () => {
    const { state } = useSymptomCheckContext();

    const steps = {
        intro: <IntroStep />,
        disclaimer: <DisclaimerStep />,
        demographics: <DemographicsStep />,
        symptoms: <SymptomsStep />,
        questions: <QuestionStep />,
        results: <ResultsStep />,
        // todo: add cute error page
    };

    return (
        <div className="min-h-screen flex justify-center items-start p-6 bg-base-200">
            <div className="w-full max-w-xl bg-base-100 rounded-xl shadow-lg p-6">
                {steps[state.step] || <div>Step not found</div>} 
            </div>
        </div>
    );

};

export default SymptomCheck;
