import React from 'react';

const StepNavigation = ({
    onBack,
    onNext,
    backLabel = "Back",
    nextLabel = "Continue",
    backClass = "btn btn-secondary me-3 mt-3",
    nextClass = "btn btn-primary mt-3",
    nextDisabled = false, // <-- new prop
}) => {
    return (
        <div className="mt-3">
            {onBack && (
                <button className={backClass} onClick={onBack}>
                    {backLabel}
                </button>
            )}
            {onNext && (
                <button
                    className={nextClass}
                    onClick={onNext}
                    disabled={nextDisabled} // <-- disables the button
                >
                    {nextLabel}
                </button>
            )}
        </div>
    );
};

export default StepNavigation;
