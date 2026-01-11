import React, { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import Editor from "@monaco-editor/react";

const Shell = forwardRef((props, ref) => {
  const editorRef = useRef(null);
  const [editorHeight, setEditorHeight] = useState(40);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return editorRef.current ? editorRef.current.getValue() : "";
    }
  }));

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    const updateHeight = () => {
      setEditorHeight(Math.max(40, editor.getContentHeight()));
    };
    editor.onDidContentSizeChange(updateHeight);
    updateHeight();
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '800px',
        height: `${editorHeight}px`,
        backgroundColor: '#1e1e1e',
        border: '1px solid #333',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        transition: 'height 0.1s ease-out',
      }}
    >
      <Editor
        height="100%"
        defaultLanguage="c"
        defaultValue={`#include <stdio.h>

                        int main() {
                            int n;
                            printf("Enter Your Number: ");
                            scanf("%d", &n);
                            printf("Number is %d", n);
                            return 0;
                        }`}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          scrollbar: {
            vertical: 'hidden',
            handleMouseWheel: false,
          },
        }}
      />
    </div>
  );
});

export default Shell;
