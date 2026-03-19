# Image Editor - Image Text Tool

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A lightweight, web-based image editor for quick image manipulation, focusing on region selection, filling, and text overlay.

[简体中文](./README-zh.md) | English

## 🚀 Features

- 🖼️ **Image Upload**: Supports PNG and JPG formats.
- 🎯 **Region Selection**: Rectangular selection for targeted edits.
- 🎨 **Smart Fill**: Fill selected regions with automatically calculated average colors.
- ✍️ **Text Overlay**: Add and style text with customizable font family, size, color, width, and line height.
- 🔍 **Image Manipulation**: Scale and move images within the canvas.
- ⏪ **Undo/Redo**: 50-step history support for seamless editing.
- 💾 **Save Image**: Export your final work as an image file.
- 📱 **Responsive UI**: Modern sidebar interface powered by Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/) (v18)
- **Canvas Library**: [Fabric.js](http://fabricjs.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/zishengwu/SnapCanvas.git
   cd SnapCanvas
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## 📖 Usage

1. **Upload**: Click the "上传图片" (Upload Image) area or drag and drop an image.
2. **Select**: Use the "框选" (Select) tool to draw a rectangular region on the image.
3. **Fill**: Click "填充" (Fill) to fill the selected region with the average color of the surrounding pixels.
4. **Text**: Click "文字" (Text) to add a text box. Customize it using the sidebar settings.
5. **Move**: Use the "移动" (Move) tool to reposition the image within the canvas.
6. **Save**: Click "保存图片" (Save Image) to download your edited image.

## 📂 Project Structure

```text
src/
├── components/      # React components (CanvasEditor)
├── stores/          # Zustand state management
├── types/           # TypeScript type definitions
├── utils/           # Utility functions (color calculation, etc.)
├── App.tsx          # Main application component
└── main.tsx         # Entry point
```

## 📄 License

This project is licensed under the MIT License.
