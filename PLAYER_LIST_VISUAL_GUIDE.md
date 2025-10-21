# 🎨 Player List & Friend Management - Visual Guide

This document provides a visual reference for the Minecraft-style player list and friend management features.

---

## 📱 Server Player List Preview

```
┌─────────────────────────────────────────────────────────────┐
│ 🎮 ROMGON SERVER                             🟢 ONLINE      │
├─────────────────────────────────────────────────────────────┤
│ 12 / 1000 players                          🔄 Refresh       │
├─────────────────────────────────────────────────────────────┤
│ [👥 All Players (12)] [⭐ Friends (3)] [🎭 Guests (2)]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────┐  ┌────────────────────┐             │
│  │ [🎮] You (You)     │  │ [🎮] HexMaster     │             │
│  │     🟢 Online      │  │     🟢 Online      │             │
│  └────────────────────┘  └────────────────────┘             │
│                                                              │
│  ┌────────────────────┐  ┌────────────────────┐             │
│  │ [🎮] StrategicMind │  │ [🎭] Guest_1234    │             │
│  │     🟢 Online      │  │     🟢 Guest User  │             │
│  └────────────────────┘  └────────────────────┘             │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ 📡 romgon.net  •  🏓 Ping: 45ms  •  🎮 v1.0.0              │
└─────────────────────────────────────────────────────────────┘
```

### Tab System

**All Players Tab (Active)**
```
┌────────────────────┐
│ 👥 All Players (12)│ ← Teal gradient background
└────────────────────┘   White text
```

**Friends Tab (Inactive)**
```
┌────────────────────┐
│ ⭐ Friends (3)     │ ← Semi-transparent teal
└────────────────────┘   Teal text, border
```

**Guests Tab (Inactive)**
```
┌────────────────────┐
│ 🎭 Guests (2)      │ ← Semi-transparent teal
└────────────────────┘   Teal text, border
```

### Player Card States

**Regular Player (Teal)**
```
┌────────────────────┐
│ [🎮] HexMaster     │ ← Teal avatar, teal border-left
│     🟢 Online      │   Hover: darker background
└────────────────────┘
```

**Friend (Purple)**
```
┌────────────────────┐
│ [👤] RomgonPro ⭐  │ ← Purple avatar, purple border-left
│     🟢 Online      │   Star emoji indicates friend
└────────────────────┘
```

**Guest (Gold)**
```
┌────────────────────┐
│ [🎭] Guest_1234 🎭 │ ← Gold avatar, gold border-left
│     🟢 Guest User  │   Mask emoji indicates guest
└────────────────────┘
```

**You (Gold highlight)**
```
┌────────────────────┐
│ [🎮] You (You)     │ ← Gold background, gold border-left
│     🟢 Online      │   Special highlighting for current user
└────────────────────┘
```

---

## 👥 Friend Management Modal Preview

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  👥 Friend Management                                     ✕   │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 📨 Pending Requests (2)                                 │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  ┌───────────────────────────────────────────────────┐  │ │
│  │  │ HexWarrior              [✓ Accept] [✕ Reject]    │  │ │
│  │  │ 10/20/2025                                         │  │
│  │  └───────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  ┌───────────────────────────────────────────────────┐  │ │
│  │  │ BoardMaster            [✓ Accept] [✕ Reject]     │  │ │
│  │  │ 10/21/2025                                         │  │
│  │  └───────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ⭐ My Friends (3)                                       │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  ┌───────────────────────────────────────────────────┐  │ │
│  │  │ [R] RomgonPro                [💬] [🗑️]          │  │ │
│  │  │     🟢 Online                                      │  │ │
│  │  └───────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  ┌───────────────────────────────────────────────────┐  │ │
│  │  │ [S] StrategicMind            [💬] [🗑️]          │  │ │
│  │  │     🟢 Online                                      │  │ │
│  │  └───────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  ┌───────────────────────────────────────────────────┐  │ │
│  │  │ [H] HexMaster                [💬] [🗑️]          │  │ │
│  │  │     ⚪ Offline                                     │  │ │
│  │  └───────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ➕ Add New Friend                                       │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  Enter username...  [________________________]          │ │
│  │                                                          │ │
│  │                            [Send Request 📨]            │ │
│  │                                                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│                       [🔄 Refresh]  [Close]                  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Modal Sections Breakdown

#### 1. Pending Requests Section
```
┌───────────────────────────────────────────────────┐
│ 📨 Pending Requests (2)                           │
├───────────────────────────────────────────────────┤
│ PlayerName                 [✓ Accept] [✕ Reject] │
│ Date                                              │
└───────────────────────────────────────────────────┘
```
- Pink border-left (`#ff79c6`)
- Accept button: Green gradient
- Reject button: Red semi-transparent

#### 2. My Friends Section
```
┌───────────────────────────────────────────────────┐
│ ⭐ My Friends (3)                                 │
├───────────────────────────────────────────────────┤
│ [A] FriendName                    [💬] [🗑️]     │
│     🟢 Online                                     │
└───────────────────────────────────────────────────┘
```
- Teal border-left (`#4ecdc4`)
- Avatar circle with gradient background
- 💬 Message button: Opens direct chat
- 🗑️ Remove button: Shows confirmation

#### 3. Add Friend Section
```
┌───────────────────────────────────────────────────┐
│ ➕ Add New Friend                                 │
├───────────────────────────────────────────────────┤
│ [Enter username...        ]  [Send Request 📨]   │
└───────────────────────────────────────────────────┘
```
- Input field with dark background
- Send button: Gradient background

---

## 🎨 Color System

### Primary Colors

**Teal (Default/All Players)**
```
Background: linear-gradient(135deg, #4ecdc4, #45b7aa)
Text: #4ecdc4
Border: rgba(78, 205, 196, 0.3)
```

**Purple (Friends)**
```
Background: linear-gradient(135deg, #a55eea, #8854d0)
Text: #a55eea
Border: rgba(165, 94, 234, 0.3)
```

**Gold (Guests/Highlights)**
```
Background: linear-gradient(135deg, #ffd700, #ffed4e)
Text: #ffd700
Border: rgba(255, 215, 0, 0.3)
```

**Pink (Pending Requests)**
```
Background: rgba(255, 121, 198, 0.1)
Text: #ff79c6
Border-left: 3px solid #ff79c6
```

### Status Colors

**Online**
```
🟢 Green dot (#26de81)
Text: "Online"
```

**Offline**
```
⚪ Gray dot (#888)
Text: "Offline"
```

**Guest**
```
🟢 Green dot (#26de81)
Text: "Guest User"
```

---

## 📐 Layout Dimensions

### Desktop Layout

**Player List**
- Width: 100% of lobby container
- Max-height: 200px (scrollable)
- Grid: `auto-fill minmax(200px, 1fr)`
- Gap: 10px
- Padding: 20px

**Player Card**
- Min-width: 200px
- Height: auto
- Avatar: 32x32px
- Padding: 10px

**Friend Modal**
- Width: 600px
- Max-width: 90vw
- Max-height: 80vh
- Padding: 30px
- Border-radius: 12px

### Mobile Layout (< 768px)

**Player List**
- Grid: 1 column
- Max-height: 300px
- Avatar: 28x28px
- Font-size: 0.85em

**Friend Modal**
- Width: 95vw
- Max-height: 90vh
- Padding: 20px 15px
- Full-screen appearance

---

## 🎭 Avatar System

### SVG Pixelated Avatars

**Teal Avatar (All Players)**
```svg
<svg viewBox="0 0 64 64">
  <rect fill="#4ecdc4" width="64" height="64"/>     <!-- Head -->
  <rect fill="#45b7aa" y="32" width="64" height="32"/> <!-- Body -->
  <rect fill="#3aa59a" x="16" y="16" width="32" height="20"/> <!-- Hair -->
  <rect fill="#fff" x="20" y="22" width="8" height="8"/> <!-- Left eye -->
  <rect fill="#fff" x="36" y="22" width="8" height="8"/> <!-- Right eye -->
</svg>
```

**Purple Avatar (Friends)**
```svg
<svg viewBox="0 0 64 64">
  <rect fill="#a55eea" width="64" height="64"/>     <!-- Head -->
  <rect fill="#8854d0" y="32" width="64" height="32"/> <!-- Body -->
  <rect fill="#6c3fb8" x="16" y="16" width="32" height="20"/> <!-- Hair -->
  <rect fill="#fff" x="20" y="22" width="8" height="8"/> <!-- Left eye -->
  <rect fill="#fff" x="36" y="22" width="8" height="8"/> <!-- Right eye -->
</svg>
```

**Gold Avatar (Guests)**
```svg
<svg viewBox="0 0 64 64">
  <rect fill="#ffd700" width="64" height="64"/>     <!-- Head -->
  <rect fill="#ffed4e" y="32" width="64" height="32"/> <!-- Body -->
  <rect fill="#ffc700" x="16" y="16" width="32" height="20"/> <!-- Hair -->
  <rect fill="#333" x="20" y="22" width="8" height="8"/>   <!-- Left eye -->
  <rect fill="#333" x="36" y="22" width="8" height="8"/>   <!-- Right eye -->
</svg>
```

**Rendering:**
- `image-rendering: pixelated` for blocky Minecraft look
- `background-size: cover` to fill avatar container
- `border: 2px solid [color]` matching user type

---

## 🔄 Interaction Flow

### Player List Flow

```
User logs in
     ↓
showUserHome() called
     ↓
refreshPlayerList() runs
     ↓
┌─── Chat connected? ───┐
│ YES              NO   │
│  ↓                ↓   │
│ updatePlayer      generate│
│ ListFromChat()    MockList()
└───────────────────────┘
     ↓
renderAllPlayersList()
     ↓
switchPlayerListTab('all')
     ↓
startServerPing()
     ↓
Player list displayed!
```

### Friend Request Flow

```
User clicks "Manage" button
        ↓
showFriendManagementModal()
        ↓
Modal appears with 3 sections
        ↓
User types username in input
        ↓
User clicks "Send Request 📨"
        ↓
sendFriendRequestFromModal()
        ↓
romgonChat.sendFriendRequest(username)
        ↓
Backend processes request
        ↓
Event: chat:friendRequestSent
        ↓
Notification: "Friend request sent! 👥"
        ↓
Input cleared, ready for next request
```

### Accept Friend Request Flow

```
Event: chat:friendRequestReceived
        ↓
showFriendRequestNotification()
        ↓
User opens Friend Management Modal
        ↓
Pending Requests section shows request
        ↓
User clicks "✓ Accept"
        ↓
acceptFriendRequestModal(requestId)
        ↓
romgonChat.acceptFriendRequest(requestId)
        ↓
Backend processes acceptance
        ↓
Event: chat:friendAdded
        ↓
Notification: "Friend added! 🎉"
        ↓
refreshFriendsList() updates modal
        ↓
updatePlayerListFromChat() updates player list
        ↓
Friend appears in Friends tab!
```

---

## 📊 State Management

### Global Variables

```javascript
let currentPlayerListTab = 'all';        // Current active tab
let allOnlinePlayers = [];               // Cache of all online players
let serverPingInterval = null;           // Ping update interval ID
let chatConnected = false;               // Chat connection status
```

### Data Sources

**Online Mode (Chat Connected):**
```javascript
romgonChat.onlineUsers          // Set of online user IDs
romgonChat.friends              // Array of friend objects
romgonChat.getFriendsList()     // Method to get friends
romgonChat.getOnlineUsersCount()// Method to get count
```

**Offline Mode:**
```javascript
allOnlinePlayers = [
    { id: 'player1', name: 'HexMaster', type: 'user', online: true },
    { id: 'player2', name: 'StrategicMind', type: 'user', online: true },
    { id: 'guest_1', name: 'Guest_1234', type: 'guest', online: true }
    // + current user
];
```

---

## 🎬 Animation & Transitions

### Tab Switching
```css
transition: all 0.3s ease;
```
- Background color fades
- Text color changes
- Border appears/disappears

### Player Card Hover
```javascript
onmouseover="this.style.background='rgba(78, 205, 196, 0.2)'"
onmouseout="this.style.background='rgba(78, 205, 196, 0.1)'"
```
- Smooth background highlight on hover

### Modal Open/Close
```css
display: none → display: flex
```
- Instant appearance (no fade for simplicity)

### Button Hover
```css
button:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
}
```
- Slight lift and brighten effect

---

## 📸 Screenshot Guide

### What to Test Visually

1. **Player List Appearance**
   - [ ] Server header with ONLINE badge visible
   - [ ] Player count shows correctly
   - [ ] Refresh button positioned right
   - [ ] Three tabs aligned horizontally
   - [ ] Player cards in grid layout
   - [ ] Avatars pixelated and colored correctly
   - [ ] Server footer with ping/version visible

2. **Tab Switching**
   - [ ] Active tab has gradient background
   - [ ] Inactive tabs have border and semi-transparent bg
   - [ ] Panel visibility toggles correctly
   - [ ] Tab counts update on data change

3. **Friend Modal**
   - [ ] Modal centers on screen
   - [ ] Header with close button (✕)
   - [ ] Three sections clearly separated
   - [ ] Pending requests have accept/reject buttons
   - [ ] Friends have message/remove buttons
   - [ ] Add friend input full-width
   - [ ] Action buttons at bottom

4. **Mobile View**
   - [ ] Player list single column
   - [ ] Tabs wrap or stack
   - [ ] Friend modal full-screen
   - [ ] All buttons 44px+ height
   - [ ] Text readable (14px+)

---

## 🎯 Accessibility Notes

### Keyboard Navigation
- All buttons focusable with Tab
- Enter/Space activates buttons
- Escape closes modal (future enhancement)

### Screen Reader Support
- Emojis provide visual context
- Text labels describe actions
- Button text descriptive ("Accept", "Reject", not just icons)

### Color Contrast
- All text meets WCAG AA standards
- Teal text on dark: 4.5:1+ ratio
- Purple text on dark: 4.5:1+ ratio
- Gold text on dark: 7:1+ ratio

### Touch Targets
- All buttons min 44px height (mobile)
- Player cards min 48px height
- Adequate spacing between buttons (8px+)

---

**Visual Guide Complete! 🎨**

Use this guide to verify the UI looks and behaves as designed.

---

**Created by:** GitHub Copilot  
**Date:** October 21, 2025  
**Purpose:** Visual reference for player list & friend management features
