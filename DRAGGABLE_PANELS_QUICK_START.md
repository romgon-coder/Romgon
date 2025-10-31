# Quick Start: Draggable Panels in Practice Mode

## 🎯 What You Can Now Do

### Sandbox Panel (Practice Mode)
```
1. Click "🛠️ Practice" button in lobby
2. Grab purple header with "🛠️ Sandbox Mode" text
3. Drag anywhere on screen
4. Resize from bottom-right corner
5. Your position is saved automatically!
```

### Camera Panel (3D Camera)
```
1. Click "🎥" button during game
2. Grab header with "🎥 3D Camera" text
3. Drag anywhere (avoid the ✕ button)
4. Resize from bottom-right corner
5. Position saved automatically!
```

---

## 🖱️ Visual Guide

### Sandbox Panel Layout
```
┌─────────────────────────────────────┐
│ 🛠️                                  │ ← DRAGGABLE HEADER
│ Sandbox Mode                        │    (Grab here to move)
│ Position Editor (Drag to Move)      │
├─────────────────────────────────────┤
│                                     │
│  ✏️ Edit Mode (Place/Remove)       │
│                                     │
│  ▶️ Play Mode (Test Position)      │
│                                     │
│  [Piece Selector Dropdown]          │
│                                     │
│  🔄 Turn     👁️ Panels             │
│  ♻️ Reset to Start                  │
│  🗑️ Clear Board                     │
│  💾 Save Position                   │
│  📂 Load Position                   │
│  🔍 Analyze Position                │
│  🧩 Create Puzzle                   │
│  ❌ Exit Sandbox                    │
│                                     │
│  Current Turn: Black                │
│                                     │ ← RESIZE HANDLE
└─────────────────────────────────────┘   (Drag from corner)
```

### Camera Panel Layout
```
┌─────────────────────────────────────┐
│ 🎥 3D Camera (Drag to Move)     [✕]│ ← DRAGGABLE HEADER
│                                     │    (Don't click ✕!)
├─────────────────────────────────────┤
│                                     │
│     🖱️ DRAG HERE                   │ ← Camera Pan Area
│     (Pan camera view)               │
│                                     │
│  [🦅 Top]  [📐 Tilt]               │
│                                     │
│  Rotate: ▬▬▬▬▬○▬▬▬▬▬ 0°           │
│  Tilt:   ▬▬▬○▬▬▬▬▬▬▬ 0°           │
│  Zoom:   ▬▬▬▬▬○▬▬▬▬▬ 1.0x         │
│                                     │
│  [↻ Reset]  [⏻ OFF]                │
│                                     │ ← RESIZE HANDLE
└─────────────────────────────────────┘
```

---

## 🎮 Example Workflow

### Setting Up Your Workspace

**Step 1: Start Practice Mode**
```
Lobby → Click "🛠️ Practice"
```

**Step 2: Position Sandbox Panel**
```
Drag panel to left side of screen
Resize to comfortable width
```

**Step 3: Enable Camera (Optional)**
```
Click "🎥" button
Drag camera panel to right side
Resize to see all controls
```

**Step 4: Test Your Setup**
```
✅ Sandbox panel on left
✅ Camera panel on right  
✅ Board visible in center
✅ All controls accessible
```

---

## 💡 Pro Tips

### Layout Recommendations

**Compact Layout (Small Screens):**
```
┌────────────────────────────────┐
│                                │
│  Sandbox Panel                 │
│  (Top-left corner)             │
│  [Minimized size]              │
│                                │
│         BOARD                  │
│         (Center)               │
│                                │
│                Camera Panel    │
│                (Bottom-right)  │
│                [Mini size]     │
└────────────────────────────────┘
```

**Spacious Layout (Large Screens):**
```
┌────────────────────────────────────────┐
│                                        │
│  Sandbox         BOARD        Camera  │
│  Panel           ────         Panel   │
│  (Full)         Center        (Full)  │
│  Left side      ────          Right   │
│                                        │
└────────────────────────────────────────┘
```

### Positioning Tips

1. **Keep panels visible:** Don't overlap the board
2. **Use screen edges:** Panels snap better at edges
3. **Resize carefully:** Don't make panels too small
4. **Save space:** Minimize panels when not in use

---

## 🔄 Reset Panel Positions

### Method 1: Manual Reset
```javascript
// Open browser console (F12)
localStorage.removeItem('sandboxPanelPosition');
localStorage.removeItem('cameraPanelPosition');
location.reload();
```

### Method 2: Default Positions
- **Sandbox:** Top-left (80px, 20px)
- **Camera:** Bottom-right (20px, 100px)

Just clear localStorage and refresh!

---

## 🎨 Customization Examples

### Example 1: Analysis Setup
```
Purpose: Analyze positions with tablebase
Layout:
- Sandbox panel (left): Position editor
- Camera panel (right): 3D view
- Bottom: Eliminated pieces visible
```

### Example 2: Training Setup
```
Purpose: Practice specific positions
Layout:
- Sandbox panel (top-left): Quick access
- Camera hidden: More board space
- Side panels visible: Track captures
```

### Example 3: Puzzle Creation
```
Purpose: Design custom puzzles
Layout:
- Sandbox panel (expanded): All tools visible
- Camera panel (collapsed): Save space
- Center: Maximum board visibility
```

---

## ⚙️ Advanced Features

### CSS Resize Properties
```css
resize: both;           /* Resize in any direction */
overflow: auto;         /* Scroll if content too large */
min-width: 200px;       /* Don't get too small */
max-width: 400px;       /* Don't get too large */
```

### Drag Detection
```
Header cursor: move     ← Indicates draggable
Content cursor: default ← Normal interaction
Resize corner: nwse-resize ← Diagonal resize
```

### Visual Feedback
```
During drag: opacity 0.8 (semi-transparent)
After drop:  opacity 1.0 (solid)
```

---

## 🐛 Common Issues

### Issue: Panel Won't Drag
**Solution:**
- Click header area (colored bar)
- Don't click buttons/controls
- Ensure JavaScript enabled

### Issue: Can't Find Resize Handle
**Solution:**
- Look at bottom-right corner
- Cursor changes to diagonal arrows
- Try zooming browser (Ctrl + 0)

### Issue: Panel Stuck Somewhere
**Solution:**
- Clear localStorage (see reset instructions)
- Boundary detection should prevent off-screen
- Try dragging from visible edge

### Issue: Position Not Saving
**Solution:**
- Check localStorage enabled in browser
- Try incognito mode to test
- Look for console errors (F12)

---

## 📱 Device Compatibility

### Desktop (Full Support) ✅
- Drag: Yes
- Resize: Yes
- Position Save: Yes

### Mobile (Limited) ⚠️
- Drag: No (needs touch events)
- Resize: No (touch not implemented)
- Position: N/A

### Tablet (Limited) ⚠️
- Drag: No (needs touch events)
- Resize: Maybe (depends on browser)
- Position: N/A

---

## 🎓 Tutorial: First Time Setup

### 5-Minute Setup Guide

**Minute 1: Start Practice Mode**
```
→ Go to lobby
→ Click "🛠️ Practice" button
→ Sandbox panel appears
```

**Minute 2: Position Sandbox Panel**
```
→ Click header (purple bar)
→ Drag to left side
→ Release mouse
```

**Minute 3: Resize Sandbox Panel**
```
→ Hover over bottom-right corner
→ Diagonal arrows appear
→ Drag to resize
→ Release when comfortable
```

**Minute 4: Enable Camera (Optional)**
```
→ Click "🎥" button
→ Camera panel appears
→ Drag to right side
→ Resize as needed
```

**Minute 5: Test Everything**
```
→ Click buttons in sandbox panel
→ Try camera controls
→ Drag a piece on board
→ Verify no conflicts
```

**Done!** Your layout is saved and will persist across sessions.

---

## 🏆 Best Practices

### Do's ✅
- Position panels at screen edges
- Resize to show all needed controls
- Keep board center clear
- Save after finding good layout
- Use camera panel when needed

### Don'ts ❌
- Don't overlap panels
- Don't make panels too small
- Don't block board interaction
- Don't drag by button/control areas
- Don't resize during active drag

---

## 📊 Feature Comparison

| Feature | Sandbox Panel | Camera Panel | Eliminated Panels |
|---------|--------------|--------------|------------------|
| Draggable | ✅ Yes | ✅ Yes | ✅ Yes (existing) |
| Resizable | ✅ Yes | ✅ Yes | ❌ No |
| Saves Position | ✅ Yes | ✅ Yes | ✅ Yes |
| Touch Support | ❌ No | ❌ No | ❌ No |
| Visual Feedback | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🎬 What's Next?

### Immediate Use
1. Start Practice mode
2. Drag panels to your preference
3. Begin testing positions!

### Future Ideas
- Mobile touch support
- Panel minimize/maximize
- Snap-to-grid alignment
- Save/load layouts
- Panel transparency slider

---

**Ready to use!** The draggable panels are live in Practice mode right now. Just click "🛠️ Practice" and start customizing your workspace!

---

**Quick Reference Card**

```
DRAG:    Hold header, move mouse, release
RESIZE:  Grab corner, drag, release
RESET:   Clear localStorage, refresh
SAVE:    Automatic on drag/resize end
```

Enjoy your customizable workspace! 🎉
