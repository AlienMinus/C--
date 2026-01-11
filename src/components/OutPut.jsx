import React from 'react';

const OutPut = ({ output }) => {
  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
        fontSize: '16px',
        padding: '10px',
        border: '1px solid #333',
        borderRadius: '8px',
        whiteSpace: 'pre-wrap',
        overflowX: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        minHeight: '40px',
      }}
    >
      {output || <span style={{ color: '#555' }}>// Output will appear here...</span>}
    </div>
  );
};

export default OutPut;
