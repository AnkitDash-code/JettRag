# Cloud9 Assistant Coach - Setup Guide

## ✅ What's Been Implemented

All core LLM-powered analysis engines are complete and ready to use:

### Backend (100% LLM-Powered)
- ✅ `lib/llm-engine.ts` - Browser-based AI + API support (Transformers.js, Groq, OpenAI)
- ✅ `lib/kast-llm.ts` - Player performance insights via LLM
- ✅ `lib/macro-llm.ts` - Post-match review agenda generator via LLM
- ✅ `lib/whatif-llm.ts` - Hypothetical scenario analyzer via LLM

### Data
- ✅ `public/data/teams/cloud9.json` - Precomputed Cloud9 match data
- ✅ `public/data/manifest.json` - Team manifest

### Configuration
- ✅ `package.json` - All dependencies listed
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `next.config.js` - Next.js config with Transformers.js support
- ✅ `tailwind.config.ts` - Styling configuration
- ✅ `.env.local.example` - Environment variables template

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- React 18
- Transformers.js (browser-based AI)
- Framer Motion (animations)
- Tailwind CSS
- TypeScript

### 2. Setup Environment (Optional)

For better/faster LLM responses, get a free Groq API key:

```bash
# Copy example env file
cp .env.local.example .env.local

# Edit .env.local and add your Groq API key
# Get one free at: https://console.groq.com/keys
```

**Note:** The app works WITHOUT any API keys using browser-based AI!

### 3. Copy UI Components

You need to copy the Coach Dashboard UI from the existing frontend:

```bash
# Copy the coach dashboard components
cp -r ../code/frontend/src/app/coach ./app/coach

# Copy globals.css for styling
cp ../code/frontend/src/app/globals.css ./app/globals.css

# Copy layout
cp ../code/frontend/src/app/layout.tsx ./app/layout.tsx
```

### 4. Update Components to Use LLM Functions

Edit the copied components to use the new LLM functions:

#### In `app/coach/components/InsightsTab.tsx`:

Replace the fetch call with:

```typescript
import { analyzeKASTWithLLM } from '@/lib/kast-llm';

const fetchInsights = async () => {
  setLoading(true);
  setError(null);

  try {
    // Load precomputed data
    const response = await fetch('/data/teams/cloud9.json');
    const data = await response.json();

    // Use LLM to analyze
    const insights = await analyzeKASTWithLLM(data, true); // true = use API if available

    setInsights({
      team: 'Cloud9',
      matches_analyzed: data.matches_analyzed,
      insights,
    });
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

#### In `app/coach/components/MacroReviewTab.tsx`:

```typescript
import { generateMacroReviewWithLLM } from '@/lib/macro-llm';

const fetchMacroReview = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await fetch('/data/teams/cloud9.json');
    const data = await response.json();

    const agenda = await generateMacroReviewWithLLM(data, true);

    setReview({
      match_id: 'cloud9-analysis',
      team_name: 'Cloud9',
      agenda,
    });
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

#### In `app/coach/components/WhatIfSimulator.tsx`:

```typescript
import { simulateWhatIfWithLLM } from '@/lib/whatif-llm';

const simulateWhatIf = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await fetch('/data/teams/cloud9.json');
    const data = await response.json();

    const analysisText = await simulateWhatIfWithLLM(query, data, true);

    setAnalysis({
      match_id: 'cloud9-analysis',
      query,
      analysis: analysisText,
    });
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to `/coach`

### 6. Test Features

1. **Player Insights** - Click "Generate Insights" (first load downloads AI model ~30s)
2. **Macro Review** - Click "Generate Review Agenda"
3. **What-If Simulator** - Type a question and click "Simulate Scenario"

## 🎯 How It Works

### Browser-Based AI (Default)
- Uses Transformers.js with LaMini-Flan-T5-783M model
- Downloads ~300MB on first use (cached after)
- Runs 100% in your browser
- No API keys needed
- Privacy-first

### API-Based (Optional, Faster)
- Set `NEXT_PUBLIC_GROQ_API_KEY` in `.env.local`
- Uses Groq's Llama 3.1 70B
- Much faster responses
- Free tier available (no credit card)

### Data Flow
```
User Action → Load Cloud9 Data → Build LLM Prompt → LLM Analysis → Parse & Display
```

**Zero manual processing** - the LLM does ALL the analysis!

## 📦 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### GitHub Pages
```bash
# Build static site
npm run build

# Deploy the `out/` folder to GitHub Pages
```

### Netlify
```bash
# Build
npm run build

# Drag `out/` folder to Netlify
```

## 🔧 Troubleshooting

### "Failed to load LLM model"
- Check your internet connection (first load downloads model)
- Try using API mode with Groq key

### "Groq API error"
- Verify your API key in `.env.local`
- Check Groq console for rate limits

### Components not found
- Make sure you copied the UI components from `../code/frontend/src/app/coach`
- Verify file paths match

## 📝 Next Steps

1. Copy UI components from existing frontend
2. Update components to use LLM functions (see above)
3. Test all three features
4. Deploy to Vercel/Netlify
5. Share on GitHub!

## 🎉 You're Done!

The entire Assistant Coach now runs 100% in the frontend with LLM-powered analysis. No backend, no complex processing - just pure AI reasoning!
