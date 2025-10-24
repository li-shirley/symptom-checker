import React, { useContext } from 'react';
import docImg from '../../assets/images/doc.jpeg';
import { MyContext } from './SymptomCheckerPage';

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
        <button
            className="btn btn-primary mt-3"
            onClick={() => setStep(prevStep => prevStep + 1)} // move to next step
        >
            Continue
        </button>
        </div>
    );
};

export default Intro;
