import React, { useContext } from 'react';
import { MyContext } from './SymptomCheckerPage';
import { IoFemale, IoMale } from "react-icons/io5";

const SexInput = () => {
    const { sex, setSex, step, setStep } = useContext(MyContext);

    return (
        <div>
        <h3 className="form-label">What is your sex?</h3>
        <IoFemale size="2em" />
        <IoMale size="2em" />

        <select
            className="form-select text-center mt-3"
            name="sex"
            onChange={(e) => setSex(e.target.value)}
            value={sex}
        >
            <option value="male">Male</option>
            <option value="female">Female</option>
        </select>

        <button
            className="btn btn-secondary me-3 mt-3"
            onClick={() => setStep(prevStep => prevStep - 1)} // Back to AgeInput
        >
            Back
        </button>

        <button
            className="btn btn-primary mt-3"
            onClick={() => setStep(prevStep => prevStep + 1)} // Continue to SearchBar
        >
            Continue
        </button>
        </div>
    );
};

export default SexInput;
