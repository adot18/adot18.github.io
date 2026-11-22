# adot18.github.io

Personal site, hosted free on GitHub Pages. No build step.

- **Edit content:** `content.js` (description, links, experience, papers/manual projects)
- **Pinned GitHub projects:** Auto-synced every 30 minutes (and on push) into `pinned-projects.js` via GitHub Actions
- **Styling:** `style.css`
- **Preview locally:** `python3 -m http.server` then open http://localhost:8000
- **Deploy:** `git push` — GitHub Actions syncs pinned repos and redeploys Pages automatically.
