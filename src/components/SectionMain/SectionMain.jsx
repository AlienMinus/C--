import React from 'react';
import { useShell } from '../../context/ShellContext';
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
} from 'react-icons/vsc';
import './SectionMain.css';
import '../CodeBlock/CodeBlock.css';

const SectionMain = () => {
  const {
    currentNotebook,
    activeCellId,
    setActiveCellId,
    updateMainCell,
    insertMainCell,
    removeMainCell,
    moveMainCell,
    runMainCell,
    clearCellOutput,
  } = useShell();

  const mainCells = currentNotebook?.mainCells || [];

  return (
    <div className="c-section-main-wrapper">
      <div className="c-section-main-meta">
        <div className="c-section-main-title-group">
          <span className="c-section-main-tag">Section 2</span>
          <span className="c-section-main-title">
            main() Execution Entry Point
          </span>
        </div>

        <button
          onClick={() => insertMainCell(null)}
          className="c-main-split-btn"
          title="Add or split statements into a new cell inside main()"
        >
          <VscAdd size={12} />
          Break main() cell
        </button>
      </div>

      <div className="c-section-main-frame">
        {/* Extracted int main() { Banner */}
        <div className="c-main-banner-top">
          <div>
            <span className="c-main-keyword">int</span>{' '}
            <span className="c-main-func-name">main</span>() {' '}
            <span className="c-main-brace">{'{'}</span>
          </div>
          <span className="c-main-step-count">
            {mainCells.length} broken {mainCells.length === 1 ? 'cell' : 'cells'} in main()
          </span>
        </div>

        {/* Broken main() cells body */}
        <div className="c-main-cells-body">
          {mainCells.map((cell, idx) => {
            const isActive = activeCellId === cell.id;
            const isRunning = cell.status === 'running';

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
                      moveMainCell(cell.id, 'up');
                    }}
                    title="Move cell up"
                    className={`colab-cell-toolbar-btn ${idx === 0 ? 'disabled' : ''}`}
                  >
                    <VscChevronUp size={14} />
                  </button>

                  <button
                    disabled={idx === mainCells.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveMainCell(cell.id, 'down');
                    }}
                    title="Move cell down"
                    className={`colab-cell-toolbar-btn ${idx === mainCells.length - 1 ? 'disabled' : ''}`}
                  >
                    <VscChevronDown size={14} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      insertMainCell(cell.id);
                    }}
                    title="Break/Split: Add new cell below inside main()"
                    className="colab-cell-toolbar-btn"
                  >
                    <VscAdd size={13} color="#8ab4f8" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(cell.content);
                    }}
                    title="Copy code"
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
                      removeMainCell(cell.id);
                    }}
                    title="Delete cell"
                    className="colab-cell-toolbar-btn colab-cell-toolbar-btn-danger"
                  >
                    <VscTrash size={14} />
                  </button>
                </div>

                {/* Cell Editor & Execution Gutter */}
                <div className="colab-cell-body">
                  <Run
                    isRunning={isRunning}
                    status={cell.status}
                    executionCount={cell.executionCount}
                    onRun={() => runMainCell(cell.id)}
                  />

                  <div className="colab-cell-editor-wrapper">
                    <Shell
                      value={cell.content}
                      onChange={(val) => updateMainCell(cell.id, val || '')}
                      onFocus={() => setActiveCellId(cell.id)}
                      onRun={() => runMainCell(cell.id)}
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

        {/* Extracted return 0; } Banner */}
        <div className="c-main-banner-bottom">
          <div className="c-main-return-line">
            <span className="c-main-keyword">return</span> 0;
          </div>
          <div>
            <span className="c-main-brace">{'}'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionMain;
