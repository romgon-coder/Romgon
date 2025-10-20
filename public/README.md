Deploy folder instructions

This folder contains a helper script to assemble a deployable package of the Romgon game for GitHub Pages or Cloudflare Pages.

How it works

1. Run the build script from the project root (PowerShell on Windows):

   .\deploy\build.ps1

   This copies the main HTML file to `deploy/index.html`, copies the `ASSETS/` and `ROMGON HEX/` folders, and writes a `.nojekyll` and `CNAME` file.

2. Inspect `deploy/index.html` — some paths in `ROMGON 2 SHAPES WORKING.html` expect assets in `ASSETS/` and `ROMGON HEX/`. The script copies those folders into `deploy/`.

3. Deploy the `deploy/` folder to your chosen service:

   - GitHub Pages (recommended for static): create a new repository or use an existing one and push the contents of `deploy/` to the `gh-pages` branch or the `main` branch's `docs/` folder. If you push to `gh-pages`, enable GitHub Pages in repository settings and pick the branch.

   - Cloudflare Pages: in the Cloudflare Pages project, set the source to your repository and the build output directory to `/` (since `index.html` is in the repo root when you push deploy/). Alternatively, push `deploy/` as your repo root.

4. DNS: point your domain `romgon.net` to Cloudflare (Cloudflare recommends changing your registrar nameservers to Cloudflare). For GitHub Pages, add A records or use CNAME depending on setup. For Cloudflare Pages the platform provides instructions; if you're using Cloudflare to proxy to GitHub, follow Cloudflare docs.

Notes and caveats
- If the app uses any server-side functionality (websockets, Node server), Cloudflare Pages / GitHub Pages won't run that — you'll need a Node host (Render, Fly, DigitalOcean App Platform, etc.). The script copies `server.js` if present so you can deploy it separately.
- Verify any absolute paths in `ROMGON 2 SHAPES WORKING.html` — if the HTML references assets with absolute file paths, you may need to adjust them to relative paths (e.g., `ASSETS/...`) for Pages.
- CNAME created with `romgon.net`. Edit `deploy/CNAME` if you want to use a different custom domain.

If you'd like, I can:
- Patch `ROMGON 2 SHAPES WORKING.html` to replace any absolute paths with relative ones automatically.
- Create a GitHub Actions workflow that automatically runs the build script and publishes `deploy/` to GitHub Pages or Cloudflare Pages on push.
- Provide step-by-step DNS entries for Cloudflare (nameservers, A/CNAME records) once you confirm whether you'll use Cloudflare Pages or an external host.
