# Deploying to Vercel

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your project pushed to GitHub (already done!)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Sign in with your GitHub account

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `rajksarkar/chess-claude-game`
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Other (or leave as default)
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave empty (no build needed)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add: `ANTHROPIC_API_KEY` = `your_actual_api_key_here`
   - Make sure it's added for Production, Preview, and Development
   - Click "Save"

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at: `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd /Users/rsarkar/chess-claude-game
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? **No** (first time)
   - Project name: `chess-claude-game` (or your choice)
   - Directory: `./` (default)

4. **Set Environment Variables**
   ```bash
   vercel env add ANTHROPIC_API_KEY
   ```
   - Enter your API key when prompted
   - Select: Production, Preview, Development

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Important Notes

- ✅ The `vercel.json` file is already configured
- ✅ The server is set up to work with Vercel's serverless functions
- ⚠️ **Don't forget to add your `ANTHROPIC_API_KEY` as an environment variable in Vercel!**
- ⚠️ Your `.env` file is in `.gitignore`, so you must add the key in Vercel's dashboard

## Troubleshooting

### If deployment fails:
1. Check that all dependencies are in `package.json`
2. Verify `ANTHROPIC_API_KEY` is set in Vercel environment variables
3. Check Vercel deployment logs for errors

### If the app doesn't work:
1. Check browser console for errors
2. Verify the API key is correct in Vercel dashboard
3. Check Vercel function logs

## Updating Your Deployment

After making changes:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically redeploy if you have GitHub integration enabled!
