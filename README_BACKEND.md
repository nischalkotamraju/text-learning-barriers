# Backend Server Setup

## The Problem
You were getting CORS errors because the frontend was trying to call OpenAI API directly from the browser, which isn't allowed for security reasons (exposes API key + OpenAI blocks browser requests).

## The Solution
A backend Express server that:
1. Receives requests from your frontend
2. Calls OpenAI API server-side (secure)
3. Returns results to frontend

## Setup Instructions

### 1. Install Backend Dependencies
```bash
npm install
```

This will install:
- `express` - Web server framework
- `cors` - Enable cross-origin requests
- `dotenv` - Load environment variables

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Then edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
PORT=3001
VITE_BACKEND_URL=http://localhost:3001
```

**Important:** 
- Remove `VITE_OPENAI_API_KEY` from your `.env` (not needed in frontend anymore)
- Make sure `.env` is in your `.gitignore` to keep API keys secret

### 3. Start Both Servers

**Option A: Run both at once (recommended)**
```bash
npm run dev:all
```

**Option B: Run separately in different terminals**

Terminal 1 - Backend Server:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

## How It Works

### Backend API Endpoints

**Text Analysis:**
- **POST** `/api/analyze-text`
- Body: `{ inputText: string, format: 'comic' | 'flowchart' | 'infographic' }`
- Returns: Structured content from GPT-3.5

**Image Generation:**
- **POST** `/api/generate-image`
- Body: `{ prompt: string, format: 'comic' | 'flowchart' | 'infographic' }`
- Returns: Array of 3 DALL-E generated images

**Health Check:**
- **GET** `/health`
- Returns: `{ status: 'ok', message: 'Server is running' }`

### Frontend Changes
The `aiClient.ts` file now calls your backend instead of OpenAI directly:
- Before: `https://api.openai.com/v1/chat/completions`
- After: `http://localhost:3001/api/analyze-text`

## Troubleshooting

### Backend won't start
- Check if port 3001 is already in use: `lsof -i :3001`
- Make sure `.env` file exists with `OPENAI_API_KEY`

### Frontend still shows CORS errors
- Make sure backend server is running (`npm run server`)
- Check browser console for backend URL being called
- Verify `VITE_BACKEND_URL` in `.env` matches your backend port

### OpenAI API errors
- Check your OpenAI API key is valid and has credits
- View backend terminal logs for detailed error messages
- Error 401: Invalid API key
- Error 429: Rate limit exceeded

## Development Tips

1. **Always start backend before frontend** when developing
2. **Check both terminal logs** if something isn't working
3. **Backend logs** show OpenAI API responses and errors
4. **Frontend logs** show what's being sent to backend

## Production Deployment

When deploying to production:
1. Deploy backend to a hosting service (Render, Railway, Fly.io, etc.)
2. Update `VITE_BACKEND_URL` in frontend to your production backend URL
3. Set `OPENAI_API_KEY` in production environment variables
4. Enable CORS for your production frontend domain in `server/index.js`
