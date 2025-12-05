import React, { useContext } from 'react';
import { MyContext } from '../../pages/SymptomChecker';
import { RiHospitalLine } from "react-icons/ri";
import StepNavigation from './StepNavigationButtons';

const Results = () => {
    const { results, handleRestart } = useContext(MyContext);



    if (!results || !results.name) {
        return <p>Loading results...</p>;
    }

    const { name, extras } = results;
    const recommendation = extras?.hint || "No recommendation available.";

    return (
        <div>
            <h3>Most Likely Condition:</h3>
            <RiHospitalLine size="2em" className="my-2"/>
            <h4 className="mt-3">{name}</h4>
            <p className="mt-2">
                <strong>Recommendation:</strong> {recommendation}
            </p>

            <StepNavigation 
                onNext={handleRestart} 
                nextLabel="Recheck Symptoms" 
                nextClass="btn btn-primary mt-4" 
            />
        </div>
    );
};

export default Results;
