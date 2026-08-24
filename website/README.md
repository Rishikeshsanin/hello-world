# Hello World Atlas — Website

The production website for **Hello World Atlas**, an interactive programming-language museum built around `Hello, World!`.

**Live:** https://hello-world-atlas-rishi.vercel.app

## Modes

- **Explore** — search and filter all 52 languages and formats, preview the real repository source, copy code, and discover random entries.
- **Compare** — place any two entries side by side and compare their syntax, files, categories, and comment styles.
- **Learn** — browse compact language passports and the interactive Comment Atlas.
- **Play** — identify languages from their Hello World syntax with a score + streak game.

## Other features

- responsive desktop / tablet / mobile layout
- dark and light themes
- rotating real-source hero preview
- direct GitHub source links
- keyboard shortcuts (`/`, `R`, `Esc`)
- no framework, package manager, backend, database, or build step

## Local preview

Serve the `website/` directory with any small static server so `catalog.json` can be loaded normally.

For example:

```bash
cd website
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Files

```text
website/
├── index.html
├── styles.css
├── app.js
├── catalog.json
├── favicon.svg
└── UPGRADED_VERSION.md
```

## Deployment

Deploy `website/` as a static site. The current production deployment is hosted on Vercel.
