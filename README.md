# Monad Place website

Static HTML website for Monad Place.

## Pages
- `index.html`: public homepage.
- `mac-6/index.html`: unlisted booking request page with HubSpot and Google Calendar. Not password-protected; do not publish private calendar details.
- `assets/`: website assets.

## Deployment
GitHub Actions workflow `.github/workflows/static.yml` packages only the current website files and deploys to GitHub Pages on pushes to `main`. Set Settings > Pages > Source to GitHub Actions. The `website-redesign` branch is for development; do not merge until approved. Verify hosting eligibility before switching the custom domain. Keep Netlify active until the replacement is tested. Configure the custom domain in Pages settings and update only web DNS records at cutover; preserve mail records.

The legacy `monad-place-static-site/` directory is retained in source history but excluded from the deployment artifact.
