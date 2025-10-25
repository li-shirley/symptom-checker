import React, { useContext, useRef } from 'react';
import { MyContext } from '../../pages/SymptomChecker';
import { ReactTags } from 'react-tag-autocomplete';
import { IoBodyOutline } from "react-icons/io5";
import StepNavigation from './StepNavigationButtons';
import '../../styles/App.css'; 

const SearchBar = ({ handleFirstSubmit }) => {
    const { age, sex, evidence, tags, suggestions, onDelete, onAdd, setStep } = useContext(MyContext);
    const reactTags = useRef();

    const handleSubmit = () => {
        handleFirstSubmit(age, sex, evidence);
    };

    const sanitizeInput = (e, inputProps) => {
        let value = e.target.value;
        if (/^\s+/.test(value)) value = value.replace(/^\s+/, "");
        if (typeof inputProps.onChange === "function") {
            const synthetic = { ...e, target: { ...e.target, value } };
            inputProps.onChange(synthetic);
        }
    };

    const handlePaste = (e, inputProps) => {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData("text");
        const trimmed = paste.replace(/^\s+/, "");
        const el = e.currentTarget;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newValue = el.value.slice(0, start) + trimmed + el.value.slice(end);
        if (typeof inputProps.onChange === "function") {
            const synthetic = { ...e, target: { ...el, value: newValue } };
            inputProps.onChange(synthetic);
        }
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
                onAdd={onAdd}
                onDelete={onDelete}
                placeholder="Search symptoms"
                noOptionsText="No symptoms found for %value%"
                collapseOnSelect={true}
                allowBackspace={false}
                renderInput={({ ref, classNames, inputWidth, ...inputProps }) => (
                    <input
                        {...inputProps}
                        ref={ref}
                        onKeyDown={(e) => {
                            // Prevent leading space at start
                            if (e.key === " " && e.currentTarget.selectionStart === 0 && e.currentTarget.value.length === 0) {
                                e.preventDefault();
                            }
                        }}
                        onPaste={(e) => handlePaste(e, inputProps)}
                        onChange={(e) => sanitizeInput(e, inputProps)}
                    />
                )}
            />

            <StepNavigation
                onBack={() => setStep(prev => prev - 1)}
                onNext={handleSubmit}
                backLabel="Back"
                nextLabel="Submit"
                nextDisabled={tags.length === 0}
            />

            
        </div>
    );
};

export default SearchBar;
