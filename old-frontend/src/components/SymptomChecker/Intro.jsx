import React, { useContext } from 'react';
import docImg from '../../assets/images/doc.jpeg';
import { MyContext } from '../../pages/SymptomChecker';
import StepNavigation from './StepNavigationButtons';

const Intro = () => {
    const { setStep } = useContext(MyContext); 

    return (
        <div>
        <h3>Welcome to the Symptom Checker!</h3>
        <img
            src={docImg}
            style={{ width: "40%", marginBottom: "1em" }}
            alt="Doctor illustration"
        />
        <h6>
            In order to assess your symptoms, we will collect some basic information
            about you. All information will be kept anonymous.
        </h6>
        <StepNavigation
                onNext={() => setStep(prev => prev + 1)}
            />
        </div>
    );
};

export default Intro;
