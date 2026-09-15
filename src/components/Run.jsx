import React, { useState } from 'react';
import { VscPlay, VscLoading } from 'react-icons/vsc';
import './Run.css';

const Run = ({ isRunning, executionCount, onRun }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="colab-run-gutter"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (onRun) onRun();
        }}
        disabled={isRunning}
        title={isRunning ? 'Executing...' : 'Run Cell (Ctrl+Enter)'}
        className={`colab-run-btn ${isRunning ? 'running' : ''}`}
      >
        {isRunning ? (
          <VscLoading size={18} className="colab-run-spinner" />
        ) : isHovered ? (
          <VscPlay size={16} className="colab-run-icon" />
        ) : (
          <span className="colab-run-count">
            [{executionCount !== null && executionCount !== undefined ? executionCount : ' '}]
          </span>
        )}
      </button>
    </div>
  );
};

export default Run;