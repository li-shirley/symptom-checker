import React, {useContext} from 'react'
import { MyContext } from '../App';
import { useHistory } from 'react-router-dom'
import { FaBirthdayCake } from "react-icons/fa";

const AgeInput = (props) => {
    const {age, ageErr, handleAge} = useContext(MyContext)
    const history=useHistory()
    return (
        <div>
            <h3>What is your age?</h3>
            <FaBirthdayCake size="2em" className="mb-3"/>
            {
                ageErr &&
                <p className="text-danger">{ageErr}</p>
            }
            <input className="form-control text-center" type="number" name="age" onChange={handleAge} value={age} />
            <button className="btn btn btn-secondary me-3 mt-3" onClick={ (e) => history.push("/symptom-check/disclaimer")}>Back</button>
            <button className="btn btn btn-primary mt-3" disabled={ageErr} onClick={(e) => {
                props.getSymptoms();
            }}>Continue</button>
        </div>
    )
}

export default AgeInput