import React, { useState, useRef } from "react";
import Shell from "./Shell";
import Run from "./Run";
import OutPut from "./OutPut";

const CodeBlock = () => {
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: "20px",
        padding: "20px",
        marginTop: "80px"
      }}
    >
      <Run isRunning={isRunning} onRun={handleRun} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: "800px",
          gap: "10px",
        }}
      >
        <Shell ref={shellRef} />
        {showOutput && <OutPut output={output} />}
      </div>
    </div>
  );
};

export default CodeBlock;
