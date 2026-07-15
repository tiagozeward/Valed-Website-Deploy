# Valed — SEO & AI-SEO Optimization Plan

> Goal: rank at the top of Google for Portuguese "Exame Nacional de Matemática A" prep
> queries, and become the answer AI assistants (ChatGPT, Perplexity, Gemini, Google AI
> Overviews) recommend for that need.
>
> Canonical domain assumed: **https://valed.ai**. If the marketing site lives on a
> different host, find-and-replace that origin across the generated files.

---

## Starting point (audit)

**Good:** clean semantic HTML, one `<h1>` per page-state, `lang="pt"`, reveal animations
correctly gated on `html.js` (no-JS crawlers see all text), legal pages have unique
title/description/robots.

**Critical gaps found:**
1. No `robots.txt`
2. No `sitemap.xml`
3. No structured data (JSON-LD) anywhere
4. No canonical tag
5. No Open Graph / Twitter Card tags (bad social shares)
6. Student + tutor on a single JS-toggled URL (`index.html`) — only one indexable page
7. Thin content (~580 words), no supporting/blog content, no FAQ
8. Keyword targeting implicit, not deliberate; brand-only `<title>`
9. `server.js` serves `index.html` for unknown paths (soft-404 → duplicate URLs)
10. No AI-crawler welcome (GPTBot/ClaudeBot/PerplexityBot), no `llms.txt`

---

## Phase 1 — Quick wins (additive, reversible)

- [x] **`robots.txt`** — allow all search + AI crawlers explicitly; point to sitemap.
- [x] **`sitemap.xml`** — list every real URL.
- [x] **Canonical tag** on every page.
- [x] **Open Graph + Twitter Card** tags on every page.
- [x] **`assets/og-image.png`** (1200×630) social share image.
- [x] **Sharper `<title>` + `<meta description>`** with real search keywords on the homepage.
- [x] **JSON-LD** on homepage: `Organization` + `EducationalOrganization` + `WebSite`.

## Phase 2 — Structural

- [x] **Split the tutor side into a real URL** (`/para-tutores.html`) with its own
      title, description, canonical, OG tags, and schema — so the tutor audience is
      independently indexable. The in-page JS toggle keeps working for humans.
- [x] **FAQ section** on the homepage + `FAQPage` JSON-LD (targets AI answer engines).
- [x] **Fix soft-404** in `server.js` — return a real 404 for unknown paths so Google
      doesn't index infinite duplicate URLs.

## Phase 3 — Content moat

- [x] **Guia do Exame hub** (`/guia-exame-matematica-a.html`) — the pillar page, links
      to every topic.
- [x] **Topic pages** generated from `data/mat_a_knowledge_graph.json` (10 domains,
      synced from the app's canonical knowledge graph; lists only skills that have a
      lesson in the app),
      each targeting a real topic query, each with `Article`/`LearningResource` +
      breadcrumb schema, all linked from the hub and listed in the sitemap.
- [x] **`llms.txt`** — plain-text summary of what Valed is, for AI crawlers.

---

## Keyword targets (deliberate)

Primary: *exame nacional matemática a, preparação exame matemática a, como estudar
matemática a, app matemática a, explicações matemática a online, matemática a 12º ano.*

Per-domain long-tail (one topic page each): *números complexos exame, derivadas exame
matemática a, limites 12º ano, trigonometria exame, probabilidades e combinatória*, etc.

---

## What shipped (all three phases done)

**New files:** `robots.txt`, `sitemap.xml`, `llms.txt`, `404.html`,
`para-tutores.html`, `guia-exame-matematica-a.html`, `assets/og-image.png`
(+ `assets/og-image.html` source), and 10 topic pages under `exame-matematica-a/`.

**Edited:** `index.html` (title/desc/canonical/OG/Twitter + Organization,
EducationalOrganization, WebSite, Course & FAQPage JSON-LD + visible FAQ section +
real footer links), `termos/privacidade/cookies.html` (canonical + OG),
`sections.css` (FAQ styles), `server.js` (real 404 + extensionless routing).

**Verified:** all real routes → 200, unknown paths → branded 404, extensionless
URLs resolve, every JSON-LD block parses, all internal links resolve, pages render
on-brand (screenshots taken).

**Assumptions made** (change if wrong): canonical origin `https://valed.ai`;
contact email `hello@valed.ai` (from the existing legal pages).

## Post-launch (off-page, not code — do manually)

- Submit `sitemap.xml` in Google Search Console + Bing Webmaster Tools.
- List Valed in PT ed-tech / startup directories (corroboration is what makes AI
  assistants trust and recommend an entity).
- Add a `sameAs` array to the Organization schema once social profiles exist.
- Self-host Google Fonts + Lenis CSS to remove render-blocking third-party requests
  (Core Web Vitals win).
- If the marketing site is NOT on valed.ai, find-and-replace the origin across all
  files listed above.
