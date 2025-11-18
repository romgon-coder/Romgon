# GitHub Wiki Setup Instructions

This directory contains comprehensive wiki documentation for the ROMGON project.

## 📚 Wiki Pages Created

1. **Home.md** - Main landing page with project overview
2. **Game-Rules.md** - Complete game rules and mechanics
3. **Flip-Mode-Mechanics.md** - Advanced flip mode variant
4. **AI-Implementation.md** - AI engine technical details
5. **API-Documentation.md** - Backend REST API reference
6. **Development-Setup.md** - Local development guide
7. **Architecture-Overview.md** - System design and tech stack

## 🚀 How to Upload to GitHub Wiki

### Method 1: Via GitHub Web Interface (Easiest)

1. **Go to your repository wiki:**
   ```
   https://github.com/romgon-coder/Romgon/wiki
   ```

2. **Create each page:**
   - Click "Create the first page" or "New Page"
   - Copy content from each `.md` file
   - Use the filename (without .md) as the page title
   - Click "Save Page"

3. **Repeat for all 7 pages:**
   - Home (use Home.md content)
   - Game-Rules
   - Flip-Mode-Mechanics
   - AI-Implementation
   - API-Documentation
   - Development-Setup
   - Architecture-Overview

### Method 2: Via Git (Advanced)

GitHub wikis are actually Git repositories. You can clone and push:

1. **Clone the wiki repository:**
   ```bash
   git clone https://github.com/romgon-coder/Romgon.wiki.git
   cd Romgon.wiki
   ```

2. **Copy wiki files:**
   ```bash
   cp /path/to/Romgon/wiki/*.md .
   rm README-WIKI-SETUP.md  # Don't include this file
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add comprehensive wiki documentation"
   git push origin master
   ```

4. **View your wiki:**
   ```
   https://github.com/romgon-coder/Romgon/wiki
   ```

### Method 3: Bulk Upload Script

Create a script to automate:

```bash
#!/bin/bash
# upload-wiki.sh

WIKI_DIR="/path/to/Romgon/wiki"
WIKI_REPO="https://github.com/romgon-coder/Romgon.wiki.git"

# Clone wiki
git clone $WIKI_REPO temp-wiki
cd temp-wiki

# Copy files (excluding this README)
cp $WIKI_DIR/*.md .
rm README-WIKI-SETUP.md

# Push
git add .
git commit -m "Add comprehensive wiki documentation"
git push origin master

# Cleanup
cd ..
rm -rf temp-wiki

echo "✅ Wiki uploaded successfully!"
```

Run:
```bash
chmod +x upload-wiki.sh
./upload-wiki.sh
```

## 📝 Wiki Structure

Once uploaded, your wiki will have this structure:

```
ROMGON Wiki
├── Home                    ← Landing page
├── Getting Started
│   ├── Game Rules
│   ├── Flip Mode Mechanics
│   └── Piece Movement Patterns (create if needed)
├── Technical Documentation
│   ├── Architecture Overview
│   ├── AI Implementation
│   ├── API Documentation
│   └── Database Schema (create if needed)
└── Development
    ├── Development Setup
    ├── Deployment Guide (create if needed)
    ├── Contributing (create if needed)
    └── Testing (create if needed)
```

## 🎨 Customizing the Wiki

### Add Sidebar Navigation

Create `_Sidebar.md`:

```markdown
## ROMGON Wiki

### Getting Started
- [Home](Home)
- [Game Rules](Game-Rules)
- [Flip Mode](Flip-Mode-Mechanics)

### Technical
- [Architecture](Architecture-Overview)
- [AI Implementation](AI-Implementation)
- [API Docs](API-Documentation)

### Development
- [Setup](Development-Setup)
- [Contributing](Contributing)

### Links
- [GitHub](https://github.com/romgon-coder/Romgon)
- [Play Online](https://romgon.net)
```

### Add Footer

Create `_Footer.md`:

```markdown
[GitHub](https://github.com/romgon-coder/Romgon) | [Play ROMGON](https://romgon.net) | [Report Issue](https://github.com/romgon-coder/Romgon/issues)

Last updated: 2025-01-18 | Version 1.0.0
```

## ✅ Verification Checklist

After uploading, verify:

- [ ] All 7 pages are accessible
- [ ] Links between pages work
- [ ] Images display correctly (if any)
- [ ] Code blocks are formatted properly
- [ ] Tables render correctly
- [ ] Home page is set as landing page

## 🔧 Troubleshooting

**"Wiki not available"**
- Solution: Enable wiki in repository settings
- Settings → Features → Check "Wikis"

**Links not working**
- Use format: `[Page Title](Page-Title)` (not `Page Title.md`)

**Formatting broken**
- Check markdown syntax
- GitHub uses GitHub Flavored Markdown (GFM)

**Can't push to wiki repo**
- Ensure you have write access
- Check authentication (SSH vs HTTPS)

## 📚 Additional Pages to Create

Consider adding these pages later:

1. **Piece-Movement-Patterns.md** - Detailed piece diagrams
2. **Database-Schema.md** - Complete DB documentation
3. **Deployment-Guide.md** - Step-by-step deployment
4. **Contributing.md** - Contribution guidelines
5. **Testing.md** - Test documentation
6. **Changelog.md** - Version history
7. **FAQ.md** - Frequently asked questions

## 🎯 Next Steps

1. Upload wiki pages to GitHub
2. Enable wiki in repository settings
3. Add sidebar navigation
4. Link wiki from main README.md
5. Share with community

---

**Need Help?**
- GitHub Wiki Docs: https://docs.github.com/en/communities/documenting-your-project-with-wikis
- Markdown Guide: https://www.markdownguide.org/
