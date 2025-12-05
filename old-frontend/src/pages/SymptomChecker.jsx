import React, { createContext, useState, useCallback, useMemo,} from "react";
import axios from "axios";
import '../styles/App.css';      
import logo from '../assets/images/logo.jpg';
import SearchBar from "../components/SymptomChecker/SearchBar";
import SexInput from "../components/SymptomChecker/SexInput";
import AgeInput from "../components/SymptomChecker/AgeInput";
import Question from "../components/SymptomChecker/Question";
import Results from "../components/SymptomChecker/Results";
import Intro from "../components/SymptomChecker/Intro";
import Disclaimer from "../components/SymptomChecker/Disclaimer";

//for testing
import symptomData from '../Data.json'; 

export const MyContext = createContext();

const SymptomChecker = () => {

    // State
    const [age, setAge] = useState("");
    const [ageErr, setAgeErr] = useState("");
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
        const value = e.target.value;
        setAge(value);

        const num = Number(value);
        if (!value) setAgeErr("Age is required.");
        else if (!Number.isInteger(num)) setAgeErr("Age must be a whole number.");
        else if (num <= 0) setAgeErr("Age must be greater than 0.");
        else if (num > 119) setAgeErr("Age exceeds max allowed (119).");
        else setAgeErr("");
    };

    const headers = {
        "Content-Type": "application/json",
        "App-Key": process.env.REACT_APP_API_KEY,
        "App-Id": process.env.REACT_APP_API_ID,
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


    const onAdd = useCallback((newTag) => {
        setTags(prevTags => [...prevTags, newTag]);
        setEvidence(prevEvidence => [
            ...prevEvidence, 
            { id: newTag.value, choice_id: "present", source: "initial" }
        ]);
    }, []);

    const handleFirstSubmit = (age, sex, evidence) => {
        axios.post('https://api.infermedica.com/v3/diagnosis', {
        "age": { "value": age },
        "sex": sex,
        "evidence": evidence,
        "extras": { "disable_groups": true }
        }, { headers: headers })
        .then(res => {
            setQuestion(res.data.question);
            setStep(prevStep => prevStep + 1); // move to Questions
        })
        .catch(err => console.log(err.response));
    };

    const handleFollowUpQuestionSubmit = (evidenceArr) => {
        axios.post('https://api.infermedica.com/v3/diagnosis', {
        age: { value: age },
        sex,
        evidence: evidenceArr,
        extras: { disable_groups: true }
        }, { headers: headers })
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
        axios.get(`https://api.infermedica.com/v3/conditions/${id}?age.value=${age}`, { headers: headers })
        .then(res => {
            setResults(res.data);
            setStep(prevStep => prevStep + 1); // move to Results
        })
        .catch(err => console.log(err.response));
    };

    const handleRestart = useCallback(() => {
        setStep(0);
        setEvidence([]);
        setTags([]);
        setQuestion({});
        setBroadConditions(null);
        setPresent("present");
        setResults({});
    }, []);

    // Step Components
    const steps = [
        <Intro />, //0
        <Disclaimer />, //1
        <AgeInput getSymptoms={getSymptoms} />, //2
        <SexInput />, //3
        <SearchBar handleFirstSubmit={handleFirstSubmit} />, //4
        <Question handleFollowUpQuestionSubmit={handleFollowUpQuestionSubmit} />, //5
        <Results /> //6
    ];

    const contextValue = useMemo(() => ({
        age, setAge,
        ageErr, setAgeErr,
        sex, setSex,
        tags, setTags,
        suggestions, setSuggestions,
        evidence, setEvidence,
        handleAge, onDelete, onAdd,
        question, present, setPresent,
        results, broadConditions,
        step, setStep, handleRestart
    }), [
        age, ageErr, sex, tags, suggestions, evidence,
        question, present, results, broadConditions, step,
        handleRestart, onAdd, onDelete
    ]);

    return (

    <MyContext.Provider value={contextValue}>
        <div className="container w-50 shadow p-3 my-5 bg-body rounded-3 text-center p-5 border border-5" style={{ minHeight: "50vh" }}>
            <img src={logo} alt="logo" style={{ width: "60%" }} />
            {steps[step]}
        </div>
    </MyContext.Provider>
    );
}

export default SymptomChecker;
