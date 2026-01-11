import React, { useState } from 'react';
import { PiPlayCircleFill, PiSpinnerGap } from "react-icons/pi";
import { TbPlaystationSquare } from "react-icons/tb";

const Run = ({ isRunning, onRun }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onRun) onRun();
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    <button
      onClick={handleClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.1s ease-in-out',
      }}
      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        setIsHovered(false);
      }}
      title={isRunning ? "Stop" : "Run Code"}
    >
      {isRunning ? (
        isHovered ? <TbPlaystationSquare size={40} color="#ef4444" /> : <PiSpinnerGap size={40} color="#ffffff" style={{ animation: 'spin 1s linear infinite' }} />
      ) : (
        <PiPlayCircleFill size={40} color="#22c55e" />
      )}
    </button>
    </>
  );
};

export default Run;