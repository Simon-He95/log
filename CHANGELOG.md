# 更新日志

## [0.1.0] - 2025-08-26

### 🚀 重大功能更新

#### 🔥 新增功能
- **智能多行表达式支持** - 完美处理复杂的多行对象、数组和函数调用
- **控制台清理套件** - 全新的控制台语句管理功能
  - `log.removeConsoleLogs` - 删除当前文件中的控制台语句
  - `log.removeConsoleLogsWorkspace` - 批量删除整个工作区的控制台语句
  - `log.previewRemoveConsoleLogs` - 预览删除效果
- **高级配置选项** - 自定义颜色、保留模式、文件匹配等
- **智能保留机制** - 保留包含 TODO、KEEP 等关键词的重要日志

#### ✨ 核心改进
- **AST 驱动的插入逻辑** - 使用 TypeScript AST 精确定位插入位置
- **多行表达式检测** - 智能识别对象字面量、数组、函数调用的边界
- **更好的快捷键支持** - 添加 `Ctrl+Shift+L` 快速删除控制台日志
- **增强的错误处理** - 更稳定的解析和处理逻辑

#### 🎨 用户体验提升
- **美化的命令标题** - 带有表情符号的直观命令名称
- **分类管理** - 所有命令归类到 "Log" 分类下
- **跨平台快捷键** - 支持 Windows/Linux (Ctrl) 和 macOS (Cmd) 快捷键
- **上下文感知** - 快捷键仅在编辑器聚焦时生效

#### 🛠️ 技术架构
- **模块化设计** - 清晰的代码结构和职责分离
- **全面测试覆盖** - 12 个测试用例覆盖核心功能
- **TypeScript AST 集成** - 利用编译器 API 进行精确代码分析
- **性能优化** - 高效的解析算法和缓存机制

### 📋 配置更新

新增配置选项：
```json
{
  "codeLoc.config.colors": ["#ff6b6b", "#4ecdc4", "#45b7d1"],
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

### 🎯 使用场景

此版本特别适合：
- 处理复杂嵌套对象的 React/Vue 开发者
- 需要批量清理控制台语句的团队项目
- 要求精确日志插入位置的 TypeScript 项目
- 希望保持代码整洁的企业级开发

### 🚧 破坏性变更
- 无破坏性变更，完全向后兼容

### 📦 下一步计划
- 支持更多 JavaScript 运行时的日志方法
- 添加日志模板自定义功能
- 集成更多代码分析工具
- 支持日志级别管理

---

## [0.0.12] - 历史版本

### 基础功能
- 基本的 console.log 插入功能
- 简单的变量检测
- 随机颜色支持
- 文件名和行号显示

---

**完整更新日志**: https://github.com/Simon-He95/log/compare/v0.0.12...v0.1.0
