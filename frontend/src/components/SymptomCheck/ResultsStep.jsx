import React from "react";
import { useSymptomCheckContext } from "../../hooks/useSymptomCheckContext";
import { fetchMedlinePlusInfo } from "../../utils/medlineplus";

const ResultsStep = () => {
    const { state } = useSymptomCheckContext();
    const results = state.results;

    async function showConditionInfo(icd10, name) {
        const info = await fetchMedlinePlusInfo({ icd10, name });
        console.log(info);
    }

    if (!results) return <div className="text-center">No results available.</div>;

    // Emergency case
    if (results.emergency) {
        return (
            <div className="max-w-lg mx-auto space-y-6 text-center">
                <h2 className="text-3xl font-bold text-error">
                    Seek Emergency Care
                </h2>

                <p className="alert alert-error text-center">
                    <span>
                        We ended the symptom check early because some of your answers may indicate a serious medical emergency. Please seek immediate help by calling <strong>911</strong> or your local emergency services.
                    </span>
                </p>


                {Array.isArray(results.conditions) && (
                    <div className="card bg-base-100 shadow border border-base-300 text-left">
                        <div className="card-body">
                            <h4 className="card-title text-sm">
                                Related conditions considered
                            </h4>

                            <ul className="list-disc list-inside text-sm">
                                {results.conditions.map(cond => (
                                    <li key={cond.id}>
                                        {cond.name}
                                        {cond.common_name && cond.common_name !== cond.name && (
                                            <span className="opacity-60">
                                                {" "}({cond.common_name})
                                            </span>
                                        )}
                                        {cond.probability != null && (
                                            <span className="opacity-60">
                                                {" "}– {(cond.probability * 100).toFixed(1)}%
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <p className="text-xs opacity-50 mt-4">
                    This tool does not provide medical advice.
                </p>
            </div>
        );
    }

    const topCondition = results.topCondition;
    const details = topCondition?.condition_details;

    // Normal results
    return (
        <div className="max-w-lg mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-center">
                Most Likely Condition
            </h2>

            <div className="card bg-base-100 shadow border border-base-300">
                <div className="card-body">
                    <h3 className="card-title">
                        {topCondition.name}
                        {topCondition.common_name &&
                            topCondition.common_name !== topCondition.name && (
                                <span className="text-base-content/60 ml-1">
                                    ({topCondition.common_name})
                                </span>
                            )}
                    </h3>

                    {details?.hint && (
                        <div className="alert alert-warning mt-2">
                            <span>{details.hint}</span>
                        </div>
                    )}

                    <ul className="mt-3 space-y-1 text-sm">
                        {details?.severity && (
                            <li>
                                <strong>Severity:</strong> {details.severity}
                            </li>
                        )}
                        {details?.acuteness && (
                            <li>
                                <strong>Course:</strong> {details.acuteness}
                            </li>
                        )}
                        {details?.prevalence && (
                            <li>
                                <strong>Prevalence:</strong> {details.prevalence.replace("_", " ")}
                            </li>
                        )}
                        {details?.icd10_code && (
                            <li>
                                <strong>ICD-10:</strong> {details.icd10_code}
                            </li>

                        )}

                        {details?.icd10_code && (
                            <li>
                                <strong>ICD-10:</strong> {details.icd10_code}
                                <button
                                    className="btn btn-xs btn-outline ml-2"
                                    onClick={() => showConditionInfo(details.icd10_code, topCondition.name)}
                                >
                                    Fetch Info
                                </button>
                            </li>
                        )}

                    </ul>

                    {topCondition.probability != null && (
                        <div className="mt-4">
                            <progress
                                className="progress progress-primary w-full"
                                value={topCondition.probability * 100}
                                max="100"
                            />
                            <p className="text-xs text-center opacity-60 mt-1">
                                Estimated likelihood: {(topCondition.probability * 100).toFixed(1)}%
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <p className="text-xs opacity-50 text-center mt-6">
                These results are informational only and are not a diagnosis.
            </p>
        </div>
    );
};

export default ResultsStep;