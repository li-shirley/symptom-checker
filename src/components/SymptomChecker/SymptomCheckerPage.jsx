import React, { createContext, useState, useCallback } from "react";
import axios from "axios";
import '../../styles/App.css';      
import logo from '../../assets/images/logo.jpg';
import SearchBar from "../../components/SymptomChecker/SearchBar";
import SexInput from "../../components/SymptomChecker/SexInput";
import AgeInput from "../../components/SymptomChecker/AgeInput";
import Question from "../../components/SymptomChecker/Question";
import Results from "../../components/SymptomChecker/Results";
import Intro from "../../components/SymptomChecker/Intro";
import Disclaimer from "../../components/SymptomChecker/Disclaimer";

//for testing
import symptomData from '../../Data.json'; 



export const MyContext = createContext();

function SymptomCheckerPage() {
    // State
    const [age, setAge] = useState("");
    const [ageErr, setAgeErr] = useState(true);
    const [sex, setSex] = useState("male");
    const [tags, setTags] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [evidence, setEvidence] = useState([]);
    const [question, setQuestion] = useState({});
    const [broadConditions, setBroadConditions] = useState();
    const [results, setResults] = useState({});
    const [step, setStep] = useState(0);
    const [present, setPresent] = useState("present");

    // Handlers
    const handleAge = (e) => {
        setAge(e.target.value);
        if (e.target.value <= 0) setAgeErr("Age is required.");
        else if (e.target.value % 1 !== 0) setAgeErr("Age must be a whole number");
        else if (e.target.value > 119) setAgeErr("Age inputted exceeds max age.");
        else setAgeErr("");
    };

    // const getSymptoms = () => {
    //     const header = {
    //         "App-Key": process.env.REACT_APP_API_KEY,
    //         "App-Id": process.env.REACT_APP_API_ID
    //     };

    //     axios
    //         .get(`https://api.infermedica.com/v3/symptoms?age.value=${age}`, { headers: header })
    //         .then(res => {
    //         const formatted = res.data.map(symptom => ({
    //             id: symptom.id,
    //             name: symptom.common_name || symptom.name
    //         }));
    //         setSuggestions(formatted);
    //         setStep(prevStep => prevStep + 1); // move to SexInput
    //         console.log("Formatted suggestions:", formatted.slice(0, 5));
    //         })
    //         .catch(err => console.log(err));
    // };

    //  for testing
    const getSymptoms = () => {
        // Map the JSON to the format ReactTags expects
        const formatted = symptomData.map(symptom => ({
            value: symptom.id,
            label: symptom.common_name || symptom.name
        }));
        setSuggestions(formatted);
        
        // Move to the next step (SexInput)
        setStep(prevStep => prevStep + 1);

        console.log("Loaded test suggestions:", formatted.slice(0, 10));
    };

    const onDelete = useCallback((tagIdx) => {
        setTags(prevTags => prevTags.filter((_, i) => i !== tagIdx));
    }, []);


    const onAddition = useCallback((newTag) => {
        setTags(prevTags => [...prevTags, newTag]);
        setEvidence(prevEvidence => [
            ...prevEvidence, 
            { id: newTag.value, choice_id: "present", source: "initial" }
        ]);
    }, []);

    const handleFirstSubmit = (age, sex, evidence) => {
        const header = {
        "Content-Type": "application/json",
        "App-Key": process.env.REACT_APP_API_KEY,
        "App-Id": process.env.REACT_APP_API_ID
        };
        axios.post('https://api.infermedica.com/v3/diagnosis', {
        "age": { "value": age },
        "sex": sex,
        "evidence": evidence,
        "extras": { "disable_groups": true }
        }, { headers: header })
        .then(res => {
            setQuestion(res.data.question);
            setStep(prevStep => prevStep + 1); // move to Questions
        })
        .catch(err => console.log(err.response));
    };

    const handleQuestionSubmit = (evidenceArr) => {
        const header = {
        "Content-Type": "application/json",
        "App-Key": process.env.REACT_APP_API_KEY,
        "App-Id": process.env.REACT_APP_API_ID
        };
        axios.post('https://api.infermedica.com/v3/diagnosis', {
        age: { value: age },
        sex,
        evidence: evidenceArr,
        extras: { disable_groups: true }
        }, { headers: header })
        .then(res => {
            if (res.data.should_stop) getCondition(res.data.conditions[0].id);
            else {
            setQuestion(res.data.question);
            setBroadConditions(res.data.conditions);
            }
        })
        .catch(err => console.log(err.response));
    };

    const getCondition = (id) => {
        const header = {
        "Content-Type": "application/json",
        "App-Key": process.env.REACT_APP_API_KEY,
        "App-Id": process.env.REACT_APP_API_ID
        };
        axios.get(`https://api.infermedica.com/v3/conditions/${id}?age.value=${age}`, { headers: header })
        .then(res => {
            setResults(res.data);
            setStep(prevStep => prevStep + 1); // move to Results
        })
        .catch(err => console.log(err.response));
    };

    // Step Components
    const steps = [
        <Intro />,
        <Disclaimer />,
        <AgeInput getSymptoms={getSymptoms} />,
        <SexInput />,
        <SearchBar handleFirstSubmit={handleFirstSubmit} />,
        <Question handleQuestionSubmit={handleQuestionSubmit} />,
        <Results />
    ];

      // 👇 ADD THIS HERE, before the return
    console.log("Current step index:", step);
    console.log("Step component:", steps[step]);

    return (
        <MyContext.Provider value={{
            age, setAge,
            ageErr, setAgeErr,
            sex, setSex,
            tags, setTags,
            suggestions, setSuggestions,
            evidence, setEvidence,
            handleAge, onDelete, onAddition,
            question, present, setPresent,
            results, broadConditions,
            step, setStep
        }}>

        <div className="container w-50 shadow p-3 my-5 bg-body rounded-3 text-center p-5 border border-5">
            <img src={logo} alt="logo" style={{ width: "60%" }} />
            
            {/* Display current step */}
            {steps[step]}
            
            {/* // Back/Next buttons for testing or navigation */}
            {/* <div className="mt-3">
            {step > 0 && step !== steps.length - 1 && (
                <button className="btn btn-secondary me-2" onClick={() => setStep(step - 1)}>Back</button>
            )} */}
            {/* Next button only if you want manual progression (can remove if handled in handlers) */}
            {/* {step < steps.length - 1 && step !== 2 && step !== 4 && (
                <button className="btn btn-primary" onClick={() => setStep(prevStep => prevStep + 1)}>Next</button>
            )}
            </div> */}
        </div>
        </MyContext.Provider>
    );
}

export default SymptomCheckerPage;
