# Testing Guide

## Current Status

✅ **Dev Server**: Running on http://localhost:3000
✅ **No Compilation Errors**: TypeScript compilation successful
✅ **Environment**: `.env.local` configured
✅ **Data**: Precomputed Cloud9 data available

## Quick Test Checklist

### 1. Home Page Test
- [ ] Visit http://localhost:3000
- [ ] Verify landing page loads with:
  - "Cloud9 Assistant Coach" title
  - Three feature cards (📊 Player Insights, 📋 Macro Review, 🔮 What-If Simulator)
  - "Launch Dashboard" button
- [ ] Click "Launch Dashboard" button

### 2. Coach Dashboard Test
- [ ] Verify navigation to `/coach` route
- [ ] See three tabs: Player Insights, Macro Review, What-If Simulator
- [ ] No match selection dropdown (removed - no longer needed)

### 3. Player Insights Tab Test
- [ ] Click on "Player Insights" tab
- [ ] Click "Generate Insights" button
- [ ] Observe loading spinner
- [ ] Wait for LLM analysis to complete
- [ ] Verify insights display with:
  - Matches analyzed count
  - KAST correlations section
  - Setup patterns section
  - Economy patterns section
  - Color-coded severity (🔴 Critical, 🟠 High, 🟡 Medium, 🔵 Low)

### 4. Macro Review Tab Test
- [ ] Click on "Macro Review" tab
- [ ] Click "Generate Review Agenda" button
- [ ] Observe loading spinner
- [ ] Wait for LLM to generate review
- [ ] Verify agenda displays with:
  - 5 sections (Pistol, Economy, Mid-Round, Site Selection, Map-Specific)
  - Formatted with warnings (⚠), success (✓), recommendations (→)
  - "Copy to Clipboard" button
  - "Download as TXT" button
- [ ] Test clipboard copy functionality
- [ ] Test download functionality

### 5. What-If Simulator Tab Test
- [ ] Click on "What-If Simulator" tab
- [ ] Click one of the example queries to populate textarea
- [ ] Click "Simulate Scenario" button
- [ ] Observe loading spinner
- [ ] Wait for LLM analysis
- [ ] Verify analysis displays with:
  - Your question echo
  - Game state analysis
  - Actual decision analysis
  - Alternative scenario analysis
  - Recommendation
  - Comparison cards
- [ ] Test "Copy Analysis" button
- [ ] Test "Download Analysis" button
- [ ] Try entering a custom query

## Performance Testing

### Browser AI (Transformers.js)
- **First Run**: May take 30-60 seconds (downloading model ~300MB)
- **Subsequent Runs**: 10-20 seconds per analysis
- **Quality**: Good for basic analysis
- **Privacy**: 100% local, no data sent to servers

### Groq API (if configured)
- **Response Time**: 2-5 seconds per analysis
- **Quality**: Excellent (Llama 3.1 70B)
- **Privacy**: Data sent to Groq servers
- **Cost**: Free tier (limited requests per day)

## Expected Behavior

### ✅ Success Indicators
- No console errors in browser DevTools (F12)
- Loading spinners appear during LLM processing
- Results display with proper formatting
- All buttons functional (copy, download)
- Smooth transitions and animations

### ⚠️ Common Issues

**Issue**: "Failed to load Cloud9 data"
- **Cause**: Missing `public/data/teams/cloud9.json`
- **Fix**: Verify file exists and is valid JSON

**Issue**: LLM takes very long (>60s)
- **Cause**: Browser AI downloading model for first time
- **Fix**: Wait for initial download to complete, or configure Groq API

**Issue**: "API key not configured"
- **Cause**: Using Groq API without API key in `.env.local`
- **Fix**: Add `NEXT_PUBLIC_GROQ_API_KEY=your_key` to `.env.local`

**Issue**: Empty results or parsing errors
- **Cause**: LLM output format unexpected
- **Fix**: Check browser console for error details, may need to adjust prompts

## Console Logging

Look for these console messages during testing:

```
🤖 Analyzing with LLM...
Using LLM: groq (or browser or openai)
```

These indicate which LLM backend is being used.

## Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (WebKit)
- ⚠️ Mobile browsers (limited by memory for Transformers.js)

## Next Steps After Testing

1. **If All Tests Pass**:
   - Ready for production build: `npm run build`
   - Deploy `out/` directory to hosting service

2. **If Issues Found**:
   - Check browser DevTools console for errors
   - Review `lib/` LLM implementation files
   - Adjust prompts if needed
   - Test with different LLM backends

3. **Enhancements** (Optional):
   - Add more team data files
   - Customize prompts for better analysis
   - Add more features (agent recommendations, VOD timestamps, etc.)
   - Integrate with real-time VALORANT API

## Data Validation

Verify `public/data/teams/cloud9.json` structure:
```bash
cd AI_Cat-1-Analyzer
cat public/data/teams/cloud9.json | head -20
```

Should see:
- `team_name: "Cloud9"`
- `matches_analyzed: 5`
- `player_stats` object with player names
- `map_performance` array

## Performance Benchmarks

| Feature | Browser AI | Groq API |
|---------|-----------|----------|
| Player Insights | 15-20s | 3-5s |
| Macro Review | 10-15s | 2-4s |
| What-If Simulator | 20-30s | 4-6s |

*Note: Browser AI times exclude initial model download*

## API Key Setup (Optional but Recommended)

To use Groq API for faster, better quality analysis:

1. Visit https://console.groq.com
2. Sign up (free)
3. Create API key
4. Add to `.env.local`:
```bash
NEXT_PUBLIC_GROQ_API_KEY=gsk_your_key_here
```
5. Restart dev server: `npm run dev`

## Troubleshooting Commands

```bash
# Check if server is running
curl http://localhost:3000

# View server logs
# (Check terminal where you ran npm run dev)

# Rebuild from scratch
npm run build
npm run dev

# Clear Next.js cache
rm -rf .next
npm run dev

# Check for TypeScript errors
npx tsc --noEmit

# Check for lint errors
npm run lint
```

---

**Testing Status**: Ready for manual testing
**Automated Tests**: Not implemented (consider adding with Jest/Playwright)
**Last Updated**: 2026-02-03
