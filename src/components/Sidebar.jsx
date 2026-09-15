import React, { useState } from 'react';
import {
  VscListTree,
  VscCode,
  VscFolderLibrary,
  VscQuestion,
  VscClose,
  VscAdd,
  VscCopy,
  VscCloudDownload,
  VscCloudUpload,
  VscTrash,
} from 'react-icons/vsc';
import { useShell } from '../context/ShellContext';
import './Sidebar.css';

const C_SNIPPETS = [
  {
    title: 'Hello World & Variables',
    description: 'Basic printf and variable formatting in C',
    code: `#include <stdio.h>

int main() {
    char name[] = "C Programmer";
    int year = 2026;
    float version = 3.2;

    printf("Welcome, %s!\\n", name);
    printf("Year: %d | Edition: %.1f\\n", year, version);
    return 0;
}`,
  },
  {
    title: 'User Input with scanf',
    description: 'Interactive input prompt handling',
    code: `#include <stdio.h>

int main() {
    int radius;
    printf("Enter radius of circle: ");
    scanf("%d", &radius);

    float area = 3.14159 * radius * radius;
    printf("Area of circle with radius %d is: %.2f\\n", radius, area);
    return 0;
}`,
  },
  {
    title: 'Loops & Factorial',
    description: 'Calculate factorial using a for-loop',
    code: `#include <stdio.h>

int main() {
    int n = 5;
    long long fact = 1;

    printf("Calculating factorial of %d...\\n", n);
    for (int i = 1; i <= n; i++) {
        fact *= i;
        printf("%d! = %lld\\n", i, fact);
    }

    printf("Final Result: %d! = %lld\\n", n, fact);
    return 0;
}`,
  },
  {
    title: 'Arrays & Pointer Basics',
    description: 'Memory addresses and pointer dereferencing',
    code: `#include <stdio.h>

int main() {
    int arr[5] = {10, 20, 30, 40, 50};
    int *ptr = arr;

    printf("Array elements via pointer traversal:\\n");
    for (int i = 0; i < 5; i++) {
        printf("Element %d = %d (Address offset: +%d)\\n", i, *(ptr + i), i);
    }
    return 0;
}`,
  },
  {
    title: 'Functions & Recursion',
    description: 'Recursive Fibonacci sequence calculator',
    code: `#include <stdio.h>

int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

int main() {
    int terms = 8;
    printf("First %d Fibonacci numbers:\\n", terms);
    for (int i = 0; i < terms; i++) {
        printf("%d ", fib(i));
    }
    printf("\\n");
    return 0;
}`,
  },
  {
    title: 'Structures (struct)',
    description: 'Records and member access in C',
    code: `#include <stdio.h>

struct Student {
    char name[20];
    int roll;
    float marks;
};

int main() {
    struct Student s1 = {"Alex", 101, 94.5};
    printf("Student Info:\\n");
    printf("Name: %s\\n", s1.name);
    printf("Roll Number: %d\\n", s1.roll);
    printf("Marks: %.1f%%\\n", s1.marks);
    return 0;
}`,
  },
];

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState(null);
  const {
    cells,
    setActiveCellId,
    insertCell,
    exportCFile,
    exportJSON,
    importNotebook,
    newNotebook,
  } = useShell();

  const tocItems = [];
  cells.forEach((cell) => {
    if (cell.type === 'text' && cell.content) {
      const lines = cell.content.split('\n');
      lines.forEach((line) => {
        if (line.startsWith('# ')) {
          tocItems.push({ cellId: cell.id, level: 1, text: line.substring(2).trim() });
        } else if (line.startsWith('## ')) {
          tocItems.push({ cellId: cell.id, level: 2, text: line.substring(3).trim() });
        } else if (line.startsWith('### ')) {
          tocItems.push({ cellId: cell.id, level: 3, text: line.substring(4).trim() });
        }
      });
    }
  });

  const toggleTab = (tab) => {
    setActiveTab(prev => (prev === tab ? null : tab));
  };

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
          onClick={() => toggleTab('toc')}
          title="Table of contents"
          className={`colab-rail-btn ${activeTab === 'toc' ? 'active' : ''}`}
        >
          <VscListTree size={20} />
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
          title="Files & Export"
          className={`colab-rail-btn ${activeTab === 'files' ? 'active' : ''}`}
        >
          <VscFolderLibrary size={20} />
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
              {activeTab === 'toc' && 'Table of Contents'}
              {activeTab === 'snippets' && 'C Code Snippets'}
              {activeTab === 'files' && 'Notebook Files'}
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
            {/* 1. Table of Contents */}
            {activeTab === 'toc' && (
              <div>
                {tocItems.length === 0 ? (
                  <div className="colab-toc-empty">
                    No headings found in markdown cells. Add headers like <code># Title</code> or <code>## Section</code> in text cells!
                  </div>
                ) : (
                  <div className="colab-toc-list">
                    {tocItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveCellId(item.cellId)}
                        className={`colab-toc-item colab-toc-level-${item.level}`}
                      >
                        {item.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. C Snippets Library */}
            {activeTab === 'snippets' && (
              <div className="colab-snippets-list">
                <div className="colab-snippets-desc">
                  Click <strong>Insert</strong> to add a template C code cell into your notebook.
                </div>
                {C_SNIPPETS.map((snip, idx) => (
                  <div key={idx} className="colab-snippet-card">
                    <div className="colab-snippet-title">
                      {snip.title}
                    </div>
                    <div className="colab-snippet-info">
                      {snip.description}
                    </div>
                    <div className="colab-snippet-actions">
                      <button
                        onClick={() => {
                          insertCell(null, 'below', 'code', snip.code);
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

            {/* 3. Files & Export */}
            {activeTab === 'files' && (
              <div className="colab-files-list">
                <div className="colab-files-desc">
                  Export your C code or load an existing project into Google Colab.
                </div>

                <button onClick={exportCFile} className="colab-file-action-btn">
                  <VscCloudDownload size={16} color="#8ab4f8" />
                  <div>
                    <div className="colab-file-action-title">Download .c Source File</div>
                    <div className="colab-file-action-desc">Combined executable C source code</div>
                  </div>
                </button>

                <button onClick={exportJSON} className="colab-file-action-btn">
                  <VscCloudDownload size={16} color="#3fb950" />
                  <div>
                    <div className="colab-file-action-title">Export Notebook (.json)</div>
                    <div className="colab-file-action-desc">Save full notebook structure & cells</div>
                  </div>
                </button>

                <label className="colab-file-action-btn">
                  <VscCloudUpload size={16} color="#f29900" />
                  <div>
                    <div className="colab-file-action-title">Upload / Import File</div>
                    <div className="colab-file-action-desc">Upload .c or .json notebook</div>
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
                  onClick={newNotebook}
                  className="colab-file-action-btn colab-file-action-danger"
                >
                  <VscTrash size={16} />
                  <div>
                    <div className="colab-file-action-title">Reset to New Notebook</div>
                    <div className="colab-file-action-desc-danger">Clear all cells and start fresh</div>
                  </div>
                </button>
              </div>
            )}

            {/* 4. Keyboard Shortcuts */}
            {activeTab === 'shortcuts' && (
              <div className="colab-shortcuts-list">
                <div className="colab-shortcuts-desc">
                  Colab Keyboard Shortcuts:
                </div>
                {[
                  { key: 'Shift + Enter', desc: 'Run cell and advance to next' },
                  { key: 'Ctrl + Enter', desc: 'Run focused cell in place' },
                  { key: 'Double Click', desc: 'Edit text/markdown cell' },
                  { key: '+ Code / + Text', desc: 'Add new cell at cursor or hover line' },
                  { key: '↑ / ↓', desc: 'Reorder cells up or down' },
                  { key: '{ } JS', desc: 'Inspect generated JavaScript compiler code' },
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
