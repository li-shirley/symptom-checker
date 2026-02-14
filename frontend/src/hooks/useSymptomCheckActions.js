import { useSymptomCheckContext } from "./useSymptomCheckContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { apiRequest } from "../utils/api";

import questionData from "../data/question.json";
import symptomsData from "../data/symptoms.json";

export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true";
const questions = questionData[0]

export const useSymptomCheckActions = () => {
    const { state, dispatch } = useSymptomCheckContext();
    const { user, refreshAccessToken } = useAuthContext();
    const accessToken = user?.token;

    const auth = { accessToken, refreshAccessToken };

    // Load symptom suggestions
    const loadSymptoms = async () => {
        if (!state.age) throw new Error("Age is required to fetch symptoms");

        if (USE_MOCK_DATA) {
            return symptomsData.map((s) => ({ value: s.id, label: s.name }));
        }

        const query = new URLSearchParams({ age: state.age.toString() });

        const res = await apiRequest(
            `/api/infermedica/symptoms?${query.toString()}`, 
            {},
            auth
        );

        if (!res.ok) {
            throw new Error(res.error?.message || "Failed to load symptoms");
        }

        return (res.data ?? []).map((s) => ({ value: s.id, label: s.name }));
    };

    // Submit initial diagnosis (returns next question + conditions)
    const submitInitialDiagnosis = async () => {
        const payload = {
            age: state.age,
            sex: state.sex,
            evidence: state.evidence,
        };

        if (USE_MOCK_DATA) {
            const entry = questions[0];
            dispatch({ type: "SET_QUESTION_INDEX", payload: 0 });

            return {
                question: entry.question,
                conditions: entry.conditions,
                interviewToken: entry.interview_token
            };
        }

        const res = await apiRequest(
            "/api/infermedica/diagnosis", 
            { method: "POST", body: payload }, 
            auth
        );

        if (!res.ok) {
            throw new Error(res.error?.message || "Failed to submit diagnosis");
        }

        return {
            question: res.data?.question,
            conditions: res.data?.conditions,
            interviewToken: res.data?.interview_token,
        };
    };

    // Submit follow-up diagnosis
    const submitFollowupDiagnosis = async (newEvidence) => {
        const updatedEvidenceArr = [
            ...state.evidence.filter(e => e.id !== newEvidence.id),
            newEvidence,
        ];

        const payload = {
            age: state.age,
            sex: state.sex,
            evidence: updatedEvidenceArr,
            interview_token: state.interviewToken,
        };

        if (USE_MOCK_DATA) {
            const currentIndex = state.questionIndex;
            const nextIndex = currentIndex + 1;

            const entry = questions[nextIndex];
            dispatch({ type: "ADD_EVIDENCE", payload: newEvidence });
            dispatch({ type: "SET_QUESTION_INDEX", payload: nextIndex });

            return {
                question: entry.question,
                conditions: entry.conditions,
                should_stop: entry.should_stop,
                has_emergency_evidence: entry.has_emergency_evidence
            };
        }

        const res = await apiRequest(
            "/api/infermedica/diagnosis", 
            { method: "POST", body: payload }, 
            auth
        );

        if (!res.ok) {
            throw new Error(res.error?.message || "Failed to submit follow-up diagnosis");
        }

        dispatch({ type: "ADD_EVIDENCE", payload: newEvidence });

        return {
            question: res.data?.question,
            conditions: res.data?.conditions,
            should_stop: res.data?.should_stop,
            has_emergency_evidence: res.data?.has_emergency_evidence,
        };
    };

    return { loadSymptoms, submitInitialDiagnosis, submitFollowupDiagnosis };
};
