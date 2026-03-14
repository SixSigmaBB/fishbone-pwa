
# 6M → Fishbone (PWA) — GitHub Pages Deployment

## Quick steps (≈1 minute)
1. Create a new **public** GitHub repository (e.g., `fishbone-pwa`).
2. Upload **all files** from this folder to the **repo root** (drag-and-drop is fine).
3. Ensure the default branch is **main** (or adjust the workflow trigger).
4. Go to **Settings → Pages** and confirm "Build and deployment" is set to **GitHub Actions**.
5. Push to `main`. The **Actions** tab will show a Pages deployment running.
6. In ~30–90 seconds your site is live at:
   `https://<YOUR_GITHUB_USERNAME>.github.io/<REPO_NAME>/`

## Using the app on phones
- **Android/Chrome**: You'll see an **Install** prompt; or use ⋮ → **Install app**.
- **iPhone/iPad (Safari)**: **Share → Add to Home Screen**. After first load, it works offline.

## Updating
- Edit any file and commit to `main`. The site redeploys automatically.
- If clients still see an old version, bump the `CACHE` value inside `service-worker.js` and commit.

## Notes
- All assets are referenced with **relative paths (`./`)**, so Project Pages (subfolder URLs) work out‑of‑the‑box.
- If you add a custom domain later, create a `CNAME` file with your domain name at repo root.
