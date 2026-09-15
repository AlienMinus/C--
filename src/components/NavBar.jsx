import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  VscRunAll,
  VscClearAll,
  VscAdd,
  VscNote,
  VscCheck,
} from 'react-icons/vsc';
import { useShell } from '../context/ShellContext';
import './NavBar.css';

const NavBar = () => {
  const {
    cells,
    activeCellId,
    notebookTitle,
    setNotebookTitle,
    runAllCells,
    clearAllOutputs,
    resetRuntime,
    insertCell,
    removeCell,
    moveCell,
    exportCFile,
    exportJSON,
    importNotebook,
    newNotebook,
    backendStatus,
    checkBackendHealth,
    isAnyRunning,
  } = useShell();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showResourceTooltip, setShowResourceTooltip] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-colab-menu]')) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const toggleMenu = (menuName, e) => {
    e.stopPropagation();
    setActiveMenu(prev => (prev === menuName ? null : menuName));
  };

  const handleMenuHover = (menuName) => {
    if (activeMenu) {
      setActiveMenu(menuName);
    }
  };

  const codeCellsCount = cells.filter(c => c.type === 'code').length;
  const textCellsCount = cells.filter(c => c.type === 'text').length;

  return (
    <header className="colab-header">
      {/* Row 1: Brand, Title, Menu Bar, Gauges */}
      <div className="colab-header-row1">
        <div className="colab-header-left">
          {/* Colab / C-- Brand with favicon.png */}
          <Link to="/" className="colab-brand">
            <img src="/favicon.png" alt="C-- Logo" className="colab-brand-logo" />
            <span className="colab-brand-title">
              C-- <span className="colab-brand-highlight">Colab</span>
            </span>
          </Link>

          {/* Title and Saved State */}
          <div className="colab-title-container">
            {isEditingTitle ? (
              <input
                type="text"
                value={notebookTitle}
                onChange={(e) => setNotebookTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(false);
                }}
                autoFocus
                className="colab-title-input"
              />
            ) : (
              <span
                onClick={() => setIsEditingTitle(true)}
                title="Click to rename notebook"
                className="colab-title-text"
              >
                {notebookTitle}
              </span>
            )}

            <span
              className="colab-saved-badge"
              title="Auto-saved to your browser's local storage"
            >
              <VscCheck size={12} color="#3fb950" />
              Saved
            </span>
          </div>

          {/* Colab Menus Bar */}
          <div data-colab-menu className="colab-menu-bar">
            {/* File Menu */}
            <div className="colab-menu-wrapper">
              <button
                onClick={(e) => toggleMenu('file', e)}
                onMouseEnter={() => handleMenuHover('file')}
                className={`colab-menu-btn ${activeMenu === 'file' ? 'active' : ''}`}
              >
                File
              </button>
              {activeMenu === 'file' && (
                <div className="colab-dropdown">
                  <div onClick={() => { newNotebook(); setActiveMenu(null); }} className="colab-dropdown-item">
                    New Notebook
                  </div>
                  <div
                    onClick={() => {
                      fileInputRef.current?.click();
                      setActiveMenu(null);
                    }}
                    className="colab-dropdown-item"
                  >
                    Open / Upload (.c, .json)
                  </div>
                  <div className="colab-dropdown-divider" />
                  <div onClick={() => { exportCFile(); setActiveMenu(null); }} className="colab-dropdown-item">
                    Download .c Source Code
                  </div>
                  <div onClick={() => { exportJSON(); setActiveMenu(null); }} className="colab-dropdown-item">
                    Download Notebook (.json)
                  </div>
                  <div className="colab-dropdown-divider" />
                  <div onClick={() => { clearAllOutputs(); setActiveMenu(null); }} className="colab-dropdown-item">
                    Clear All Outputs
                  </div>
                </div>
              )}
            </div>

            {/* Edit Menu */}
            <div className="colab-menu-wrapper">
              <button
                onClick={(e) => toggleMenu('edit', e)}
                onMouseEnter={() => handleMenuHover('edit')}
                className={`colab-menu-btn ${activeMenu === 'edit' ? 'active' : ''}`}
              >
                Edit
              </button>
              {activeMenu === 'edit' && (
                <div className="colab-dropdown">
                  <div
                    onClick={() => {
                      if (activeCellId) moveCell(activeCellId, 'up');
                      setActiveMenu(null);
                    }}
                    className="colab-dropdown-item"
                  >
                    Move Cell Up
                  </div>
                  <div
                    onClick={() => {
                      if (activeCellId) moveCell(activeCellId, 'down');
                      setActiveMenu(null);
                    }}
                    className="colab-dropdown-item"
                  >
                    Move Cell Down
                  </div>
                  <div className="colab-dropdown-divider" />
                  <div
                    onClick={() => {
                      if (activeCellId) removeCell(activeCellId);
                      setActiveMenu(null);
                    }}
                    className="colab-dropdown-item colab-dropdown-danger"
                  >
                    Delete Selected Cell
                  </div>
                </div>
              )}
            </div>

            {/* View Menu */}
            <div className="colab-menu-wrapper">
              <button
                onClick={(e) => toggleMenu('view', e)}
                onMouseEnter={() => handleMenuHover('view')}
                className={`colab-menu-btn ${activeMenu === 'view' ? 'active' : ''}`}
              >
                View
              </button>
              {activeMenu === 'view' && (
                <div className="colab-dropdown">
                  <div onClick={() => { clearAllOutputs(); setActiveMenu(null); }} className="colab-dropdown-item">
                    Clear All Cell Outputs
                  </div>
                </div>
              )}
            </div>

            {/* Insert Menu */}
            <div className="colab-menu-wrapper">
              <button
                onClick={(e) => toggleMenu('insert', e)}
                onMouseEnter={() => handleMenuHover('insert')}
                className={`colab-menu-btn ${activeMenu === 'insert' ? 'active' : ''}`}
              >
                Insert
              </button>
              {activeMenu === 'insert' && (
                <div className="colab-dropdown">
                  <div
                    onClick={() => {
                      insertCell(activeCellId, 'below', 'code');
                      setActiveMenu(null);
                    }}
                    className="colab-dropdown-item"
                  >
                    Code Cell (Ctrl+M B)
                  </div>
                  <div
                    onClick={() => {
                      insertCell(activeCellId, 'below', 'text');
                      setActiveMenu(null);
                    }}
                    className="colab-dropdown-item"
                  >
                    Text Cell (Ctrl+M M)
                  </div>
                </div>
              )}
            </div>

            {/* Runtime Menu */}
            <div className="colab-menu-wrapper">
              <button
                onClick={(e) => toggleMenu('runtime', e)}
                onMouseEnter={() => handleMenuHover('runtime')}
                className={`colab-menu-btn ${activeMenu === 'runtime' ? 'active' : ''}`}
              >
                Runtime
              </button>
              {activeMenu === 'runtime' && (
                <div className="colab-dropdown">
                  <div onClick={() => { runAllCells(); setActiveMenu(null); }} className="colab-dropdown-item">
                    Run All Cells (Ctrl+F9)
                  </div>
                  <div className="colab-dropdown-divider" />
                  <div onClick={() => { resetRuntime(); setActiveMenu(null); }} className="colab-dropdown-item">
                    Restart Runtime & Reset Counters
                  </div>
                  <div onClick={() => { checkBackendHealth(); setActiveMenu(null); }} className="colab-dropdown-item">
                    Reconnect to Backend (Render)
                  </div>
                </div>
              )}
            </div>

            {/* Tools Menu */}
            <div className="colab-menu-wrapper">
              <button
                onClick={(e) => toggleMenu('tools', e)}
                onMouseEnter={() => handleMenuHover('tools')}
                className={`colab-menu-btn ${activeMenu === 'tools' ? 'active' : ''}`}
              >
                Tools
              </button>
              {activeMenu === 'tools' && (
                <div className="colab-dropdown">
                  <div
                    onClick={() => {
                      alert('Keyboard Shortcuts:\n• Shift + Enter: Run cell and advance\n• Ctrl + Enter: Run cell in place\n• Double click text cell to edit\n• Hover divider between cells to add + Code / + Text');
                      setActiveMenu(null);
                    }}
                    className="colab-dropdown-item"
                  >
                    Keyboard Shortcuts Guide
                  </div>
                  <div
                    onClick={() => {
                      alert('C-- Backend Information:\n• Endpoint: https://code-converter-c-to-js.onrender.com/convert\n• Architecture: C AST -> JavaScript AST -> Browser V8 sandbox');
                      setActiveMenu(null);
                    }}
                    className="colab-dropdown-item"
                  >
                    C-to-JS Backend Info
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: RAM/Disk Resource Gauges + Backend Connected Badge */}
        <div className="colab-header-right">
          {/* Resource Usage Meter */}
          <div
            onMouseEnter={() => setShowResourceTooltip(true)}
            onMouseLeave={() => setShowResourceTooltip(false)}
            className="colab-resource-meter"
          >
            <div className="colab-meter-group">
              <span className="colab-meter-label">RAM</span>
              <div className="colab-meter-track">
                <div className="colab-meter-fill-ram" />
              </div>
            </div>

            <div className="colab-meter-divider" />

            <div className="colab-meter-group">
              <span className="colab-meter-label">Disk</span>
              <div className="colab-meter-track">
                <div className="colab-meter-fill-disk" />
              </div>
            </div>

            {/* Resource Hover Tooltip */}
            {showResourceTooltip && (
              <div className="colab-resource-tooltip">
                <div className="colab-tooltip-title">
                  Connected Runtime Resources
                </div>
                <div className="colab-tooltip-row">
                  <span className="colab-tooltip-label">System RAM:</span>
                  <span>1.4 GB / 12.7 GB</span>
                </div>
                <div className="colab-tooltip-row">
                  <span className="colab-tooltip-label">Disk:</span>
                  <span>22.6 GB / 107.7 GB</span>
                </div>
                <div className="colab-tooltip-row">
                  <span className="colab-tooltip-label">Compiler:</span>
                  <span>C-to-JS v1.0</span>
                </div>
              </div>
            )}
          </div>

          {/* Backend Status Badge */}
          <div
            onClick={checkBackendHealth}
            title="Backend Endpoint: https://code-converter-c-to-js.onrender.com/convert (Click to ping)"
            className="colab-backend-badge"
          >
            <span className={`colab-backend-dot ${backendStatus.status}`} />
            <span>
              {backendStatus.status === 'connected'
                ? `Connected (${backendStatus.latency}ms)`
                : backendStatus.status === 'checking'
                ? 'Connecting...'
                : 'Offline'}
            </span>
          </div>

          {/* Share Button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2000);
            }}
            className="colab-share-btn"
          >
            {copiedLink ? <VscCheck size={14} /> : null}
            {copiedLink ? 'Copied Link' : 'Share'}
          </button>
        </div>
      </div>

      {/* Row 2: Secondary Action Toolbar */}
      <div className="colab-header-row2">
        <div className="colab-header-actions">
          <button
            onClick={() => insertCell(activeCellId, 'below', 'code')}
            className="colab-action-btn"
            title="Add a new C code cell (Ctrl+M B)"
          >
            <VscAdd size={14} color="#8ab4f8" />
            <span>Code</span>
          </button>

          <button
            onClick={() => insertCell(activeCellId, 'below', 'text')}
            className="colab-action-btn"
            title="Add a new Markdown text cell (Ctrl+M M)"
          >
            <VscNote size={14} color="#8ab4f8" />
            <span>Text</span>
          </button>

          <div className="colab-toolbar-divider" />

          <button
            onClick={runAllCells}
            disabled={isAnyRunning}
            className={`colab-action-btn ${isAnyRunning ? 'disabled' : ''}`}
            title="Run all cells in notebook (Ctrl+F9)"
          >
            <VscRunAll size={15} color={isAnyRunning ? '#9aa0a6' : '#34a853'} />
            <span>Run all</span>
          </button>

          <button
            onClick={clearAllOutputs}
            className="colab-action-btn"
            title="Clear all execution outputs"
          >
            <VscClearAll size={15} color="#9aa0a6" />
            <span>Clear outputs</span>
          </button>
        </div>

        {/* Right Info: Cells counter */}
        <div className="colab-cell-counter">
          <span>
            {cells.length} cells ({codeCellsCount} code, {textCellsCount} text)
          </span>
        </div>
      </div>

      {/* Hidden file input for file import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".c,.json,.h"
        className="colab-hidden-file-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importNotebook(file);
        }}
      />
    </header>
  );
};

export default NavBar;