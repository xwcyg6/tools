# JiSuXiang | Developer Toolbox

**[中文文档](README.zh-CN.md)** | **English**

JiSuXiang (极速箱) is a high-quality, visually appealing online developer toolbox that provides a comprehensive collection of essential development tools for programmers. Built with Next.js and TailwindCSS, this platform offers a wide range of utilities for everyday programming tasks with a beautiful, modern UI design.

**Live Demo**: [https://www.jisuxiang.com/](https://www.jisuxiang.com/) - Try it now!

## 🚀 Features

- **Multiple Tool Categories**: JSON processing, encoding/decoding, network testing, and more
- **Responsive Design**: Optimized for all device sizes
- **Dark Theme**: Eye-friendly interface for extended coding sessions
- **Efficient Search**: Quickly find tools with powerful search functionality
- **Favorites System**: Save frequently used tools for easy access
- **Multi-language Support**: Available in English and Chinese

## 🔧 Tools Included

- JSON Formatter & Validator
- HTTP Request Tester
- Timestamp Converter
- Encoding/Decoding Tools
- Regular Expression Tester
- Cryptographic Tools
- Color Picker & Converter
- Code Formatter
- JSON Editor & Converter
- IP Address Lookup
- Date Calculator
- Timezone Converter
- Text Statistics
- HTML/Markdown Converter
- Image Compression
- QR Code Generator
- CSS Gradient Generator
- And more...

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org) - React framework for production
- [TailwindCSS](https://tailwindcss.com) - Utility-first CSS framework
- [Font Awesome](https://fontawesome.com) - Icon library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

## 📦 Installation & Deployment

### Using Docker (Recommended)

The easiest way to run JiSuXiang is using our official Docker image from Docker Hub:

```bash
# For x86/x64 architecture
docker pull star7th/jisuxiang:latest
docker run -d --name jisuxiang --restart always -p 3000:3000 star7th/jisuxiang:latest

# For ARM architecture (e.g., Raspberry Pi, Apple Silicon)
docker pull star7th/jisuxiang:arm-latest
docker run -d --name jisuxiang --restart always -p 3000:3000 star7th/jisuxiang:arm-latest
```

### Using Node.js

For local development or deployment on a Node.js server:

1. Clone the repository:
```bash
git clone https://github.com/star7th/jisuxiang.git
cd jisuxiang
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

For production deployment:
```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🧩 Project Structure

```
jisuxiang/
├── src/
│   ├── app/              # Next.js app directory (pages, layouts)
│   ├── components/       # Reusable UI components
│   ├── config/           # Configuration files
│   │   ├── categories.ts # Tool category definitions
│   │   ├── tools.ts      # Tool definitions
│   │   └── i18n/         # Internationalization files
│   ├── context/          # React context providers
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── public/               # Static assets
└── ...                   # Configuration files
```

## 🧪 Development

To add a new tool:

1. Create a new directory in `src/app/tools/[tool_code]/`
2. Add tool to the configuration in `src/config/tools.ts`
3. Add translations in `src/config/i18n/tools/[tool_code]/`

## 🌍 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- GitHub Repository: [https://github.com/star7th/jisuxiang](https://github.com/star7th/jisuxiang)

