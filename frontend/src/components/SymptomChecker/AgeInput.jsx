import React, { useContext } from 'react';
import { MyContext } from '../../pages/SymptomChecker';
import { FaBirthdayCake } from "react-icons/fa";
import StepNavigation from './StepNavigationButtons';

const AgeInput = ({ getSymptoms }) => {
    const { age, ageErr, handleAge, setStep } = useContext(MyContext);

    return (
        <div>
            <h3>What is your age?</h3>
            <FaBirthdayCake size="2em" className="mb-3" />
            {ageErr && <p className="text-danger">{ageErr}</p>}

            <input
                className="form-control text-center"
                type="number"
                name="age"
                onChange={handleAge}
                value={age}
            />

            <StepNavigation
                onBack={() => setStep(prev => prev - 1)}
                onNext={getSymptoms}
                backLabel="Back"
                nextLabel="Continue"
                nextDisabled={!!ageErr} 
            />

        </div>
    );
};

export default AgeInput;
