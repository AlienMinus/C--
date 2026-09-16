import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import NotFound from './components/NotFound/NotFound';
import ShellList from './components/ShellList/ShellList';
import NavBar from './components/NavBar/NavBar';
import Sidebar from './components/Sidebar/Sidebar';
import { ShellProvider } from './context/ShellContext';

function App() {
  return (
    <ShellProvider>
      <Router>
        <NavBar />
        <Sidebar />
        <main className="notebook-main">
          <Routes>
            <Route path="/" element={<ShellList />} />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </main>
      </Router>
    </ShellProvider>
  );
}

export default App;
