import React, { useContext } from 'react';
import { MyContext } from '../../pages/SymptomChecker';
import { IoFemale, IoMale } from "react-icons/io5";
import StepNavigation from './StepNavigationButtons';

const SexInput = () => {
    const { sex, setSex, setStep } = useContext(MyContext);

    return (
        <div>
            <h3 className="form-label">What is your sex assigned at birth?</h3>
            <div className="d-flex justify-content-center gap-4 mb-3">
                <IoFemale size="2em" />
                <IoMale size="2em" />
            </div>

            <select
                className="form-select text-center mt-3"
                name="sex"
                onChange={(e) => setSex(e.target.value)}
                value={sex}
            >
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>


            <StepNavigation
                onBack={() => setStep(prev => prev - 1)}
                onNext={() => setStep(prev => prev + 1)}
                backLabel="Back"
                nextLabel="Continue"
            />
        </div>
    );
};

export default SexInput;
