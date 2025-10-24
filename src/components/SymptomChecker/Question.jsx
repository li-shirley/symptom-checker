import React, { useContext } from 'react';
import { MyContext } from './SymptomCheckerPage';
import { BsQuestionDiamond } from "react-icons/bs";

const Question = ({handleQuestionSubmit}) => {
    const { question, present, setPresent, evidence, setEvidence, broadConditions, step, setStep, } = useContext(MyContext);

    const handleQuestion = () => {
        const newEvidence = [...evidence, { "id": question.items[0].id, "choice_id": present }];
        setEvidence(newEvidence);
        handleQuestionSubmit(newEvidence);
    };

    return (
        <div>
        <h5>Please answer questions to the best of your ability. Questions will end when the most accurate condition is predicted.</h5>
        <h3 className="form-label">{question.text}</h3>
        <BsQuestionDiamond size="2em" />

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

        <button className="btn btn-primary my-3" onClick={handleQuestion}>Next</button>

        {broadConditions && (
            <div className="mt-3">
            <h4>Probable Conditions:</h4>
            <table className="table">
                <tbody>
                {broadConditions.map((condition, i) => (
                    <tr key={i}>
                    <th>{condition.name}</th>
                    <td>Probability: {(condition.probability * 100).toFixed(2)}%</td>
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
