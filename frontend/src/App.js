import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SymptomChecker from "./pages/SymptomChecker.jsx";


function App() {
  return (
      <Routes>
        <Route path="/symptom-check" element={<SymptomChecker/>} />
      </Routes>

  );
}

export default App;

