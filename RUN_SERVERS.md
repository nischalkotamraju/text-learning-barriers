# 🚀 Running the Application with Ideogram AI

## Quick Start (Two Terminal Setup)

### Terminal 1 - Backend Server
```bash
cd /Users/nischalkotamraju/Desktop/text-learning-barriers
npm run server
```
This starts the backend proxy server at http://localhost:3001

### Terminal 2 - Frontend App  
```bash
cd /Users/nischalkotamraju/Desktop/text-learning-barriers
npm run dev
```
This starts the frontend app at http://localhost:5174

## Alternative: One Command Setup
```bash
npm run dev:full
```
This runs both servers simultaneously using concurrently.

## ✅ Verification

1. **Backend Ready**: You should see: 
   ```
   Ideogram proxy server running at http://localhost:3001
   Image generation endpoint: http://localhost:3001/api/generate-image
   ```

2. **Frontend Ready**: You should see:
   ```
   ➜  Local:   http://localhost:5174/
   ```

3. **Test the Integration**: 
   - Open http://localhost:5174
   - Create a folder
   - Use "Convert Text to Visual"
   - Choose any format and enter text
   - The image should now generate via Ideogram AI (no more CORS errors!)

## 🔧 How It Works

- **Frontend** calls our backend proxy at `http://localhost:3001/api/generate-image`
- **Backend proxy** calls Ideogram API with your API key
- **No CORS issues** because the API call happens server-side
- **Superior text quality** in generated images using Ideogram AI

## ⚠️ Important Notes

- Both servers must be running for image generation to work
- Backend server handles the Ideogram API calls (solves CORS issue)
- Frontend server serves the React application
- Ideogram API key is used securely on the backend only