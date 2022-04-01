import React from 'react'
import { useHistory } from 'react-router-dom'
import { MdEmergency } from "react-icons/md"
import { RiHealthBookLine } from "react-icons/ri";

const Disclaimer = () => {
    const history = useHistory()
    return (
        <div>
            <h6>Please understand that results of the Symptom Checker are not to be substituted with a medical professional's advice. Results are not official diagnoses.</h6>
            <RiHealthBookLine size="2em"/>
            <h6>In the event of an emergency, please call 9-1-1, or your local emergency number.</h6>
            <MdEmergency size="2em" />
            <p>By clicking "continue" you agree to the above conditions.</p>
            <button className="btn btn btn-secondary me-3 mt-3" onClick={(e) => history.push("/symptom-check")}>Back</button>
            <button className="btn btn btn-primary mt-3" onClick={(e) => history.push("/symptom-check/age")}>Continue</button>
        </div>
    )
}

export default Disclaimer