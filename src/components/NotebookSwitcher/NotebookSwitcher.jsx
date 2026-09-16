import React, { useState, useRef, useEffect } from 'react';
import { useShell } from '../../context/ShellContext';
import { VscChevronDown, VscCheck, VscAdd } from 'react-icons/vsc';
import './NotebookSwitcher.css';

const NotebookSwitcher = () => {
  const {
    notebooks,
    activeNotebookId,
    currentNotebook,
    switchNotebook,
    createNotebook,
  } = useShell();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div className="nb-switcher-container" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="nb-switcher-btn"
        title="Switch active notebook"
      >
        <span className="nb-switcher-title">
          {currentNotebook?.title || 'Notebook.c'}
        </span>
        <VscChevronDown size={14} />
      </button>

      {isOpen && (
        <div className="nb-switcher-dropdown">
          <div className="nb-switcher-header">
            <span>Saved Notebooks</span>
            <span>({notebooks.length})</span>
          </div>

          <div className="nb-switcher-list">
            {notebooks.map((nb) => {
              const isActive = nb.id === activeNotebookId;
              return (
                <div
                  key={nb.id}
                  onClick={() => {
                    switchNotebook(nb.id);
                    setIsOpen(false);
                  }}
                  className={`nb-switcher-item ${isActive ? 'active' : ''}`}
                >
                  <span>{nb.title}</span>
                  {isActive && <VscCheck size={14} color="#8ab4f8" />}
                </div>
              );
            })}
          </div>

          <div className="nb-switcher-footer">
            <button
              onClick={() => {
                createNotebook();
                setIsOpen(false);
              }}
              className="nb-switcher-new-btn"
            >
              <VscAdd size={14} />
              <span>Create New Notebook</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotebookSwitcher;

