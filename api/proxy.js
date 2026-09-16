/**
 * T212 CORS Proxy — Vercel Serverless Function
 *
 * Deploy via GitHub → Vercel (free). See README for the one-click button.
 * Set T212_API_KEY in Vercel Environment Variables after deploy.
 */

module.exports = async function handler(req, res) {
  // ── CORS — allow any browser origin ──────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-T212-Env');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(204).end();

  // ── Pick environment ──────────────────────────────────
  const env = req.headers['x-t212-env'] || 'demo';
  const base = env === 'live'
    ? 'https://live.trading212.com/api/v0'
    : 'https://demo.trading212.com/api/v0';

  // ── API key: env var (secure) or forwarded header ─────
  const apiKey = process.env.T212_API_KEY || req.headers['authorization'];
  if (!apiKey) {
    return res.status(401).json({
      error: 'No API key configured.',
      hint: 'Add T212_API_KEY to your Vercel Environment Variables, then redeploy.'
    });
  }

  // ── Build upstream URL ────────────────────────────────
  const path = req.query.path || '/equity/account/cash';
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    if (k !== 'path') qs.append(k, v);
  }
  const upstream = `${base}${path}${qs.toString() ? '?' + qs : ''}`;

  // ── Forward request ───────────────────────────────────
  try {
    const upRes = await fetch(upstream, {
      method: req.method,
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: ['GET', 'HEAD', 'DELETE'].includes(req.method)
        ? undefined
        : JSON.stringify(req.body),
    });

    const ct = upRes.headers.get('content-type') || '';
    res.status(upRes.status);

    if (ct.includes('json')) {
      const data = await upRes.json();
      return res.json(data);
    } else {
      const text = await upRes.text();
      return res.send(text);
    }
  } catch (err) {
    return res.status(502).json({ error: 'Upstream failed', detail: err.message });
  }
};
