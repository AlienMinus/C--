import React, { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import Editor from '@monaco-editor/react';
import './Shell.css';

const Shell = forwardRef(({ onFocus, defaultValue, value, onChange, onRun, onRunAndAdvance }, ref) => {
  const editorRef = useRef(null);
  const [editorHeight, setEditorHeight] = useState(60);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return editorRef.current ? editorRef.current.getValue() : (value || defaultValue || '');
    },
    setValue: (val) => {
      if (editorRef.current) {
        editorRef.current.setValue(val);
      }
    },
    focus: () => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }
  }));

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    const updateHeight = () => {
      const contentHeight = Math.max(50, editor.getContentHeight());
      setEditorHeight(contentHeight);
    };

    editor.onDidContentSizeChange(updateHeight);
    updateHeight();

    if (onFocus) {
      editor.onDidFocusEditorText(onFocus);
    }

    // Keyboard shortcuts inside Monaco
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      if (onRunAndAdvance) {
        onRunAndAdvance();
      } else if (onRun) {
        onRun();
      }
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun) {
        onRun();
      }
    });
  };

  return (
    <div
      className="colab-shell-wrapper"
      style={{ height: `${editorHeight}px` }}
    >
      <Editor
        height="100%"
        defaultLanguage="c"
        language="c"
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'Fira Code', Consolas, Monaco, 'Courier New', monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          lineNumbersMinChars: 3,
          lineDecorationsWidth: 6,
          glyphMargin: false,
          folding: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 8, bottom: 8 },
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          tabSize: 4,
          scrollbar: {
            vertical: 'hidden',
            horizontal: 'auto',
            handleMouseWheel: false,
            horizontalScrollbarSize: 6,
          },
          autoIndent: 'full',
          formatOnPaste: true,
          formatOnType: true,
          wordWrap: 'on',
        }}
      />
    </div>
  );
});

Shell.displayName = 'Shell';

export default Shell;
