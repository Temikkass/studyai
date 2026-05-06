# StudyAI

AI-powered study tool — turn any lecture into flashcards, quizzes, or summaries.

## Stack
- **Frontend:** Vanilla HTML/CSS/JS + PDF.js
- **Backend:** Vercel Serverless Functions
- **AI:** OpenRouter (Llama 3.3 70B — free tier)

## Setup

### 1. Clone & install
```bash
git clone https://github.com/YOUR_USERNAME/studyai
cd studyai
npm install -g vercel
```

### 2. Get OpenRouter API key
Go to https://openrouter.ai/keys and create a free key.

### 3. Set environment variables
```bash
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env
```

### 4. Run locally
```bash
vercel dev
```
Open http://localhost:3000

### 5. Deploy
```bash
vercel --prod
```
Then add environment variables in Vercel dashboard:
- `OPENROUTER_API_KEY` — your OpenRouter key
- `SITE_URL` — your deployed URL (e.g. https://studyai.vercel.app)

## Project structure
```
studyai/
├── api/
│   └── generate.js     # Serverless function (hides API key)
├── public/
│   └── index.html      # Frontend
├── vercel.json         # Vercel config
├── package.json
└── .env.example
```

## License
Personal use only.
