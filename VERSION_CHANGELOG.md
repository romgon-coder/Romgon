# ROMGON Version Changelog

This file tracks all versions, bug fixes, and features for easy updates to the welcome page.

---

## ALPHA v0.3.0 (November 9, 2025)

### Recent Bug Fixes
1. **Select Sound File Missing** (Commit: 8341cf1)
   - Fixed missing `sellectSound.ogg` causing 404 errors on checkbox and dropdown interactions
   - Root cause: File was never added to git repository
   - Solution: Added 7.25 KiB OGG audio file to deploy/ASSETS/

2. **Illegal Sound Alert Blocking** (Commit: fc22af3, 78a1f98)
   - Resolved issue where alert() blocked audio playback
   - Sounds now play immediately before popups appear
   - Changed from AFTER alert dismissal to BEFORE alert display

3. **MP3 Audio Corruption** (Commit: 78a1f98)
   - Switched to OGG format after DEMUXER_ERROR_COULD_NOT_OPEN issues with MP3 files
   - All new sounds use OGG format for better browser compatibility
   - Fixed corrupted audio files in deploy folder

### Latest Features
1. **Comprehensive Sound Effects System** (Commits: fad6fe1 → 8341cf1)
   - Added audio feedback for illegal moves (`illegalSound.ogg` at 50% volume)
   - FLIP button sound effect (`flipSound.ogg` at 50% volume)
   - KEEP button sound effect (`keepSound.ogg` at 50% volume)
   - UI interaction sounds for checkboxes and dropdowns (`sellectSound.ogg` at 40% volume)
   - Global click detector with capture phase for early event detection
   - Label click support for checkbox sounds

2. **FLIP Mode Game Variant** (Previous release)
   - New game variant where pieces can be flipped to change their orientation
   - Pieces can flip to alter movement patterns strategically
   - Visual flip indicators and animations
   - Special rules for flipped pieces

3. **Fog of War Mode** (Previous release)
   - Strategic variant where you can only see your own pieces
   - Opponent moves are hidden until revealed
   - Adds mystery and strategic planning element
   - Forces players to anticipate opponent strategy

4. **ChatGPT AI Opponent** (Previous release)
   - Play against an AI-powered opponent
   - AI learns and adapts to player strategy
   - Multiple difficulty levels
   - Natural language interaction capabilities

5. **Enhanced Turn Sound Volume** (Commit: 98f8f61)
   - Increased end turn sound from 40% to 70%
   - Better auditory feedback during gameplay
   - Improved game flow awareness

### Other Changes
- Added comprehensive debug logging for sound system
- Added error handlers for audio file loading
- Improved event listener structure for UI sounds
- Welcome page modal implementation (Commit: 750ac12)

---

## ALPHA v0.2.X (October 2025)

### Features
- Guest mode support
- Google OAuth integration
- Active games system
- Challenge multiplayer mode
- Badge system
- Dark mode implementation
- Draggable UI panels
- Engine analysis system
- Game variants system

### Bug Fixes
- Google OAuth configuration errors
- Guest login backend issues
- FedCM warnings
- Favicon cache issues
- Various multiplayer sync issues

---

## Template for Future Updates

```markdown
## ALPHA v0.X.X (Month Day, Year)

### Recent Bug Fixes
1. **Bug Title** (Commit: XXXXXXX)
   - Description of the bug
   - Root cause explanation
   - Solution implemented

2. **Another Bug** (Commit: XXXXXXX)
   - Description
   - Solution

3. **Third Bug** (Commit: XXXXXXX)
   - Description
   - Solution

### Latest Features
1. **Feature Name** (Commits: XXXXXXX → XXXXXXX)
   - Feature description
   - Key capabilities
   - User benefits

2. **Another Feature** (Previous release)
   - Description
   - Benefits

[Continue with 5 total features]

### Other Changes
- Minor improvements
- Code refactoring
- Documentation updates
```

---

## Quick Update Guide

### When Adding New Features
1. Add entry to "Latest Features" section
2. Keep only the 5 most recent features
3. Move older features to previous version section
4. Update version number if major change

### When Fixing Bugs
1. Add entry to "Recent Bug Fixes" section
2. Keep only the 3 most recent fixes
3. Move older fixes to previous version section
4. Include commit hash for reference

### When Updating Welcome Page
1. Copy 3 most recent bug fixes from this file
2. Copy 5 most recent features from this file
3. Update version number in welcome page
4. Update "Last Updated" date in WELCOME_PAGE_GUIDE.md

---

**Maintenance Notes**:
- Keep this file updated with every significant change
- Include commit hashes for traceability
- Be descriptive but concise
- Focus on user-facing changes
- Technical details in description, not title

**File Sync**:
- This changelog feeds into `deploy/welcome-page.html`
- This changelog feeds into `deploy/index.html` welcome modal
- Update all three files together to maintain consistency

---

**Last Updated**: November 9, 2025  
**Current Version**: ALPHA v0.3.0  
**Total Versions**: 3 (v0.1.X, v0.2.X, v0.3.0)
