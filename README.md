# Diana Chalakova — Portfolio

A personal portfolio site for designer Diana Chalakova: a work-first landing grid, in-depth case studies, an about page, and a playground of experiments. Built as static HTML, CSS, and a touch of vanilla JavaScript — no build step, no dependencies.

## Structure

```
.
├── index.html              # Home — work grid
├── About.html              # About page
├── Playground.html         # Experiments & side projects
├── 404.html                # Not-found page (served by GitHub Pages)
├── directions/             # Case studies
│   ├── flux.html
│   ├── seal.html
│   ├── contextpath.html
│   ├── watch-out.html
│   ├── arc-security.html
│   ├── through-ais-eyes.html
│   ├── atlas.html
│   └── for-stillness.html
├── styles/
│   └── base.css            # Design tokens + shared styles
└── assets/
    ├── favicon.svg         # Flower brand mark
    ├── about-portrait.jpg
    ├── brand/web/          # Flux brand assets
    ├── playground/         # Playground media
    └── work/               # Case-study images & video
```

## Running locally

No build step. Open `index.html` directly, or serve the folder with any static server:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then visit `http://localhost:8000`.

## Deploying to GitHub Pages

1. Create a new repository and push the contents of this folder to it.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Save. Your site will be live at `https://<username>.github.io/<repo>/` within a minute or two.

The included `.nojekyll` file tells GitHub Pages to serve files as-is (no Jekyll processing), and `404.html` is served automatically for unknown paths.

### Custom domain (optional)

Add a `CNAME` file at the root containing your domain (e.g. `dianachalakova.com`), then configure the domain's DNS per GitHub's [custom-domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

## Notes

- **Fonts** load from Google Fonts (Archivo, Space Mono, Caveat) — an internet connection is needed for them; the site falls back to system fonts offline.
- **Images** are sized for the web (longest edge capped at 2200px; photographs as JPEG, UI/diagrams as PNG) so pages load fast without visible quality loss.
- The **Among the Trees** card links out to a separately hosted live project.
- Social-share previews (Open Graph) use relative image paths; for richest link previews on every platform, swap the `og:image` paths in each page's `<head>` for absolute URLs once the domain is known.

---

© Diana Chalakova. All work and imagery belong to their respective owners.
