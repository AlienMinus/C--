import React, { useState } from 'react';
import { VscCheck, VscError, VscCopy, VscClearAll, VscCode, VscChevronDown, VscChevronRight } from 'react-icons/vsc';
import './OutPut.css';

const OutPut = ({ output, error, executionTime, jsCode, fullJs, onClear }) => {
  const [showJs, setShowJs] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(output || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isError = Boolean(error) || (output && output.toLowerCase().includes('error'));

  return (
    <div className={`colab-output-box ${isError ? 'error' : ''}`}>
      {/* Output Header / Meta Bar */}
      <div className="colab-output-header">
        {/* Left: Execution status & time */}
        <div className="colab-output-status">
          {isError ? (
            <span className="colab-output-status-failed">
              <VscError size={14} />
              Failed
            </span>
          ) : (
            <span className="colab-output-status-success">
              <VscCheck size={14} />
              Executed
            </span>
          )}

          {executionTime !== null && executionTime !== undefined && (
            <span className="colab-output-time">
              ({executionTime < 1000 ? `${executionTime}ms` : `${(executionTime / 1000).toFixed(2)}s`})
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="colab-output-actions">
          {(jsCode || fullJs) && (
            <button
              onClick={() => setShowJs(!showJs)}
              className={`colab-output-btn-js ${showJs ? 'active' : ''}`}
              title="Inspect generated JavaScript code from backend"
            >
              <VscCode size={13} />
              {showJs ? 'Hide JS' : 'Inspect JS'}
              {showJs ? <VscChevronDown size={12} /> : <VscChevronRight size={12} />}
            </button>
          )}

          <button
            onClick={handleCopy}
            className={`colab-output-btn-text ${copied ? 'copied' : ''}`}
            title="Copy output"
          >
            <VscCopy size={13} />
            {copied ? 'Copied!' : 'Copy'}
          </button>

          {onClear && (
            <button
              onClick={onClear}
              className="colab-output-btn-text"
              title="Clear output"
            >
              <VscClearAll size={13} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Generated JS Accordion */}
      {showJs && (jsCode || fullJs) && (
        <div className="colab-output-js-panel">
          <div className="colab-output-js-title">
            Generated JavaScript (Compiled from C):
          </div>
          <pre className="colab-output-js-code">
            <code>{fullJs || jsCode}</code>
          </pre>
        </div>
      )}

      {/* Primary Terminal Output */}
      <div className={`colab-output-terminal ${isError ? 'error' : ''}`}>
        {output || <span className="colab-output-empty">No output produced</span>}
      </div>
    </div>
  );
};

export default OutPut;
