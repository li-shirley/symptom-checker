import React, { useState } from "react";
import { useSymptomCheckContext } from "../../hooks/useSymptomCheckContext";
import { useAuthContext } from "../../hooks/useAuthContext";

const DemographicsStep = () => {
    const { state, dispatch } = useSymptomCheckContext();
    const { user } = useAuthContext();

    // Local form state
    const [ageInput, setAgeInput] = useState(state.age || user?.age || "");
    const [sexInput, setSexInput] = useState(state.sex || user?.sex || "");

    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [heightUnit, setHeightUnit] = useState("in");
    const [weightUnit, setWeightUnit] = useState("lb");

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        const num = Number(ageInput);
        if (!ageInput) newErrors.age = "Age is required.";
        else if (!Number.isInteger(num)) newErrors.age = "Age must be a whole number.";
        else if (num <= 0) newErrors.age = "Age must be greater than 0.";
        else if (num > 120) newErrors.age = "Age exceeds max allowed (120).";

        if (!sexInput) newErrors.sex = "Please select your sex.";

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // BMI calculation (synchronous)
    const calculateBmiEvidence = () => {
        if (!height || !weight) return [];

        // Convert to metric
        let heightCm = Number(height);
        let weightKg = Number(weight);

        if (heightUnit === "in") heightCm = heightCm * 2.54;
        if (weightUnit === "lb") weightKg = weightKg * 0.453592;

        const bmi = weightKg / ((heightCm / 100) ** 2);
        const bmiEvidence = [];

        if (bmi < 19) {
            bmiEvidence.push({ id: "p_6", choice_id: "present" }); // low BMI
        } else if (bmi > 30) {
            bmiEvidence.push({ id: "p_7", choice_id: "present" }); // high BMI
        } else {
            bmiEvidence.push({ id: "p_6", choice_id: "absent" });
            bmiEvidence.push({ id: "p_7", choice_id: "absent" });
        }

        return bmiEvidence;
    };

    const handleNext = () => {
        if (!validate()) return;

        const bmiEvidence = calculateBmiEvidence();

        dispatch({
            type: "SET_DEMOGRAPHICS",
            payload: { age: Number(ageInput), sex: sexInput }
        });

        // Add BMI evidence
        bmiEvidence.forEach((evidence) => {
            dispatch({ type: "ADD_EVIDENCE", payload: evidence });
        });

        dispatch({ type: "SET_STEP", payload: "symptoms" });
    };


    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Demographics</h2>

            {/* Age Input */}
            <div>
                <label className="block font-medium mb-1">
                    <span className="label-text">Age</span>
                </label>
                <input
                    type="number"
                    value={ageInput}
                    min={1}
                    onChange={(e) => setAgeInput(e.target.value)}
                    className={`input input-bordered w-full ${errors.age ? "input-error" : ""}`}
                    placeholder="Enter your age"
                />
                {errors.age && (
                    <span className="label-text-alt text-error">{errors.age}</span>
                )}
            </div>

            {/* Sex Input */}
            <div>
                <label className="block font-medium mb-1">
                    Sex assigned at birth
                </label>
                <span className="text-sm text-gray-500 block mb-2">
                    For the symptom checker only. If you indentify as transgender, intersex, or non-binary, please select the option that best matches your biological sex.
                </span>
                <select
                    value={sexInput}
                    onChange={(e) => setSexInput(e.target.value)}
                    className={`select select-bordered w-full ${errors.sex ? "select-error" : ""}`}
                >
                    <option value="">Select sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                {errors.sex && (
                    <span className="label-text-alt text-error">{errors.sex}</span>
                )}
            </div>

            {/* Height Input with unit */}
            <div>
                <label className="block font-medium mb-1">
                    <span className="label-text">Height (optional)</span>
                </label>
                <div className="flex">
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="Enter your height"
                        min={0}
                    />
                    <select
                        value={heightUnit}
                        onChange={(e) => setHeightUnit(e.target.value)}
                        className="select select-bordered ml-2 w-24"
                    >
                        <option value="cm">cm</option>
                        <option value="in">in</option>
                    </select>
                </div>
            </div>

            {/* Weight Input with unit */}
            <div>
                <label className="block font-medium mb-1">
                    <span className="label-text">Weight (optional)</span>
                </label>
                <div className="flex">
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="Enter your weight"
                        min={0}
                    />
                    <select
                        value={weightUnit}
                        onChange={(e) => setWeightUnit(e.target.value)}
                        className="select select-bordered ml-2 w-24"
                    >
                        <option value="kg">kg</option>
                        <option value="lb">lb</option>
                    </select>
                </div>
            </div>




            <button
                className="btn btn-primary w-full mt-4"
                onClick={handleNext}
            >
                Next
            </button>
        </div>
    );
};

export default DemographicsStep;
