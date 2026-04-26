/* =====================
   ASX Index Lookup — App Logic
   ===================== */

const STORAGE_KEY = 'asx_anthropic_key';
const HISTORY_KEY = 'asx_search_history';
let searchHistory = [];

/* ---- Initialise ---- */
document.addEventListener('DOMContentLoaded', () => {
  const savedKey = sessionStorage.getItem(STORAGE_KEY);
  if (savedKey) {
    showSearchSection();
  }

  // Load history
  try {
    searchHistory = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');
  } catch { searchHistory = []; }

  renderHistory();

  // Allow Enter key in search
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });

  // Allow Enter key in API key input
  document.getElementById('apiKeyInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveApiKey();
  });
});

/* ---- API Key Management ---- */
function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (!key.startsWith('sk-ant-')) {
    alert('Please enter a valid Anthropic API key starting with "sk-ant-"');
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, key);
  showSearchSection();
}

function resetApiKey() {
  sessionStorage.removeItem(STORAGE_KEY);
  document.getElementById('searchSection').style.display = 'none';
  document.getElementById('apiSetup').style.display = 'block';
  document.getElementById('apiKeyInput').value = '';
  document.getElementById('resultArea').innerHTML = '';
}

function getApiKey() {
  return sessionStorage.getItem(STORAGE_KEY);
}

function showSearchSection() {
  document.getElementById('apiSetup').style.display = 'none';
  document.getElementById('searchSection').style.display = 'block';
}

/* ---- History ---- */
function addToHistory(query) {
  searchHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 8);
  sessionStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory));
  renderHistory();
}

function renderHistory() {
  const bar = document.getElementById('historyBar');
  const chips = document.getElementById('historyChips');
  if (searchHistory.length === 0) {
    bar.style.display = 'none';
    return;
  }
  bar.style.display = 'flex';
  chips.innerHTML = searchHistory
    .map(h => `<button class="chip" onclick="quickSearch('${h.replace(/'/g, "\\'")}')">${h}</button>`)
    .join('');
}

/* ---- Search ---- */
function quickSearch(term) {
  document.getElementById('searchInput').value = term;
  doSearch();
}

async function doSearch() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  const apiKey = getApiKey();
  if (!apiKey) {
    resetApiKey();
    return;
  }

  addToHistory(query);

  const btn = document.getElementById('searchBtn');
  btn.disabled = true;
  btn.textContent = 'Searching...';

  showLoading(query);

  try {
    const result = await lookupCompany(query, apiKey);
    renderResult(result);
  } catch (err) {
    renderError(err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Look up';
  }
}

/* ---- Anthropic API Call ---- */
async function lookupCompany(query, apiKey) {
  const prompt = `You are an expert on the Australian Securities Exchange (ASX) and its S&P/ASX indices. The user is searching for: "${query}"

Use web search to find the most current and accurate information, then return ONLY a raw JSON object (no markdown, no backticks, no explanation) with this structure:

{
  "found": true,
  "companyName": "Full official company name",
  "ticker": "ASX ticker code (uppercase)",
  "sector": "GICS sector name",
  "industry": "GICS industry name",
  "marketCapCategory": "Mega Cap / Large Cap / Mid Cap / Small Cap / Micro Cap",
  "lastKnownMarketCap": "Approximate market cap in AUD, e.g. ~$240B AUD",
  "indices": ["Array of indices from: ASX 20, ASX 50, ASX 100, ASX 200, ASX 300, All Ordinaries, Small Ordinaries"],
  "primaryIndex": "The most exclusive/smallest index it belongs to",
  "summary": "2-3 sentence description of the company and its market standing",
  "note": "Any caveat about data currency, last rebalance date, or index membership confidence"
}

IMPORTANT index membership rules (strictly follow these):
- Indices are nested: ASX 20 ⊂ ASX 50 ⊂ ASX 100 ⊂ ASX 200 ⊂ ASX 300 ⊂ All Ordinaries
- If a company is in ASX 20, it is ALSO in ASX 50, ASX 100, ASX 200, ASX 300, All Ordinaries
- If in ASX 100, it is NOT in Small Ordinaries
- Small Ordinaries = companies in All Ordinaries NOT in ASX 100
- If in ASX 300 but not ASX 200, include: ASX 300, All Ordinaries, Small Ordinaries
- If in All Ordinaries but not ASX 300, include: All Ordinaries, Small Ordinaries
- If not in any major index, return an empty array []

If the company is not found on ASX or not an ASX-listed company:
{"found": false, "message": "Brief explanation of why not found"}

Return ONLY the JSON. No markdown fences.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('Invalid API key. Please check your Anthropic API key and try again.');
    if (response.status === 429) throw new Error('Rate limit reached. Please wait a moment and try again.');
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();

  // Extract text from response (may have multiple content blocks due to tool use)
  const textBlocks = data.content.filter(b => b.type === 'text').map(b => b.text);
  const rawText = textBlocks.join('');

  // Parse JSON from response
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse response from AI. Please try again.');

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Invalid response format. Please try again.');
  }

  return parsed;
}

/* ---- Render States ---- */
function showLoading(query) {
  document.getElementById('resultArea').innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Searching ASX data for <strong>"${escHtml(query)}"</strong>…</p>
      <p style="margin-top:6px;font-size:12px;opacity:0.7;">Using live web search for the most current index information</p>
    </div>
  `;
}

function renderError(err) {
  document.getElementById('resultArea').innerHTML = `
    <div class="error-state">
      <strong>Something went wrong</strong>
      <p>${escHtml(err.message || 'An unexpected error occurred. Please try again.')}</p>
    </div>
  `;
}

function renderResult(data) {
  if (!data.found) {
    document.getElementById('resultArea').innerHTML = `
      <div class="error-state">
        <strong>Company not found</strong>
        <p>${escHtml(data.message || 'This company could not be found on the ASX. Check the ticker or name and try again.')}</p>
      </div>
    `;
    return;
  }

  const indicesHtml = buildIndexBadges(data.indices || []);

  document.getElementById('resultArea').innerHTML = `
    <div class="result-card">
      <div class="result-header">
        <div>
          <div class="company-name">${escHtml(data.companyName || '')}</div>
          <span class="ticker-badge">ASX: ${escHtml(data.ticker || '')}</span>
        </div>
        <div class="market-cap-block">
          <div class="market-cap-value">${escHtml(data.lastKnownMarketCap || '—')}</div>
          <div class="market-cap-label">${escHtml(data.marketCapCategory || '')}</div>
        </div>
      </div>

      <div class="result-indices">
        <h3>Index membership</h3>
        <div class="index-badges">
          ${indicesHtml || '<span class="index-badge idx-unknown">Not in major indices</span>'}
        </div>
      </div>

      <div class="result-details">
        <div class="detail-block">
          <div class="detail-label">Primary index</div>
          <div class="detail-value">${escHtml(data.primaryIndex || '—')}</div>
        </div>
        <div class="detail-block">
          <div class="detail-label">Sector</div>
          <div class="detail-value">${escHtml(data.sector || '—')}</div>
        </div>
        <div class="detail-block">
          <div class="detail-label">Industry</div>
          <div class="detail-value">${escHtml(data.industry || '—')}</div>
        </div>
        <div class="detail-block">
          <div class="detail-label">Market cap tier</div>
          <div class="detail-value">${escHtml(data.marketCapCategory || '—')}</div>
        </div>
      </div>

      ${data.summary ? `<div class="result-summary">${escHtml(data.summary)}</div>` : ''}

      ${data.note ? `<div class="result-note">⚠ ${escHtml(data.note)}</div>` : ''}
    </div>
  `;
}

/* ---- Index Badge Builder ---- */
function buildIndexBadges(indices) {
  const classMap = {
    'ASX 20':          'idx-asx20',
    'ASX 50':          'idx-asx50',
    'ASX 100':         'idx-asx100',
    'ASX 200':         'idx-asx200',
    'ASX 300':         'idx-asx300',
    'All Ordinaries':  'idx-allords',
    'Small Ordinaries':'idx-smallords',
  };

  // Preferred display order
  const order = ['ASX 20', 'ASX 50', 'ASX 100', 'ASX 200', 'ASX 300', 'All Ordinaries', 'Small Ordinaries'];
  const sorted = [...indices].sort((a, b) => order.indexOf(a) - order.indexOf(b));

  return sorted.map(idx => {
    const cls = classMap[idx] || 'idx-unknown';
    return `<span class="index-badge ${cls}">${escHtml(idx)}</span>`;
  }).join('');
}

/* ---- Utility ---- */
function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
