import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { A as rankClaim, D as keepWire, O as loadMetr, P as tagFromRank, S as compileDigest, T as keepPaper, c as MAIL, f as PAPERS, i as DIGEST_ITEMS, l as MAIL_AT, n as CRAWL, r as CRAWL_AT, v as TASTE, y as TASTE_AT } from "./compile-2dzJVUB8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/edition-4JlVkMe_.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function mapDailyPapers(raw) {
	return raw.slice(0, 24).map((row) => {
		const id = (row.paper?.id ?? "").replace(/^arxiv:/, "") || "unknown";
		const title = row.paper?.title ?? row.title ?? id;
		return {
			id,
			title,
			up: row.paper?.upvotes ?? row.upvotes ?? 0,
			keep: keepPaper(id, title),
			abstract: (row.paper?.summary ?? row.summary ?? "").slice(0, 420) || "HF daily_papers live row.",
			href: `https://arxiv.org/abs/${id}`
		};
	});
}
var MAX_AGE_MS = 18144e5;
var EVAL_DESKS = /* @__PURE__ */ new Set([
	"Redwood",
	"Alignment Forum",
	"AI Snake Oil",
	"Transformer",
	"UK AISI",
	"Import AI",
	"Epoch",
	"Zvi"
]);
var FEEDS = [
	{
		name: "HuggingNews",
		url: "https://huggingnews.com/feed.xml",
		kind: "atom"
	},
	{
		name: "Alignment Forum",
		url: "https://www.alignmentforum.org/feed.xml",
		kind: "rss"
	},
	{
		name: "Transformer",
		url: "https://www.transformernews.ai/feed",
		kind: "rss"
	},
	{
		name: "Redwood",
		url: "https://blog.redwoodresearch.org/feed",
		kind: "rss"
	},
	{
		name: "AI Snake Oil",
		url: "https://www.aisnakeoil.com/feed",
		kind: "rss"
	},
	{
		name: "Import AI",
		url: "https://jack-clark.net/feed/",
		kind: "rss"
	},
	{
		name: "Epoch",
		url: "https://epochai.substack.com/feed",
		kind: "rss",
		titlesOnly: true
	},
	{
		name: "Zvi",
		url: "https://thezvi.substack.com/feed",
		kind: "rss",
		titlesOnly: true,
		timeout: 12e3
	},
	{
		name: "OpenAI",
		url: "https://openai.com/news/rss.xml",
		kind: "rss",
		titlesOnly: true
	}
];
function decode(s) {
	const amp = [
		"&",
		"amp",
		";"
	].join("");
	const quot = [
		"&",
		"quot",
		";"
	].join("");
	const apos = [
		"&",
		"apos",
		";"
	].join("");
	const lt = [
		"&",
		"lt",
		";"
	].join("");
	const gt = [
		"&",
		"gt",
		";"
	].join("");
	return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").replace(new RegExp(quot, "gi"), "\"").replace(/&#39;/g, "'").replace(new RegExp(apos, "gi"), "'").replace(new RegExp(lt, "gi"), "<").replace(new RegExp(gt, "gi"), ">").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(new RegExp(amp, "gi"), "&").replace(/\s+/g, " ").trim();
}
function field(block, tag) {
	const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
	return m ? decode(m[1]) : "";
}
function hrefOf(block) {
	const alt = block.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/i);
	if (alt?.[1]) return alt[1];
	const any = block.match(/<link[^>]*href="([^"]+)"/i);
	if (any?.[1]) return any[1];
	return field(block, "link");
}
function toIso(raw) {
	const t = Date.parse(raw);
	return Number.isFinite(t) ? new Date(t).toISOString() : raw;
}
function keepEvalDesk(outlet, title, summary) {
	const t = `${title} ${summary}`;
	if (keepWire(title, summary, outlet)) return true;
	if (!EVAL_DESKS.has(outlet)) return false;
	if (/gdp statistics|nvidia-sized hole|music v2|voice price/i.test(t)) return false;
	return /brief|benchmark|compute|capability|horizon|rsi|eval|incident|agent|metr|pace the frontier|oversight|monitor/i.test(t);
}
function storyOf(title, summary, href, at, id, outlet) {
	if (!title) return null;
	let verdict = rankClaim(`${title} ${summary}`);
	if (verdict.rank === "unconfirmed" && EVAL_DESKS.has(outlet)) verdict = {
		rank: "also",
		reason: "Eval-desk writing. Not a rumor — and not a replacement for the lead."
	};
	return {
		id: id || href || title,
		title,
		summary: summary.slice(0, 420),
		href,
		at: toIso(at),
		keep: keepEvalDesk(outlet, title, summary),
		rank: tagFromRank(verdict.rank),
		reason: verdict.reason,
		outlet
	};
}
function fresh(stories) {
	const cutoff = Date.now() - MAX_AGE_MS;
	return stories.filter((s) => {
		const t = Date.parse(s.at);
		return !Number.isFinite(t) || t >= cutoff;
	});
}
function capPerOutlet(stories, n) {
	const seen = {};
	return stories.filter((s) => {
		seen[s.outlet] = (seen[s.outlet] ?? 0) + 1;
		return seen[s.outlet] <= n;
	});
}
function parseAtom(xml, outlet = "HuggingNews") {
	return fresh(xml.split(/<entry[\s>]/i).slice(1).map((raw) => {
		const block = raw.split(/<\/entry>/i)[0] ?? raw;
		return storyOf(field(block, "title"), field(block, "summary") || field(block, "content"), hrefOf(block), field(block, "published") || field(block, "updated") || "", field(block, "id") || hrefOf(block), outlet);
	}).filter((s) => Boolean(s)));
}
function parseRss(xml, outlet, titlesOnly = false) {
	return fresh(xml.split(/<item[\s>]/i).slice(1).map((raw) => {
		const block = raw.split(/<\/item>/i)[0] ?? raw;
		const href = hrefOf(block);
		const summary = titlesOnly ? "" : field(block, "description") || field(block, "content:encoded");
		return storyOf(field(block, "title"), summary, href, field(block, "pubDate") || field(block, "dc:date") || "", field(block, "guid") || href, outlet);
	}).filter((s) => Boolean(s)));
}
async function fetchFeed(feed) {
	const t0 = Date.now();
	try {
		const r = await fetch(feed.url, {
			headers: { Accept: "application/atom+xml, application/rss+xml, application/xml, text/xml" },
			signal: AbortSignal.timeout(feed.timeout ?? 8e3)
		});
		const ms = Date.now() - t0;
		if (!r.ok) return {
			stories: [],
			ok: false,
			ms
		};
		const xml = await r.text();
		const stories = feed.kind === "atom" ? parseAtom(xml, feed.name) : parseRss(xml, feed.name, feed.titlesOnly);
		return {
			stories,
			ok: stories.length > 0,
			ms
		};
	} catch {
		return {
			stories: [],
			ok: false,
			ms: Date.now() - t0
		};
	}
}
async function loadWires() {
	const t0 = Date.now();
	const packs = await Promise.all(FEEDS.map(fetchFeed));
	const stories = capPerOutlet(packs.flatMap((p) => p.stories).sort((a, b) => {
		if (a.keep !== b.keep) return a.keep ? -1 : 1;
		return Date.parse(b.at) - Date.parse(a.at);
	}), 6);
	const ok = packs.some((p) => p.ok);
	const kept = stories.filter((s) => s.keep);
	const outlets = [...new Set(kept.map((s) => s.outlet))];
	const at = stories[0]?.at || (/* @__PURE__ */ new Date()).toISOString();
	return {
		stories,
		ok,
		ms: Date.now() - t0,
		at,
		note: ok ? `${kept.length} kept of ${stories.length} · ${outlets.join(" · ") || "no keep"} · ranked, not a lab primary` : "Unreachable · no snapshot"
	};
}
function keepTracker(e) {
	if (e.category === "benchmark-change" || e.type === "ranked-benchmark") return false;
	if (e.type === "app-bundle-strings") return false;
	if (e.category === "model-change") return true;
	if (e.officialSignal || e.genuineNewRelease || e.officialPreview) return true;
	return false;
}
function mapTrackerEvents(raw) {
	return raw.map((e) => {
		const models = [...e.addedModels ?? [], ...e.newReleaseModels ?? []].filter(Boolean).slice(0, 8);
		const title = (e.title || e.summary || (models.length ? `Added ${models.join(", ")}` : e.sourceName) || "Change").trim();
		return {
			id: e.id || `${e.sourceName}-${e.detectedAt}`,
			title,
			source: e.sourceName || "tracker",
			href: e.url || "https://ai-tracker.ssh.codes/",
			at: e.detectedAt || "",
			models,
			keep: keepTracker(e),
			official: Boolean(e.officialSignal || e.genuineNewRelease || e.officialPreview),
			kind: e.category || e.type || "change"
		};
	});
}
async function loadTracker() {
	const t0 = Date.now();
	const at = (/* @__PURE__ */ new Date()).toISOString();
	try {
		const r = await fetch("https://ai-tracker.ssh.codes/api/events?limit=80", {
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(8e3)
		});
		const ms = Date.now() - t0;
		if (!r.ok) return {
			hits: [],
			ok: false,
			ms,
			at,
			note: `Tracker HTTP ${r.status}`,
			sources: 0
		};
		const body = await r.json();
		const hits = mapTrackerEvents(Array.isArray(body.events) ? body.events : []);
		const kept = hits.filter((h) => h.keep);
		return {
			hits: kept,
			ok: true,
			ms,
			at: kept[0]?.at || at,
			note: `${kept.length} model/docs changes · ${hits.length - kept.length} leaderboard ticks dropped`,
			sources: hits.length
		};
	} catch {
		return {
			hits: [],
			ok: false,
			ms: Date.now() - t0,
			at,
			note: "Unreachable · no snapshot",
			sources: 0
		};
	}
}
async function loadLivePapers() {
	const t0 = Date.now();
	const at = (/* @__PURE__ */ new Date()).toISOString();
	try {
		const r = await fetch("https://huggingface.co/api/daily_papers", {
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(8e3)
		});
		const ms = Date.now() - t0;
		if (!r.ok) return {
			papers: PAPERS,
			log: {
				id: "hf",
				label: "Papers",
				live: true,
				ok: false,
				count: 0,
				ms,
				at,
				note: `Hugging Face HTTP ${r.status} · using last board`
			}
		};
		const raw = await r.json();
		const papers = mapDailyPapers(Array.isArray(raw) ? raw : []);
		if (!papers.length) return {
			papers: PAPERS,
			log: {
				id: "hf",
				label: "Papers",
				live: true,
				ok: false,
				count: 0,
				ms,
				at,
				note: "Empty board · using last board"
			}
		};
		return {
			papers,
			log: {
				id: "hf",
				label: "Papers",
				live: true,
				ok: true,
				count: papers.length,
				ms,
				at,
				note: `${papers.filter((p) => p.keep).length} kept · keep is not upvote`
			}
		};
	} catch {
		const ms = Date.now() - t0;
		return {
			papers: PAPERS,
			log: {
				id: "hf",
				label: "Papers",
				live: true,
				ok: false,
				count: 0,
				ms,
				at,
				note: "Unreachable · using last board"
			}
		};
	}
}
var fetchEdition_createServerFn_handler = createServerRpc({
	id: "feff7ded2d3a10a8052487e776965bf5e59cbfca2242aaf4520bdc461f5e0e8f",
	name: "fetchEdition",
	filename: "src/lib/edition.ts"
}, (opts) => fetchEdition.__executeServer(opts));
var fetchEdition = createServerFn({ method: "GET" }).handler(fetchEdition_createServerFn_handler, async () => {
	const [paperPack, wirePack, trackerPack, metrPack] = await Promise.all([
		loadLivePapers(),
		loadWires(),
		loadTracker(),
		loadMetr()
	]);
	const at = (/* @__PURE__ */ new Date()).toISOString();
	return {
		edition: compileDigest({
			items: DIGEST_ITEMS,
			papers: paperPack.papers,
			crawl: CRAWL,
			mail: MAIL,
			wires: [...wirePack.stories, ...metrPack.aisi],
			tracker: trackerPack.hits,
			metr: metrPack.stories,
			at
		}),
		ingest: [
			{
				id: "metr",
				label: "METR",
				live: true,
				ok: metrPack.ok,
				count: metrPack.stories.length,
				ms: metrPack.ms,
				at: metrPack.at,
				note: metrPack.note
			},
			{
				id: "wire",
				label: "Wire",
				live: true,
				ok: wirePack.ok,
				count: wirePack.stories.filter((s) => s.keep).length,
				ms: wirePack.ms,
				at: wirePack.at,
				note: wirePack.note
			},
			paperPack.log,
			{
				id: "tracker",
				label: "Tracker",
				live: true,
				ok: trackerPack.ok,
				count: trackerPack.hits.length,
				ms: trackerPack.ms,
				at: trackerPack.at,
				note: trackerPack.note
			},
			{
				id: "x",
				label: "X",
				live: false,
				ok: true,
				count: CRAWL.length,
				ms: 0,
				at: CRAWL_AT,
				note: "Curran-class snapshot · ranked on compile · no paid firehose"
			},
			{
				id: "mail",
				label: "Inbox",
				live: false,
				ok: true,
				count: MAIL.length,
				ms: 0,
				at: MAIL_AT,
				note: "Newsletter highlights · last pull 15 Sep"
			},
			{
				id: "bookmarks",
				label: "Bookmarks",
				live: false,
				ok: true,
				count: TASTE.length,
				ms: 0,
				at: TASTE_AT,
				note: "Never the lead"
			}
		]
	};
});
//#endregion
export { fetchEdition_createServerFn_handler };
