import React from 'react';
import { useShell } from '../context/ShellContext';
import CodeBlock from './CodeBlock';
import TextCell from './TextCell';
import CellDivider from './CellDivider';
import { VscAdd, VscNote } from 'react-icons/vsc';
import './ShellList.css';

const ShellList = () => {
  const { cells, insertCell, sidebarTab } = useShell();

  return (
    <div className={`colab-notebook-container ${sidebarTab ? 'sidebar-open' : ''}`}>
      <div className="colab-notebook-inner">
        {/* Top hover divider */}
        {cells.length > 0 && <CellDivider targetId={cells[0].id} position="above" />}

        {/* Cells and between-cells hover dividers */}
        {cells.map((cell, index) => (
          <React.Fragment key={cell.id}>
            {cell.type === 'text' ? (
              <TextCell
                cell={cell}
                isFirst={index === 0}
                isLast={index === cells.length - 1}
              />
            ) : (
              <CodeBlock
                cell={cell}
                isFirst={index === 0}
                isLast={index === cells.length - 1}
              />
            )}

            {/* Divider after each cell */}
            <CellDivider targetId={cell.id} position="below" />
          </React.Fragment>
        ))}

        {/* Bottom notebook buttons */}
        <div className="colab-notebook-bottom-actions">
          <button
            onClick={() => insertCell(null, 'below', 'code')}
            className="colab-bottom-add-btn"
            title="Add a new C code cell at end of notebook"
          >
            <VscAdd size={14} color="#8ab4f8" />
            <span>Code</span>
          </button>

          <button
            onClick={() => insertCell(null, 'below', 'text')}
            className="colab-bottom-add-btn"
            title="Add a new Markdown text cell at end of notebook"
          >
            <VscNote size={14} color="#8ab4f8" />
            <span>Text</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShellList;
