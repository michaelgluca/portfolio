# michaelluca.co.uk

Personal portfolio of Michael G. Luca — Microsoft Power Platform Developer.
Plain HTML, CSS and JavaScript. No build step, no dependencies, no tracking.

## Files

| File | What it is |
|---|---|
| `index.html` | Main page — about, skills, project cards, experience, contact |
| `projects/*.html` | One full case-study page per project |
| `styles.css` | Design: colours, layout, dark/light theme, responsive rules |
| `script.js` | Theme toggle, mobile menu, scroll animations, TOC highlighting, photo fallback |
| `theme-init.js` | Applies the saved theme before first paint (kept external so the CSP can stay strict) |
| `assets/photo.jpg` | Profile photo (shows initials if missing) |
| `404.html` | Not-found page (GitHub Pages serves it automatically) |
| `CNAME` | Tells GitHub Pages the custom domain |
| `robots.txt`, `sitemap.xml` | Search-engine hints |
| `serve.ps1` | Tiny local preview server |

## Preview locally

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open <http://localhost:8080>. `Ctrl+C` to stop.

## Publishing (GitHub Pages + custom domain)

The site is designed to be hosted for free on GitHub Pages at **michaelluca.co.uk**.

### 1. GitHub

1. Create a **public** repository named `michaelgluca.github.io` (a "user site" — it publishes from the root of `main` with no extra config).
2. Push this folder to it.
3. In the repo: **Settings → Pages** → Custom domain: `michaelluca.co.uk` → Save. Tick **Enforce HTTPS** once the certificate is issued (can take up to an hour after DNS resolves).

The `CNAME` file in this repo keeps the custom domain set across deployments — don't delete it.

### 2. IONOS DNS (for michaelluca.co.uk)

In IONOS → Domains & SSL → michaelluca.co.uk → DNS, add these records
(delete any existing `A` / `AAAA` records for `@` and any existing `CNAME` for `www` first):

| Type | Host | Value |
|---|---|---|
| A | @ | `185.199.108.153` |
| A | @ | `185.199.109.153` |
| A | @ | `185.199.110.153` |
| A | @ | `185.199.111.153` |
| AAAA | @ | `2606:50c0:8000::153` |
| AAAA | @ | `2606:50c0:8001::153` |
| AAAA | @ | `2606:50c0:8002::153` |
| AAAA | @ | `2606:50c0:8003::153` |
| CNAME | www | `michaelgluca.github.io` |

DNS changes typically take 10–60 minutes to propagate. `www.michaelluca.co.uk` will redirect to the apex domain.

### Every update after that

Edit → commit → push. GitHub Pages redeploys in about a minute.

## Security notes

- Static site: no server code, no database, no forms, no third-party scripts.
- A `Content-Security-Policy` on every page restricts scripts to this origin and styles/fonts to Google Fonts.
- Nothing secret lives in this repo (no API keys, tokens or credentials are needed for a static site). `.gitignore` excludes local tooling and any `notes/` or `private/` folders as a safety net.
- The only personal data published is what the site is for: name, photo, public email, LinkedIn and GitHub links.
