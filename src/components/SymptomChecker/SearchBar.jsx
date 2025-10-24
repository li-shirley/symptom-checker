import React, { useContext, useRef } from 'react';
import { MyContext } from './SymptomCheckerPage';
import { ReactTags } from 'react-tag-autocomplete';
import { IoBodyOutline } from "react-icons/io5";

const SearchBar = ({ handleFirstSubmit }) => {
    const { age, sex, evidence, tags, suggestions, onDelete, onAddition, setStep } = useContext(MyContext);
    const reactTags = useRef();

    const handleSubmit = () => {
        handleFirstSubmit(age, sex, evidence);
        // handleFirstSubmit already advances the step
    };

    const filterSuggestions = (inputValue, suggestions = []) => {
        return suggestions.filter(s =>
            s.label.toLowerCase().includes(inputValue.toLowerCase())
        );
    };


    return (
        <div>
        <h3>Which symptoms are you experiencing?</h3>
        <IoBodyOutline size="2em" />
        <h6 className="mt-3">(You may add more than one symptom)</h6>

        <ReactTags
            ref={reactTags}
            selected={tags}
            suggestions={suggestions}
            onDelete={onDelete}
            onAdd={onAddition}
            placeholder="Search symptoms"
            suggestionsTransform={filterSuggestions}
        />


        <button
            className="btn btn-secondary me-3 mt-3"
            onClick={() => setStep(prevStep => prevStep - 1)} // Back to SexInput
        >
            Back
        </button>

        <button
            className="btn btn-primary mt-3"
            onClick={handleSubmit}
        >
            Submit
        </button>
        </div>
    );
};

export default SearchBar;
