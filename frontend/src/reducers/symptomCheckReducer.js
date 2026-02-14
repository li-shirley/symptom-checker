

export const INITIAL_STATE = {
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
    console.groupCollapsed(`SymptomCheck Action: ${action.type}`);
    console.log("Payload:", action.payload);
    console.log("Prev State:", state);
    console.groupEnd();
};

export function symptomCheckReducer(state, action) {
    if (import.meta.env.DEV) logAction(action, state);

    switch (action.type) {
        // for mock data testing only
        case "SET_QUESTION_INDEX":
            return { ...state, questionIndex: action.payload };

        // flow control
        case "SET_STEP":
            return { ...state, step: action.payload, error: null };

        case "RESET":
            return { ...INITIAL_STATE };

        // demographics
        case "SET_DEMOGRAPHICS":
            return {
                ...state,
                ...action.payload
            };

        // questions -> diagnosis
        case "SET_QUESTION":
            return { ...state, question: action.payload };

        case "SET_BROAD_CONDITIONS":
            return { ...state, broadConditions: action.payload };

        case "SET_RESULTS":
            return { ...state, results: action.payload, loading: false };

        // follow-up handling
        case "SET_INTERVIEW_TOKEN":
            return { ...state, interviewToken: action.payload };

        case "ADD_EVIDENCE":
            // if id exists, update choice_id; otherwise append
            {
                const incoming = action.payload;
                const exists = state.evidence.some((e) => e.id === incoming.id);

                const evidence = exists
                    ? state.evidence.map((e) =>
                        e.id === incoming.id ? { ...e, choice_id: incoming.choice_id } : e
                    )
                    : [...state.evidence, incoming];

                return { ...state, evidence };
            }

        case "REMOVE_EVIDENCE": {
            const id = action.payload;
            return {
                ...state,
                evidence: state.evidence.filter((e) => e.id !== id),
            };
        }

        // async page state
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload };

        default:
            return state;
    }
}
