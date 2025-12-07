# CramCraft 📚✨

An AI-powered study tool that transforms PDFs, images, and text files into organized revision packs with summaries, key concepts, and interactive quizzes.

🚀 **Live Demo:** [https://cramcraft-study.vercel.app](https://cramcraft-study.vercel.app)

## Features

- **Smart File Upload** - Drag-and-drop support for PDFs, images (JPG, PNG), and text files
- **Text Extraction** - PDF parsing and OCR for images using Tesseract.js
- **AI-Generated Summaries** - Key concepts, definitions, and memory aids powered by Claude
- **Interactive Quizzes** - 10-15 auto-generated questions with difficulty distribution
- **Readiness Assessment** - Color-coded scores with weak area identification
- **PDF Export** - Download revision packs and quiz results

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS 4 |
| PDF Processing | PDF.js |
| OCR | Tesseract.js |
| AI | Claude Sonnet API |
| PDF Export | jsPDF |
| Animations | Framer Motion |
| Testing | Vitest + fast-check |
| Deployment | Vercel |

## Prerequisites

- Node.js 18+
- Claude API key from [Anthropic](https://console.anthropic.com/)

## Installation

```bash
# Clone the repository
git clone https://github.com/keshsrini/CramCraft.git
cd CramCraft

# Install dependencies
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Add your Claude API key to `.env`:
```
VITE_CLAUDE_API_KEY=your_api_key_here
VITE_CLAUDE_API_URL=https://api.anthropic.com/v1/messages
VITE_CLAUDE_MODEL=claude-sonnet-4-20250514
```

## Running Locally

```bash
# Start both frontend and backend proxy server
npm run dev:all
```

This starts:
- Frontend at `http://localhost:5173`
- API proxy server at `http://localhost:3001`

### Alternative Commands

```bash
# Frontend only
npm run dev

# Backend proxy only
npm run server

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## Deployment to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Add environment variable
vercel env add VITE_CLAUDE_API_KEY production
```

## Project Structure

```
cramcraft/
├── .kiro/                    # Kiro specs
│   └── specs/cramcraft/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
├── api/
│   └── claude.js             # Vercel serverless function
├── src/
│   ├── components/           # React components
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript interfaces
│   └── context/              # React Context
├── vercel.json               # Vercel configuration
└── package.json
```

## Usage

1. **Upload** - Drag and drop your study materials (up to 10 files)
2. **Process** - Wait for text extraction and AI generation
3. **Review** - Read through your personalized revision pack
4. **Quiz** - Test your knowledge with the generated quiz
5. **Assess** - Check your readiness score and weak areas
6. **Export** - Download PDFs for offline study

## License

MIT

---

Built with ❤️ using [Kiro](https://kiro.dev) for the AI for Bharat Challenge
