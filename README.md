# C-- (LexCodex)

A modern, interactive code playground built with React that allows users to write and execute C code directly in the browser. The application manages multiple coding "shells," enabling developers to experiment with different snippets simultaneously.

## 🚀 Features

- **Multi-Shell Architecture**: Create and manage multiple independent code blocks (shells) in a single session.
- **Monaco Editor Integration**: Uses the powerful VS Code editor engine for syntax highlighting, auto-indentation, and a professional coding experience.
- **Client-Side Execution**: C code is sent to a backend service for transpilation to JavaScript, then executed safely within the browser's sandbox.
- **Output Capture**: Intercepts `stdout` (console logs) to display program output directly below each shell.
- **Global Controls**:
  - **Run All**: Execute all active shells in sequence.
  - **Run Current**: Execute only the currently focused shell.
  - **Clear All**: Wipe output logs from all shells.
  - **Add/Remove**: Dynamically add new shells or delete existing ones.
- **Responsive UI**: Dark-themed, clean interface with a floating navigation bar and responsive layout.

## 🛠️ Tech Stack

- **Frontend Framework**: React.js
- **Routing**: React Router DOM
- **Code Editor**: `@monaco-editor/react`
- **Icons**: `react-icons` (VS Code, Material Design, Remix icons)
- **State Management**: React Context API (`ShellContext`)
- **Transpilation API**: External C-to-JS converter service

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd C--
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal).

## 🎮 Usage

1. **Writing Code**: The first shell loads with a default "Hello World" style C program. Subsequent shells start empty.
2. **Running Code**: Click the "Run" button (Play icon) next to a shell, or use the controls in the top navigation bar.
3. **Managing Shells**:
   - Click the **+** icon in the navbar to add a new shell.
   - Click the **Trash** icon next to a shell to remove it.
4. **Focus**: Clicking inside an editor sets it as the "Active Shell" for global commands.

## 📝 License

This project is open source.