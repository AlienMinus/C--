import React, { useState } from 'react';
import { VscAdd, VscNote } from 'react-icons/vsc';
import { useShell } from '../context/ShellContext';
import './CellDivider.css';

const CellDivider = ({ targetId, position = 'below' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { insertCell } = useShell();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="colab-divider-container"
    >
      {/* Background connector line */}
      <div className={`colab-divider-line ${isHovered ? 'active' : ''}`} />

      {/* Action Buttons */}
      <div className={`colab-divider-actions ${isHovered ? 'visible' : ''}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            insertCell(targetId, position, 'code');
          }}
          className="colab-divider-btn"
          title="Add code cell here"
        >
          <VscAdd size={12} />
          Code
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            insertCell(targetId, position, 'text');
          }}
          className="colab-divider-btn"
          title="Add text cell here"
        >
          <VscNote size={12} />
          Text
        </button>
      </div>
    </div>
  );
};

export default CellDivider;
