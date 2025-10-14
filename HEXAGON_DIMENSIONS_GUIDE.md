# 🎨 Custom Hexagon Image Dimensions Guide

## 📐 Exact Dimensions Needed

Based on your current game settings (`--hex-size: 35px`), here are the precise dimensions:

### **Required PNG Dimensions:**

```
Desktop (Primary):
├── Width:  60.62 pixels  (√3 × 35)
├── Height: 70 pixels     (2 × 35)
└── Format: PNG with transparent background

Mobile (Optional):
├── Width:  48.50 pixels  (√3 × 28)
├── Height: 56 pixels     (2 × 28)
└── Format: PNG with transparent background
```

### **Recommended Production Sizes:**

For best quality across all screens, create at **2x or 3x** resolution and let CSS scale down:

```
🎯 RECOMMENDED (2x): 
├── Width:  121 pixels
├── Height: 140 pixels
└── Scale: 200%

🎯 HIGH-RES (3x):
├── Width:  182 pixels
├── Height: 210 pixels
└── Scale: 300%
```

---

## 📊 Mathematical Breakdown

### Formula:
```
Hex Size = 35px (your current setting)

Width  = Hex Size × √3 = 35 × 1.73205 = 60.62px
Height = Hex Size × 2  = 35 × 2       = 70px
```

### Aspect Ratio:
```
Width : Height = 1.73205 : 2 (approximately 0.866 : 1)
```

---

## 🎨 Design Specifications

### **1. Image Canvas Setup**

#### **Standard Resolution (1x):**
```
Canvas Size: 61px × 70px (round up for crisp edges)
DPI: 72 (web standard)
Color Mode: RGB
Background: Transparent (Alpha channel)
```

#### **High Resolution (2x):**
```
Canvas Size: 122px × 140px
DPI: 144
Color Mode: RGB
Background: Transparent
```

#### **Ultra High-Res (3x) - Retina:**
```
Canvas Size: 183px × 210px
DPI: 216
Color Mode: RGB
Background: Transparent
```

---

## 🔷 Hexagon Shape Guide

### **Perfect Hexagon Points (SVG Path):**

For a 61×70px hexagon:
```svg
<svg width="61" height="70" viewBox="0 0 61 70">
  <polygon points="
    30.5,0    (top)
    61,17.5   (upper-right)
    61,52.5   (lower-right)
    30.5,70   (bottom)
    0,52.5    (lower-left)
    0,17.5    (upper-left)
  "/>
</svg>
```

### **Percentage-Based (for any size):**
```
Top:          50%, 0%
Upper-right:  100%, 25%
Lower-right:  100%, 75%
Bottom:       50%, 100%
Lower-left:   0%, 75%
Upper-left:   0%, 25%
```

---

## 🛠️ Creation Methods

### **Method 1: Photoshop/GIMP**

1. **Create New Image:**
   - Width: 122px (2x quality)
   - Height: 140px
   - Background: Transparent
   - Color Mode: RGB, 8-bit

2. **Draw Hexagon:**
   - Use Polygon Tool
   - Set sides: 6
   - Draw from center (61px, 70px)
   - Radius: 61px

3. **Add Your Design:**
   - Textures, gradients, colors
   - Keep everything inside hexagon shape
   - Use layer masks for clean edges

4. **Export:**
   - Format: PNG-24
   - Transparency: Yes
   - Compression: Medium

### **Method 2: Illustrator/Inkscape**

1. **Create Hexagon:**
   ```
   - Polygon Tool → 6 sides
   - Size: 122px × 140px
   - Flat top orientation
   ```

2. **Design:**
   - Add fills, strokes, patterns
   - Export as PNG
   - Resolution: 2x (244 DPI)

### **Method 3: Online Tools**

**Using Figma (Free):**
1. Create frame: 122×140px
2. Polygon tool → 6 sides
3. Rotate 30° for flat top
4. Design inside
5. Export as PNG 2x

**Using Canva (Free):**
1. Custom dimensions: 122×140px
2. Upload hexagon template
3. Add design
4. Download as PNG (transparent)

---

## 📁 File Organization

### **Recommended File Structure:**

```
ASSETS/
├── hexagons/
│   ├── hex-dark-brown.png      (dark variant)
│   ├── hex-orange-med.png      (medium variant)
│   ├── hex-orange-light.png    (light variant)
│   ├── hex-center.png          (center hexes)
│   └── hex-default.png         (default/fallback)
│
├── hexagons-2x/  (optional high-res)
│   ├── hex-dark-brown@2x.png
│   ├── hex-orange-med@2x.png
│   └── ...
│
└── hexagons-3x/  (optional retina)
    └── ...
```

---

## 🎨 Design Tips

### **1. Safe Zone:**
```
Keep important details 5-10px from edges
Center area: ~40px × 50px is safest
Avoid text/details near corners
```

### **2. Color Variants:**
Your current colors to match:
```css
Dark Brown:   #6d3a13
Orange Med:   #f57d2d
Orange Light: #fcc49c
```

### **3. Effects to Consider:**
- Subtle shadow/depth
- Border/outline (2-3px)
- Texture (wood, stone, metal)
- Gradient (top-to-bottom subtle)
- Inner glow for selected state

### **4. Transparency:**
```
Background: 100% transparent
Edges: Smooth anti-aliasing
No white/black halos
```

---

## 🖼️ Example Templates

### **Template 1: Solid Color**
```
122×140px PNG
- Fill hexagon with color
- 2px darker border
- Subtle inner shadow
```

### **Template 2: Textured**
```
122×140px PNG
- Wood grain texture
- Overlay hexagon mask
- Slight vignette effect
```

### **Template 3: Gradient**
```
122×140px PNG
- Linear gradient (top→bottom)
- Color: #f57d2d → #e06a1f
- Soft border highlight
```

---

## 📏 Quick Reference Card

```
╔════════════════════════════════════════╗
║  ROMGON HEXAGON IMAGE SPECS           ║
╠════════════════════════════════════════╣
║  Standard (1x):  61px  × 70px         ║
║  Quality  (2x):  122px × 140px  ⭐    ║
║  Retina   (3x):  183px × 210px        ║
╠════════════════════════════════════════╣
║  Format:         PNG with alpha       ║
║  Orientation:    Flat-top hexagon     ║
║  Background:     Transparent          ║
║  Corners:        6 equal sides        ║
╠════════════════════════════════════════╣
║  Current Colors:                      ║
║  • Dark:    #6d3a13                   ║
║  • Medium:  #f57d2d                   ║
║  • Light:   #fcc49c                   ║
╚════════════════════════════════════════╝
```

---

## ✅ Pre-Export Checklist

Before exporting your hexagon images:

- [ ] Canvas size: 122×140px (2x quality)
- [ ] Hexagon perfectly centered
- [ ] All design elements inside hexagon
- [ ] Background is transparent
- [ ] No white/black edges (proper anti-aliasing)
- [ ] File format: PNG-24 (not PNG-8)
- [ ] File size: Under 50KB per image
- [ ] Tested at actual size (61×70px)
- [ ] Looks good at both light/dark backgrounds
- [ ] Named descriptively (hex-dark.png, etc.)

---

## 🚀 After Creating Images

Once you have your PNG files:

1. **Place in ASSETS folder:**
   ```
   C:\Users\mansonic\Documents\Romgon Game\ASSETS\hexagons\
   ```

2. **Tell me:**
   - How many variants you created
   - File names
   - Which hexagons should use which image

3. **I'll update the CSS:**
   ```css
   .hexagon {
       background-image: url('../ASSETS/hexagons/hex-default.png');
       background-size: cover;
   }
   ```

---

## 🎯 TLDR - Just Give Me The Numbers!

### **Create Your Hexagon Images:**
```
✅ Size:   122 pixels wide × 140 pixels tall
✅ Shape:  Regular hexagon (6 equal sides)
✅ Format: PNG with transparent background
✅ DPI:    144 (or 2x web resolution)
✅ Save:   In ASSETS/hexagons/ folder
```

### **Quick Start: Use This Exact Size**
```
Width:  122px
Height: 140px
```

That's it! Create your images at **122×140 pixels** and you're ready to go! 🎨✨

---

## 💡 Need Help Creating Them?

If you need assistance:

**Option 1:** I can provide SVG template code
**Option 2:** I can guide you through Photoshop/GIMP steps
**Option 3:** I can recommend online tools with exact settings
**Option 4:** I can create CSS patterns to simulate textures

Just let me know what you need! 🚀
