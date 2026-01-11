// c:\m.1\My Progs\LexCodex\C--\src\context\ShellContext.jsx
import React, { createContext, useState, useContext, useCallback, useRef } from 'react';

const ShellContext = createContext(null);

export const useShell = () => {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error('useShell must be used within a ShellProvider');
  }
  return context;
};

export const ShellProvider = ({ children }) => {
  const [shells, setShells] = useState([{ id: 'shell-1' }]);
  const [activeShellId, setActiveShellId] = useState('shell-1');
  const shellRunners = useRef(new Map());
  const shellClearers = useRef(new Map());

  const addShell = () => {
    const newId = `shell-${Date.now()}`;
    setShells(prev => [...prev, { id: newId }]);
    setActiveShellId(newId);
  };

  const removeShell = useCallback((id) => {
    setShells(prev => prev.filter(shell => shell.id !== id));
    if (activeShellId === id) {
      setActiveShellId(null);
    }
  }, [activeShellId]);

  const registerShellRunner = useCallback((id, runFn) => {
    shellRunners.current.set(id, runFn);
    return () => {
      shellRunners.current.delete(id);
    };
  }, []);

  const registerShellClearer = useCallback((id, clearFn) => {
    shellClearers.current.set(id, clearFn);
    return () => {
      shellClearers.current.delete(id);
    };
  }, []);

  const runAll = useCallback(() => {
    shellRunners.current.forEach(runFn => runFn());
  }, []);

  const runCurrent = useCallback(() => {
    if (activeShellId && shellRunners.current.has(activeShellId)) {
      shellRunners.current.get(activeShellId)();
    }
  }, [activeShellId]);

  const clearAllOutputs = useCallback(() => {
    shellClearers.current.forEach(clearFn => clearFn());
  }, []);

  return (
    <ShellContext.Provider value={{ 
      shells, 
      addShell, 
      removeShell,
      registerShellRunner, 
      registerShellClearer,
      runAll, 
      runCurrent, 
      clearAllOutputs,
      activeShellId, 
      setActiveShellId 
    }}>
      {children}
    </ShellContext.Provider>
  );
};
