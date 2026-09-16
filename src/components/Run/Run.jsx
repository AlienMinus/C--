import React, { useState } from 'react';
import { VscPlay, VscLoading, VscCheck, VscError } from 'react-icons/vsc';
import './Run.css';

const Run = ({ isRunning, status, executionCount, onRun }) => {
  const [isHovered, setIsHovered] = useState(false);

  const isExecuted = status === 'success' || (executionCount !== null && executionCount !== undefined && status !== 'error');
  const isError = status === 'error';

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
        title={
          isRunning
            ? 'Executing...'
            : isExecuted
            ? `Executed [#${executionCount || ''}] - Click to re-run (Ctrl+Enter)`
            : isError
            ? 'Execution failed - Click to re-run (Ctrl+Enter)'
            : 'Run Cell (Ctrl+Enter)'
        }
        className={`colab-run-btn ${isRunning ? 'running' : ''} ${isExecuted && !isRunning ? 'executed' : ''} ${isError && !isRunning ? 'failed' : ''}`}
      >
        {isRunning ? (
          <VscLoading size={18} className="colab-run-spinner" />
        ) : isHovered ? (
          <VscPlay size={16} className="colab-run-icon" />
        ) : isExecuted ? (
          <VscCheck size={17} className="colab-run-check" />
        ) : isError ? (
          <VscError size={16} className="colab-run-error-icon" />
        ) : (
          <span className="colab-run-count">
            [{executionCount !== null && executionCount !== undefined ? executionCount : ' '}]
          </span>
        )}
      </button>
      {isExecuted && executionCount !== null && executionCount !== undefined && !isRunning && (
        <span className="colab-run-count-sub">[{executionCount}]</span>
      )}
    </div>
  );
};

export default Run;