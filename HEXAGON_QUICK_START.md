# 🎯 QUICK START - Hexagon Image Creation

## The Simple Answer:

### **CREATE YOUR PNG AT:**
```
Width:  122 pixels
Height: 140 pixels
Format: PNG with transparent background
```

**That's it!** These dimensions will display perfectly at the actual size of 61×70px on your board.

---

## 📐 Why These Dimensions?

```
Your game uses: --hex-size: 35px

Hexagon Math:
├── Width  = 35 × √3 = 60.62px → rounds to 61px
└── Height = 35 × 2  = 70px

For quality, we create at 2x:
├── Width  = 61 × 2 = 122px
└── Height = 70 × 2 = 140px
```

---

## 🎨 Visual Guide

```
        TOP (61, 0)
           /\
          /  \
 LEFT    /    \    RIGHT
(0,35)  |      |  (122,35)
        |      |
        |      |
(0,105) |      |  (122,105)
         \    /
          \  /
           \/
      BOTTOM (61, 140)
```

---

## 🛠️ 3 Easy Ways to Create

### **Method 1: Use the SVG Template** ⭐ EASIEST
1. Open `ASSETS/hexagon-template.svg` in any image editor
2. Customize colors/add texture
3. Export as PNG (122×140px)
4. Done!

### **Method 2: Photoshop/GIMP**
1. New Image: 122×140px, transparent
2. Polygon Tool: 6 sides
3. Draw hexagon from center (61, 70)
4. Add your design
5. Export PNG

### **Method 3: Online (Figma/Canva)**
1. Create 122×140px canvas
2. Draw hexagon (use template)
3. Design inside
4. Download PNG

---

## 📁 Where to Save

```
C:\Users\mansonic\Documents\Romgon Game\ASSETS\hexagons\
```

Create this folder and put your PNG files there:
- `hex-dark.png`
- `hex-medium.png`
- `hex-light.png`

---

## ✅ Checklist

Before you start:
- [ ] Canvas: 122×140 pixels
- [ ] Transparent background
- [ ] Hexagon shape (6 equal sides)
- [ ] Design fits inside hexagon
- [ ] Save as PNG (not JPG!)

---

## 🚀 Next Steps

1. **Create your hexagon(s)** at 122×140px
2. **Save to ASSETS/hexagons/** folder
3. **Tell me the filenames**
4. **I'll update the game code** to use them!

---

## 💡 Example Colors (Your Current Theme)

```css
Dark Brown:  #6d3a13  ███ 
Medium:      #f57d2d  ███
Light:       #fcc49c  ███
```

Match these or create your own! 🎨

---

## ❓ Questions?

**Q: Can I use different sizes?**
A: Stick to 122×140px for best results. I can adjust CSS if needed.

**Q: Can I use JPG?**
A: PNG only! Need transparency for hexagon shape.

**Q: How many images do I need?**
A: Minimum 1 (all hexagons same). Ideally 3-5 (variety).

**Q: What if my design doesn't fit?**
A: Keep it centered, 5-10px from edges.

---

**Ready?** Create your 122×140px PNG hexagons and let me know when they're ready! 🎯✨
