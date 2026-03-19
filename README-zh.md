# Image Editor - 图像文字工具

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

一个基于 Web 的轻量级图像编辑器，专注于快速区域选择、填充和文字覆盖。

简体中文 | [English](./README.md)

## 🚀 功能特性

- 🖼️ **图片上传**: 支持 PNG 和 JPG 格式。
- 🎯 **区域选择**: 矩形选框，用于目标编辑。
- 🎨 **智能填充**: 自动计算周边像素平均值，快速填充选中区域。
- ✍️ **文字覆盖**: 添加并自定义文字，包括字体、大小、颜色、宽度和行高。
- 🔍 **图像操作**: 在画布内缩放和移动图像。
- ⏪ **撤销/重做**: 支持 50 步历史记录。
- 💾 **保存图片**: 将最终作品导出为图片文件。
- 📱 **响应式 UI**: 基于 Tailwind CSS 的现代化侧边栏界面。

## 🛠️ 技术栈

- **框架**: [React](https://reactjs.org/) (v18)
- **画布库**: [Fabric.js](http://fabricjs.com/)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)

## 📦 快速开始

### 环境准备

- [Node.js](https://nodejs.org/) (v18 或更高版本)
- npm 或 yarn

### 安装步骤

1. 克隆仓库:
   ```bash
   git clone https://github.com/your-username/image-editor.git
   cd image-editor
   ```

2. 安装依赖:
   ```bash
   npm install
   ```

3. 启动开发服务器:
   ```bash
   npm run dev
   ```

4. 打开浏览器并访问 `http://localhost:5173`。

## 📖 使用指南

1. **上传**: 点击“上传图片”区域或将图片拖入。
2. **框选**: 使用“框选”工具在图片上绘制矩形选区。
3. **填充**: 点击“填充”，选区将被周边像素的平均颜色填充。
4. **文字**: 点击“文字”添加文本框，并在侧边栏进行样式设置。
5. **移动**: 使用“移动”工具调整图像在画布中的位置。
6. **保存**: 点击“保存图片”下载编辑后的图片。

## 📂 项目结构

```text
src/
├── components/      # React 组件 (CanvasEditor)
├── stores/          # Zustand 状态管理
├── types/           # TypeScript 类型定义
├── utils/           # 工具函数 (颜色计算等)
├── App.tsx          # 应用主组件
└── main.tsx         # 入口文件
```

## 📄 开源协议

本项目采用 MIT 协议。
