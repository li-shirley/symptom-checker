import React from 'react'
import { useHistory } from 'react-router-dom'
import doc from "../images/doc.jpeg"

const Intro = () => {
    const history=useHistory()
    return (
        <div>
            <h3>Welcome to the Symptom Checker! </h3>
            <img src={doc} style={{width: "40%", marginBottom: "1em"}} alt=""></img>            
            <h6>In order to assess your symptoms, we will collect some basic information about you. All information will be kept anonymous.</h6>
            <button className="btn btn btn-primary mt-3" onClick={ (e) => history.push("/symptom-check/disclaimer")}>Continue</button>
        </div>
    )
}

export default Intro