import React, { useContext } from 'react';
import { MyContext } from './SymptomCheckerPage';
import { FaBirthdayCake } from "react-icons/fa";

const AgeInput = ({ getSymptoms }) => {
    const { age, ageErr, handleAge, step, setStep } = useContext(MyContext);

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

        <button
            className="btn btn-secondary me-3 mt-3"
            onClick={() => setStep(prevStep => prevStep - 1)} // back to Disclaimer
        >
            Back
        </button>

        <button
            className="btn btn-primary mt-3"
            disabled={ageErr}
            onClick={() => getSymptoms()} // fetch symptoms and move to next step
        >
            Continue
        </button>
        </div>
    );
};

export default AgeInput;
