# Deploy to Railway

## What is already configured

- `package.json` with `npm start`
- `server.js` serving the static site and binding to `PORT`
- `railway.json` setting Railway deploy command

## Deploy steps

1. Push this repository to GitHub.
2. In Railway, click **New Project** -> **Deploy from GitHub Repo**.
3. Select this repository and branch.
4. Railway will detect Node.js and run:
   - install: `npm install`
   - start: `npm start`
5. Open the generated Railway domain to verify the site is live.

## Notes

- No environment variables are required for this static site.
- The app entry page is `index.html`.
- Static assets are served from the repository root (`assets/`, `styles.css`, `script.js`).
