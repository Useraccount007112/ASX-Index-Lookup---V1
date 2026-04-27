/* ASX Index Lookup — app.js v2 */

const HISTORY_KEY = 'asx_history_v2';
const API_KEY     = 'asx_api_key_v2';
let history = [];

document.addEventListener('DOMContentLoaded', () => {
  try { history = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]'); } catch { history = []; }
  renderHistory();
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });
  document.getElementById('apiKeyInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveApiKey();
  });
});

/* ── UI helpers ── */
function toggleAiPanel() {
  const p = document.getElementById('aiPanel');
  p.style.display = p.style.display === 'none' ? 'block' : 'none';
}

function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (!key.startsWith('sk-ant-')) { alert('Please enter a valid Anthropic API key (starts with sk-ant-)'); return; }
  sessionStorage.setItem(API_KEY, key);
  document.getElementById('aiPanel').style.display = 'none';
  doSearch();
}

function quickSearch(term) {
  document.getElementById('searchInput').value = term;
  doSearch();
}

function addHistory(q) {
  history = [q, ...history.filter(h => h !== q)].slice(0, 8);
  sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const bar = document.getElementById('historyBar');
  const chips = document.getElementById('historyChips');
  if (!history.length) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  chips.innerHTML = history.map(h =>
    `<button class="chip" onclick="quickSearch('${h.replace(/'/g,"\\'")}'">${h}</button>`
  ).join('');
}

/* ── Main search ── */
function doSearch() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;
  addHistory(query);

  // 1. Try local data first
  const results = asxLookup(query);

  if (results.length === 1) {
    renderResult(results[0]);
    return;
  }
  if (results.length > 1) {
    renderMulti(results, query);
    return;
  }

  // 2. No local match — try AI if key exists
  const apiKey = sessionStorage.getItem(API_KEY);
  if (apiKey) {
    aiLookup(query, apiKey);
  } else {
    renderNotFound(query);
  }
}

/* ── Render: multiple matches ── */
function renderMulti(results, query) {
  const idxClass = { "ASX 20":"idx-asx20","ASX 50":"idx-asx50","ASX 100":"idx-asx100",
                     "ASX 200":"idx-asx200","ASX 300":"idx-asx300" };
  const rows = results.slice(0, 12).map(d => `
    <div class="multi-result-row" onclick="renderResult(${JSON.stringify(d).replace(/"/g,'&quot;')})">
      <span class="mr-ticker">${d.ticker}</span>
      <span class="mr-name">${d.company}</span>
      <span class="mr-index index-badge ${idxClass[d.primary] || 'idx-asx300'}">${d.primary}</span>
    </div>`).join('');

  document.getElementById('resultArea').innerHTML = `
    <div class="multi-results">
      <h3>${results.length} result${results.length > 1 ? 's' : ''} for "${escHtml(query)}" — click to view</h3>
      ${rows}
      ${results.length > 12 ? `<p style="font-size:12px;color:var(--text-3);padding:8px">...and ${results.length-12} more. Try a more specific search.</p>` : ''}
    </div>`;
}

/* ── Render: single result ── */
function renderResult(d) {
  if (typeof d === 'string') { try { d = JSON.parse(d); } catch { return; } }

  const idxClass = {
    "ASX 20":"idx-asx20","ASX 50":"idx-asx50","ASX 100":"idx-asx100",
    "ASX 200":"idx-asx200","ASX 300":"idx-asx300",
    "All Ordinaries":"idx-allords","Small Ordinaries":"idx-smallords"
  };

  const badges = (d.indices || []).map(idx =>
    `<span class="index-badge ${idxClass[idx] || ''}">${idx}</span>`
  ).join('');

  const newBadge = d.newMar2026 ? '<span class="new-badge">★ New Mar 2026</span>' : '';
  const isAI = d.source === 'ai';

  document.getElementById('resultArea').innerHTML = `
    <div class="result-card">
      <div class="result-header">
        <div>
          <div class="company-name">${escHtml(d.company || d.companyName || '')}${newBadge}</div>
          <span class="ticker-badge">ASX: ${escHtml(d.ticker)}</span>
        </div>
        ${d.lastKnownMarketCap ? `<div style="text-align:right">
          <div style="font-size:18px;font-weight:600;font-family:'DM Mono',monospace">${escHtml(d.lastKnownMarketCap)}</div>
          <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin-top:2px">${escHtml(d.marketCapCategory||'')}</div>
        </div>` : ''}
      </div>
      <div class="result-indices">
        <h3>Index membership</h3>
        <div class="index-badges">${badges || '<span style="font-size:13px;color:var(--text-3)">Not in a major S&P/ASX index</span>'}</div>
      </div>
      <div class="result-details">
        <div>
          <div class="detail-label">Primary index</div>
          <div class="detail-value">${escHtml(d.primary || d.primaryIndex || '—')}</div>
        </div>
        <div>
          <div class="detail-label">Sector</div>
          <div class="detail-value">${escHtml(d.sector || '—')}</div>
        </div>
        ${d.industry ? `<div><div class="detail-label">Industry</div><div class="detail-value">${escHtml(d.industry)}</div></div>` : ''}
        ${d.marketCapCategory ? `<div><div class="detail-label">Market cap tier</div><div class="detail-value">${escHtml(d.marketCapCategory)}</div></div>` : ''}
      </div>
      ${d.summary ? `<div style="padding:16px 26px;font-size:14px;color:var(--text-2);line-height:1.7;border-bottom:1px solid var(--border)">${escHtml(d.summary)}</div>` : ''}
      <div class="result-note">
        ${isAI ? '🤖 Result sourced via Anthropic AI web search — ' : '📅 Data from '}
        S&P/ASX March 2026 rebalance (effective 23 March 2026)
        ${d.newMar2026 ? ' · ★ This company was <strong>newly added</strong> in the March 2026 rebalance' : ''}
      </div>
    </div>`;
}

/* ── Render: not found ── */
function renderNotFound(query) {
  document.getElementById('resultArea').innerHTML = `
    <div class="error-state">
      <strong>"${escHtml(query)}" not found in the March 2026 index data</strong>
      <p style="margin-top:8px;font-size:13px">This company may be listed on ASX but not in the top 300, or the name/ticker may be different.
      Use <strong>AI lookup</strong> (button above) to search all ~2,400 ASX-listed companies using live web search.</p>
    </div>`;
}

/* ── AI Lookup via Anthropic API ── */
async function aiLookup(query, apiKey) {
  const area = document.getElementById('resultArea');
  area.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div><p>Searching with AI for "<strong>${escHtml(query)}</strong>"…</p><p style="font-size:12px;margin-top:6px;opacity:.7">Using live web search for current data</p></div>`;

  const prompt = `You are an ASX index expert. Search for "${query}" and return ONLY raw JSON (no markdown):
{
  "found": true,
  "ticker": "ASX ticker",
  "companyName": "Full name",
  "sector": "GICS sector",
  "industry": "GICS industry",
  "marketCapCategory": "Large/Mid/Small/Micro Cap",
  "lastKnownMarketCap": "e.g. ~$2.4B AUD",
  "indices": ["from: ASX 20,ASX 50,ASX 100,ASX 200,ASX 300,All Ordinaries,Small Ordinaries"],
  "primaryIndex": "most exclusive index",
  "summary": "2 sentence description"
}
Rules: ASX 20⊂50⊂100⊂200⊂300⊂All Ords. Small Ords = All Ords minus ASX 100.
If not found: {"found":false,"message":"reason"}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error('Invalid API key. Check your Anthropic key.');
      if (res.status === 429) throw new Error('Rate limit — wait a moment and try again.');
      throw new Error(e.error?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Could not parse AI response.');
    const parsed = JSON.parse(match[0]);

    if (!parsed.found) {
      area.innerHTML = `<div class="error-state"><strong>Not found</strong><p>${escHtml(parsed.message || 'This company could not be found on ASX.')}</p></div>`;
      return;
    }

    renderResult({ ...parsed,
      company: parsed.companyName,
      primary: parsed.primaryIndex,
      source: 'ai'
    });
  } catch (err) {
    area.innerHTML = `<div class="error-state"><strong>AI lookup failed</strong><p>${escHtml(err.message)}</p></div>`;
  }
}

function escHtml(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
