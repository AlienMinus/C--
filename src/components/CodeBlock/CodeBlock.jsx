import React, { useState, useRef } from 'react';
import Shell from '../Shell/Shell';
import Run from '../Run/Run';
import OutPut from '../OutPut/OutPut';
import { useShell } from '../../context/ShellContext';
import {
  VscChevronUp,
  VscChevronDown,
  VscTrash,
  VscCopy,
  VscCode,
  VscClearAll,
} from 'react-icons/vsc';
import './CodeBlock.css';

const CodeBlock = ({ cell, isFirst, isLast }) => {
  const { id, content, output, status, executionCount, executionTime, jsCode, fullJs, error } = cell;
  const {
    activeCellId,
    setActiveCellId,
    updateCellContent,
    runCell,
    runCellAndAdvance,
    clearCellOutput,
    moveCell,
    removeCell,
  } = useShell();

  const [isHovered, setIsHovered] = useState(false);
  const [showJsInline, setShowJsInline] = useState(false);
  const [copied, setCopied] = useState(false);
  const shellRef = useRef(null);

  const isActive = activeCellId === id;
  const isRunning = status === 'running';

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      onClick={() => setActiveCellId(id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`colab-cell-container ${isActive ? 'active' : ''}`}
    >
      {/* Floating Toolbar in top-right */}
      <div className={`colab-cell-toolbar ${isHovered || isActive ? 'visible' : ''}`}>
        <button
          disabled={isFirst}
          onClick={(e) => {
            e.stopPropagation();
            moveCell(id, 'up');
          }}
          title="Move cell up"
          className={`colab-cell-toolbar-btn ${isFirst ? 'disabled' : ''}`}
        >
          <VscChevronUp size={14} />
        </button>

        <button
          disabled={isLast}
          onClick={(e) => {
            e.stopPropagation();
            moveCell(id, 'down');
          }}
          title="Move cell down"
          className={`colab-cell-toolbar-btn ${isLast ? 'disabled' : ''}`}
        >
          <VscChevronDown size={14} />
        </button>

        {(jsCode || fullJs) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowJsInline(!showJsInline);
            }}
            title="Inspect generated JavaScript"
            className={`colab-cell-toolbar-btn colab-cell-toolbar-btn-js ${showJsInline ? 'active' : ''}`}
          >
            <VscCode size={13} className="colab-btn-icon-space" />
            JS
          </button>
        )}

        <button
          onClick={handleCopyCode}
          title={copied ? 'Copied code!' : 'Copy cell code'}
          className="colab-cell-toolbar-btn"
        >
          <VscCopy size={13} color={copied ? '#3fb950' : '#c9d1d9'} />
        </button>

        {output && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearCellOutput(id);
            }}
            title="Clear cell output"
            className="colab-cell-toolbar-btn"
          >
            <VscClearAll size={14} />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            removeCell(id);
          }}
          title="Delete cell"
          className="colab-cell-toolbar-btn colab-cell-toolbar-btn-danger"
        >
          <VscTrash size={14} />
        </button>
      </div>

      {/* Cell Body: Execution Gutter + Monaco Editor */}
      <div className="colab-cell-body">
        <Run
          isRunning={isRunning}
          executionCount={executionCount}
          onRun={() => runCell(id)}
        />

        <div className="colab-cell-editor-wrapper">
          <Shell
            ref={shellRef}
            value={content}
            onChange={(val) => updateCellContent(id, val || '')}
            onFocus={() => setActiveCellId(id)}
            onRun={() => runCell(id)}
            onRunAndAdvance={() => runCellAndAdvance(id)}
          />
        </div>
      </div>

      {/* Inline Converted JS View */}
      {showJsInline && (jsCode || fullJs) && (
        <div className="colab-cell-js-preview">
          <div className="colab-cell-js-title">
            Compiled JavaScript (Executed via Browser):
          </div>
          <pre className="colab-cell-js-code">
            <code>{fullJs || jsCode}</code>
          </pre>
        </div>
      )}

      {/* Output Section */}
      {(output || status === 'running' || isRunning) && (
        <div className="colab-cell-output-wrapper">
          <OutPut
            output={output}
            error={error}
            executionTime={executionTime}
            jsCode={jsCode}
            fullJs={fullJs}
            onClear={() => clearCellOutput(id)}
          />
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
