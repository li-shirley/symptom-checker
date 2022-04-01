import React, { useContext, useRef } from 'react'
import { MyContext } from '../App';
import ReactTags from 'react-tag-autocomplete'
import { useHistory } from 'react-router-dom';
import { IoBodyOutline } from "react-icons/io5";

const SearchBar = (props) => {
    const { age, sex, evidence, tags, suggestions, onDelete, onAddition } = useContext(MyContext)
    const reactTags = useRef()
    const history = useHistory()

    function handleSubmit() {
        props.handleFirstSubmit(age, sex, evidence);
    }

    return (
        <div>
            <h3>Which symptoms are you experiencing?</h3>
            <IoBodyOutline size="2em"/>
            <h6 className="mt-3">(You may add more than one symptom)</h6>
            <ReactTags
                ref={reactTags}
                tags={tags}
                suggestions={suggestions}
                onDelete={onDelete}
                onAddition={onAddition}
                placeholderText="Search symptoms"
            />
            <button className="btn btn btn-secondary me-3 mt-3" onClick={(e) => history.push("/symptom-check/sex")}>Back</button>
            <button className="btn btn btn-primary mt-3" onClick={handleSubmit}>Submit</button>
        </div>
    )
}

export default SearchBar