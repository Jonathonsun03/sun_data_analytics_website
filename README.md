# Sun Data Analytics Website

Quarto website for Sun Data Analytics, LLC.

## Preview locally

From this repository root, run:

```bash
quarto preview
```

Quarto will print a local URL, usually something like:

```text
http://localhost:4200
```

Open that URL in your browser. The preview server watches the source files, so edits to `.qmd`, `_quarto.yml`, or `styles.css` should update the site automatically.

## Render the site

To build the static website:

```bash
quarto render
```

By default, Quarto writes the rendered site to `_site/`.

## Project structure

- `_quarto.yml` controls site-wide settings, navigation, footer, theme, and shared CSS.
- `index.qmd` is the client-facing landing page.
- `pages/` contains the Quarto content for each page.
- `css/styles.css` imports the shared visual design modules in `css/styles/`.
- `site-parts/footer.html` contains the site-wide footer that is injected into every page.
- `assets/` stores images and other static assets.
- `legacy-static/` stores the older hand-written HTML pages for reference.

## Adding pages

Create a new `.qmd` file in `pages/`, then add it to the `project.render` list and the navbar in `_quarto.yml` when it should be published.
