# C-- (LexCodex)

An interactive, multi-cell notebook environment designed specifically for C programming in the browser.

🚀 **Launch Live App**: **[C-- Notebook](https://c-minus.vercel.app/)** — *Zero installation, setup, or compiler configuration required.*

---

## 🌐 How to Use [C-- Notebook](https://c-minus.vercel.app/)

Get started immediately by navigating to **[C-- Notebook](https://c-minus.vercel.app/)** in any modern web browser.

### 1. Preprocessor Directives, Macros & Prototypes (Section 1)
- The topmost cell is dedicated to your preprocessor commands, macros, and function prototypes.
- Include standard libraries, define constants, or declare prototypes for functions you define later.
- *Example:*
  ```c
  #include <stdio.h>
  
  #define MULTIPLIER 2
  int calculate_square(int n);
  ```

### 2. Splittable `main()` Sequence (Section 2)
- Boilerplate `int main() {` and `return 0; }` are extracted outside the editable cells so you only focus on executable logic.
- **Add Sequential Steps**: Click **`+ Add Step in main()`** to break your program into logical, bite-sized stages.
- **Reorder Steps**: Use the **▲** and **▼** buttons on each cell header to shift steps up or down.
- **Clean Execution Flow**: When compiled, all steps in this section run sequentially inside the single `main()` body.

### 3. Function Definitions (Section 3)
- Located below `return 0; }`, this section is for complete function implementations called by your `main()` steps.
- Built-in validation ensures that every cell in this section contains at least one valid function definition.
- *Example:*
  ```c
  int calculate_square(int n) {
      return n * n * MULTIPLIER;
  }
  ```

### 4. Running & Debugging Code
- **Run Individual Cell**: Click the **Run** (`▶`) button on the left of any cell.
  - The built-in static analyzer first checks your code for missing semicolons, unbalanced braces, brackets, or quotes.
  - The complete program is assembled and transpiled, capturing output specifically for that step.
- **Visual Feedback & Execution Tracking**:
  - The button turns into a green badge with a checkmark (`✓`) once execution completes.
  - An execution counter (`[1]`, `[2]`, etc.) and execution timer appear below the button.
  - Hovering over an executed cell restores the play icon for quick re-execution.
- **Run All**: Click **Run All** in the top navigation bar to execute all notebook cells in a single synchronized pass.
- **Isolated Output**: Each cell shows **only** the `stdout` produced by its statements—no duplicate or mixed terminal outputs.

### 5. Multi-Notebook Management & Persistence
- **Sidebar Navigation**: Open the push sidebar to view all your notebooks.
- **Create & Switch**: Create new notebooks for different algorithms or exercises and switch between them instantly.
- **Automatic Persistence**: All notebooks, cell structures, code, and execution history are stored directly in your browser's `localStorage`. Your work is saved automatically.

### 6. Exporting to Native C
- Click the **Download .c** button in the navigation bar at any time.
- C-- validates your full syntax and exports a single, ready-to-compile `.c` file that you can compile locally with `gcc`, `clang`, or MSVC:
  ```bash
  gcc -Wall -O2 notebook.c -o program
  ./program
  ```

---

## ✨ Features & Architecture

### 🛡️ Strict Client-Side C Syntax Validator
- Detects missing semicolons on statements, variable assignments, and function calls before calling the compilation engine.
- Validates delimiter matching: `{ }`, `( )`, `[ ]`, and string/char literals.
- Formats errors with compiler-style diagnostics, indicating exact lines and actionable error messages.

### 🧩 Full-Program Assembly with Output Delimiting
- Automatically assembles the directives cell, sequential `main()` steps, and all custom functions into a single cohesive program.
- Injects invisible boundary markers (`__CELL_START:c<id>__` and `__CELL_END:c<id>__`) so that the runtime routes output cleanly to the originating cell without cross-cell stdout contamination.

### 🎨 Responsive Push-Content Interface
- Responsive sidebar pushes the workspace rather than covering code blocks.
- Fully isolated component architecture with modular styling (`.css` files, no inline style tags).
- Built with Monaco Editor (the engine behind VS Code) for syntax highlighting and auto-indentation.

---

## 🏗️ Project Structure

```text
C--/
├── public/
│   └── favicon.png              # Brand icon
├── src/
│   ├── components/
│   │   ├── CellDivider/         # Cell boundary insertion dividers
│   │   ├── CodeBlock/           # Code container display
│   │   ├── NavBar/              # Top navigation bar and global execution controls
│   │   ├── NotFound/            # 404 handler
│   │   ├── NotebookSwitcher/    # Multi-notebook switcher & manager
│   │   ├── OutPut/              # Terminal output panel and status tags
│   │   ├── Run/                 # Interactive run button with tick indicator
│   │   ├── SectionDirectives/   # Preprocessor directives & prototypes cell
│   │   ├── SectionFunctions/    # Post-main function definition cells
│   │   ├── SectionMain/         # Splittable main() step cells
│   │   ├── Shell/               # Base cell container
│   │   ├── ShellList/           # Notebook layout orchestrator
│   │   ├── Sidebar/             # Responsive push sidebar
│   │   └── TextCell/            # Markdown & documentation cells
│   ├── context/
│   │   └── ShellContext.jsx     # State management, execution engine, storage
│   ├── utils/
│   │   └── cSyntaxValidator.js  # Static C syntax validator & sanitizer
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── README.md
```

---

## 🛠️ Tech Stack

- **Hosted App**: **[C-- Notebook](https://c-minus.vercel.app/)**
- **UI Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Code Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (`vsc`, `fa6`, `ri`, `md`)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Static Analysis**: Client-side delimiter and syntax validator
- **Backend Transpilation**: External C-to-JS conversion service

---

## 📄 License

This project is open source and available under the MIT License.