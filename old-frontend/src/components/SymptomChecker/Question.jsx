import React, { useContext } from 'react';
import { MyContext } from '../../pages/SymptomChecker';
import { BsQuestionDiamond } from "react-icons/bs";
import StepNavigation from './StepNavigationButtons';

const Question = ({handleFollowUpQuestionSubmit}) => {
    const { question, present, setPresent, evidence, setEvidence, broadConditions, setStep} = useContext(MyContext);

    if (!question || !question.items || question.items.length === 0) {
        return <p>Loading question...</p>;
    }
    
    const currentItemId = question.items[0].id;

    const handleNext = () => {
        const newEvidence = [...evidence, { id: currentItemId, choice_id: present }];
        setEvidence(newEvidence);
        handleFollowUpQuestionSubmit(newEvidence);
    };


    return (
        <div>
            <h3 className='mb-5'>Please answer each question to the best of your ability. Questions will end when the most accurate condition is predicted.</h3>

            <h5 className="form-label mb-3">{question.text}</h5>
            <BsQuestionDiamond size="2em" className="mb-3" />

            <select
                className="form-select text-center mt-3"
                name="present"
                onChange={(e) => setPresent(e.target.value)}
                value={present}
            >
                <option value="present">Yes</option>
                <option value="absent">No</option>
                <option value="unknown">Don't know</option>
            </select>

            <StepNavigation
                onNext={handleNext}
                nextLabel="Next"
            />

            {broadConditions && broadConditions.length > 0 && (
                <div className="mt-4">
                    <h4>Probable Conditions:</h4>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Condition</th>
                                <th>Probability</th>
                            </tr>
                        </thead>
                        <tbody>
                            {broadConditions.map((cond, i) => (
                                <tr key={i}>
                                    <td>{cond.name}</td>
                                    <td>{(cond.probability * 100).toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Question;
