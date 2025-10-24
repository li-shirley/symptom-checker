import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SymptomCheckerPage from "./components/SymptomChecker/SymptomCheckerPage.jsx";

function App() {
  return (
      <Routes>
        <Route path="/symptom-check" element={<SymptomCheckerPage />} />
      </Routes>

  );
}

export default App;

