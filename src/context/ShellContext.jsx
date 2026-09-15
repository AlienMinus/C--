/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';

const ShellContext = createContext(null);

export const useShell = () => {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error('useShell must be used within a ShellProvider');
  }
  return context;
};

const STORAGE_KEY = 'colab_c_notebook_v2';
const TITLE_KEY = 'colab_c_notebook_title_v2';

const INITIAL_CELLS = [
  {
    id: 'cell-1',
    type: 'text',
    content: `# C-- Notebook
Welcome to the interactive C notebook! You can write, edit, and run standard C code in code cells, or document your logic in Markdown text cells.

- Press **Shift + Enter** to run a cell and advance to the next cell.
- Press **Ctrl + Enter** to run the current cell in place.
- Inspect the generated JavaScript code by clicking the **{ } JS** button on any cell.`,
    output: '',
    status: 'idle',
    executionCount: null,
    executionTime: null,
    jsCode: '',
    fullJs: '',
    error: null,
  },
  {
    id: 'cell-2',
    type: 'code',
    content: `#include <stdio.h>

int main() {
    printf("Hello from C Notebook!\\n");
    
    int sum = 0;
    for (int i = 1; i <= 5; i++) {
        sum += i;
        printf("Iteration %d: Running sum = %d\\n", i, sum);
    }
    
    printf("\\nFinal Sum: %d\\n", sum);
    return 0;
}`,
    output: '',
    status: 'idle',
    executionCount: null,
    executionTime: null,
    jsCode: '',
    fullJs: '',
    error: null,
  },
  {
    id: 'cell-3',
    type: 'text',
    content: `### Interactive Input with \`scanf\`
The backend compiler translates \`scanf\` into browser input prompts seamlessly. Run the cell below to try it out!`,
    output: '',
    status: 'idle',
    executionCount: null,
    executionTime: null,
    jsCode: '',
    fullJs: '',
    error: null,
  },
  {
    id: 'cell-4',
    type: 'code',
    content: `#include <stdio.h>

int main() {
    int n;
    printf("Enter a number to calculate its square: ");
    scanf("%d", &n);
    printf("Square of %d is %d\\n", n, n * n);
    return 0;
}`,
    output: '',
    status: 'idle',
    executionCount: null,
    executionTime: null,
    jsCode: '',
    fullJs: '',
    error: null,
  }
];

export const ShellProvider = ({ children }) => {
  // Load saved state or fallback to default
  const [cells, setCells] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
    }
    return INITIAL_CELLS;
  });

  const [notebookTitle, setNotebookTitle] = useState(() => {
    try {
      const savedTitle = localStorage.getItem(TITLE_KEY);
      if (savedTitle) return savedTitle;
    } catch {
      // ignore
    }
    return 'Untitled_C_Notebook.c';
  });

  const [activeCellId, setActiveCellId] = useState(() => (cells[0] ? cells[0].id : null));
  const [executionCounter, setExecutionCounter] = useState(1);
  const [isAnyRunning, setIsAnyRunning] = useState(false);
  const [backendStatus, setBackendStatus] = useState({
    status: 'checking', // 'checking' | 'connected' | 'error'
    latency: null,
    lastChecked: null,
  });

  // Save to localStorage when cells or title change
  const saveTimeoutRef = useRef(null);
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cells));
        localStorage.setItem(TITLE_KEY, notebookTitle);
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [cells, notebookTitle]);

  // Ping backend to check connectivity and latency
  const checkBackendHealth = useCallback(async () => {
    setBackendStatus(prev => ({ ...prev, status: 'checking' }));
    const startTime = performance.now();
    try {
      const res = await fetch('https://code-converter-c-to-js.onrender.com/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: '#include <stdio.h>\nint main(){return 0;}' }),
      });
      const latency = Math.round(performance.now() - startTime);
      if (res.ok) {
        setBackendStatus({ status: 'connected', latency, lastChecked: new Date() });
      } else {
        setBackendStatus({ status: 'error', latency, lastChecked: new Date() });
      }
    } catch {
      setBackendStatus({ status: 'error', latency: null, lastChecked: new Date() });
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 60000); // check every 60s
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  // Update cell content
  const updateCellContent = useCallback((id, content) => {
    setCells(prev => prev.map(cell => (cell.id === id ? { ...cell, content } : cell)));
  }, []);

  // Update cell type ('code' | 'text')
  const updateCellType = useCallback((id, type) => {
    setCells(prev => prev.map(cell => (cell.id === id ? { ...cell, type } : cell)));
  }, []);

  // Insert a cell at a specific location
  const insertCell = useCallback((targetId, position = 'below', type = 'code', initialContent = '') => {
    const newId = `cell-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newCell = {
      id: newId,
      type,
      content: initialContent || (type === 'code' ? '#include <stdio.h>\n\nint main() {\n    printf("Hello C!\\n");\n    return 0;\n}' : '### New Section\nWrite notes in **Markdown** here.'),
      output: '',
      status: 'idle',
      executionCount: null,
      executionTime: null,
      jsCode: '',
      fullJs: '',
      error: null,
    };

    setCells(prev => {
      if (!targetId) {
        return position === 'above' ? [newCell, ...prev] : [...prev, newCell];
      }
      const index = prev.findIndex(c => c.id === targetId);
      if (index === -1) return [...prev, newCell];

      const newCells = [...prev];
      if (position === 'above') {
        newCells.splice(index, 0, newCell);
      } else {
        newCells.splice(index + 1, 0, newCell);
      }
      return newCells;
    });

    setActiveCellId(newId);
    return newId;
  }, []);

  // Remove cell
  const removeCell = useCallback((id) => {
    setCells(prev => {
      if (prev.length <= 1) {
        // Always keep at least 1 cell
        return [{
          id: `cell-${Date.now()}`,
          type: 'code',
          content: '#include <stdio.h>\n\nint main() {\n    return 0;\n}',
          output: '',
          status: 'idle',
          executionCount: null,
          executionTime: null,
          jsCode: '',
          fullJs: '',
          error: null,
        }];
      }
      const index = prev.findIndex(c => c.id === id);
      const nextIndex = index > 0 ? index - 1 : 0;
      const nextId = prev[nextIndex]?.id || null;
      if (activeCellId === id) {
        setActiveCellId(nextId);
      }
      return prev.filter(c => c.id !== id);
    });
  }, [activeCellId]);

  // Duplicate cell
  const duplicateCell = useCallback((id) => {
    setCells(prev => {
      const cell = prev.find(c => c.id === id);
      if (!cell) return prev;
      const newId = `cell-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newCell = {
        ...cell,
        id: newId,
        output: '',
        status: 'idle',
        executionCount: null,
        executionTime: null,
      };
      const index = prev.findIndex(c => c.id === id);
      const copy = [...prev];
      copy.splice(index + 1, 0, newCell);
      return copy;
    });
  }, []);

  // Move cell up or down
  const moveCell = useCallback((id, direction) => {
    setCells(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const newCells = [...prev];
      const [moved] = newCells.splice(index, 1);
      newCells.splice(targetIndex, 0, moved);
      return newCells;
    });
  }, []);

  // Execute JavaScript code in browser with output capture
  const executeJs = (code) => {
    const outputBuffer = [];
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      outputBuffer.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    };
    console.error = (...args) => {
      outputBuffer.push('[Error] ' + args.map(a => String(a)).join(' '));
    };
    console.warn = (...args) => {
      outputBuffer.push('[Warn] ' + args.map(a => String(a)).join(' '));
    };

    let runtimeError = null;
    try {
      // Execute in Function sandbox
      new Function(code)();
    } catch (err) {
      runtimeError = err.message || String(err);
      outputBuffer.push(`Runtime Error: ${runtimeError}`);
    } finally {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }

    return {
      output: outputBuffer.join('\n'),
      error: runtimeError,
    };
  };

  // Run a single code cell by ID
  const runCell = useCallback(async (id) => {
    const cell = cells.find(c => c.id === id);
    if (!cell || cell.type !== 'code') return;

    // Set running state
    setCells(prev => prev.map(c => (c.id === id ? { ...c, status: 'running', error: null } : c)));
    setIsAnyRunning(true);

    const startTime = performance.now();

    try {
      const response = await fetch('https://code-converter-c-to-js.onrender.com/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cell.content }),
      });

      const data = await response.json();
      const elapsed = Math.round(performance.now() - startTime);

      if (data.error) {
        setCells(prev => prev.map(c => {
          if (c.id !== id) return c;
          return {
            ...c,
            status: 'error',
            output: `Compilation Error:\n${data.error}`,
            error: data.error,
            executionTime: elapsed,
            jsCode: data.js || '',
            fullJs: data.full_js || '',
          };
        }));
      } else {
        const codeToExecute = data.full_js || data.js || data.result || '';
        const { output: execOutput, error: runError } = executeJs(codeToExecute);
        const finalStatus = runError ? 'error' : 'success';
        const nextExecCount = executionCounter;
        setExecutionCounter(cnt => cnt + 1);

        setCells(prev => prev.map(c => {
          if (c.id !== id) return c;
          return {
            ...c,
            status: finalStatus,
            output: execOutput || (runError ? `Runtime Error: ${runError}` : '[Program exited with return code 0 (No stdout)]'),
            error: runError,
            executionTime: elapsed,
            executionCount: nextExecCount,
            jsCode: data.js || '',
            fullJs: data.full_js || '',
          };
        }));
      }
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      setCells(prev => prev.map(c => {
        if (c.id !== id) return c;
        return {
          ...c,
          status: 'error',
          output: `Network / Execution Error: ${err.message}`,
          error: err.message,
          executionTime: elapsed,
        };
      }));
    } finally {
      setIsAnyRunning(false);
    }
  }, [cells, executionCounter]);

  // Run all code cells in sequential order
  const runAllCells = useCallback(async () => {
    setIsAnyRunning(true);
    for (const cell of cells) {
      if (cell.type === 'code') {
        setActiveCellId(cell.id);
        await runCell(cell.id);
      }
    }
    setIsAnyRunning(false);
  }, [cells, runCell]);

  // Run focused cell and advance to next
  const runCellAndAdvance = useCallback(async (id) => {
    await runCell(id);
    const currentIndex = cells.findIndex(c => c.id === id);
    if (currentIndex !== -1) {
      if (currentIndex === cells.length - 1) {
        // Last cell: insert a new code cell below
        const newId = insertCell(id, 'below', 'code', '');
        setActiveCellId(newId);
      } else {
        setActiveCellId(cells[currentIndex + 1].id);
      }
    }
  }, [cells, runCell, insertCell]);

  // Clear single cell output
  const clearCellOutput = useCallback((id) => {
    setCells(prev => prev.map(c => (c.id === id ? {
      ...c,
      output: '',
      error: null,
      status: 'idle',
      executionCount: null,
      executionTime: null,
    } : c)));
  }, []);

  // Clear all cell outputs
  const clearAllOutputs = useCallback(() => {
    setCells(prev => prev.map(c => ({
      ...c,
      output: '',
      error: null,
      status: 'idle',
      executionCount: null,
      executionTime: null,
    })));
  }, []);

  // Reset runtime (clear counters and state)
  const resetRuntime = useCallback(() => {
    setExecutionCounter(1);
    clearAllOutputs();
  }, [clearAllOutputs]);

  // Export full notebook as a downloadable .c file
  const exportCFile = useCallback(() => {
    let fileContent = `/*\n * ${notebookTitle}\n * Generated via Google Colab C-- Interface\n * Date: ${new Date().toLocaleString()}\n */\n\n`;
    cells.forEach((cell, idx) => {
      if (cell.type === 'text') {
        fileContent += `/* ==========================================\n * [TEXT CELL #${idx + 1}]\n * ${cell.content.replace(/\n/g, '\n * ')}\n * ========================================== */\n\n`;
      } else {
        fileContent += `/* [CODE CELL #${idx + 1}] */\n${cell.content}\n\n`;
      }
    });

    const blob = new Blob([fileContent], { type: 'text/x-csrc' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = notebookTitle.endsWith('.c') ? notebookTitle : `${notebookTitle}.c`;
    a.click();
    URL.revokeObjectURL(url);
  }, [cells, notebookTitle]);

  // Export full notebook as JSON
  const exportJSON = useCallback(() => {
    const data = {
      title: notebookTitle,
      version: '2.0',
      createdAt: new Date().toISOString(),
      cells,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = notebookTitle.replace(/\.c$/, '') + '.ipynb.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [cells, notebookTitle]);

  // Import notebook from file
  const importNotebook = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (parsed.cells && Array.isArray(parsed.cells)) {
            setCells(parsed.cells);
            if (parsed.title) setNotebookTitle(parsed.title);
            return;
          }
        }
        // Fallback or .c file import: create a single code cell with file text
        const newId = `cell-${Date.now()}`;
        setCells([{
          id: newId,
          type: 'code',
          content: text,
          output: '',
          status: 'idle',
          executionCount: null,
          executionTime: null,
          jsCode: '',
          fullJs: '',
          error: null,
        }]);
        setNotebookTitle(file.name);
        setActiveCellId(newId);
      } catch (err) {
        alert('Failed to parse imported file: ' + err.message);
      }
    };
    reader.readAsText(file);
  }, []);

  // Reset to brand new notebook
  const newNotebook = useCallback(() => {
    if (window.confirm('Create a new notebook? Any unsaved changes will be reset.')) {
      setCells(INITIAL_CELLS);
      setNotebookTitle('Untitled_C_Notebook.c');
      setExecutionCounter(1);
      setActiveCellId('cell-1');
    }
  }, []);

  return (
    <ShellContext.Provider value={{
      cells,
      activeCellId,
      setActiveCellId,
      notebookTitle,
      setNotebookTitle,
      executionCounter,
      isAnyRunning,
      backendStatus,
      checkBackendHealth,
      updateCellContent,
      updateCellType,
      insertCell,
      removeCell,
      duplicateCell,
      moveCell,
      runCell,
      runAllCells,
      runCellAndAdvance,
      clearCellOutput,
      clearAllOutputs,
      resetRuntime,
      exportCFile,
      exportJSON,
      importNotebook,
      newNotebook,
    }}>
      {children}
    </ShellContext.Provider>
  );
};

export default ShellContext;
