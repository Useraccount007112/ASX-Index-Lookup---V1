# ASX Index Lookup — Web App

A fast, searchable web app showing every company's S&P/ASX index membership based on the **March 2026 quarterly rebalance**.

**Live demo:** `https://YOUR_USERNAME.github.io/asx-index-lookup`

---

## What's included

| File | Purpose |
|------|---------|
| `index.html` | Main page |
| `css/style.css` | All styles |
| `js/app.js` | Search logic |
| `data/asx-data.js` | 267 companies, March 2026 index data |

---

## How to upload to GitHub (step by step)

### Step 1 — Go to GitHub and create a repository

1. Open [github.com](https://github.com) and sign in
2. Click the **+** button (top right) → **New repository**
3. Set:
   - **Repository name:** `asx-index-lookup`
   - **Visibility:** Public ✅
4. Click **Create repository**

---

### Step 2 — Upload the files

On the empty repo page, click **"uploading an existing file"**

You need to upload files into the correct folders. Do this in **4 rounds**:

**Round 1 — Root file:**
- Drag `index.html` into the upload box
- Scroll down, type commit message: `Add index.html`
- Click **Commit changes**

**Round 2 — CSS folder:**
- Click **Add file → Upload files**
- In the path box at the top, type: `css/style.css` (this creates the folder automatically)
- Drag `style.css` into the box
- Click **Commit changes**

**Round 3 — JS folder:**
- Click **Add file → Upload files**
- Type path: `js/app.js`
- Drag `app.js` into the box
- Click **Commit changes**

**Round 4 — Data folder:**
- Click **Add file → Upload files**
- Type path: `data/asx-data.js`
- Drag `asx-data.js` into the box
- Click **Commit changes**

**Round 5 — README:**
- Click **Add file → Upload files**
- Drag `README.md`
- Click **Commit changes**

---

### Step 3 — Enable GitHub Pages

1. Click **Settings** in your repo
2. Click **Pages** in the left sidebar
3. Under **Source** → select **Deploy from a branch**
4. Branch: **main** | Folder: **/ (root)**
5. Click **Save**
6. Wait 1–2 minutes

Your site will be live at:
```
https://YOUR_USERNAME.github.io/asx-index-lookup
```

---

## Features

- **267 companies** with March 2026 index data built in — no API key needed for these
- **Instant search** by company name or ticker
- **Multiple matches** shown as a clickable list
- **AI fallback** for any company not in the top 300 (requires Anthropic API key)
- **★ New additions** from the March 2026 rebalance highlighted
- Fully responsive — works on mobile

## March 2026 Rebalance Summary

| Index | Added | Removed |
|-------|-------|---------|
| ASX 20 | Northern Star (NST) | Santos (STO) |
| ASX 50 | Light & Wonder (LNW), Pilbara Minerals (PLS) | Seek (SEK), Technology One (TNE) |
| ASX 100 | Greatland (GRL), Regis (RRL), Westgold (WGX) | Lendlease (LLC), Netwealth (NWL), Pinnacle (PNI) |
| ASX 200 | Predictive Discovery (PDC), SRG Global (SRG), Vulcan Energy (VUL) | Catapult (CAT), DigiCo REIT (DGT), EBOS Group (EBO) |
| ASX 300 | 4DMedical, Arafura, DPM Metals, Elevra Lithium, GemLife, Turaco Gold | — |

## Disclaimer

For informational purposes only. Not financial advice. Index data reflects the S&P/ASX March 2026 quarterly rebalance (effective 23 March 2026). Always verify with official S&P Dow Jones Indices sources.
