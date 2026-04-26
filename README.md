# ASX Index Lookup

A web app to identify any ASX-listed company and find out which S&P/ASX indices it belongs to — including ASX 20, 50, 100, 200, 300, All Ordinaries, and Small Ordinaries.

Built with vanilla HTML/CSS/JS, powered by the Anthropic API with live web search.

---

## Features

- Search by company name or ASX ticker code
- Live web search for up-to-date index membership data
- Shows all indices a company belongs to (nested membership handled automatically)
- GICS sector and industry classification
- Market cap category and approximate value
- Search history (session-based)
- Fully responsive — works on mobile and desktop

---

## How to Deploy on GitHub Pages

### Step 1 — Create a GitHub repository

1. Go to [github.com](https://github.com) and sign in
2. Click **New repository**
3. Name it something like `asx-index-lookup`
4. Set it to **Public**
5. Click **Create repository**

### Step 2 — Upload the files

**Option A — GitHub web interface (easiest):**

1. In your new repo, click **Add file → Upload files**
2. Upload all files maintaining the folder structure:
   ```
   index.html
   css/style.css
   js/app.js
   README.md
   ```
3. Click **Commit changes**

**Option B — Git command line:**

```bash
git clone https://github.com/YOUR_USERNAME/asx-index-lookup.git
cd asx-index-lookup

# Copy the app files into this folder, then:
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 3 — Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select **Deploy from a branch**
5. Select branch: **main**, folder: **/ (root)**
6. Click **Save**
7. Wait 1-2 minutes, then visit: `https://YOUR_USERNAME.github.io/asx-index-lookup`

---

## Getting an Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)

When you open the app, paste this key into the setup screen. The key is stored in your browser's session storage only — it is never saved to any server or third party.

> **Note:** The API key is sent directly from your browser to Anthropic's API. This is safe for personal use, but for a public-facing app consider adding a backend proxy to keep the key secret.

---

## API Usage & Costs

Each company lookup makes one call to `claude-sonnet-4-20250514` with web search enabled. A typical search uses approximately 1,000–2,000 tokens total (input + output), which costs roughly **$0.003–$0.006 AUD** per search at current Anthropic pricing.

---

## Data Source

Index membership data is retrieved via **live Anthropic web search** at query time, drawing from sources including:
- ASX official website (asx.com.au)
- S&P Dow Jones Indices
- Market Index, Wikipedia, and other financial data sources

Index membership reflects the most recent quarterly rebalance known to the web search. For officially licensed, real-time constituent data, contact [S&P Dow Jones Indices](https://www.spglobal.com/spdji/en/).

---

## Disclaimer

This app is for **informational purposes only** and is not financial advice. Index membership data may not reflect the very latest quarterly rebalance. Always verify critical investment decisions with official S&P/ASX sources.

---

## Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript
- [Anthropic Messages API](https://docs.anthropic.com/en/api/messages) with web search tool
- Google Fonts (DM Sans + DM Mono)
- No build tools, no frameworks, no npm — just static files
