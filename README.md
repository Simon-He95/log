<p align="center">
<img height="200" src="./assets/kv.png" alt="Log Extension">
</p>
<p align="center"> English | <a href="./README_zh.md">简体中文</a></p>

# 🚀 Log - The Ultimate Console.log Management Extension

**Stop wasting time typing console.log statements!** This powerful VS Code extension revolutionizes your debugging workflow with intelligent log generation and comprehensive console statement management.

## ✨ Why Choose Log Extension?

- 🎯 **Smart Variable Detection** - Automatically detects variables under cursor
- 🎨 **Beautiful Colored Output** - Random colors for easy log identification
- 📍 **Context-Aware Insertion** - Handles complex multi-line expressions perfectly
- 🧹 **Powerful Cleanup Tools** - Remove console statements with precision
- ⚡ **Lightning Fast** - One keystroke to generate logs
- 🎛️ **Highly Configurable** - Customize colors, patterns, and behavior

## 🔥 Key Features

### 📝 Intelligent Log Generation
- **Smart Insertion**: Works with objects, arrays, function calls, and complex expressions
- **Multi-line Support**: Correctly handles nested structures and multi-line expressions
- **File Context**: Includes filename and line number for easy debugging
- **Variable Detection**: Automatically detects variable names under cursor

### 🧹 Console Management Suite
- **Selective Removal**: Remove specific console methods (log, warn, error, etc.)
- **Workspace Cleanup**: Batch remove console statements across entire workspace
- **Preview Mode**: See what will be removed before making changes
- **Smart Preservation**: Keep console statements with specific patterns (TODO, KEEP)

### ⚙️ Advanced Configuration
- **Custom Colors**: Define your own color palette
- **Flexible Patterns**: Configure file inclusion/exclusion patterns
- **Method Selection**: Choose which console methods to target
- **Workspace Settings**: Team-wide configuration support

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+L` (Windows/Linux)<br>`Cmd+L` (macOS) | Insert console.log statement |
| `Ctrl+Shift+L` (Windows/Linux)<br>`Cmd+Shift+L` (macOS) | Remove console logs from current file |

## 🎮 Commands

- **`log.log`** - Insert intelligent console.log statement
- **`log.removeConsoleLogs`** - Remove console statements from active editor
- **`log.removeConsoleLogsWorkspace`** - Remove console statements from entire workspace
- **`log.previewRemoveConsoleLogs`** - Preview console statement removal

## 🛠️ Configuration

```json
{
  "codeLoc.config.colors": ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4"],
  "log.removeConsole": {
    "methods": ["log", "warn", "error", "info", "debug"],
    "preservePatterns": ["TODO", "KEEP"],
    "includeTrailingNewLine": true
  },
  "log.removeConsole.workspace": {
    "includeGlobs": ["**/*.{js,jsx,ts,tsx}"],
    "excludeGlobs": ["**/node_modules/**", "**/dist/**"],
    "confirm": true
  }
}
```

## 📖 Usage Examples

### Basic Usage
```javascript
const user = { name: 'John', age: 30 };
// Place cursor on 'user' and press Ctrl+L
// Result: console.log('📁 file.js:2 user:', user);
```

### Multi-line Objects
```javascript
const config = {
  api: {
    url: 'https://api.example.com',
    timeout: 5000
  }
};
// Place cursor anywhere in the object and press Ctrl+L
// Log will be inserted AFTER the closing brace
```

### Workspace Cleanup
Remove all console statements from your project while preserving important ones:
```javascript
console.log('TODO: This will be kept');
console.log('Regular log'); // This will be removed
console.warn('KEEP: Important warning'); // This will be kept
```

## 🎯 Perfect For

- **Frontend Developers** debugging React, Vue, Angular applications
- **Node.js Developers** working with server-side JavaScript
- **TypeScript Projects** with complex type definitions
- **Teams** wanting consistent logging practices
- **Code Reviews** requiring clean, console-free production code

## 🚀 Get Started

1. Install the extension from VS Code Marketplace
2. Open any JavaScript/TypeScript file
3. Place cursor on a variable
4. Press `Ctrl+L` (or `Cmd+L` on macOS)
5. Watch the magic happen! ✨

![demo](assets/demo.gif)

## 🤝 Contributing

We welcome contributions! Please see our [GitHub repository](https://github.com/Simon-He95/log) for more information.

## ☕ Support the Project

If this extension saves you time and makes your development experience better, consider supporting the project:

[🎯 Buy me a coffee](https://github.com/Simon-He95/sponsor)

## 📄 License

[MIT](./license) - Free and open source forever!
