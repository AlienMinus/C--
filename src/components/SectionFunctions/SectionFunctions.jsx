import React from 'react';
import { useShell, detectCFunctions } from '../../context/ShellContext';
import Shell from '../Shell/Shell';
import Run from '../Run/Run';
import OutPut from '../OutPut/OutPut';
import {
  VscAdd,
  VscChevronUp,
  VscChevronDown,
  VscTrash,
  VscCopy,
  VscClearAll,
  VscCheck,
  VscWarning,
} from 'react-icons/vsc';
import './SectionFunctions.css';
import '../CodeBlock/CodeBlock.css';

const SectionFunctions = () => {
  const {
    currentNotebook,
    activeCellId,
    setActiveCellId,
    updateFunctionCell,
    insertFunctionCell,
    removeFunctionCell,
    moveFunctionCell,
    runFunctionCell,
    clearCellOutput,
  } = useShell();

  const functionCells = currentNotebook?.functionCells || [];

  return (
    <div className="c-section-functions-wrapper">
      <div className="c-section-functions-meta">
        <div className="c-section-functions-title-group">
          <span className="c-section-functions-tag">Section 3</span>
          <span className="c-section-functions-title">
            Function Implementations (after return 0)
          </span>
        </div>

        <button
          onClick={() => insertFunctionCell(null)}
          className="c-section-functions-add-btn"
          title="Add a new function cell"
        >
          <VscAdd size={12} />
          Add Function Cell
        </button>
      </div>

      <div className="c-section-functions-desc">
        All cells below are placed after <code>return 0; &#125;</code>. Each cell may contain one or multiple C functions, but <strong>at least one function definition</strong> is strictly required per cell.
      </div>

      <div className="c-section-functions-list">
        {functionCells.map((cell, idx) => {
          const isActive = activeCellId === cell.id;
          const isRunning = cell.status === 'running';
          const detectedFunctions = detectCFunctions(cell.content);
          const hasFunctions = detectedFunctions.length > 0;

          return (
            <div
              key={cell.id}
              onClick={() => setActiveCellId(cell.id)}
              className={`colab-cell-container ${isActive ? 'active' : ''}`}
            >
              {/* Floating Toolbar */}
              <div className={`colab-cell-toolbar ${isActive ? 'visible' : ''}`}>
                <button
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveFunctionCell(cell.id, 'up');
                  }}
                  title="Move function cell up"
                  className={`colab-cell-toolbar-btn ${idx === 0 ? 'disabled' : ''}`}
                >
                  <VscChevronUp size={14} />
                </button>

                <button
                  disabled={idx === functionCells.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveFunctionCell(cell.id, 'down');
                  }}
                  title="Move function cell down"
                  className={`colab-cell-toolbar-btn ${idx === functionCells.length - 1 ? 'disabled' : ''}`}
                >
                  <VscChevronDown size={14} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    insertFunctionCell(cell.id);
                  }}
                  title="Insert function cell below"
                  className="colab-cell-toolbar-btn"
                >
                  <VscAdd size={13} color="#8ab4f8" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(cell.content);
                  }}
                  title="Copy function code"
                  className="colab-cell-toolbar-btn"
                >
                  <VscCopy size={13} />
                </button>

                {cell.output && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearCellOutput(cell.id);
                    }}
                    title="Clear output"
                    className="colab-cell-toolbar-btn"
                  >
                    <VscClearAll size={14} />
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFunctionCell(cell.id);
                  }}
                  title="Delete cell"
                  className="colab-cell-toolbar-btn colab-cell-toolbar-btn-danger"
                >
                  <VscTrash size={14} />
                </button>
              </div>

              {/* Function Detection Status Badge */}
              <div className="c-function-status-wrapper">
                {hasFunctions ? (
                  <span className="c-function-status-badge c-function-status-valid">
                    <VscCheck size={12} />
                    Functions defined: {detectedFunctions.join(', ')}
                  </span>
                ) : (
                  <span className="c-function-status-badge c-function-status-invalid">
                    <VscWarning size={12} />
                    Validation error: No function definition found! (at least 1 required)
                  </span>
                )}
              </div>

              {/* Cell Editor & Execution Gutter */}
              <div className="colab-cell-body">
                <Run
                  isRunning={isRunning}
                  status={cell.status}
                  executionCount={cell.executionCount}
                  onRun={() => runFunctionCell(cell.id)}
                />

                <div className="colab-cell-editor-wrapper">
                  <Shell
                    value={cell.content}
                    onChange={(val) => updateFunctionCell(cell.id, val || '')}
                    onFocus={() => setActiveCellId(cell.id)}
                    onRun={() => runFunctionCell(cell.id)}
                  />
                </div>
              </div>

              {/* Output Section */}
              {(cell.output || cell.status === 'running') && (
                <div className="colab-cell-output-wrapper">
                  <OutPut
                    output={cell.output}
                    error={cell.error}
                    executionTime={cell.executionTime}
                    jsCode={cell.jsCode}
                    fullJs={cell.fullJs}
                    onClear={() => clearCellOutput(cell.id)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionFunctions;
