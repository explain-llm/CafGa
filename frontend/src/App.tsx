import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import Main from './components/Main'
import ExplanationComparison from './components/ExplanationComparison/EvaluationComparison';
import { annulModeSwitchIfUnregistered} from './services/settings';
function App() {
  // If users reload the page during the registration process, they could enter the study without registering.
  annulModeSwitchIfUnregistered();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/explanation-comparison" element={<ExplanationComparison />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
