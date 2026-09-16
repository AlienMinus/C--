import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  VscRunAll,
  VscClearAll,
  VscAdd,
  VscCheck,
  VscCode,
} from 'react-icons/vsc';
import { useShell } from '../../context/ShellContext';
import NotebookSwitcher from '../NotebookSwitcher/NotebookSwitcher';
import './NavBar.css';

const NavBar = () => {
  const {
    currentNotebook,
    activeNotebookId,
    setNotebookTitle,
    createNotebook,
    duplicateNotebook,
    deleteNotebook,
    runAllCells,
    clearAllOutputs,
    resetRuntime,
    insertMainCell,
    insertFunctionCell,
    exportCFile,
    exportJSON,
    importNotebook,
    backendStatus,
    checkBackendHealth,
    isAnyRunning,
    toggleSidebarTab,
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

  const mainCount = currentNotebook?.mainCells?.length || 0;
  const funcCount = currentNotebook?.functionCells?.length || 0;

  return (
    <header className="colab-header">
      {/* Row 1: Brand, Title, Switcher, Menu Bar, Gauges */}
      <div className="colab-header-row1">
        <div className="colab-header-left">
          {/* Brand with favicon.png */}
          <Link to="/" className="colab-brand">
            <img src="/favicon.png" alt="C-- Logo" className="colab-brand-logo" />
            <span className="colab-brand-title">
              C-- <span className="colab-brand-highlight">Notebook</span>
            </span>
          </Link>

          {/* Notebook Switcher Dropdown */}
          <NotebookSwitcher />

          {/* Title and Saved State */}
          <div className="colab-title-container">
            {isEditingTitle ? (
              <input
                type="text"
                value={currentNotebook?.title || 'Notebook.c'}
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
                {currentNotebook?.title || 'Notebook.c'}
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

          {/* Menus Bar */}
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
                  <div onClick={() => { createNotebook(); setActiveMenu(null); }} className="colab-dropdown-item">
                    New Notebook
                  </div>
                  <div onClick={() => { duplicateNotebook(activeNotebookId); setActiveMenu(null); }} className="colab-dropdown-item">
                    Duplicate Notebook
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
                  <div
                    onClick={() => {
                      deleteNotebook(activeNotebookId);
                      setActiveMenu(null);
                    }}
                    className="colab-dropdown-item colab-dropdown-danger"
                  >
                    Delete Current Notebook
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
                      setIsEditingTitle(true);
                      setActiveMenu(null);
                    }}
                    className="colab-dropdown-item"
                  >
                    Rename Notebook
                  </div>
                  <div
                    onClick={() => {
                      insertMainCell(null);
                      setActiveMenu(null);
                    }}
                    className="colab-dropdown-item"
                  >
                    Break main() - Add Step
                  </div>
                  <div
                    onClick={() => {
                      insertFunctionCell(null);
                      setActiveMenu(null);
                    }}
                    className="colab-dropdown-item"
                  >
                    Add Function Cell
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
                  <div onClick={() => { toggleSidebarTab('notebooks'); setActiveMenu(null); }} className="colab-dropdown-item">
                    Notebooks Manager
                  </div>
                  <div onClick={() => { toggleSidebarTab('snippets'); setActiveMenu(null); }} className="colab-dropdown-item">
                    C Snippets Library
                  </div>
                  <div onClick={() => { toggleSidebarTab('files'); setActiveMenu(null); }} className="colab-dropdown-item">
                    Files & Export
                  </div>
                  <div className="colab-dropdown-divider" />
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
                      insertMainCell(null);
                      setActiveMenu(null);
                    }}
                    className="colab-dropdown-item"
                  >
                    Break main() - Add Step
                  </div>
                  <div
                    onClick={() => {
                      insertFunctionCell(null);
                      setActiveMenu(null);
                    }}
                    className="colab-dropdown-item"
                  >
                    Add Function Cell (after return 0)
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
                    Run All main() Cells (Ctrl+F9)
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
            onClick={() => insertMainCell(null)}
            className="colab-action-btn"
            title="Break / Add step inside main()"
          >
            <VscAdd size={14} color="#8ab4f8" />
            <span>Break main() cell</span>
          </button>

          <button
            onClick={() => insertFunctionCell(null)}
            className="colab-action-btn"
            title="Add a new function cell (after return 0)"
          >
            <VscCode size={14} color="#8ab4f8" />
            <span>Add Function cell</span>
          </button>

          <div className="colab-toolbar-divider" />

          <button
            onClick={runAllCells}
            disabled={isAnyRunning}
            className={`colab-action-btn ${isAnyRunning ? 'disabled' : ''}`}
            title="Run all main() cells sequentially (Ctrl+F9)"
          >
            <VscRunAll size={15} color={isAnyRunning ? '#9aa0a6' : '#34a853'} />
            <span>Run all main()</span>
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

        {/* Right Info: Structure counters */}
        <div className="colab-cell-counter">
          <span>
            {mainCount} main step{mainCount === 1 ? '' : 's'}, {funcCount} function cell{funcCount === 1 ? '' : 's'}
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