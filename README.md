# Studify — Exam Prep Companion

A proper Node/Vite build of the app — real `npm install`, a real `dist/`
build output, and a GitHub Actions workflow that deploys it to a live
GitHub Pages URL automatically every time you push.

## 1. Run it locally

```bash
cd studify-app
npm install
npm run dev
```

Opens at `http://localhost:5173`. Edit `src/App.jsx` and it hot-reloads.

To produce the production build yourself (this is what the GitHub Action
runs automatically, but you can do it locally too):

```bash
npm run build      # outputs to dist/
npm run preview    # serves dist/ locally so you can check it
```

## 2. Set the base path to match your repo name

Open `vite.config.js` and check this line:

```js
base: "/studify/",
```

This has to match your GitHub repo name exactly. If you create the repo
as `github.com/<you>/studify`, leave it as `/studify/`. If you name the
repo something else, change it to `/<that-name>/`. (If you're deploying
to a custom domain or a `<you>.github.io` user/org page instead of a
project page, set it to `/` instead.)

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Studify"
git branch -M main
git remote add origin https://github.com/<your-username>/studify.git
git push -u origin main
```

## 4. Turn on GitHub Pages (Actions-based deploy)

1. On GitHub: your repo → **Settings → Pages**.
2. Under "Build and deployment", set **Source** to **GitHub Actions**
   (not "Deploy from a branch" — the workflow here handles the build).
3. That's it — no further setup. The workflow in
   `.github/workflows/deploy.yml` runs automatically on every push to
   `main`: it installs Node dependencies, runs `npm run build`, and
   publishes `dist/` to Pages.

## 5. Go live

After the first push, check the **Actions** tab on GitHub — you'll see
the "Deploy Studify to GitHub Pages" workflow running. Once it finishes
(green check), your site is live at:

```
https://<your-username>.github.io/studify/
```

Every future `git push` to `main` rebuilds and redeploys automatically.

## 6. Install it on Android

Open the live URL in Chrome on your phone → tap **Install app** in the
prompt (or ⋮ menu → **Add to Home screen**). It installs like a native
app — its own icon, full-screen, and works offline after the first load,
thanks to the service worker `vite-plugin-pwa` generates during the
build.

## 7. Want an actual `.apk` file?

A PWA installed this way already behaves like a native app, but it's
not a distributable APK. If you want one:

- **[PWABuilder](https://www.pwabuilder.com)** — paste your live GitHub
  Pages URL, it reads the generated manifest and packages a signed
  Android APK/AAB you can download. No code required.
- **[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)** —
  Google's CLI, if you'd rather do it from the command line.

Publishing to the Play Store on top of that needs a Google Play
developer account and app signing — a separate step from hosting here.

## Project layout

```
studify-app/
├── src/
│   ├── App.jsx          — the app (quiz, study tracker, exams, settings)
│   ├── main.jsx          — mounts App into #root
│   └── index.css         — Tailwind + font import + small resets
├── public/icons/          — app icons (192, 512, maskable, apple-touch)
├── index.html             — Vite entry HTML
├── vite.config.js         — build config + vite-plugin-pwa (manifest + service worker)
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .github/workflows/deploy.yml   — builds + deploys dist/ to Pages on every push
```
