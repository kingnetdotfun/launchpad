(() => {
  const MINT = "XQ2xvSxKh5sZqJxoRpby23p3K5WHQTEgN4pzVA1KNET";
  const URL = `https://lite-api.jup.ag/tokens/v2/search?query=${encodeURIComponent(MINT)}`;
  const REFRESH_MS = 60_000;

  const parseMarketCap = (raw) => {
    if (raw == null) return null;
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "object") {
      const maybe =
        raw.usd ?? raw.USD ?? raw.price ?? raw.value ?? raw.amount ?? raw.marketCap;
      const num = Number(maybe);
      return Number.isFinite(num) ? num : null;
    }
    const asNum = Number(raw);
    return Number.isFinite(asNum) ? asNum : null;
  };

  async function fetchMarketMeta() {
    const res = await fetch(URL, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Jupiter request failed (${res.status}): ${text}`);
    }
    const json = await res.json();
    const list = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
        ? json.data
        : [];

    const item =
      list.find((entry) => {
        const address = String(
          entry?.address || entry?.mint || entry?.id || ""
        ).trim();
        return address === MINT;
      }) || null;

    if (!item) {
      return {
        mint: MINT,
        marketCap: null,
        name: "",
        symbol: "",
        logoURI: "",
      };
    }

    const marketCapSource =
      item.marketCap ?? item.marketcap ?? item.mcap ?? item.fdv ?? null;

    return {
      mint: MINT,
      marketCap: parseMarketCap(marketCapSource),
      name: item.name ?? "",
      symbol: item.symbol ?? "",
      logoURI: item.logoURI || item.logoUri || item.icon || item.image || "",
    };
  }

  async function loadAndBroadcast() {
    try {
      const meta = await fetchMarketMeta();
      const detail = {
        ...meta,
        fetchedAt: Date.now(),
      };
      document.dispatchEvent(new CustomEvent("jupMarketCap", { detail }));
    } catch (err) {
      console.error("Failed to load Jupiter market cap", err);
      const detail = {
        mint: MINT,
        marketCap: null,
        fetchedAt: Date.now(),
        error: String(err?.message || err),
      };
      document.dispatchEvent(new CustomEvent("jupMarketCap", { detail }));
    }
  }

  let started = false;

  function startPolling() {
    if (started) return;
    started = true;
    loadAndBroadcast();
    setInterval(loadAndBroadcast, REFRESH_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startPolling, { once: true });
  } else {
    startPolling();
  }
})();
