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

## Portfolio versions

- **V1.5** (`main` and `v1.5` branches; `V1.5-release` tag): slideshow landing page and project-category pages, with V1 case-study layouts updated with project metadata below the overview media, tool icons and labels, and borderless media. Published version.
- **V2** (`v2` branch): the full redesign, including sticky-text case studies. Saved intact for future work.
- **V1** (`V1` tag): the original rollback snapshot.
- **Last published V1** (`V1-live-before-v1.5` tag): exact live site immediately before the V1.5 release, including the Featured project update.

To restore the last published V1 without rewriting history, restore the complete tracked tree from `V1-live-before-v1.5` on `main`, commit the restoration, then push `main`. The V1.5 release remains saved by its tag and branch.

The V2 layout notes below apply when working on V2; V1.5 intentionally uses V1 case-study layouts. Do not publish a version unless the user asks.

## V2 project-page layout — agreed design

Use the current Flux case-study layout as the reference for all V2 individual project pages.

- Desktop: roughly two-thirds scrolling media on the left and one-third sticky text on the right. Text stays sticky within its section and releases as the next section arrives; use natural page scrolling.
- Open at Overview, presenting the finished solution first. Keep each project's relevant later sections and content.
- Put the project title above the right-hand text, 40px and bold. The first Overview media starts 8px below the column top, aligned with the visible top of the title lettering.
- Body text is 17px on desktop (16px at narrower sizes). Preserve project metadata and links.
- Images and videos have no added background panels or decorative borders. Keep captions directly beneath media. Use the shared viewport-aware spacing; do not reintroduce large fixed-height media containers.
- Iteration media on Flux has captions only, without the extra paragraphs beneath each image.
- Videos have no user playback controls. Autoplay only the most-visible video when at least 55% is visible; pause all others. Respect reduced motion and hidden tabs.
- Keep a fixed white section-navigation bar at the bottom, centered with generous spacing and an underlined active section. Do not add divider lines between sections.
- Use the shared V2 top navigation with pink (#D8576C) backgrounds and white text on hover, including the magnetic interaction.
- On narrow screens, stack text and media and disable sticky text so all content remains readable.
- Shared implementation: `styles/case-study-v2.css`, `js/case-study-v2.js`; migrated-page compatibility and galleries live in `styles/case-study-migrated.css`, `styles/project-details/`, and `js/case-study-widgets.js`.
- V2 stays local until the user explicitly asks to push. Preserve the original `V1` Git tag as the rollback snapshot.
