import React, { useContext } from 'react';
import { MdEmergency } from "react-icons/md";
import { RiHealthBookLine } from "react-icons/ri";
import { MyContext } from '../../pages/SymptomChecker';
import StepNavigation from './StepNavigationButtons';

const Disclaimer = () => {
    const { setStep } = useContext(MyContext);

    return (
        <div>
        <h6>
            Please understand that results of the Symptom Checker are not to be
            substituted with a medical professional's advice. Results are not official
            diagnoses.
        </h6>
        <RiHealthBookLine size="2em" />
        <h6>
            In the event of an emergency, please call 9-1-1, or your local emergency
            number.
        </h6>
        <MdEmergency size="2em" />
        <p>By clicking "continue" you agree to the above conditions.</p>

        <StepNavigation
                onBack={() => setStep(prev => prev - 1)}
                onNext={() => setStep(prev => prev + 1)}
            />
        </div>
    );
};

export default Disclaimer;
