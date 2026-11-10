# Monad Place static website export

## Files
- `index.html` is the complete one-page site. It contains the page structure, styling, and small amount of interaction code.
- `monad-place-overview.png` is the photo asset used in the venue section.

## Where to put the files
Upload both files together to the web host's publish/root folder. Keep the image beside `index.html` so the venue photo loads. On hosts that ask for a publish directory, choose the folder containing these two files. Do not put the files one folder deeper unless you also set that inner folder as the publish directory.

For an existing website builder, this is a complete page, not a small embed snippet. Replace the site's homepage with `index.html` or use the builder's full-page custom HTML/code option. A regular text/embed block is not enough because it may strip the page's styles and layout.

## Contact form behavior
The form opens a prefilled email to `contact@monadplace.com` using the visitor's email app. It does not send or store submissions on a server. The page also has a copy-inquiry button as a fallback.

## Netlify manual deploy
Create a new Netlify site with manual/drag-and-drop deploy, then upload this folder (or the ZIP containing these files). Set the custom domain in Netlify before changing DNS. If using an external DNS provider, copy the exact DNS records Netlify shows into that provider and leave mail-related MX records in place. DNS changes can take time to propagate.
