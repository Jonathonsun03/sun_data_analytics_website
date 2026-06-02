# Sun Data Analytics Website

Quarto website for Sun Data Analytics.

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
- `index.qmd` is the homepage.
- `data.qmd`, `projects.qmd`, `reports.qmd`, `notes.qmd`, and `about.qmd` are top-level site pages.
- `styles.css` contains the shared visual design.
- `assets/` stores images and other static assets.
- `legacy-static/` stores the older hand-written HTML pages for reference.

## Adding pages

Create a new `.qmd` file in the root, then add a link to `_quarto.yml` under `website.navbar.left` or `website.navbar.right`.
