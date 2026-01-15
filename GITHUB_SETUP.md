# GitHub Setup Instructions

## Step 1: Configure Git (if not already done)

Set your Git identity:
```bash
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

## Step 2: Make the Initial Commit

```bash
cd /Users/rsarkar/chess-claude-game
git commit -m "Initial commit: Chess game vs Claude 4.5"
```

## Step 3: Create a GitHub Repository

1. Go to https://github.com/new
2. Repository name: `chess-claude-game` (or any name you prefer)
3. Description: "A chess game where you play against Claude 4.5"
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 4: Connect and Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
cd /Users/rsarkar/chess-claude-game
git remote add origin https://github.com/YOUR_USERNAME/chess-claude-game.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Alternative: Using SSH (if you have SSH keys set up)

```bash
git remote add origin git@github.com:YOUR_USERNAME/chess-claude-game.git
git branch -M main
git push -u origin main
```

## Important Notes

- Your `.env` file is already in `.gitignore`, so your API key won't be uploaded
- Make sure to keep your `ANTHROPIC_API_KEY` secret and never commit it
- The `.env.example` file is included as a template for others
