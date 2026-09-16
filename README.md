# T212 CORS Proxy

A tiny serverless proxy that lets the [T212 Agent](https://claude.ai/artifact/9YzP7imunF8KBe9vRfaDPo) call the Trading 212 API from your browser.

## Deploy in one click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/t212-proxy&env=T212_API_KEY&envDescription=Your%20Trading%20212%20API%20key%20from%20Settings%20%E2%86%92%20API&envLink=https://docs.trading212.com/api&project-name=t212-proxy&repository-name=t212-proxy)

> **Replace `YOUR_USERNAME`** in the button URL above with your GitHub username after pushing this repo.

### Steps
1. Create a new GitHub repo and push this folder to it
2. Make the repo **public**
3. Update the Deploy button URL above with your GitHub username
4. Click the button — Vercel will ask for your `T212_API_KEY`, fork the repo, and deploy
5. Your proxy URL: `https://t212-proxy.vercel.app/api/proxy`
6. Paste that URL into the T212 Agent connect panel

That's it. Free tier, no credit card.

---

## What this does

The Trading 212 API doesn't allow direct browser requests (CORS). This proxy:
- Runs server-side on Vercel (free Hobby tier)
- Forwards requests from the browser agent to `demo.trading212.com` or `live.trading212.com`
- Injects your API key from an environment variable (it never travels over the wire)
- Adds the `Access-Control-Allow-Origin: *` header the browser needs

## Security

- Your API key lives in Vercel's encrypted environment variables, not in any code
- The proxy only forwards to `*.trading212.com` — nothing else
- You can restrict the CORS origin to `https://claude.ai` if you want extra tightness
