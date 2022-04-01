import React, {useContext} from 'react'
import { MyContext } from '../App';
import { useHistory } from 'react-router-dom';
import { IoFemale, IoMale } from "react-icons/io5";


const SexInput = () => {
    const {sex, setSex } = useContext(MyContext)
    const history = useHistory()
    return (
        <div>
            <h3 className="form-label">What is your sex?</h3>
            <IoFemale size="2em"/>
            <IoMale size="2em"/>
            <select className="form-select text-center mt-3" name="sex" onChange={(e) => setSex(e.target.value)} value={sex}>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
            <button className="btn btn btn-secondary me-3 mt-3" onClick={ (e) => history.push("/symptom-check/age")}>Back</button>
            <button className="btn btn btn-primary mt-3" onClick={ (e) => history.push("/symptom-check/search")}>Continue</button>
        </div>
    )
}

export default SexInput