import { useSymptomCheckContext } from "./useSymptomCheckContext";
import { apiRequest } from "../utils/api";
import questionData from "../data/question.json";
import symptomsData from "../data/symptoms.json";

export const USE_MOCK_DATA = true;

export const useSymptomCheckActions = () => {
    const { state, dispatch } = useSymptomCheckContext();

    const buildAgePayload = (age) => ({ value: Number(age), unit: "year" });

    // Load symptom suggestions
    const loadSymptoms = async () => {
        if (!state.age) throw new Error("Age is required to fetch symptoms");

        if (USE_MOCK_DATA) {
            return symptomsData.map(s => ({
                value: s.id,
                label: s.common_name || s.name,
            }));
        }

        const query = new URLSearchParams({
            age: state.age.toString(),
            ...(state.sex ? { sex: state.sex } : {}),
        });

        const res = await apiRequest(`/api/infermedica/symptoms?${query.toString()}`);

        if (!res.success) {
            throw new Error(res.data.error || "Failed to load symptoms");
        }

        return res.data.map(s => ({
            value: s.id,
            label: s.common_name || s.name,
        }));
    };

    // Submit initial diagnosis (returns next question + conditions)
    const submitInitialDiagnosis = async () => {
        const payload = {
            age: buildAgePayload(state.age),
            sex: state.sex,
            evidence: state.evidence,
        };

        if (USE_MOCK_DATA) {
            console.log("📝 [MOCK] POST /diagnosis (initial) payload:", payload);

            const entry = questionData[0][0];
            dispatch({ type: "SET_QUESTION_INDEX", payload: 0 });

            return {
                question: entry.question,
                conditions: entry.conditions,
                interviewToken: entry.interview_token
            };
        }

        const response = await apiRequest("/api/infermedica/diagnosis", {
            method: "POST",
            body: payload,
        });

        if (!response.success) {
            throw new Error(response.data.error);
        }

        return {
            question: response.data.question,
            conditions: response.data.conditions,
            interviewToken: response.data.interview_token
        };
    };

    // Submit follow-up diagnosis
    const submitFollowupDiagnosis = async (newEvidence) => {
        const updatedEvidenceArr = [
            ...state.evidence.filter(e => e.id !== newEvidence.id),
            newEvidence,
        ];

        const payload = {
            "age": buildAgePayload(state.age),
            "sex": state.sex,
            "evidence": updatedEvidenceArr,
            interview_token: state.interviewToken,
        };

        if (USE_MOCK_DATA) {
            console.log("📝 [MOCK] POST /diagnosis (follow-up) payload:", payload);

            const currentIndex = state.questionIndex;
            const nextIndex = currentIndex + 1;

            const entry = questionData[0][nextIndex];
            dispatch({ type: "ADD_EVIDENCE", payload: newEvidence });
            dispatch({ type: "SET_QUESTION_INDEX", payload: nextIndex });

            return {
                question: entry.question,
                conditions: entry.conditions,
                should_stop: entry.should_stop,
                has_emergency_evidence: entry.has_emergency_evidence
            };
        }

        const res = await apiRequest("/api/infermedica/diagnosis", {
            method: "POST",
            body: payload,
        });

        if (!res.success) throw new Error(res.data.error);

        dispatch({ type: "ADD_EVIDENCE", payload: newEvidence });

        return {
            question: res.data.question,
            conditions: res.data.conditions,
            should_stop: res.data.should_stop,
            has_emergency_evidence: res.data.has_emergency_evidence,
        };
    };

    return { loadSymptoms, submitInitialDiagnosis, submitFollowupDiagnosis };
};
