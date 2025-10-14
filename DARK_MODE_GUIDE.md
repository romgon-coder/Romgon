# 🎨 Dark Mode Quick Guide

## 🌙 Button Location

```
┌─────────────────────────────────────────────────────┐
│  ROMGON GAME                                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  Turn Indicator                              │  │
│  │  [?] [👁️] [⚡] [↩️] [📋] [📥] [💾] [🔍] [🌙] │  │
│  │   │    │    │    │    │    │    │    │    │  │  │
│  │   │    │    │    │    │    │    │    │    └──── NEW!
│  │   │    │    │    │    │    │    │    └─────────  Log RPN
│  │   │    │    │    │    │    │    └──────────────  Export Game
│  │   │    │    │    │    │    └───────────────────  Load Position
│  │   │    │    │    │    └────────────────────────  Copy Position
│  │   │    │    │    └─────────────────────────────  Undo
│  │   │    │    └──────────────────────────────────  Last Move
│  │   │    └───────────────────────────────────────  Show Moves
│  │   └────────────────────────────────────────────  Help
│  └─────────────────────────────────────────────┘  │
│                                                     │
│              ┌───────────────┐                     │
│              │  GAME BOARD   │                     │
│              │  (Hexagons)   │                     │
│              └───────────────┘                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🎮 How to Use

### Light Mode → Dark Mode:
1. Click the **🌙** (moon) button
2. Background turns dark
3. Button changes to **☀️** (sun)
4. Preference saved automatically

### Dark Mode → Light Mode:
1. Click the **☀️** (sun) button
2. Background turns light
3. Button changes to **🌙** (moon)
4. Preference saved automatically

## 🎨 Color Schemes

### Light Mode (Default):
```
Background:     #f0f0f0 (Light gray)
Board:          #ffffff (White)
Text:           #333333 (Dark gray)
Hexagons:       Original colors (orange/brown)
```

### Dark Mode:
```
Background:     #1a2332 (Dark blue-gray)
Board:          #262421 (Dark brown)
Text:           #ffffff (White)
Hexagons:       Original colors (orange/brown)
```

## ✨ Features

- ✅ **Instant switching** - No page reload needed
- ✅ **Persistent** - Remembers your choice
- ✅ **Smooth transition** - 0.3 second fade
- ✅ **Icon feedback** - Button icon changes
- ✅ **Tooltip help** - Hover to see description

## 🔧 Technical Info

### Storage:
```javascript
localStorage.getItem('romgon-theme')
// Returns: 'light' or 'dark'
```

### CSS Class:
```javascript
document.body.classList.contains('dark-mode')
// Returns: true or false
```

### Manual Control:
```javascript
// Switch to dark mode
document.body.classList.add('dark-mode');

// Switch to light mode
document.body.classList.remove('dark-mode');

// Toggle
document.body.classList.toggle('dark-mode');
```

## 📊 Comparison

| Feature | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background | 🤍 Light | 🖤 Dark |
| Eye Strain | Higher | Lower |
| Battery (OLED) | More | Less |
| Best Time | Day ☀️ | Night 🌙 |
| Icon | 🌙 | ☀️ |

## 🎯 When to Use

### Light Mode ☀️:
- ✅ Daytime gaming
- ✅ Bright room
- ✅ Prefer high contrast
- ✅ Better for some colorblind users

### Dark Mode 🌙:
- ✅ Nighttime gaming
- ✅ Dark room
- ✅ Reduce eye strain
- ✅ Save battery (OLED screens)
- ✅ Modern aesthetic

## 🚀 Pro Tips

1. **Try both modes** - See which you prefer
2. **Night sessions?** - Use dark mode
3. **Bright room?** - Use light mode
4. **Eye strain?** - Switch to dark mode
5. **Your choice is saved** - No need to switch every time

## 🎉 Enjoy!

You now have **full control** over your gaming experience! 

Switch anytime with one click: **🌙 ↔ ☀️**

Happy gaming! 🎮✨
