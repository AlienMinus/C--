import React from 'react';
import {
  VscFolderLibrary,
  VscCode,
  VscQuestion,
  VscClose,
  VscAdd,
  VscCopy,
  VscCloudDownload,
  VscCloudUpload,
  VscTrash,
  VscCheck,
  VscFiles,
} from 'react-icons/vsc';
import { useShell } from '../../context/ShellContext';
import './Sidebar.css';

const C_SNIPPETS = [
  {
    title: 'Hello World & Variables',
    description: 'Basic printf and variable formatting in C',
    target: 'main',
    code: `char name[] = "C Programmer";
int year = 2026;
printf("Welcome, %s!\\n", name);
printf("Year: %d\\n", year);`,
  },
  {
    title: 'User Input with scanf',
    description: 'Interactive input prompt handling',
    target: 'main',
    code: `int radius;
printf("Enter radius of circle: ");
scanf("%d", &radius);
float area = 3.14159 * radius * radius;
printf("Area of circle: %.2f\\n", area);`,
  },
  {
    title: 'Loop & Factorial Calculation',
    description: 'Calculate factorial using for-loop',
    target: 'main',
    code: `int n = 5;
long long fact = 1;
for (int i = 1; i <= n; i++) {
    fact *= i;
}
printf("Factorial of %d is: %lld\\n", n, fact);`,
  },
  {
    title: 'Factorial Function Implementation',
    description: 'Recursive factorial function (put in Section 3)',
    target: 'function',
    code: `// Recursive factorial function
long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`,
  },
  {
    title: 'Array Reversal Function',
    description: 'Function to reverse an integer array in place',
    target: 'function',
    code: `// Function to reverse array elements
void reverse_array(int arr[], int size) {
    int start = 0, end = size - 1;
    while (start < end) {
        int temp = arr[start];
        arr[start] = arr[end];
        arr[end] = temp;
        start++;
        end--;
    }
}`,
  },
  {
    title: 'Prime Checker Function',
    description: 'Function to test if a number is prime',
    target: 'function',
    code: `// Function to check prime number
int is_prime(int n) {
    if (n <= 1) return 0;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return 0;
    }
    return 1;
}`,
  },
];

const Sidebar = () => {
  const {
    notebooks,
    activeNotebookId,
    switchNotebook,
    createNotebook,
    duplicateNotebook,
    deleteNotebook,
    insertMainCell,
    insertFunctionCell,
    exportCFile,
    exportJSON,
    importNotebook,
    sidebarTab: activeTab,
    setSidebarTab: setActiveTab,
    toggleSidebarTab: toggleTab,
  } = useShell();

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importNotebook(file);
      setActiveTab(null);
    }
  };

  return (
    <div className="colab-sidebar-container">
      {/* Left Icon Activity Rail */}
      <div className="colab-activity-rail">
        <button
          onClick={() => toggleTab('notebooks')}
          title="Saved Notebooks Manager"
          className={`colab-rail-btn ${activeTab === 'notebooks' ? 'active' : ''}`}
        >
          <VscFolderLibrary size={20} />
        </button>

        <button
          onClick={() => toggleTab('snippets')}
          title="C Code Snippets Library"
          className={`colab-rail-btn ${activeTab === 'snippets' ? 'active' : ''}`}
        >
          <VscCode size={20} />
        </button>

        <button
          onClick={() => toggleTab('files')}
          title="Export & Import"
          className={`colab-rail-btn ${activeTab === 'files' ? 'active' : ''}`}
        >
          <VscFiles size={20} />
        </button>

        <div className="colab-rail-spacer" />

        <button
          onClick={() => toggleTab('shortcuts')}
          title="Keyboard Shortcuts"
          className={`colab-rail-btn colab-rail-btn-bottom ${activeTab === 'shortcuts' ? 'active' : ''}`}
        >
          <VscQuestion size={20} />
        </button>
      </div>

      {/* Expandable Content Drawer */}
      {activeTab && (
        <div className="colab-drawer">
          {/* Drawer Header */}
          <div className="colab-drawer-header">
            <span>
              {activeTab === 'notebooks' && 'Saved Notebooks'}
              {activeTab === 'snippets' && 'C Code Snippets'}
              {activeTab === 'files' && 'Export & Import'}
              {activeTab === 'shortcuts' && 'Keyboard Shortcuts'}
            </span>
            <button
              onClick={() => setActiveTab(null)}
              className="colab-drawer-close-btn"
              title="Close drawer"
            >
              <VscClose size={16} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="colab-drawer-body">
            {/* 1. Notebooks Manager */}
            {activeTab === 'notebooks' && (
              <div className="colab-notebooks-list">
                <div className="colab-notebooks-desc">
                  All notebooks are automatically preserved in local storage with full integrity.
                </div>

                {notebooks.map((nb) => {
                  const isActive = nb.id === activeNotebookId;
                  const mainSteps = nb.mainCells?.length || 0;
                  const funcSteps = nb.functionCells?.length || 0;

                  return (
                    <div
                      key={nb.id}
                      onClick={() => switchNotebook(nb.id)}
                      className={`colab-notebook-card ${isActive ? 'active' : ''}`}
                    >
                      <div className="colab-notebook-card-header">
                        <span className="colab-notebook-card-title">{nb.title}</span>
                        {isActive && <VscCheck size={14} color="#8ab4f8" />}
                      </div>

                      <div className="colab-notebook-card-info">
                        {mainSteps} main step{mainSteps === 1 ? '' : 's'} • {funcSteps} function{funcSteps === 1 ? '' : 's'}
                      </div>

                      <div className="colab-notebook-card-actions">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateNotebook(nb.id);
                          }}
                          className="colab-snippet-btn colab-snippet-btn-secondary"
                          title="Duplicate notebook"
                        >
                          Duplicate
                        </button>

                        {notebooks.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotebook(nb.id);
                            }}
                            className="colab-snippet-btn colab-snippet-btn-secondary colab-snippet-btn-danger"
                            title="Delete notebook"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => createNotebook()}
                  className="colab-snippet-btn colab-notebook-create-btn"
                >
                  <VscAdd size={14} /> Create New Notebook
                </button>
              </div>
            )}

            {/* 2. C Snippets Library */}
            {activeTab === 'snippets' && (
              <div className="colab-snippets-list">
                <div className="colab-snippets-desc">
                  Click <strong>Insert</strong> to inject tested C code directly into your notebook.
                </div>
                {C_SNIPPETS.map((snip, idx) => (
                  <div key={idx} className="colab-snippet-card">
                    <div className="colab-snippet-title">
                      {snip.title}
                    </div>
                    <div className="colab-snippet-info">
                      {snip.description} (Target: {snip.target === 'function' ? 'Section 3 Functions' : 'Section 2 main()'})
                    </div>
                    <div className="colab-snippet-actions">
                      <button
                        onClick={() => {
                          if (snip.target === 'function') {
                            insertFunctionCell(null, snip.code);
                          } else {
                            insertMainCell(null, snip.code);
                          }
                          setActiveTab(null);
                        }}
                        className="colab-snippet-btn"
                      >
                        <VscAdd size={12} /> Insert
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(snip.code);
                        }}
                        className="colab-snippet-btn colab-snippet-btn-secondary"
                      >
                        <VscCopy size={12} /> Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Export & Import */}
            {activeTab === 'files' && (
              <div className="colab-files-list">
                <div className="colab-files-desc">
                  Export your compiled C program or backup the complete multi-notebook project.
                </div>

                <button onClick={exportCFile} className="colab-file-action-btn">
                  <VscCloudDownload size={16} color="#8ab4f8" />
                  <div>
                    <div className="colab-file-action-title">Download .c Source File</div>
                    <div className="colab-file-action-desc">Directly compiles in gcc/clang</div>
                  </div>
                </button>

                <button onClick={exportJSON} className="colab-file-action-btn">
                  <VscCloudDownload size={16} color="#3fb950" />
                  <div>
                    <div className="colab-file-action-title">Export Notebook (.json)</div>
                    <div className="colab-file-action-desc">Backup structured sections</div>
                  </div>
                </button>

                <label className="colab-file-action-btn">
                  <VscCloudUpload size={16} color="#f29900" />
                  <div>
                    <div className="colab-file-action-title">Upload / Import File</div>
                    <div className="colab-file-action-desc">Load .c or .json notebook</div>
                  </div>
                  <input
                    type="file"
                    accept=".c,.json,.h"
                    onChange={handleFileUpload}
                    className="colab-hidden-file-input"
                  />
                </label>

                <div className="colab-file-divider" />

                <button
                  onClick={() => createNotebook()}
                  className="colab-file-action-btn"
                >
                  <VscAdd size={16} color="#34a853" />
                  <div>
                    <div className="colab-file-action-title">Start New Notebook</div>
                    <div className="colab-file-action-desc">Add another project to LocalStorage</div>
                  </div>
                </button>
              </div>
            )}

            {/* 4. Keyboard Shortcuts */}
            {activeTab === 'shortcuts' && (
              <div className="colab-shortcuts-list">
                <div className="colab-shortcuts-desc">
                  Keyboard Shortcuts:
                </div>
                {[
                  { key: 'Ctrl + Enter', desc: 'Run focused cell in place' },
                  { key: 'Break main()', desc: 'Add new statement step inside main()' },
                  { key: 'Add Function', desc: 'Add new function implementation cell' },
                  { key: 'Ctrl + F9', desc: 'Run all main() cells sequentially' },
                  { key: '↑ / ↓', desc: 'Reorder cells within section' },
                  { key: '{ } JS', desc: 'Inspect generated JavaScript compiler output' },
                ].map((s, i) => (
                  <div key={i} className="colab-shortcut-item">
                    <span className="colab-shortcut-desc">{s.desc}</span>
                    <kbd className="colab-shortcut-key">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
