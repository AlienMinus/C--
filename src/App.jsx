import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import NotFound from './NotFound';
import CodeBlock from './components/CodeBlock';
import NavBar from './components/NavBar';

function App() {
  
  return (
    <Router>
      <NavBar />
        <Routes>
          <Route path="/" element={<CodeBlock />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
    </Router>
  )
}

export default App
