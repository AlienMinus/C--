import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import NotFound from './NotFound';
import ShellList from './components/ShellList';
import NavBar from './components/NavBar';
import { ShellProvider } from './context/ShellContext';

function App() {
  
  return (
    <ShellProvider>
      <Router>
        <NavBar />
          <Routes>
            <Route path="/" element={<ShellList />} />
            <Route path="/*" element={<NotFound />} />
          </Routes>
      </Router>
    </ShellProvider>
  )
}

export default App
