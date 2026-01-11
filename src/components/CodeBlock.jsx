import React, { useState, useRef, useEffect } from "react";
import Shell from "./Shell";
import Run from "./Run";
import OutPut from "./OutPut";
import { useShell } from "../context/ShellContext";
import { MdDelete } from "react-icons/md";

const CodeBlock = ({ id, defaultValue }) => {
  const { registerShellRunner, registerShellClearer, setActiveShellId, removeShell } = useShell();
  const [showOutput, setShowOutput] = useState(false);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const shellRef = useRef(null);

  const runJS = (code) => {
    let outputBuffer = [];
    const originalLog = console.log;

    // Override console.log to capture output
    console.log = (...args) => {
      outputBuffer.push("> " + args.join(" "));
    };

    try {
      // Execute the code
      // prompt() works synchronously in the browser
      new Function(code)();
    } catch (err) {
      outputBuffer.push("> Runtime Error: " + err.message);
    }

    // Restore console.log
    console.log = originalLog;

    // Update output state
    setOutput(outputBuffer.join("\n"));
  };

  const handleRun = async () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    setIsRunning(true);
    setShowOutput(true);
    setOutput(""); // Clear previous output

    const cCode = shellRef.current ? shellRef.current.getValue() : "";

    try {
      const response = await fetch("https://code-converter-c-to-js.onrender.com/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cCode }),
      });
      const data = await response.json();

      if (data.error) {
        setOutput("> Compile Error:\n" + data.error);
      } else {
        const jsCode = data.js || data.result;
        runJS(jsCode);
      }
    } catch (err) {
      setOutput("> Error: " + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setOutput("");
    setShowOutput(false);
  };

  useEffect(() => {
    if (id) {
      const unregisterRunner = registerShellRunner(id, handleRun);
      const unregisterClearer = registerShellClearer(id, handleClear);
      return () => {
        unregisterRunner();
        unregisterClearer();
      };
    }
  }, [id, registerShellRunner, registerShellClearer]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: "20px",
        padding: "20px",
      }}
      onClick={() => setActiveShellId(id)}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
        <Run isRunning={isRunning} onRun={handleRun} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "60vw",
          gap: "10px",
        }}
      >
        <Shell ref={shellRef} onFocus={() => setActiveShellId(id)} defaultValue={defaultValue} />
        {showOutput && <OutPut output={output} />}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeShell(id);
        }}
        title="Delete Shell"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.1s ease-in-out",
          color: "#ef4444",
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
        onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        <MdDelete size={30} />
      </button>
    </div>
  );
};

export default CodeBlock;
