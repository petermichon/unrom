#!/usr/bin/env python3
"""Fetch one provider's results for the fixed 10-query SEO audit set.

Usage: python3 fetch.py <exa|parallel|tavily|tinyfish>

Writes:
  data/raw_<provider>.json  -> untouched per-query responses + transport metadata
  data/<provider>.json      -> normalized rows, one list per query
"""
import json, os, re, sys, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
os.makedirs(DATA, exist_ok=True)

QUERIES = [
    ("q1",  "custom android rom",                    "head"),
    ("q2",  "custom rom vs stock android",           "position_vs_stock"),
    ("q3",  "alternative android os",                "category_synonym"),
    ("q4",  "how to install custom rom android",     "install_howto"),
    ("q5",  "install lineageos on pixel",            "install_device"),
    ("q6",  "best custom rom 2026",                  "decision_fresh"),
    ("q7",  "grapheneos vs calyxos",                 "brand_compare"),
    ("q8",  "is installing a custom rom safe",       "risk_objection"),
    ("q9",  "custom rom banking app play integrity", "dealbreaker_objection"),
    ("q10", "degoogle android",                      "adjacent_privacy"),
]

TOP_N = 8
UA = "opencode-seo-audit/1.0"


def post(url, body, headers, timeout=40):
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json, text/event-stream")
    req.add_header("User-Agent", UA)
    for k, v in headers.items():
        req.add_header(k, v)
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read().decode("utf-8", "replace")
        return r.status, raw, int((time.time() - t0) * 1000)


def parse_json_or_sse(text):
    t = text.strip()
    if t.startswith("{"):
        return json.loads(t)
    for line in reversed(t.splitlines()):
        if line.startswith("data:"):
            try:
                return json.loads(line[5:].strip())
            except Exception:
                continue
    raise ValueError("unparseable body: " + t[:200])


def content_text(payload):
    """Pull the MCP text content out of either a top-level or nested result."""
    node = payload.get("result", payload)
    parts = node.get("content") or []
    return "\n".join(p.get("text", "") for p in parts if isinstance(p, dict))


def parse_exa(text):
    rows = []
    for block in re.split(r"\n\n---\n\n", text):
        url = re.search(r"^URL:\s*(.+)$", block, re.M)
        if not url:
            continue
        title = re.search(r"^Title:\s*(.+)$", block, re.M)
        pub = re.search(r"^Published:\s*(.+)$", block, re.M)
        body = re.search(r"^(?:Highlights|Text):\s*\n?([\s\S]*)$", block, re.M)
        pubv = (pub.group(1).strip() if pub else "")
        rows.append({
            "url": url.group(1).strip(),
            "title": (title.group(1).strip() if title else ""),
            "published_date": None if pubv in ("", "N/A") else pubv,
            "snippet": (body.group(1).strip()[:900] if body else ""),
        })
    return rows


def fetch(provider, query):
    if provider == "exa":
        s, raw, ms = post("https://mcp.exa.ai/mcp",
                          {"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                           "params": {"name": "web_search_exa",
                                      "arguments": {"query": query, "numResults": TOP_N}}},
                          {})
        p = parse_json_or_sse(raw)
        if p.get("result", {}).get("isError"):
            raise RuntimeError(content_text(p)[:200])
        return s, raw, ms, parse_exa(content_text(p))

    if provider == "parallel":
        s, raw, ms = post("https://search.parallel.ai/mcp",
                          {"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                           "params": {"name": "web_search",
                                      "arguments": {"objective": query, "search_queries": [query]}}},
                          {})
        p = parse_json_or_sse(raw)
        inner = json.loads(content_text(p))
        rows = []
        for r in inner.get("results", [])[:TOP_N]:
            rows.append({
                "url": r.get("url", ""),
                "title": r.get("title", ""),
                "published_date": r.get("publish_date") or None,
                "snippet": " ".join(r.get("excerpts", []))[:900],
            })
        return s, raw, ms, rows

    if provider == "tavily":
        s, raw, ms = post("https://api.tavily.com/search",
                          {"query": query, "search_depth": "basic",
                           "chunks_per_source": 3, "max_results": TOP_N},
                          {"X-Tavily-Access-Mode": "keyless"})
        p = json.loads(raw)
        rows = [{"url": r.get("url", ""), "title": r.get("title", ""),
                 "published_date": r.get("published_date") or None,
                 "snippet": (r.get("content") or "")[:900]}
                for r in p.get("results", [])[:TOP_N]]
        return s, raw, ms, rows

    if provider == "tinyfish":
        s, raw, ms = post("https://agent.tinyfish.ai/mcp",
                          {"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                           "params": {"name": "search", "arguments": {"query": query}}},
                          {"X-TinyFish-Access-Mode": "keyless"})
        p = parse_json_or_sse(raw)
        if p.get("error"):
            raise RuntimeError(str(p["error"])[:200])
        inner = json.loads(content_text(p))
        rows = []
        for r in inner.get("results", [])[:TOP_N]:
            rows.append({
                "url": r.get("url", ""),
                "title": r.get("title", ""),
                "published_date": r.get("published_date") or None,
                "snippet": (r.get("snippet") or "")[:900],
            })
        return s, raw, ms, rows

    raise SystemExit("unknown provider " + provider)


def main():
    provider = sys.argv[1]
    out = {"provider": provider, "captured_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
           "top_n": TOP_N, "queries": []}
    rawlog = []
    for qid, q, intent in QUERIES:
        entry = {"id": qid, "query": q, "intent": intent, "results": [], "error": None}
        last = None
        for attempt in range(4):
            try:
                status, raw, ms, rows = fetch(provider, q)
                entry.update({"http_status": status, "latency_ms": ms})
                entry["results"] = rows
                rawlog.append({"id": qid, "query": q, "http_status": status,
                               "latency_ms": ms, "raw": raw})
                last = None
                break
            except urllib.error.HTTPError as e:
                last = f"HTTP {e.code}"
                wait = 3 * (attempt + 1)
                if e.code == 429 and e.headers.get("retry-after"):
                    try:
                        wait = float(e.headers["retry-after"])
                    except Exception:
                        pass
                time.sleep(min(wait, 20))
            except Exception as e:
                last = f"{type(e).__name__}: {e}"
                time.sleep(2 * (attempt + 1))
        if last:
            entry["error"] = last
            rawlog.append({"id": qid, "query": q, "error": last})
        out["queries"].append(entry)
        print(f"  {provider} {qid} -> {len(entry['results'])} results" +
              (f" ERR {last}" if last else ""), flush=True)
        time.sleep(1.0)

    with open(os.path.join(DATA, f"{provider}.json"), "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    with open(os.path.join(DATA, f"raw_{provider}.json"), "w") as f:
        json.dump(rawlog, f, indent=2, ensure_ascii=False)
    ok = sum(1 for x in out["queries"] if not x["error"])
    total = sum(len(x["results"]) for x in out["queries"])
    print(f"{provider}: {ok}/10 queries ok, {total} rows -> data/{provider}.json")


if __name__ == "__main__":
    main()
