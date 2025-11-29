const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

const btnConnect = $("#connectWallet");
const btnConnectLabel = btnConnect?.querySelector(".btn__label");
const btnDisconnect = $("#disconnectWallet");
const btnCreate = $("#createTokenBtn");
const badgeAddr = $("#walletAddr");
const btnClaim = $("#claimCreatorFeesBtn");
const projectMarketCard = document.querySelector("[data-marketcap-card]");
const navSoonButtons = $$("[data-soon-toast]");
const viewHome = document.querySelector("[data-view='home']");
const viewProject = document.querySelector("[data-view='project']");
const projectBackBtn = document.querySelector("[data-project-back]");
const projectTags = document.querySelector("[data-project-tags]");
const projectTitle = document.querySelector("[data-project-title]");
const projectSubtitle = document.querySelector("[data-project-subtitle]");
const projectCreatorAvatar = document.querySelector("[data-project-creator-avatar]");
const projectCreatorName = document.querySelector("[data-project-creator-name]");
const projectImage = document.querySelector("[data-project-image]");
const projectDescription = document.querySelector("[data-project-description]");
const projectBackersEl = document.querySelector("[data-project-backers]");
const projectDaysEl = document.querySelector("[data-project-days]");

const BASE_PATH = (() => {
  const path = window.location.pathname || "/";
  if (path.endsWith("/")) return path;
  return path.replace(/[^/]+$/, "/");
})();

const modalCreate = $("#modalCreateToken");
const closeCreate = $("#closeCreateToken");
const cancelCreate = $("#cancelCreateToken");
const submitCreate = $("#submitCreateToken");

const inpImageFile = $("#ctImageFile");
const inpImage = $("#ctImage");
const inpName = $("#ctName");
const inpSymbol = $("#ctSymbol");
const inpBuyAmount = $("#ctBuyAmount");

const API_BASE = "";

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
    <rect width='120' height='120' fill='#1f2937'/>
    <circle cx='60' cy='48' r='22' fill='#374151'/>
    <rect x='22' y='80' width='76' height='18' rx='9' fill='#374151'/>
  </svg>`);

const MANUAL_TOKENS = [
  {
    mint: "XQ2xvSxKh5sZqJxoRpby23p3K5WHQTEgN4pzVA1KNET",
    name: "Agent Joi",
    symbol: "Joi",
    category: "Agent",
    description:
      "Next-generation artificial intelligence assistant to help you manage daily tasks and boost productivity.",
    subtitle:
      "Next-generation artificial intelligence assistant to help you manage daily tasks and boost productivity.",
    longDescription: [
      "Agent Joi is introduced as the demonstrative character of the Kingnet AI Semantic Game Production System. Her role is to showcase how the platform can transform simple natural-language instructions into complete 3D game-development processes. She represents the connection between user intention and high-level technical execution.",
      "Through Joi, the system highlights the ability to automate traditionally complex animation and development tasks, including skeletal framework generation, keyframe sequence creation, synchronized logic binding, and UI interface generation. With only a one-sentence requirement, the platform intelligently orchestrates multiple stages of the production pipeline without manual configuration.",
      "Joi symbolizes the technological breakthrough toward industrial-grade execution driven entirely by natural language. By demonstrating drastic efficiency improvements and the unification of animation, logic, and physics, she embodies the concept of accelerated, semantic-based production that reduces development time from hundreds of manual hours to a fully automated flow.",
    ],
    image:
      "http://ipfs.io/ipfs/bafybeiesumu7xva5biuftri7626ftvamedkka6znhntza6lzjd7lqvo56a",
    pledged: null,
    goal: 500000,
    backers: 1230,
    daysLeft: 15,
    creator: "KingnetAI",
    isTrending: true,
    marketCap: null,
    createdAt: Date.UTC(2024, 10, 4),
    route: "agentjoi",
  },
];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result).split(",")[1]);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

function escapeHTML(s) {
  return String(s ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));
}

function toHttpImage(u) {
  if (!u) return "";
  const s = String(u).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const cid = s.startsWith("ipfs://")
    ? s.slice(7).replace(/^ipfs\//i, "")
    : (s.match(/\/ipfs\/([^/?#]+)/i)?.[1] || "");
  return cid ? `${IPFS_GATEWAY.replace(/\/+$/, "")}/${cid}` : s;
}

function truncateMiddle(str, head = 6, tail = 6) {
  if (!str) return "";
  if (str.length <= head + tail + 3) return str;
  return `${str.slice(0, head)}…${str.slice(-tail)}`;
}

function fmtMoney(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  try {
    return Number(n).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  } catch {
    return "$" + n;
  }
}

function fmtNumber(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  try {
    return Number(n).toLocaleString("en-US");
  } catch {
    return String(n);
  }
}

function shortPk(pk) {
  const s = String(pk || "");
  return s.length > 12 ? `${s.slice(0, 6)}…${s.slice(-6)}` : s;
}

function formIsValid() {
  const name = inpName.value.trim();
  const symbol = inpSymbol.value.trim();
  const buyAmt = parseFloat(inpBuyAmount.value);
  const hasFile = inpImageFile?.files && inpImageFile.files[0];
  const url = inpImage?.value?.trim() || "";
  const imageOk = Boolean(hasFile || url);
  return Boolean(
    name && symbol && !Number.isNaN(buyAmt) && buyAmt > 0 && imageOk
  );
}

function updateSubmitState() {
  if (submitCreate) submitCreate.disabled = !formIsValid();
}

[inpName, inpSymbol, inpBuyAmount, inpImage].forEach((el) =>
  el?.addEventListener("input", updateSubmitState)
);
inpImageFile?.addEventListener("change", updateSubmitState);

// ===== Whitelist helper =====
function isWalletWhitelisted(pk) {
  const addr = String(pk || "").trim();
  if (!addr) return false;
  const list = CREATOR_WHITELIST.map((s) => s.trim()).filter(Boolean);
  if (!list.length) return true; // allow any wallet when the whitelist is empty
  return list.some((w) => w === addr);
}

// ===== Tx helpers =====
function base64ToUint8Array(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function uint8ToBase64(u8) {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}

async function relaySignedTxBase64(signedB64) {
  const r = await fetch("/api/send-tx", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ txBase64: signedB64 }),
  });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || "send failed");
  return j.signature;
}

async function signSendConfirmV0TxBase64(b64, wallet) {
  const bytes = base64ToUint8Array(b64);
  let tx;
  try {
    tx = solanaWeb3.VersionedTransaction.deserialize(bytes);
  } catch {
    tx = solanaWeb3.Transaction.from(bytes);
  }
  const signed = await wallet.signTransaction(tx);
  return await relaySignedTxBase64(uint8ToBase64(signed.serialize()));
}

async function sendTxsBase64Sequential(txsBase64, wallet) {
  const sigs = [];
  for (const b64 of txsBase64 || []) {
    const sig = await signSendConfirmV0TxBase64(b64, wallet);
    sigs.push(sig);
  }
  return sigs;
}

// ===== Wallet connect =====

let wallet, pubkey;

function getProviders() {
  const w = window;
  return {
    phantom: w.solana?.isPhantom ? w.solana : null,
    solflare: w.solflare?.isSolflare ? w.solflare : null,
  };
}

async function connectAny() {
  const { phantom, solflare } = getProviders();
  const provider = phantom || solflare;
  if (!provider) {
    alert("Install Phantom or Solflare to connect your wallet.");
    window.open("https://phantom.app/", "_blank");
    return null;
  }
  await provider.connect();
  return provider;
}

async function ensureWallet() {
  if (wallet?.publicKey) return wallet;
  wallet = await connectAny();
  pubkey = wallet?.publicKey?.toString?.();
  if (pubkey) {
    badgeAddr.textContent = shortPk(pubkey);
    badgeAddr.style.display = "inline-flex";
    if (btnConnectLabel) {
      btnConnectLabel.textContent = "Connected";
    } else if (btnConnect) {
      btnConnect.textContent = "Connected";
    }
    if (btnDisconnect) btnDisconnect.style.display = "inline-block";

    const allowed = isWalletWhitelisted(pubkey);
    if (allowed) {
      if (btnCreate) btnCreate.style.display = "inline-block";
      if (btnClaim) btnClaim.style.display = "inline-block";
    } else {
      if (btnCreate) btnCreate.style.display = "none";
      if (btnClaim) btnClaim.style.display = "none";
    }
  }
  return wallet;
}

btnConnect?.addEventListener("click", ensureWallet);

btnDisconnect?.addEventListener("click", async () => {
  try {
    if (wallet?.disconnect) await wallet.disconnect();
  } catch {}
  wallet = null;
  pubkey = null;
  badgeAddr.style.display = "none";
  if (btnConnectLabel) {
    btnConnectLabel.textContent = "Connect Wallet";
  } else if (btnConnect) {
    btnConnect.textContent = "Connect Wallet";
  }
  if (btnCreate) btnCreate.style.display = "none";
  if (btnDisconnect) btnDisconnect.style.display = "none";
  if (btnClaim) btnClaim.style.display = "none";
});

btnClaim?.addEventListener("click", async () => {
  try {
    const w = await ensureWallet();
    if (!w?.publicKey) return;

    btnClaim.disabled = true;
    const prev = btnClaim.textContent;
    btnClaim.textContent = "Claiming…";

    const r = await fetch("/api/claim-creator-fee", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payer: wallet.publicKey.toBase58() }),
    });
    const j = await r.json();

    if (!j.ok) {
      if (j.reason === "not-eligible") {
        alert("This wallet hasn't deployed any token on this site. Claim not allowed.");
      } else if (j.reason === "nothing-to-claim") {
        alert("No creator fees available to claim.");
      } else {
        alert(j.error || "Claim failed.");
      }
      return;
    }

    const txs = j.txsBase64 || (j.txBase64 ? [j.txBase64] : []);
    if (!txs.length) {
      alert("No transaction to sign.");
      return;
    }

    const sigs = await sendTxsBase64Sequential(txs, wallet);
    alert("Creator fees claimed!\n" + sigs.join("\n"));
  } catch (e) {
    console.error(e);
    alert(String(e?.message || e));
  } finally {
    btnClaim.disabled = false;
    btnClaim.textContent = "Claim creator fees";
  }
});

// ===== Create token modal =====

function openCreateModal() {
  modalCreate.classList.add("is-open");
  modalCreate.setAttribute("aria-hidden", "false");
  if (inpImageFile) inpImageFile.value = "";
  if (inpImage) inpImage.value = "";
  inpName.value = "";
  inpSymbol.value = "";
  inpBuyAmount.value = "";
  updateSubmitState();
}

function closeCreateModal() {
  modalCreate.classList.remove("is-open");
  modalCreate.setAttribute("aria-hidden", "true");
}

btnCreate?.addEventListener("click", async () => {
  const w = await ensureWallet();
  if (!w) return;
  if (!isWalletWhitelisted(pubkey)) {
    alert("This wallet is not allowed to create tokens on Kingnet.");
    return;
  }
  openCreateModal();
});

closeCreate?.addEventListener("click", closeCreateModal);
cancelCreate?.addEventListener("click", closeCreateModal);

submitCreate?.addEventListener("click", async (e) => {
  e.preventDefault();
  if (!formIsValid()) {
    updateSubmitState();
    return;
  }

  const name = inpName.value.trim();
  const symbol = inpSymbol.value.trim().toUpperCase();
  const buyAmt = parseFloat(inpBuyAmount.value);
  const hasFile = inpImageFile?.files && inpImageFile.files[0];
  let imageUrl = inpImage?.value?.trim() || "";

  try {
    await ensureWallet();
    if (!isWalletWhitelisted(pubkey)) {
      alert("This wallet is not allowed to create tokens on Kingnet.");
      return;
    }

    if (hasFile) {
      const f = inpImageFile.files[0];
      const base64 = await fileToBase64(f);
      const up = await fetch(`${API_BASE}/api/upload-image`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          filename: f.name,
          contentType: f.type || "application/octet-stream",
          base64,
        }),
      });
      if (!up.ok) throw new Error(`upload failed (${up.status})`);
      const uj = await up.json();
      if (!uj.ok) throw new Error(uj.error || "upload failed");
      imageUrl = uj.imageUri;
    }

    // The backend expects the buy amount already expressed in SOL
    const r = await fetch(`${API_BASE}/api/prepare-launchpad`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        payer: pubkey,
        name,
        symbol,
        image: imageUrl,
        buyAmountSol: String(buyAmt),
      }),
    });
    if (!r.ok) throw new Error(`prepare failed (${r.status})`);
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "prepare failed");

    const list1 = j.body?.txsBase64 ?? j.txsBase64 ?? [];
    if (list1.length) {
      await sendTxsBase64Sequential(list1, wallet);
    }

    if (j.needsAta) {
      const r2 = await fetch(`${API_BASE}/api/prepare-launchpad`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          payer: pubkey,
          name,
          symbol,
          image: imageUrl,
          buyAmountSol: String(buyAmt),
        }),
      });
      const j2 = await r2.json();
      const list2 = j2.body?.txsBase64 ?? j2.txsBase64 ?? [];
      if (list2.length) {
        await sendTxsBase64Sequential(list2, wallet);
      }
    }

    if (j.mint) {
      fetch("/api/tokens", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mint: j.mint,
          name,
          symbol,
          image: imageUrl,
          metadata: j.metadataUri,
          creator: wallet.publicKey.toBase58(),
          platformId: j.platformId,
          mintSource: j.mintSource,
        }),
      }).catch(() => {});
      await reloadAndRenderCurrentTab();
    }

    alert("Launch submitted! Check the explorer.");
  } catch (e) {
    console.error(e);
    alert(String(e?.message || e));
  } finally {
    closeCreateModal();
  }
});

// ===== Token list / grid =====

const GRID = $("#grid");
const tabSelector = $("#tabSelector");
const searchInp = $("#search");
const pagePrev = $("#pagePrev");
const pageNext = $("#pageNext");
const pageLbl = $("#pageLabel");

const PAGE_SIZE = 12;
let CURRENT_TAB = "featured";
let CURRENT_PAGE = 1;
let SEARCH_TEXT = "";
let TOKENS = [];
let HAS_MARKET_CAP_UPDATE = false;

function normalizeRoute(route) {
  return String(route ?? "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

function buildPathForRoute(route) {
  const normalized = normalizeRoute(route);
  if (!normalized) return BASE_PATH || "/";
  const base = BASE_PATH || "/";
  return `${base}${normalized}`;
}

function routeFromLocation() {
  const path = window.location.pathname || "/";
  const base = BASE_PATH || "/";
  let suffix = path.startsWith(base) ? path.slice(base.length) : path;
  suffix = suffix.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!suffix) return "";
  if (/^index(\.html?)?$/i.test(suffix)) return "";
  return normalizeRoute(suffix);
}

function findTokenByRoute(route) {
  const normalized = normalizeRoute(route);
  if (!normalized) return null;
  return (
    TOKENS.find((token) => token.routeKey === normalized || normalizeRoute(token.route) === normalized) ||
    null
  );
}

function creatorInitials(name) {
  const parts = String(name || "")
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function populateProjectView(token) {
  if (!token) return;
  if (projectTags) {
    projectTags.innerHTML = "";
    if (token.category) {
      const span = document.createElement("span");
      span.className = "project-tag";
      span.textContent = token.category;
      projectTags.appendChild(span);
    }
    if (token.isTrending) {
      const span = document.createElement("span");
      span.className = "project-tag project-tag--accent";
      span.textContent = "Trending";
      projectTags.appendChild(span);
    }
  }
  if (projectTitle) projectTitle.textContent = token.name || "Project";
  if (projectSubtitle) {
    projectSubtitle.textContent = token.subtitle || token.description || "";
  }
  if (projectCreatorName) projectCreatorName.textContent = token.creator || "—";
  if (projectCreatorAvatar) {
    projectCreatorAvatar.textContent = creatorInitials(token.creator);
  }
  if (projectImage) {
    const src = toHttpImage(token.image || "") || PLACEHOLDER_IMG;
    projectImage.src = src;
    projectImage.alt = token.name || token.symbol || "Project image";
  }
  if (projectDescription) {
    const paragraphs = Array.isArray(token.longDescription)
      ? token.longDescription
      : token.longDescription
      ? [token.longDescription]
      : [];
    const source = paragraphs.length
      ? paragraphs
      : token.description
      ? [token.description]
      : [];
    if (source.length) {
      projectDescription.innerHTML = source
        .map((text) => `<p>${escapeHTML(text)}</p>`)
        .join("");
    } else {
      projectDescription.innerHTML = "<p>Details coming soon.</p>";
    }
  }
  if (projectBackersEl) {
    projectBackersEl.textContent =
      token.backers != null ? fmtNumber(token.backers) : "—";
  }
  if (projectDaysEl) {
    projectDaysEl.textContent =
      token.daysLeft != null ? fmtNumber(token.daysLeft) : "—";
  }

  if (projectMarketCard) {
    const goal = Number(token.goal) || 0;
    const amount = token.marketCap ?? token.pledged ?? null;
    projectMarketCard.setAttribute("data-marketcap-mint", token.mint || "");
    projectMarketCard.setAttribute("data-marketcap-goal", String(goal));
    const amountEl = projectMarketCard.querySelector("[data-marketcap-amount]");
    const statusEl = projectMarketCard.querySelector("[data-marketcap-status]");
    const progressEl = projectMarketCard.querySelector("[data-marketcap-progress]");
    const updatedEl = projectMarketCard.querySelector("[data-marketcap-updated]");
    if (statusEl) statusEl.textContent = "Market Cap (USD)";
    if (amountEl) amountEl.textContent = amount != null ? fmtMoney(amount) : "—";
    if (progressEl) {
      const pct = goal > 0 && amount != null ? Math.min(100, Math.max(0, (amount / goal) * 100)) : 0;
      progressEl.style.width = `${pct}%`;
    }
    if (updatedEl) updatedEl.textContent = "—";
  }
}

function showProjectView(token, { replaceHistory = false, skipHistory = false } = {}) {
  if (!viewProject || !viewHome) return;
  populateProjectView(token);
  viewHome.classList.add("is-hidden");
  viewProject.classList.remove("is-hidden");
  if (!skipHistory && window.history?.pushState) {
    const routeKey = token.routeKey || normalizeRoute(token.route);
    const path = routeKey ? buildPathForRoute(routeKey) : buildPathForRoute("");
    const state = { route: routeKey };
    if (replaceHistory) {
      history.replaceState(state, "", path);
    } else {
      history.pushState(state, "", path);
    }
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showHome({ replaceHistory = false, skipHistory = false } = {}) {
  if (viewHome) viewHome.classList.remove("is-hidden");
  if (viewProject) viewProject.classList.add("is-hidden");
  if (!skipHistory && window.history?.pushState) {
    const path = buildPathForRoute("");
    const state = { route: "" };
    if (replaceHistory) {
      history.replaceState(state, "", path);
    } else {
      history.pushState(state, "", path);
    }
  }
}

function handleRouteChange(route, { replaceHistory = false, skipHistory = false } = {}) {
  const normalized = normalizeRoute(route);
  const token = normalized ? findTokenByRoute(normalized) : null;
  if (token) {
    showProjectView(token, { replaceHistory, skipHistory });
  } else {
    showHome({ replaceHistory, skipHistory });
  }
}

function computeRows() {
  let rows = TOKENS.slice();
  if (SEARCH_TEXT) {
    const s = SEARCH_TEXT.toLowerCase();
    rows = rows.filter(
      (r) =>
        (r.name && r.name.toLowerCase().includes(s)) ||
        (r.symbol && r.symbol.toLowerCase().includes(s)) ||
        (r.mint && r.mint.toLowerCase().includes(s))
    );
  }
  if (CURRENT_TAB === "new") {
    rows.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  } else if (CURRENT_TAB === "featured") {
    rows.sort((a, b) => Number(b.marketCap || 0) - Number(a.marketCap || 0));
  } else {
    rows.sort(
      (a, b) =>
        String(a.name || "").localeCompare(String(b.name || "")) ||
        Number(b.createdAt || 0) - Number(a.createdAt || 0)
    );
  }
  return rows;
}

function renderPage() {
  if (!GRID) return;
  const rowsAll = computeRows();
  const total = rowsAll.length;
  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  CURRENT_PAGE = Math.min(CURRENT_PAGE, maxPage);
  const start = (CURRENT_PAGE - 1) * PAGE_SIZE;
  const pageRows = rowsAll.slice(start, start + PAGE_SIZE);
  GRID.innerHTML = "";
  const fallbackImg = escapeHTML(PLACEHOLDER_IMG);
  if (!pageRows.length) {
    GRID.innerHTML = `<div class="empty">No projects yet. Update MANUAL_TOKENS in script.js to list them here.</div>`;
  } else {
    for (const t of pageRows) {
      const displayedCA = truncateMiddle(t.mint || "", 4, 4);
      const rawPledged = t.marketCap ?? t.pledged;
      const pledgedValue = rawPledged != null ? Number(rawPledged) : null;
      const pledged = Number.isFinite(pledgedValue) ? pledgedValue : null;
      const rawGoal = t.goal;
      const goalValue = rawGoal != null ? Number(rawGoal) : null;
      const goal = Number.isFinite(goalValue) ? goalValue : null;
      const progress = goal && goal > 0 && pledged != null
        ? Math.min(100, Math.max(0, (pledged / goal) * 100))
        : 0;
      const pledgedDisplay = pledged != null ? fmtMoney(pledged) : "—";
      const card = document.createElement("div");
      card.className = "token-card";
      card.dataset.mint = t.mint || "";
      if (goal != null) card.dataset.goal = String(goal);
      const routeKey = t.routeKey || normalizeRoute(t.route);
      card.innerHTML = `
        <div class="token-card__media">
          <img src="${escapeHTML(
            toHttpImage(t.image || "") || PLACEHOLDER_IMG
          )}" alt="${escapeHTML(t.name || t.symbol || "project")}" onerror="this.onerror=null; this.src='${fallbackImg}'"/>
          <div class="token-card__chip-row">
            ${
              t.category
                ? `<span class="token-chip">${escapeHTML(t.category)}</span>`
                : ""
            }
            ${
              t.isTrending || CURRENT_TAB === "featured"
                ? `<span class="token-chip token-chip--accent">Trending</span>`
                : ""
            }
          </div>
          <button class="token-copy" type="button" data-ca="${escapeHTML(
            t.mint || ""
          )}" aria-label="Copy contract address">Copy CA</button>
        </div>
        <div class="token-card__body">
          ${
            t.symbol
              ? `<div class="token-card__symbol">${escapeHTML(t.symbol)}</div>`
              : ""
          }
          <h3 class="token-card__title">${escapeHTML(t.name || "—")}</h3>
          ${
            t.description
              ? `<p class="token-card__desc">${escapeHTML(t.description)}</p>`
              : ""
          }
          <div class="token-card__progress">
            <div class="token-card__progress-bar"><span style="width:${progress}%"></span></div>
            <div class="token-card__amounts">
              <span class="token-card__pledged">${pledgedDisplay}</span>
            </div>
          </div>
          <div class="token-card__stats">
            <div>
              <span class="token-card__stat-value">${escapeHTML(displayedCA)}</span>
              <span class="token-card__stat-label">Contract</span>
            </div>
          </div>
          <div class="token-card__creator">Creator: <strong>${escapeHTML(
            t.creator || "—"
          )}</strong></div>
          ${
            routeKey
              ? `<div class="token-card__actions"><button class="btn btn--primary btn--sm" type="button" data-project-route="${escapeHTML(
                  routeKey
                )}">View Project</button></div>`
              : ""
          }
        </div>
      `;
      if (routeKey) {
        card.classList.add("token-card--link");
        card.dataset.route = routeKey;
        card.setAttribute("role", "link");
        card.setAttribute("tabindex", "0");
        const navigate = () => {
          handleRouteChange(routeKey);
        };
        card.addEventListener("click", (ev) => {
          if (ev.target.closest(".token-copy")) return;
          if (ev.target.closest("[data-project-route]")) return;
          navigate();
        });
        card.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            navigate();
          }
        });
      }
      GRID.appendChild(card);
    }
  }
  pageLbl.textContent = String(CURRENT_PAGE);
  pagePrev.disabled = CURRENT_PAGE <= 1;
  pageNext.disabled = CURRENT_PAGE >= maxPage;
}

function updateTokenCollections(detail) {
  if (!detail) return;
  const mint = String(detail.mint || detail.address || "").trim();
  if (!mint) return;

  const capRaw = detail.marketCap;
  const capValue =
    typeof capRaw === "number" && Number.isFinite(capRaw) ? capRaw : null;
  const hasExplicitCap = Object.prototype.hasOwnProperty.call(detail, "marketCap");
  const logo = detail.logoURI || detail.logoUri || detail.image || "";
  const name = detail.name || "";
  const symbol = detail.symbol || "";

  const apply = (token) => {
    if (!token || String(token.mint || "") !== mint) return;
    if (capValue != null) {
      token.marketCap = capValue;
      token.pledged = capValue;
    } else if (hasExplicitCap) {
      token.marketCap = null;
      token.pledged = null;
    }
    if (logo && !token.image) token.image = logo;
    if (name) token.name = name;
    if (symbol) token.symbol = symbol;
  };

  MANUAL_TOKENS.forEach(apply);
  TOKENS.forEach(apply);
}

function applyMarketCapToProjectCard(detail) {
  if (!projectMarketCard || !detail) return;
  const targetMint = projectMarketCard
    .getAttribute("data-marketcap-mint")
    ?.trim();
  const mint = String(detail.mint || detail.address || "").trim();
  if (!targetMint || targetMint !== mint) return;

  const goal = Number(projectMarketCard.getAttribute("data-marketcap-goal")) || 0;
  const amountEl = projectMarketCard.querySelector("[data-marketcap-amount]");
  const statusEl = projectMarketCard.querySelector("[data-marketcap-status]");
  const progressEl = projectMarketCard.querySelector("[data-marketcap-progress]");
  const updatedEl = projectMarketCard.querySelector("[data-marketcap-updated]");

  const capRaw = detail.marketCap;
  const hasCap = typeof capRaw === "number" && Number.isFinite(capRaw);
  const capValue = hasCap ? capRaw : null;

  if (statusEl) {
    statusEl.textContent = hasCap ? "Market Cap (USD)" : "Market Cap unavailable";
  }
  if (amountEl) {
    amountEl.textContent = hasCap ? fmtMoney(capValue) : "—";
  }
  if (progressEl) {
    const pct = hasCap && goal > 0 ? Math.min(100, Math.max(0, (capValue / goal) * 100)) : 0;
    progressEl.style.width = `${pct}%`;
  }
  if (updatedEl) {
    const ts = detail.fetchedAt ? new Date(detail.fetchedAt) : new Date();
    updatedEl.textContent = hasCap ? ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
  }
}

document.addEventListener("jupMarketCap", (event) => {
  const detail = event?.detail || {};
  HAS_MARKET_CAP_UPDATE = true;
  updateTokenCollections(detail);
  renderPage();
  applyMarketCapToProjectCard(detail);
});

GRID?.addEventListener("click", async (e) => {
  const viewBtn = e.target.closest("[data-project-route]");
  if (viewBtn) {
    e.preventDefault();
    const route = viewBtn.getAttribute("data-project-route") || "";
    handleRouteChange(route);
    return;
  }
  const copyBtn = e.target.closest(".token-copy");
  if (!copyBtn) return;
  e.stopPropagation();
  const ca = copyBtn.getAttribute("data-ca") || "";
  try {
    await navigator.clipboard.writeText(ca);
  } catch {}
  const prev = copyBtn.textContent;
  copyBtn.textContent = "Copied!";
  copyBtn.classList.add("success");
  setTimeout(() => {
    copyBtn.textContent = prev;
    copyBtn.classList.remove("success");
  }, 1200);
});

function reloadAndRenderCurrentTab() {
  if (!GRID) return;
  if (tabSelector) tabSelector.value = CURRENT_TAB;
  TOKENS = MANUAL_TOKENS.map((t) => ({
    ...t,
    routeKey: normalizeRoute(t.route || t.routeKey),
  }));
  renderPage();
}

// Filters
tabSelector?.addEventListener("change", (e) => {
  CURRENT_TAB = e.target?.value || "featured";
  CURRENT_PAGE = 1;
  reloadAndRenderCurrentTab();
});

searchInp?.addEventListener("input", () => {
  SEARCH_TEXT = searchInp.value || "";
  CURRENT_PAGE = 1;
  renderPage();
});

pagePrev?.addEventListener("click", () => {
  if (CURRENT_PAGE > 1) {
    CURRENT_PAGE--;
    renderPage();
  }
});
pageNext?.addEventListener("click", () => {
  CURRENT_PAGE++;
  renderPage();
});

projectBackBtn?.addEventListener("click", (event) => {
  event.preventDefault();
  handleRouteChange("", { replaceHistory: true });
});

// ===== Boot =====

window.addEventListener("DOMContentLoaded", () => {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
  CURRENT_TAB = "featured";
  CURRENT_PAGE = 1;
  SEARCH_TEXT = "";
  reloadAndRenderCurrentTab();
  if (projectMarketCard && !HAS_MARKET_CAP_UPDATE) {
    const statusEl = projectMarketCard.querySelector("[data-marketcap-status]");
    const amountEl = projectMarketCard.querySelector("[data-marketcap-amount]");
    const progressEl = projectMarketCard.querySelector("[data-marketcap-progress]");
    const updatedEl = projectMarketCard.querySelector("[data-marketcap-updated]");
    if (statusEl) statusEl.textContent = "Market Cap (loading…)";
    if (amountEl) amountEl.textContent = "—";
    if (progressEl) progressEl.style.width = "0%";
    if (updatedEl) updatedEl.textContent = "—";
  }

  navSoonButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const already = btn.classList.contains("is-toast");
      btn.classList.add("is-toast");
      const prev = btn.textContent;
      btn.textContent = "Soon";
      if (!already) {
        setTimeout(() => {
          btn.textContent = prev;
          btn.classList.remove("is-toast");
        }, 1500);
      }
    });
  });

  const initialRoute = routeFromLocation();
  handleRouteChange(initialRoute, { replaceHistory: true });
});

window.addEventListener("popstate", () => {
  const stateRoute = normalizeRoute(window.history?.state?.route);
  const fallbackRoute = routeFromLocation();
  handleRouteChange(stateRoute || fallbackRoute, { skipHistory: true });
});
