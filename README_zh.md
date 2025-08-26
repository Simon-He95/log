<p align="center">
<img height="200" src="./assets/kv.png" alt="Log扩展">
</p>
<p align="center"> <a href="./README.md">English</a> | 简体中文</p>

# 🚀 Log - 终极 Console.log 管理扩展

**不要再浪费时间手写 console.log 语句了！** 这个强大的 VS Code 扩展通过智能日志生成和全面的控制台语句管理，彻底革新您的调试工作流程。

## ✨ 为什么选择 Log 扩展？

- 🎯 **智能变量检测** - 自动检测光标下的变量
- 🎨 **美观彩色输出** - 随机颜色，轻松识别日志
- 📍 **上下文感知插入** - 完美处理复杂的多行表达式
- 🧹 **强大清理工具** - 精确删除控制台语句
- ⚡ **闪电般快速** - 一键生成日志
- 🎛️ **高度可配置** - 自定义颜色、模式和行为

## 🔥 核心功能

### 📝 智能日志生成
- **智能插入**：支持对象、数组、函数调用和复杂表达式
- **多行支持**：正确处理嵌套结构和多行表达式
- **文件上下文**：包含文件名和行号，便于调试
- **变量检测**：自动检测光标下的变量名

### 🧹 控制台管理套件
- **选择性删除**：删除特定的控制台方法 (log, warn, error 等)
- **工作区清理**：批量删除整个工作区的控制台语句
- **预览模式**：在更改之前查看将被删除的内容
- **智能保留**：保留包含特定模式的控制台语句 (TODO, KEEP)

### ⚙️ 高级配置
- **自定义颜色**：定义您自己的调色板
- **灵活模式**：配置文件包含/排除模式
- **方法选择**：选择要定位的控制台方法
- **工作区设置**：支持团队范围的配置

## ⌨️ 快捷键

| 快捷键 | 操作 |
|--------|------|
| `Ctrl+L` (Windows/Linux)<br>`Cmd+L` (macOS) | 插入 console.log 语句 |
| `Ctrl+Shift+L` (Windows/Linux)<br>`Cmd+Shift+L` (macOS) | 从当前文件删除控制台日志 |

## 🎮 命令

- **`log.log`** - 插入智能 console.log 语句
- **`log.removeConsoleLogs`** - 从活动编辑器删除控制台语句
- **`log.removeConsoleLogsWorkspace`** - 从整个工作区删除控制台语句
- **`log.previewRemoveConsoleLogs`** - 预览控制台语句删除

## 🛠️ 配置

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

## 📖 使用示例

### 基本用法
```javascript
const user = { name: 'John', age: 30 };
// 将光标放在 'user' 上并按 Ctrl+L
// 结果: console.log('📁 file.js:2 user:', user);
```

### 多行对象
```javascript
const config = {
  api: {
    url: 'https://api.example.com',
    timeout: 5000
  }
};
// 将光标放在对象的任何位置并按 Ctrl+L
// 日志将在结束大括号后插入
```

### 工作区清理
从您的项目中删除所有控制台语句，同时保留重要的语句：
```javascript
console.log('TODO: 这个会被保留');
console.log('普通日志'); // 这个会被删除
console.warn('KEEP: 重要警告'); // 这个会被保留
```

## 🎯 完美适用于

- **前端开发者** 调试 React、Vue、Angular 应用
- **Node.js 开发者** 处理服务端 JavaScript
- **TypeScript 项目** 具有复杂类型定义
- **团队** 需要一致的日志记录实践
- **代码审查** 需要干净、无控制台的生产代码

## 🚀 开始使用

1. 从 VS Code 市场安装扩展
2. 打开任何 JavaScript/TypeScript 文件
3. 将光标放在变量上
4. 按 `Ctrl+L` (macOS 上按 `Cmd+L`)
5. 见证奇迹的发生！ ✨

![demo](assets/demo.gif)

## 🤝 贡献

我们欢迎贡献！请查看我们的 [GitHub 仓库](https://github.com/Simon-He95/log) 了解更多信息。

## ☕ 支持项目

如果这个扩展为您节省了时间并改善了您的开发体验，请考虑支持该项目：

[🎯 请我喝咖啡](https://github.com/Simon-He95/sponsor)

## 📄 许可证

[MIT](./license) - 永远免费开源！
