import React, { useState, useRef, useEffect } from 'react';
import { VscChevronUp, VscChevronDown, VscTrash, VscEdit, VscCheck, VscCopy } from 'react-icons/vsc';
import { useShell } from '../../context/ShellContext';
import './TextCell.css';

// Lightweight safe Markdown to HTML parser
const renderMarkdown = (text) => {
  if (!text) return '';

  const lines = text.split('\n');
  const rendered = [];
  let inCodeBlock = false;
  let codeBlockContent = [];
  let inList = false;
  let listItems = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      rendered.push(
        <ul key={`ul-${rendered.length}`} className="colab-md-list">
          {listItems.map((item, i) => (
            <li key={i} className="colab-md-list-item">{formatInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const formatInline = (str) => {
    return <span dangerouslySetInnerHTML={{
      __html: str
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff; font-weight: 600;">$1</strong>')
        .replace(/`([^`]+)`/g, '<code style="background-color: #2b2b2b; color: #ff7b72; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">$1</code>')
        .replace(/\*([^*]+)\*/g, '<em style="color: #e6edf3;">$1</em>')
    }} />;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        rendered.push(
          <pre key={`code-${rendered.length}`} className="colab-md-code-block">
            <code>{codeBlockContent.join('\n')}</code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      inList = true;
      listItems.push(line.trim().substring(2));
      continue;
    } else {
      flushList();
    }

    if (line.startsWith('# ')) {
      rendered.push(
        <h1 key={`h1-${i}`} className="colab-md-h1">
          {line.substring(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      rendered.push(
        <h2 key={`h2-${i}`} className="colab-md-h2">
          {line.substring(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      rendered.push(
        <h3 key={`h3-${i}`} className="colab-md-h3">
          {line.substring(4)}
        </h3>
      );
    } else if (line.startsWith('> ')) {
      rendered.push(
        <blockquote key={`quote-${i}`} className="colab-md-quote">
          {formatInline(line.substring(2))}
        </blockquote>
      );
    } else if (line.trim() === '') {
      rendered.push(<div key={`br-${i}`} className="colab-md-spacer" />);
    } else {
      rendered.push(
        <p key={`p-${i}`} className="colab-md-paragraph">
          {formatInline(line)}
        </p>
      );
    }
  }

  flushList();
  return rendered;
};

const TextCell = ({ cell, isFirst, isLast }) => {
  const { id, content } = cell;
  const { activeCellId, setActiveCellId, updateCellContent, moveCell, removeCell } = useShell();
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef(null);

  const isActive = activeCellId === id;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(60, textareaRef.current.scrollHeight)}px`;
      textareaRef.current.focus();
    }
  }, [isEditing, content]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    }
  };

  return (
    <div
      onClick={() => setActiveCellId(id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`colab-text-cell ${isActive ? 'active' : ''} ${isEditing ? 'editing' : ''}`}
    >
      {/* Floating Toolbar */}
      <div className={`colab-text-toolbar ${isHovered || isActive ? 'visible' : ''}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(!isEditing);
          }}
          title={isEditing ? 'Render Markdown (Shift+Enter)' : 'Edit Markdown'}
          className="colab-text-toolbar-btn"
        >
          {isEditing ? <VscCheck size={14} color="#22c55e" /> : <VscEdit size={14} />}
        </button>

        <button
          disabled={isFirst}
          onClick={(e) => {
            e.stopPropagation();
            moveCell(id, 'up');
          }}
          title="Move Cell Up"
          className={`colab-text-toolbar-btn ${isFirst ? 'disabled' : ''}`}
        >
          <VscChevronUp size={14} />
        </button>

        <button
          disabled={isLast}
          onClick={(e) => {
            e.stopPropagation();
            moveCell(id, 'down');
          }}
          title="Move Cell Down"
          className={`colab-text-toolbar-btn ${isLast ? 'disabled' : ''}`}
        >
          <VscChevronDown size={14} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(content);
          }}
          title="Copy Markdown"
          className="colab-text-toolbar-btn"
        >
          <VscCopy size={14} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            removeCell(id);
          }}
          title="Delete Cell"
          className="colab-text-toolbar-btn colab-text-toolbar-btn-danger"
        >
          <VscTrash size={14} />
        </button>
      </div>

      {isEditing ? (
        <div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => updateCellContent(id, e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => setIsEditing(false)}
            placeholder="Type markdown here... (Shift+Enter to render)"
            className="colab-text-textarea"
          />
          <div className="colab-text-hint">
            Markdown supported (# H1, ## H2, **bold**, *italic*, `code`, - list). Press <strong>Shift + Enter</strong> to render.
          </div>
        </div>
      ) : (
        <div
          onDoubleClick={() => setIsEditing(true)}
          title="Double-click to edit markdown"
          className="colab-text-rendered"
        >
          {renderMarkdown(content) || <span className="colab-text-empty">Empty markdown cell. Double click to add text...</span>}
        </div>
      )}
    </div>
  );
};

export default TextCell;
