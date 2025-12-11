import { useContext } from "react";
import { SymptomCheckContext } from "../contexts/SymptomCheckContext";

export const useSymptomCheckContext = () => {
    const context = useContext(SymptomCheckContext);

    if (!context) {
        throw new Error(
            "useSymptomCheckContext must be used within a SymptomCheckProvider"
        );
    }

    return context;
};
