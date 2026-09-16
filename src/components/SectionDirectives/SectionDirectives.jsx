import React from 'react';
import { useShell } from '../../context/ShellContext';
import Shell from '../Shell/Shell';
import './SectionDirectives.css';

const SectionDirectives = () => {
  const { currentNotebook, updateDirectives } = useShell();
  const directives = currentNotebook?.directives;

  return (
    <div className="c-section-directives">
      <div className="c-section-directives-header">
        <div className="c-section-directives-title-group">
          <span className="c-section-directives-tag">Section 1</span>
          <span className="c-section-directives-title">
            Preprocessor Directives, Macros & Function Prototypes
          </span>
        </div>
      </div>

      <div className="c-section-directives-desc">
        Write <code>#include</code> headers, <code>#define</code> constants, and function declarations here. Placed globally at the top of your program.
      </div>

      <div className="c-section-directives-editor">
        <Shell
          value={directives?.content || ''}
          onChange={(val) => updateDirectives(val || '')}
        />
      </div>
    </div>
  );
};

export default SectionDirectives;

