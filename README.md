# Monad Place marketing page

A lightweight, responsive landing page for GitHub Pages. It introduces Monad Place and directs visitors to the main site at [monadplace.com](https://monadplace.com/) or to `contact@monadplace.com`.

## Publish with GitHub Pages

1. Create a GitHub repository for this page.
2. Upload the contents of this folder to the repository root. Keep `index.html`, `.nojekyll`, and the `assets/` folder together.
3. Open **Settings → Pages** in the repository.
4. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
5. GitHub Pages will show the published `github.io` address in the same settings panel.

No Node, package install, build command, or server is required. The page uses relative paths for local assets and works as a GitHub project page.

## Domain note

This page sends visitors to `https://monadplace.com/`. It does not configure a `CNAME` file or replace the main site's DNS. Use GitHub's generated `github.io` URL for this campaign page unless you intentionally choose a separate subdomain later.

## Page contents

- `index.html` — complete single-page marketing site
- `assets/monad-place-overview.png` — supplied Monad Place overview artwork, retained as a reusable campaign asset
- `.nojekyll` — tells GitHub Pages to publish files as-is
