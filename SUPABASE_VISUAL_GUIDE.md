# 👀 Supabase Visual Guide

## What You're Looking At

You're on the **Database → Replication → Publications** page in Supabase.

---

## 🎯 What to Look For

### The Page Layout

You should see something like this:

```
┌─────────────────────────────────────────────────────┐
│  Database > Replication > Publications              │
├─────────────────────────────────────────────────────┤
│                                                      │
│  supabase_realtime                                  │
│                                                      │
│  Tables in this publication:                        │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Table Name          Toggle                  │  │
│  ├──────────────────────────────────────────────┤  │
│  │  players             [  ON  ]  or  [ OFF ]   │  │
│  │  games               [  ON  ]  or  [ OFF ]   │  │ ← FIND THIS!
│  │  other_table         [  ON  ]  or  [ OFF ]   │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## ✅ What You Need to Do

### Find the `games` Row

Look through the list of tables and find the one that says **`games`**

### Check the Toggle

Next to `games`, you'll see a toggle switch. It can be in two states:

**Option 1: Already ON (Green)**
```
games    [ 🟢 ON ]
```
✅ Perfect! You're done! Real-time is already enabled.

**Option 2: Currently OFF (Gray)**
```
games    [ ⚪ OFF ]
```
❌ Click the toggle to turn it ON. It will turn green.

---

## 🔍 How to Identify the Toggle State

### ON (Enabled):
- Color: Green or Blue
- Position: Right side
- May show: "ON", "Enabled", or a checkmark ✓
- Background: Colored (not gray)

### OFF (Disabled):
- Color: Gray or White
- Position: Left side
- May show: "OFF", "Disabled", or empty
- Background: Gray or transparent

---

## 🎯 After Enabling

Once you click the toggle and it turns green:

1. ✅ Real-time is enabled
2. ✅ Changes to the `games` table will broadcast to all connected clients
3. ✅ Your friend game system will work in real-time
4. ✅ Moves will sync instantly between players

---

## 🧪 Test It Immediately

After enabling:

1. Open http://localhost:3001
2. Create a game
3. Join from another browser
4. Make moves and watch them sync instantly!

---

## 📸 Visual Reference

### What the Toggle Looks Like

**OFF State:**
```
┌─────────────┐
│ ⚪ OFF      │  ← Gray, left position
└─────────────┘
```

**ON State:**
```
┌─────────────┐
│      ON 🟢  │  ← Green, right position
└─────────────┘
```

### The Full Row

**Before (OFF):**
```
games    [ ⚪ OFF ]    ← Click here
```

**After (ON):**
```
games    [ 🟢 ON ]     ← Success!
```

---

## 💡 Pro Tip

If you can't find the `games` table:
1. Use Ctrl+F (or Cmd+F on Mac)
2. Search for "games"
3. It should highlight the row

---

## ✅ Confirmation

You'll know it worked when:
- Toggle is green/blue (not gray)
- Toggle is on the right side (not left)
- May show "ON" or "Enabled" text
- Background is colored

That's it! Once you see the green toggle, you're ready to test! 🎉

