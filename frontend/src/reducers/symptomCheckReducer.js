

export const initialState = {
    // for testing only
    questionIndex: 0,

    // flow control
    step: "intro", // intro → disclaimer → demographics → symptoms → questions → results
    loading: false,
    error: null,

    // demographics
    age: "",
    sex: "",

    // symptoms & diagnosis
    evidence: [], // Infermedica evidence
    question: null,
    broadConditions: null,
    results: null,

    // follow-up
    interviewToken: null,
};

const logAction = (action, state) => {
    console.groupCollapsed(`🧠 SymptomCheck Action: ${action.type}`);
    console.log("Payload:", action.payload);
    console.log("Prev State:", state);
    console.groupEnd();
};

export function symptomCheckReducer(state, action) {
    if (import.meta.env.DEV) logAction(action, state);

    switch (action.type) {
        // for testing only
        case "SET_QUESTION_INDEX":
            return { ...state, questionIndex: action.payload };

        // flow control
        case "SET_STEP":
            return { ...state, step: action.payload, error: null  };

        case "RESET":
            return { ...initialState };

        // demographics
        case "SET_DEMOGRAPHICS":
            return {
                ...state,
                ...action.payload
            };;

        // questions -> diagnosis
        case "SET_QUESTION":
            return { ...state, question: action.payload };

        case "SET_BROAD_CONDITIONS":
            return { ...state, broadConditions: action.payload };

        case "SET_RESULTS":
            return { ...state, results: action.payload, step: "results", loading: false };

        // follow-up handling
        case "SET_INTERVIEW_TOKEN":
            return { ...state, interviewToken: action.payload };

        case "ADD_EVIDENCE":
            // if id exists, update choice_id; otherwise append
            {
                const evidenceExists = state.evidence.findIndex(e => e.id === action.payload.id);
                let updatedEvidence;
                if (evidenceExists > -1) {
                    updatedEvidence = state.evidence.map(e =>
                        e.id === action.payload.id ? { ...e, choice_id: action.payload.choice_id } : e
                    );
                } else {
                    updatedEvidence = [...state.evidence, action.payload];
                }
                return { ...state, evidence: updatedEvidence };
            }

        // async page state
        case "LOADING":
            return { ...state, loading: true };
        case "LOADED":
            return { ...state, loading: false };

        case "ERROR":
            return { ...state, loading: false, error: action.payload };

        default:
            return state;
    }
}
