/**
 * C Syntax Validator for C-- Notebook
 * Validates C code before sending to backend transpiler.
 * Specifically checks for:
 * 1. Missing semicolons on statements, declarations, return, do-while, and prototypes.
 * 2. Unclosed and mismatched brackets, braces, and parentheses.
 * 3. Unterminated string and character literals.
 * 4. Unterminated block comments.
 */

export function validateCSyntax(code) {
  if (!code || typeof code !== 'string') {
    return { isValid: true, errors: [] };
  }

  const errors = [];
  const lines = code.split(/\r?\n/);

  // Phase 1: Track strings and comments while keeping line/col mapping
  let inBlockComment = false;
  const sanitizedLines = [];

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const rawLine = lines[lineIdx];
    let sanitized = '';
    let inString = false;
    let inChar = false;
    let i = 0;

    while (i < rawLine.length) {
      // If currently inside a multi-line comment /* ... */
      if (inBlockComment) {
        if (rawLine[i] === '*' && rawLine[i + 1] === '/') {
          inBlockComment = false;
          sanitized += '  ';
          i += 2;
        } else {
          sanitized += ' ';
          i++;
        }
        continue;
      }

      // If currently inside a string literal "..."
      if (inString) {
        if (rawLine[i] === '\\') {
          sanitized += '  ';
          i += 2;
        } else if (rawLine[i] === '"') {
          inString = false;
          sanitized += '"';
          i++;
        } else {
          sanitized += ' ';
          i++;
        }
        continue;
      }

      // If currently inside a char literal '...'
      if (inChar) {
        if (rawLine[i] === '\\') {
          sanitized += '  ';
          i += 2;
        } else if (rawLine[i] === '\'') {
          inChar = false;
          sanitized += '\'';
          i++;
        } else {
          sanitized += ' ';
          i++;
        }
        continue;
      }

      // Check start of multi-line comment
      if (rawLine[i] === '/' && rawLine[i + 1] === '*') {
        inBlockComment = true;
        sanitized += '  ';
        i += 2;
        continue;
      }

      // Check start of single-line comment
      if (rawLine[i] === '/' && rawLine[i + 1] === '/') {
        // Rest of line is comment
        sanitized += ' '.repeat(rawLine.length - i);
        break;
      }

      // Check string start
      if (rawLine[i] === '"') {
        inString = true;
        sanitized += '"';
        i++;
        continue;
      }

      // Check char start
      if (rawLine[i] === '\'') {
        inChar = true;
        sanitized += '\'';
        i++;
        continue;
      }

      sanitized += rawLine[i];
      i++;
    }

    if (inString) {
      errors.push({
        line: lineIdx + 1,
        message: `Unterminated string literal at line ${lineIdx + 1}`,
        snippet: rawLine.trim(),
      });
      inString = false;
    }

    if (inChar) {
      errors.push({
        line: lineIdx + 1,
        message: `Unterminated character literal at line ${lineIdx + 1}`,
        snippet: rawLine.trim(),
      });
      inChar = false;
    }

    sanitizedLines.push(sanitized);
  }

  if (inBlockComment) {
    errors.push({
      line: lines.length,
      message: 'Unterminated comment (/*) at end of code',
      snippet: '/*',
    });
  }

  // Phase 2: Delimiter matching ({}, (), [])
  const stack = [];
  for (let lineIdx = 0; lineIdx < sanitizedLines.length; lineIdx++) {
    const sLine = sanitizedLines[lineIdx];
    for (let charIdx = 0; charIdx < sLine.length; charIdx++) {
      const ch = sLine[charIdx];
      if (ch === '{' || ch === '(' || ch === '[') {
        stack.push({ ch, line: lineIdx + 1, col: charIdx + 1 });
      } else if (ch === '}' || ch === ')' || ch === ']') {
        if (stack.length === 0) {
          errors.push({
            line: lineIdx + 1,
            message: `Unexpected closing '${ch}' with no matching opening delimiter`,
            snippet: lines[lineIdx].trim(),
          });
        } else {
          const top = stack.pop();
          const matches = (top.ch === '{' && ch === '}') ||
                          (top.ch === '(' && ch === ')') ||
                          (top.ch === '[' && ch === ']');
          if (!matches) {
            errors.push({
              line: lineIdx + 1,
              message: `Mismatched delimiter: opened '${top.ch}' at line ${top.line}, closed with '${ch}' at line ${lineIdx + 1}`,
              snippet: lines[lineIdx].trim(),
            });
          }
        }
      }
    }
  }

  while (stack.length > 0) {
    const unclosed = stack.pop();
    errors.push({
      line: unclosed.line,
      message: `Unclosed '${unclosed.ch}' opened at line ${unclosed.line}`,
      snippet: lines[unclosed.line - 1].trim(),
    });
  }

  // Phase 3: Missing Semicolon Detection
  let parenDepth = 0;
  let bracketDepth = 0;
  let braceDepth = 0;

  const CONTROL_FLOW_REGEX = /^\s*(?:if\s*\(|else(?:\s+if\s*\(.*|\s*\{|\s*$)|for\s*\(|while\s*\(|do\s*\{|do\s*$|switch\s*\(|case\s+[^:]+:|default\s*:)/;

  for (let lineIdx = 0; lineIdx < sanitizedLines.length; lineIdx++) {
    const sLine = sanitizedLines[lineIdx];
    const rawLine = lines[lineIdx];
    const trimmed = sLine.trim();

    // Track delimiter depths
    for (const c of sLine) {
      if (c === '(') parenDepth++;
      else if (c === ')') parenDepth = Math.max(0, parenDepth - 1);
      else if (c === '[') bracketDepth++;
      else if (c === ']') bracketDepth = Math.max(0, bracketDepth - 1);
      else if (c === '{') braceDepth++;
      else if (c === '}') braceDepth = Math.max(0, braceDepth - 1);
    }

    if (!trimmed) continue;

    // 1. Preprocessor directives (start with '#')
    if (trimmed.startsWith('#')) {
      continue;
    }

    // 2. Multi-line function calls, argument lists, condition headers, array initializers
    if (parenDepth > 0 || bracketDepth > 0) {
      continue;
    }

    // 3. Line ends with valid statement terminator or block opener/closer
    const lastChar = trimmed[trimmed.length - 1];
    if (lastChar === ';' || lastChar === '{' || lastChar === ':') {
      continue;
    }

    // 4. Line ends with continuation operator
    if (/[,+\-*/%|&^?=<>.]$/.test(trimmed)) {
      continue;
    }

    // 5. Line is a closing brace '}' (or nested braces '}}') without trailing statement
    if (/^\}+$/.test(trimmed)) {
      continue;
    }

    // 6. Control flow headers without inline brace
    if (CONTROL_FLOW_REGEX.test(trimmed)) {
      // Special check: do { ... } while (...); MUST have a semicolon
      if (/^\s*(?:\}\s*)?while\s*\(/.test(trimmed)) {
        let isDoWhile = false;
        for (let prevIdx = lineIdx - 1; prevIdx >= 0; prevIdx--) {
          const prevTrimmed = sanitizedLines[prevIdx].trim();
          if (prevTrimmed.includes('do')) {
            isDoWhile = true;
            break;
          }
          if (prevTrimmed.endsWith(';')) break;
        }
        if (isDoWhile && !trimmed.endsWith(';')) {
          errors.push({
            line: lineIdx + 1,
            message: `Missing ';' after 'do ... while (...)' statement at line ${lineIdx + 1}`,
            snippet: rawLine.trim(),
          });
          continue;
        }
      }
      continue;
    }

    // 7. Function signature starting a block on the next line (K&R or Allman style)
    let nextNonEmptyIdx = lineIdx + 1;
    while (nextNonEmptyIdx < sanitizedLines.length && !sanitizedLines[nextNonEmptyIdx].trim()) {
      nextNonEmptyIdx++;
    }
    if (nextNonEmptyIdx < sanitizedLines.length && sanitizedLines[nextNonEmptyIdx].trim().startsWith('{')) {
      continue;
    }

    // If none of the above matched, the statement at lineIdx is missing a semicolon!
    errors.push({
      line: lineIdx + 1,
      message: `Missing ';' at line ${lineIdx + 1}: expected statement to end with semicolon`,
      snippet: rawLine.trim(),
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an entire notebook's sections and cells.
 * Returns { isValid, errors, cellErrors: Map<cellId, Array<error>> }
 */
export function validateNotebookCells(notebook) {
  if (!notebook) return { isValid: true, errors: [], cellErrors: new Map() };

  const allErrors = [];
  const cellErrors = new Map();

  // 1. Directives section
  if (notebook.directives?.content) {
    const res = validateCSyntax(notebook.directives.content);
    if (!res.isValid) {
      const formatted = res.errors.map(e => ({
        ...e,
        section: 'Directives',
        cellId: notebook.directives.id,
        message: `Directives (Line ${e.line}): ${e.message}`,
      }));
      allErrors.push(...formatted);
      cellErrors.set(notebook.directives.id, formatted);
    }
  }

  // 2. Main cells
  const mainCells = notebook.mainCells || [];
  for (let idx = 0; idx < mainCells.length; idx++) {
    const cell = mainCells[idx];
    if (cell.content?.trim()) {
      const res = validateCSyntax(cell.content);
      if (!res.isValid) {
        const formatted = res.errors.map(e => ({
          ...e,
          section: 'Main',
          cellId: cell.id,
          cellIndex: idx + 1,
          message: `Main Cell #${idx + 1} (Line ${e.line}): ${e.message}`,
        }));
        allErrors.push(...formatted);
        cellErrors.set(cell.id, formatted);
      }
    }
  }

  // 3. Function cells
  const functionCells = notebook.functionCells || [];
  for (let idx = 0; idx < functionCells.length; idx++) {
    const cell = functionCells[idx];
    if (cell.content?.trim()) {
      const res = validateCSyntax(cell.content);
      if (!res.isValid) {
        const formatted = res.errors.map(e => ({
          ...e,
          section: 'Functions',
          cellId: cell.id,
          cellIndex: idx + 1,
          message: `Function Cell #${idx + 1} (Line ${e.line}): ${e.message}`,
        }));
        allErrors.push(...formatted);
        cellErrors.set(cell.id, formatted);
      }
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    cellErrors,
  };
}

/**
 * Format syntax errors into a clear compiler-style diagnostic string
 */
export function formatSyntaxErrorOutput(errors) {
  if (!errors || errors.length === 0) return '';

  const header = `╔══════════════════════════════════════════════════════════╗\n║                C SYNTAX ERROR DETECTED                  ║\n╚══════════════════════════════════════════════════════════╝\n`;

  const details = errors.map((err, i) => {
    const loc = err.section ? `[${err.section}${err.cellIndex ? ' Cell #' + err.cellIndex : ''}] ` : '';
    const snip = err.snippet ? `\n      --> ${err.snippet}` : '';
    return `  (${i + 1}) ${loc}${err.message}${snip}`;
  }).join('\n\n');

  const tip = `\n\n[Tip] In C, every expression and declaration statement must end with a semicolon (;).\nEnsure loops, variables, function calls, and prototypes are properly terminated.`;

  return `${header}\n${details}${tip}`;
}

/**
 * Strip C function prototypes (e.g. "int calculate_square(int n);")
 * Used when preparing code for the backend C-to-JS transpiler so the transpiler doesn't
 * copy prototype declarations into the JS runtime.
 */
export function stripPrototypes(directivesCode) {
  if (!directivesCode || typeof directivesCode !== 'string') return '';
  return directivesCode.replace(/^\s*(?:void|int|float|double|char|long|short|unsigned|signed|size_t|bool)\s+[A-Za-z_]\w*\s*\([^)]*\)\s*;\s*$/gm, '');
}

/**
 * Sanitizes transpiled JS code returned from the backend before execution:
 * 1. Removes any unparsed C function prototypes.
 * 2. Normalizes leftover C type declarations ("int sum = ...", "float x = ...") to "let".
 * 3. Normalizes uninitialized C variable declarations ("int sum;") to "let sum;".
 */
export function sanitizeTranspiledJs(jsCode) {
  if (!jsCode || typeof jsCode !== 'string') return '';
  let cleaned = jsCode;

  // 1. Remove leftover C prototypes
  cleaned = cleaned.replace(/^\s*(?:void|int|float|double|char|long|short|unsigned|signed|size_t|bool)\s+[A-Za-z_]\w*\s*\([^)]*\)\s*;\s*$/gm, '');

  // 2. Convert leftover C typed variables with assignments (e.g., int sum = add_numbers(a, b);)
  cleaned = cleaned.replace(/\b(?:int|float|double|char|long|short|unsigned|signed|size_t|bool)\s+([A-Za-z_]\w*\s*=)/g, 'let $1');

  // 3. Convert leftover C typed declarations without assignments (e.g., int sum;)
  cleaned = cleaned.replace(/\b(?:int|float|double|char|long|short|unsigned|signed|size_t|bool)\s+([A-Za-z_]\w*)\s*;/g, 'let $1;');

  return cleaned;
}

