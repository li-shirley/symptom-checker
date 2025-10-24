import React, { useContext } from 'react';
import { MyContext } from './SymptomCheckerPage';
import { RiHospitalLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';

const Results = () => {
    const { results, setStep, setEvidence, setTags, setQuestion, setBroadConditions, setPresent } = useContext(MyContext);
    const navigate = useNavigate();

    const handleRestart = () => {
        // Reset context state to start over
        setStep(0);
        setEvidence([]);
        setTags([]);
        setQuestion({});
        setBroadConditions(null);
        setPresent("present");
        navigate("/symptom-check");
    };

    if (!results || !results.name) {
        return <p>Loading results...</p>;
    }

    return (
        <div>
        <h3>Most Likely Condition:</h3>
        <RiHospitalLine size="2em" />
        <h4 className="mt-3">{results.name}</h4>
        <p>Recommendation: {results.extras?.hint || "No recommendation available."}</p>
        <button className="btn btn-primary mt-3" onClick={handleRestart}>
            Recheck Symptoms
        </button>
        </div>
    );
};

export default Results;
