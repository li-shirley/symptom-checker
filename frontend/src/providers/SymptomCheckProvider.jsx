import { useReducer } from "react";
import { SymptomCheckContext } from "../contexts/SymptomCheckContext";
import {
    symptomCheckReducer,
    initialState,
} from "../reducers/symptomCheckReducer";

const SymptomCheckProvider = ({ children }) => {
    const [state, dispatch] = useReducer(
        symptomCheckReducer,
        initialState
    );

    return (
        <SymptomCheckContext.Provider value={{ state, dispatch }}>
            {children}
        </SymptomCheckContext.Provider>
    );
};

export default SymptomCheckProvider;
