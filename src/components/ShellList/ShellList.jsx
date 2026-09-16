import React from 'react';
import { useShell } from '../../context/ShellContext';
import SectionDirectives from '../SectionDirectives/SectionDirectives';
import SectionMain from '../SectionMain/SectionMain';
import SectionFunctions from '../SectionFunctions/SectionFunctions';
import './ShellList.css';

const ShellList = () => {
  const { sidebarTab } = useShell();

  return (
    <div className={`colab-notebook-container ${sidebarTab ? 'sidebar-open' : ''}`}>
      <div className="colab-notebook-inner">
        {/* Section 1: Preprocessor Directives, Macros & Function Prototypes */}
        <SectionDirectives />

        {/* Section 2: main() Function with Extracted Banners and Broken Cells */}
        <SectionMain />

        {/* Section 3: Function Implementations (After return 0) */}
        <SectionFunctions />
      </div>
    </div>
  );
};

export default ShellList;
