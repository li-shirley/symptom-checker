import { useReducer } from "react";
import { SymptomCheckContext } from "../contexts/SymptomCheckContext";
import {
    symptomCheckReducer,
    INITIAL_STATE,
} from "../reducers/symptomCheckReducer";

const SymptomCheckProvider = ({ children }) => {
    const [state, dispatch] = useReducer(
        symptomCheckReducer,
        INITIAL_STATE
    );

    return (
        <SymptomCheckContext.Provider value={{ state, dispatch }}>
            {children}
        </SymptomCheckContext.Provider>
    );
};

export default SymptomCheckProvider;
