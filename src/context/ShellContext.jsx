/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import {
  validateCSyntax,
  validateNotebookCells,
  formatSyntaxErrorOutput,
} from '../utils/cSyntaxValidator';

const ShellContext = createContext(null);

export const useShell = () => {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error('useShell must be used within a ShellProvider');
  }
  return context;
};

const CATALOG_KEY = 'c_notebooks_catalog_v2';
const ACTIVE_NOTEBOOK_KEY = 'c_active_notebook_id_v2';

// C Function Detector: matches function definitions e.g. int add(int a, int b) { ... }
export const detectCFunctions = (code) => {
  if (!code || typeof code !== 'string') return [];
  // Strip comments
  const cleanCode = code
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*/g, ' ');

  const funcRegex = /\b(?:(?:static|inline|extern|const)\s+)*(?:void|int|float|double|char|long|short|unsigned|signed|size_t|bool|struct\s+\w+|[A-Za-z_]\w*\*?)\s+([A-Za-z_]\w*)\s*\([^)]*\)\s*\{/g;
  const matches = [];
  let m;
  while ((m = funcRegex.exec(cleanCode)) !== null) {
    const name = m[1];
    if (!['if', 'while', 'for', 'switch', 'catch'].includes(name)) {
      matches.push(name);
    }
  }
  return matches;
};

const DEFAULT_DIRECTIVES = `#include <stdio.h>

// Macros
#define MULTIPLIER 2

// Function Prototypes
int calculate_square(int n);
int add_numbers(int a, int b);`;

const DEFAULT_MAIN_CELL_1 = `int number = 7;
int base = 10;
printf("Starting calculation with number: %d\\n", number);`;

const DEFAULT_MAIN_CELL_2 = `int sq = calculate_square(number);
int sum = add_numbers(sq, base);
printf("Square of %d: %d\\n", number, sq);
printf("Sum with base %d: %d\\n", base, sum);`;

const DEFAULT_FUNC_CELL_1 = `// Function to calculate square of a number
int calculate_square(int n) {
    return n * n;
}

// Function to add two numbers with multiplier
int add_numbers(int a, int b) {
    return (a + b) * MULTIPLIER;
}`;

const createInitialNotebook = (id = 'notebook-1', title = 'Untitled_C_Notebook.c') => ({
  id,
  title,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  directives: {
    id: `dir-${Date.now()}`,
    content: DEFAULT_DIRECTIVES,
  },
  mainCells: [
    {
      id: `main-${Date.now()}-1`,
      content: DEFAULT_MAIN_CELL_1,
      output: '',
      status: 'idle',
      executionCount: null,
      executionTime: null,
      jsCode: '',
      fullJs: '',
      error: null,
    },
    {
      id: `main-${Date.now()}-2`,
      content: DEFAULT_MAIN_CELL_2,
      output: '',
      status: 'idle',
      executionCount: null,
      executionTime: null,
      jsCode: '',
      fullJs: '',
      error: null,
    },
  ],
  functionCells: [
    {
      id: `func-${Date.now()}-1`,
      content: DEFAULT_FUNC_CELL_1,
      output: '',
      status: 'idle',
      executionCount: null,
      executionTime: null,
      jsCode: '',
      fullJs: '',
      error: null,
    },
  ],
});

export const ShellProvider = ({ children }) => {
  // Load notebooks catalog from localStorage or initialize with default
  const [notebooks, setNotebooks] = useState(() => {
    try {
      const saved = localStorage.getItem(CATALOG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [createInitialNotebook()];
  });

  const [activeNotebookId, setActiveNotebookId] = useState(() => {
    try {
      const savedActive = localStorage.getItem(ACTIVE_NOTEBOOK_KEY);
      if (savedActive && notebooks.some(n => n.id === savedActive)) {
        return savedActive;
      }
    } catch {
      // ignore
    }
    return notebooks[0]?.id || 'notebook-1';
  });

  const [activeCellId, setActiveCellId] = useState(null);
  const [executionCounter, setExecutionCounter] = useState(1);
  const [isAnyRunning, setIsAnyRunning] = useState(false);
  const [sidebarTab, setSidebarTab] = useState(null);

  const toggleSidebarTab = useCallback((tab) => {
    setSidebarTab(prev => (prev === tab ? null : tab));
  }, []);

  const [backendStatus, setBackendStatus] = useState({
    status: 'checking',
    latency: null,
    lastChecked: null,
  });

  // Current active notebook object
  const currentNotebook = notebooks.find(n => n.id === activeNotebookId) || notebooks[0];

  // Auto-save notebooks to LocalStorage
  const saveTimeoutRef = useRef(null);
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(CATALOG_KEY, JSON.stringify(notebooks));
        localStorage.setItem(ACTIVE_NOTEBOOK_KEY, activeNotebookId);
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }, 400);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [notebooks, activeNotebookId]);

  // Ping backend to check connectivity
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
    const interval = setInterval(checkBackendHealth, 60000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  // Notebook Manager: Switch notebook
  const switchNotebook = useCallback((id) => {
    const target = notebooks.find(n => n.id === id);
    if (target) {
      setActiveNotebookId(id);
      setActiveCellId(null);
    }
  }, [notebooks]);

  // Notebook Manager: Create new notebook
  const createNotebook = useCallback((customTitle) => {
    const count = notebooks.length + 1;
    const title = customTitle || `Notebook_${count}.c`;
    const newNb = createInitialNotebook(`notebook-${Date.now()}`, title);
    setNotebooks(prev => [...prev, newNb]);
    setActiveNotebookId(newNb.id);
    setActiveCellId(null);
    return newNb.id;
  }, [notebooks.length]);

  // Notebook Manager: Rename active notebook
  const setNotebookTitle = useCallback((newTitle) => {
    setNotebooks(prev => prev.map(nb => (
      nb.id === activeNotebookId ? { ...nb, title: newTitle, updatedAt: new Date().toISOString() } : nb
    )));
  }, [activeNotebookId]);

  // Notebook Manager: Duplicate notebook
  const duplicateNotebook = useCallback((id) => {
    const src = notebooks.find(n => n.id === id);
    if (!src) return;
    const newNb = {
      ...JSON.parse(JSON.stringify(src)),
      id: `notebook-${Date.now()}`,
      title: `${src.title.replace(/\.c$/, '')}_copy.c`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotebooks(prev => [...prev, newNb]);
    setActiveNotebookId(newNb.id);
  }, [notebooks]);

  // Notebook Manager: Delete notebook
  const deleteNotebook = useCallback((id) => {
    if (notebooks.length <= 1) {
      alert('Cannot delete the only notebook. Create another notebook first.');
      return;
    }
    if (window.confirm('Delete this notebook permanently?')) {
      const remaining = notebooks.filter(n => n.id !== id);
      setNotebooks(remaining);
      if (activeNotebookId === id) {
        setActiveNotebookId(remaining[0].id);
      }
    }
  }, [notebooks, activeNotebookId]);

  // SECTION 1: Update Preprocessor Directives & Prototypes
  const updateDirectives = useCallback((content) => {
    setNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      return {
        ...nb,
        directives: { ...nb.directives, content },
        updatedAt: new Date().toISOString(),
      };
    }));
  }, [activeNotebookId]);

  // SECTION 2: Update a main() cell
  const updateMainCell = useCallback((id, content) => {
    setNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      return {
        ...nb,
        mainCells: nb.mainCells.map(c => (c.id === id ? { ...c, content } : c)),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, [activeNotebookId]);

  // SECTION 2: Insert a new main() cell (breaking main into multiple cells)
  const insertMainCell = useCallback((afterId, initialContent = '') => {
    const newId = `main-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newCell = {
      id: newId,
      content: initialContent || '// Next step in main()...\n',
      output: '',
      status: 'idle',
      executionCount: null,
      executionTime: null,
      jsCode: '',
      fullJs: '',
      error: null,
    };

    setNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      const cells = [...nb.mainCells];
      if (!afterId) {
        cells.push(newCell);
      } else {
        const idx = cells.findIndex(c => c.id === afterId);
        if (idx === -1) cells.push(newCell);
        else cells.splice(idx + 1, 0, newCell);
      }
      return { ...nb, mainCells: cells, updatedAt: new Date().toISOString() };
    }));

    setActiveCellId(newId);
  }, [activeNotebookId]);

  // SECTION 2: Remove a main() cell
  const removeMainCell = useCallback((id) => {
    setNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      if (nb.mainCells.length <= 1) {
        return {
          ...nb,
          mainCells: [{
            id: `main-${Date.now()}`,
            content: '// Write main statements here\n',
            output: '',
            status: 'idle',
            executionCount: null,
            executionTime: null,
            jsCode: '',
            fullJs: '',
            error: null,
          }],
        };
      }
      return {
        ...nb,
        mainCells: nb.mainCells.filter(c => c.id !== id),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, [activeNotebookId]);

  // SECTION 2: Move main() cell up or down
  const moveMainCell = useCallback((id, direction) => {
    setNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      const cells = [...nb.mainCells];
      const idx = cells.findIndex(c => c.id === id);
      if (idx === -1) return nb;
      if (direction === 'up' && idx === 0) return nb;
      if (direction === 'down' && idx === cells.length - 1) return nb;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      const [item] = cells.splice(idx, 1);
      cells.splice(targetIdx, 0, item);
      return { ...nb, mainCells: cells, updatedAt: new Date().toISOString() };
    }));
  }, [activeNotebookId]);

  // SECTION 3: Update a function cell
  const updateFunctionCell = useCallback((id, content) => {
    setNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      return {
        ...nb,
        functionCells: nb.functionCells.map(c => (c.id === id ? { ...c, content } : c)),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, [activeNotebookId]);

  // SECTION 3: Insert a function cell (after return 0)
  const insertFunctionCell = useCallback((afterId, initialContent = '') => {
    const newId = `func-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newCell = {
      id: newId,
      content: initialContent || '// Define function(s) here\nint my_function(int x) {\n    return x * 2;\n}',
      output: '',
      status: 'idle',
      executionCount: null,
      executionTime: null,
      jsCode: '',
      fullJs: '',
      error: null,
    };

    setNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      const cells = [...nb.functionCells];
      if (!afterId) {
        cells.push(newCell);
      } else {
        const idx = cells.findIndex(c => c.id === afterId);
        if (idx === -1) cells.push(newCell);
        else cells.splice(idx + 1, 0, newCell);
      }
      return { ...nb, functionCells: cells, updatedAt: new Date().toISOString() };
    }));

    setActiveCellId(newId);
  }, [activeNotebookId]);

  // SECTION 3: Remove a function cell
  const removeFunctionCell = useCallback((id) => {
    setNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      if (nb.functionCells.length <= 1) {
        return {
          ...nb,
          functionCells: [{
            id: `func-${Date.now()}`,
            content: '// Define your function here\nvoid helper() {\n    printf("Helper\\n");\n}',
            output: '',
            status: 'idle',
            executionCount: null,
            executionTime: null,
            jsCode: '',
            fullJs: '',
            error: null,
          }],
        };
      }
      return {
        ...nb,
        functionCells: nb.functionCells.filter(c => c.id !== id),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, [activeNotebookId]);

  // SECTION 3: Move function cell
  const moveFunctionCell = useCallback((id, direction) => {
    setNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      const cells = [...nb.functionCells];
      const idx = cells.findIndex(c => c.id === id);
      if (idx === -1) return nb;
      if (direction === 'up' && idx === 0) return nb;
      if (direction === 'down' && idx === cells.length - 1) return nb;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      const [item] = cells.splice(idx, 1);
      cells.splice(targetIdx, 0, item);
      return { ...nb, functionCells: cells, updatedAt: new Date().toISOString() };
    }));
  }, [activeNotebookId]);

  // Assemble full C program by concatenating ALL cell programs into a single complete C program
  const assembleProgram = useCallback(() => {
    if (!currentNotebook) return '';

    const header = (currentNotebook.directives?.content || '').trim();

    let mainBody = '';
    const mainCells = currentNotebook.mainCells || [];
    for (let i = 0; i < mainCells.length; i++) {
      const cell = mainCells[i];
      const trimmed = (cell.content || '').trim();
      if (trimmed) {
        mainBody += `    // [Main Step ${i + 1}]\n${cell.content.split('\n').map(l => '    ' + l).join('\n')}\n\n`;
      }
    }

    let functions = '';
    const funcCells = currentNotebook.functionCells || [];
    for (let i = 0; i < funcCells.length; i++) {
      const cell = funcCells[i];
      const trimmed = (cell.content || '').trim();
      if (trimmed) {
        functions += `// [Function Definition ${i + 1}]\n${trimmed}\n\n`;
      }
    }

    const parts = [];
    if (header) {
      parts.push(header);
    }

    parts.push(`int main() {\n${mainBody}    return 0;\n}`);

    if (functions.trim()) {
      parts.push(functions.trim());
    }

    return parts.join('\n\n') + '\n';
  }, [currentNotebook]);

  // Execute JavaScript in browser with output capture
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

  // Run a specific main() cell with strict C syntax validation & full concatenation
  const runMainCell = useCallback(async (cellId) => {
    if (!currentNotebook) return;

    // 1. STRICT C SYNTAX VALIDATION: Check active cell first
    const activeCell = currentNotebook.mainCells.find(c => c.id === cellId);
    if (activeCell && activeCell.content?.trim()) {
      const cellValidation = validateCSyntax(activeCell.content);
      if (!cellValidation.isValid) {
        const errorMsg = formatSyntaxErrorOutput(cellValidation.errors.map(e => ({
          ...e,
          section: 'Current Cell',
          message: e.message,
        })));
        setNotebooks(prev => prev.map(nb => {
          if (nb.id !== activeNotebookId) return nb;
          return {
            ...nb,
            mainCells: nb.mainCells.map(c => (c.id === cellId ? {
              ...c,
              status: 'error',
              output: errorMsg,
              error: 'C Syntax Error: Missing semicolon or delimiter mismatch',
              executionTime: 0,
            } : c)),
          };
        }));
        return;
      }
    }

    // 2. Check all notebook cells for syntax errors
    const nbValidation = validateNotebookCells(currentNotebook);
    if (!nbValidation.isValid) {
      const errorMsg = formatSyntaxErrorOutput(nbValidation.errors);
      setNotebooks(prev => prev.map(nb => {
        if (nb.id !== activeNotebookId) return nb;
        return {
          ...nb,
          mainCells: nb.mainCells.map(c => (c.id === cellId ? {
            ...c,
            status: 'error',
            output: errorMsg,
            error: 'C Syntax Error in notebook',
            executionTime: 0,
          } : c)),
        };
      }));
      return;
    }

    // 3. Assemble full program (concatenating all cell programs)
    const assembled = assembleProgram();
    const assembledValidation = validateCSyntax(assembled);
    if (!assembledValidation.isValid) {
      const errorMsg = formatSyntaxErrorOutput(assembledValidation.errors);
      setNotebooks(prev => prev.map(nb => {
        if (nb.id !== activeNotebookId) return nb;
        return {
          ...nb,
          mainCells: nb.mainCells.map(c => (c.id === cellId ? {
            ...c,
            status: 'error',
            output: errorMsg,
            error: 'C Syntax Error in combined program',
            executionTime: 0,
          } : c)),
        };
      }));
      return;
    }

    // Set running state
    setNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      return {
        ...nb,
        mainCells: nb.mainCells.map(c => (c.id === cellId ? { ...c, status: 'running', error: null } : c)),
      };
    }));
    setIsAnyRunning(true);

    const startTime = performance.now();

    try {
      const response = await fetch('https://code-converter-c-to-js.onrender.com/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: assembled }),
      });

      const data = await response.json();
      const elapsed = Math.round(performance.now() - startTime);

      // Detect backend error or backend parsing failure where C types were treated as undeclared variables
      const C_TYPES = ['int', 'char', 'float', 'double', 'void', 'long', 'short', 'struct', 'unsigned', 'signed'];
      const unparsedTypes = (data.undeclared || []).filter(u => C_TYPES.includes(u));

      if (data.error || unparsedTypes.length > 0) {
        const errorDesc = data.error ||
          `Backend parsing error: Unparsed C type keyword(s) [${unparsedTypes.join(', ')}]. Check for missing semicolons or syntax errors.`;

        setNotebooks(prev => prev.map(nb => {
          if (nb.id !== activeNotebookId) return nb;
          return {
            ...nb,
            mainCells: nb.mainCells.map(c => (c.id === cellId ? {
              ...c,
              status: 'error',
              output: `Compilation Error:\n${errorDesc}`,
              error: errorDesc,
              executionTime: elapsed,
              jsCode: data.js || '',
              fullJs: data.full_js || '',
            } : c)),
          };
        }));
      } else {
        const codeToExecute = data.full_js || data.js || data.result || '';
        const { output: execOutput, error: runError } = executeJs(codeToExecute);
        const finalStatus = runError ? 'error' : 'success';
        const nextExecCount = executionCounter;
        setExecutionCounter(cnt => cnt + 1);

        setNotebooks(prev => prev.map(nb => {
          if (nb.id !== activeNotebookId) return nb;
          return {
            ...nb,
            mainCells: nb.mainCells.map(c => (c.id === cellId ? {
              ...c,
              status: finalStatus,
              output: execOutput || (runError ? `Runtime Error: ${runError}` : '[Program exited with code 0 (No stdout)]'),
              error: runError,
              executionTime: elapsed,
              executionCount: nextExecCount,
              jsCode: data.js || '',
              fullJs: data.full_js || '',
            } : c)),
          };
        }));
      }
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      setNotebooks(prev => prev.map(nb => {
        if (nb.id !== activeNotebookId) return nb;
        return {
          ...nb,
          mainCells: nb.mainCells.map(c => (c.id === cellId ? {
            ...c,
            status: 'error',
            output: `Execution Error: ${err.message}`,
            error: err.message,
            executionTime: elapsed,
          } : c)),
        };
      }));
    } finally {
      setIsAnyRunning(false);
    }
  }, [currentNotebook, activeNotebookId, assembleProgram, executionCounter]);

  // Run a specific function cell with validation check & full concatenation
  const runFunctionCell = useCallback(async (cellId) => {
    if (!currentNotebook) return;
    const cell = currentNotebook.functionCells.find(c => c.id === cellId);
    if (!cell) return;

    // VALIDATION 1: Must contain at least one function definition
    const detected = detectCFunctions(cell.content);
    if (detected.length === 0) {
      setNotebooks(prev => prev.map(nb => {
        if (nb.id !== activeNotebookId) return nb;
        return {
          ...nb,
          functionCells: nb.functionCells.map(c => (c.id === cellId ? {
            ...c,
            status: 'error',
            output: 'Validation Error: Every function cell after return 0 must contain at least one function definition (e.g., int add(int a, int b) { return a + b; }). Plain statements without a function body are not allowed in this section.',
            error: 'No function definition found',
            executionTime: 0,
          } : c)),
        };
      }));
      return;
    }

    // VALIDATION 2: Strict C Syntax Check on this cell
    const cellValidation = validateCSyntax(cell.content);
    if (!cellValidation.isValid) {
      const errorMsg = formatSyntaxErrorOutput(cellValidation.errors.map(e => ({
        ...e,
        section: 'Function Cell',
        message: e.message,
      })));
      setNotebooks(prev => prev.map(nb => {
        if (nb.id !== activeNotebookId) return nb;
        return {
          ...nb,
          functionCells: nb.functionCells.map(c => (c.id === cellId ? {
            ...c,
            status: 'error',
            output: errorMsg,
            error: 'C Syntax Error: Missing semicolon or delimiter mismatch',
            executionTime: 0,
          } : c)),
        };
      }));
      return;
    }

    // VALIDATION 3: Check all notebook cells
    const nbValidation = validateNotebookCells(currentNotebook);
    if (!nbValidation.isValid) {
      const errorMsg = formatSyntaxErrorOutput(nbValidation.errors);
      setNotebooks(prev => prev.map(nb => {
        if (nb.id !== activeNotebookId) return nb;
        return {
          ...nb,
          functionCells: nb.functionCells.map(c => (c.id === cellId ? {
            ...c,
            status: 'error',
            output: errorMsg,
            error: 'C Syntax Error in notebook',
            executionTime: 0,
          } : c)),
        };
      }));
      return;
    }

    // Assembled program validation (concatenating all cell programs)
    const assembled = assembleProgram();
    const assembledValidation = validateCSyntax(assembled);
    if (!assembledValidation.isValid) {
      const errorMsg = formatSyntaxErrorOutput(assembledValidation.errors);
      setNotebooks(prev => prev.map(nb => {
        if (nb.id !== activeNotebookId) return nb;
        return {
          ...nb,
          functionCells: nb.functionCells.map(c => (c.id === cellId ? {
            ...c,
            status: 'error',
            output: errorMsg,
            error: 'C Syntax Error in combined program',
            executionTime: 0,
          } : c)),
        };
      }));
      return;
    }

    // Set running
    setNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      return {
        ...nb,
        functionCells: nb.functionCells.map(c => (c.id === cellId ? { ...c, status: 'running', error: null } : c)),
      };
    }));
    setIsAnyRunning(true);

    const startTime = performance.now();

    try {
      const response = await fetch('https://code-converter-c-to-js.onrender.com/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: assembled }),
      });
      const data = await response.json();
      const elapsed = Math.round(performance.now() - startTime);

      const C_TYPES = ['int', 'char', 'float', 'double', 'void', 'long', 'short', 'struct', 'unsigned', 'signed'];
      const unparsedTypes = (data.undeclared || []).filter(u => C_TYPES.includes(u));

      if (data.error || unparsedTypes.length > 0) {
        const errorDesc = data.error ||
          `Backend parsing error: Unparsed C type keyword(s) [${unparsedTypes.join(', ')}]. Check for missing semicolons or syntax errors.`;

        setNotebooks(prev => prev.map(nb => {
          if (nb.id !== activeNotebookId) return nb;
          return {
            ...nb,
            functionCells: nb.functionCells.map(c => (c.id === cellId ? {
              ...c,
              status: 'error',
              output: `Compilation Error:\n${errorDesc}`,
              error: errorDesc,
              executionTime: elapsed,
              jsCode: data.js || '',
              fullJs: data.full_js || '',
            } : c)),
          };
        }));
      } else {
        const nextExecCount = executionCounter;
        setExecutionCounter(cnt => cnt + 1);

        setNotebooks(prev => prev.map(nb => {
          if (nb.id !== activeNotebookId) return nb;
          return {
            ...nb,
            functionCells: nb.functionCells.map(c => (c.id === cellId ? {
              ...c,
              status: 'success',
              output: `✓ Function definition(s) valid: [${detected.join(', ')}]. Compiled successfully with complete program.`,
              error: null,
              executionTime: elapsed,
              executionCount: nextExecCount,
              jsCode: data.js || '',
              fullJs: data.full_js || '',
            } : c)),
          };
        }));
      }
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      setNotebooks(prev => prev.map(nb => {
        if (nb.id !== activeNotebookId) return nb;
        return {
          ...nb,
          functionCells: nb.functionCells.map(c => (c.id === cellId ? {
            ...c,
            status: 'error',
            output: `Execution Error: ${err.message}`,
            error: err.message,
            executionTime: elapsed,
          } : c)),
        };
      }));
    } finally {
      setIsAnyRunning(false);
    }
  }, [currentNotebook, activeNotebookId, assembleProgram, executionCounter]);

  // Run all main cells (validating syntax first)
  const runAllCells = useCallback(async () => {
    if (!currentNotebook) return;

    // Validate entire notebook before running all
    const nbValidation = validateNotebookCells(currentNotebook);
    if (!nbValidation.isValid) {
      const errorMsg = formatSyntaxErrorOutput(nbValidation.errors);
      const firstMainId = currentNotebook.mainCells[0]?.id;
      if (firstMainId) {
        setNotebooks(prev => prev.map(nb => {
          if (nb.id !== activeNotebookId) return nb;
          return {
            ...nb,
            mainCells: nb.mainCells.map(c => (c.id === firstMainId ? {
              ...c,
              status: 'error',
              output: errorMsg,
              error: 'C Syntax Error in notebook',
              executionTime: 0,
            } : c)),
          };
        }));
      }
      return;
    }

    setIsAnyRunning(true);
    for (const cell of currentNotebook.mainCells) {
      setActiveCellId(cell.id);
      await runMainCell(cell.id);
    }
    setIsAnyRunning(false);
  }, [currentNotebook, runMainCell, activeNotebookId]);

  // Clear single cell output
  const clearCellOutput = useCallback((id) => {
    setNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      return {
        ...nb,
        mainCells: nb.mainCells.map(c => (c.id === id ? { ...c, output: '', error: null, status: 'idle' } : c)),
        functionCells: nb.functionCells.map(c => (c.id === id ? { ...c, output: '', error: null, status: 'idle' } : c)),
      };
    }));
  }, [activeNotebookId]);

  // Clear all outputs in active notebook
  const clearAllOutputs = useCallback(() => {
    setNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      return {
        ...nb,
        mainCells: nb.mainCells.map(c => ({ ...c, output: '', error: null, status: 'idle', executionCount: null, executionTime: null })),
        functionCells: nb.functionCells.map(c => ({ ...c, output: '', error: null, status: 'idle', executionCount: null, executionTime: null })),
      };
    }));
  }, [activeNotebookId]);

  // Reset runtime counters
  const resetRuntime = useCallback(() => {
    setExecutionCounter(1);
    clearAllOutputs();
  }, [clearAllOutputs]);

  // Export combined .c file (concatenating all cell programs and verifying syntax)
  const exportCFile = useCallback(() => {
    if (!currentNotebook) return;
    const title = currentNotebook.title || 'notebook.c';
    const assembled = assembleProgram();

    // Validate syntax before downloading
    const validation = validateCSyntax(assembled);
    if (!validation.isValid) {
      const issues = validation.errors.map(e => `  • Line ${e.line}: ${e.message}`).join('\n');
      const proceed = window.confirm(
        `[C Syntax Warning]\nYour notebook contains ${validation.errors.length} syntax error(s) (e.g. missing semicolons):\n\n${issues}\n\nDo you want to download the file anyway?`
      );
      if (!proceed) return;
    }

    let fileContent = `/*\n * ${title}\n * Generated via C-- Interactive Notebook\n * Date: ${new Date().toLocaleString()}\n */\n\n`;
    fileContent += assembled;

    const blob = new Blob([fileContent], { type: 'text/x-csrc' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title.endsWith('.c') ? title : `${title}.c`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentNotebook, assembleProgram]);

  // Export full notebook JSON
  const exportJSON = useCallback(() => {
    if (!currentNotebook) return;
    const blob = new Blob([JSON.stringify(currentNotebook, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentNotebook.title.replace(/\.c$/, '') + '.cnotebook.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [currentNotebook]);

  // Import notebook
  const importNotebook = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (parsed.directives && parsed.mainCells) {
            const imported = {
              ...parsed,
              id: `notebook-${Date.now()}`,
              title: parsed.title || file.name,
              updatedAt: new Date().toISOString(),
            };
            setNotebooks(prev => [...prev, imported]);
            setActiveNotebookId(imported.id);
            return;
          }
        }
        // If importing .c file, create a new notebook with text inside main
        const newNb = createInitialNotebook(`notebook-${Date.now()}`, file.name);
        newNb.mainCells[0].content = text;
        setNotebooks(prev => [...prev, newNb]);
        setActiveNotebookId(newNb.id);
      } catch (err) {
        alert('Failed to parse imported file: ' + err.message);
      }
    };
    reader.readAsText(file);
  }, []);

  return (
    <ShellContext.Provider value={{
      notebooks,
      activeNotebookId,
      currentNotebook,
      switchNotebook,
      createNotebook,
      setNotebookTitle,
      duplicateNotebook,
      deleteNotebook,
      activeCellId,
      setActiveCellId,
      isAnyRunning,
      backendStatus,
      checkBackendHealth,
      sidebarTab,
      setSidebarTab,
      toggleSidebarTab,
      updateDirectives,
      updateMainCell,
      insertMainCell,
      removeMainCell,
      moveMainCell,
      updateFunctionCell,
      insertFunctionCell,
      removeFunctionCell,
      moveFunctionCell,
      runMainCell,
      runFunctionCell,
      runAllCells,
      clearCellOutput,
      clearAllOutputs,
      resetRuntime,
      exportCFile,
      exportJSON,
      importNotebook,
    }}>
      {children}
    </ShellContext.Provider>
  );
};

export default ShellContext;
