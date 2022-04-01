import React, { createContext, useState, useCallback } from "react";
import { Route, useHistory, Switch } from "react-router-dom";
import axios from "axios";
import './App.css'
import logo from "./images/logo.jpg"

import SearchBar from "./components/SearchBar";
import SexInput from "./components/SexInput";
import AgeInput from "./components/AgeInput";
import Question from "./components/Question";
import Results from "./components/Results";
import Intro from "./components/Intro";
import Disclaimer from "./components/Disclaimer";

export const MyContext = createContext()

function App() {
  const [age, setAge] = useState("")
  const [ageErr, setAgeErr] = useState(true)
  const [sex, setSex] = useState("male")
  const [tags, setTags] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [evidence, setEvidence] = useState([])
  const [question, setQuestion] = useState({})
  const [present, setPresent] = useState("present")
  const [broadConditions, setBroadConditions] = useState()
  const [results, setResults] = useState({})
  const history = useHistory();

  const handleAge = (e) => {
    setAge(e.target.value)
    if (e.target.value <= 0) {
      setAgeErr("Age is required.")
    }
    else if(e.target.value %1 !== 0) {
      setAgeErr("Age must be a whole number")
    }
    else if (e.target.value > 119) {
      setAgeErr("Age inputted exceeds the age of oldest person currently alive.")
    }
    else setAgeErr("")
  }

  function getSymptoms() {
    const header = {
      "App-Key": process.env.REACT_APP_API_KEY,
      "App-Id": process.env.REACT_APP_API_ID
    };
    axios.get(`https://api.infermedica.com/v3/symptoms?age.value=${age}`, { headers: header })
      .then(res => {
        console.log(res.data)
        setSuggestions(res.data)
        history.push("/symptom-check/sex")
      })
      .catch(err => console.log(err))
  }

  const onDelete = useCallback((tagIdx) => {
    setTags(tags.filter((_, i) => i !== tagIdx))
  }, [tags])

  const onAddition = useCallback((newTag) => {
    setTags([...tags, newTag])
    setEvidence([...evidence, { "id": newTag.id, "choice_id": "present", "source": "initial" }])
  }, [tags])

  function handleFirstSubmit(age, sex, evidence) {
    const header = {
      "Content-Type": "application/json",
      "App-Key": process.env.REACT_APP_API_KEY,
      "App-Id": process.env.REACT_APP_API_ID
    }
    axios.post('https://api.infermedica.com/v3/diagnosis', {
      "age": {
        "value": age
      },
      "sex": sex,
      "evidence": evidence,
      "extras": { "disable_groups": true }
    }, { headers: header })
      .then(res => {
        console.log(res.data.question)
        setQuestion(res.data.question)
        history.push("/symptom-check/questions")
      })
      .catch(err => console.log(err.response))
  }

  function handleQuestionSubmit(e) {
    const header = {
      "Content-Type": "application/json",
      "App-Key": process.env.REACT_APP_API_KEY,
      "App-Id": process.env.REACT_APP_API_ID
    }
    axios.post('https://api.infermedica.com/v3/diagnosis', {
      "age": {
        "value": age
      },
      "sex": sex,
      "evidence": e,
      "extras": { "disable_groups": true }
    }, { headers: header })
      .then(res => {
        console.log(res.data)
        if (res.data.should_stop === true) {
          getCondition(res.data.conditions[0].id)
        }
        else {
          setQuestion(res.data.question)
          setBroadConditions(res.data.conditions)
        }
      })
      .catch(err => console.log(err.response))
  }

  function getCondition(id) {
    const header = {
      "Content-Type": "application/json",
      "App-Key": process.env.REACT_APP_API_KEY,
      "App-Id": process.env.REACT_APP_API_ID
    }
    axios.get(`https://api.infermedica.com/v3/conditions/${id}?age.value=${age}`, {
      headers: header
    })
      .then(res => {
        console.log(res.data)
        setResults(res.data)
        history.push("/symptom-check/results")
      })
      .catch(err => console.log(err.response))
      
  }

  return (
    
      <MyContext.Provider
        value={{ age, setAge, ageErr, setAgeErr, sex, setSex, tags, setTags, suggestions, setSuggestions, evidence, setEvidence, handleAge, onDelete, onAddition, question, present, setPresent, results, broadConditions }}>
        <Switch>
          <div className="container w-50 shadow p-3 my-5 bg-body rounded-3 text-center p-5 border border-5">
            <img src={logo} style={{width: "60%"}} alt=""></img>
            <Route exact path="/symptom-check">
              <Intro/>
            </Route>
            <Route exact path="/symptom-check/disclaimer">
              <Disclaimer/>
            </Route>
            <Route exact path="/symptom-check/age">
              <AgeInput getSymptoms={getSymptoms}/>
            </Route>
            <Route exact path="/symptom-check/sex">
              <SexInput />
            </Route>
            <Route exact path="/symptom-check/search">
              <SearchBar handleFirstSubmit={handleFirstSubmit} />
            </Route>
            <Route exact path="/symptom-check/questions">
              <Question handleQuestionSubmit={handleQuestionSubmit} />
            </Route>
            <Route exact path="/symptom-check/results">
              <Results />
            </Route>
          </div>
        </Switch>
      </MyContext.Provider >



  );
}

export default App;
