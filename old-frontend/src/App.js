import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from './pages/HomePage'
import SymptomChecker from "./pages/SymptomChecker";
import NavBar from "./components/Navbar";


function App() {
  return (
    <BrowserRouter>
      <NavBar></NavBar>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/symptom-check" element={<SymptomChecker/>} />
      </Routes>
    </BrowserRouter>

  );
}

export default App;

