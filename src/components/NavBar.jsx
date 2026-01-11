import React from 'react';
import { Link } from 'react-router-dom';
import { VscRunAll, VscClearAll } from "react-icons/vsc";
import { MdRunCircle } from "react-icons/md";
import { RiAddCircleFill } from "react-icons/ri";
import { useShell } from '../context/ShellContext';

const NavButton = ({ children, title, ...props }) => (
  <button
    {...props}
    title={title}
    style={{
      backgroundColor: '#333333',
      color: '#22c55e',
      border: '1px solid #444',
      padding: '0.5rem',
      borderRadius: '50%',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.1s ease-in-out, background-color 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = '#444';
      e.currentTarget.style.transform = 'scale(1.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = '#333';
      e.currentTarget.style.transform = 'scale(1)';
    }}
    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
  >
    {children}
  </button>
);

const NavBar = () => {
  const { addShell, runAll, runCurrent, clearAllOutputs } = useShell();

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#1e1e1e',
      borderBottom: '1px solid #333',
      fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#00ff00', fontSize: '1.5rem', fontWeight: 'bold' }}>
        &lt;C-- /&gt;
      </Link>
      <div style={{ display: 'flex', gap: '10px' }}>
        <NavButton title="Run All Shell" onClick={runAll}><VscRunAll /></NavButton>
        <NavButton title="Run Current Shell" onClick={runCurrent}><MdRunCircle /></NavButton>
        <NavButton title="Clear All Outputs" onClick={clearAllOutputs}><VscClearAll /></NavButton>
        <NavButton title="Add New Shell" onClick={addShell}><RiAddCircleFill /></NavButton>
      </div>
    </nav>
  );
};

export default NavBar;