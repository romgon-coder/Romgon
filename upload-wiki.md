# Quick Wiki Upload Guide

## Fastest Method: Clone Wiki Repo and Push

1. **Clone your wiki repository:**
```bash
cd "c:\Users\mansonic\Documents"
git clone https://github.com/romgon-coder/Romgon.wiki.git
```

2. **Copy wiki files:**
```bash
Copy-Item "c:\Users\mansonic\Documents\Romgon Game\wiki\*" -Destination "c:\Users\mansonic\Documents\Romgon.wiki\" -Force
```

3. **Push to wiki:**
```bash
cd "c:\Users\mansonic\Documents\Romgon.wiki"
git add .
git commit -m "Add comprehensive game documentation"
git push origin master
```

## Alternative: Manual Upload (if git clone doesn't work)

Go to: https://github.com/romgon-coder/Romgon/wiki

For each file:
1. Click "New Page" or "Edit"
2. Copy content from `wiki/` folder
3. Paste and save

**Files to upload:**
- Home.md → Home
- Game-Rules.md → Game Rules
- Flip-Mode-Mechanics.md → Flip Mode Mechanics
- AI-Implementation.md → AI Implementation
- API-Documentation.md → API Documentation
- Development-Setup.md → Development Setup
- Architecture-Overview.md → Architecture Overview

Done! 📚
