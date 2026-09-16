module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-T212-Env, X-T212-Key, X-T212-Secret');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') return res.status(204).end();
  const env = req.headers['x-t212-env'] || 'demo';
  const base = env === 'live' ? 'https://live.trading212.com/api/v0' : 'https://demo.trading212.com/api/v0';
  const apiKey = process.env.T212_API_KEY || req.headers['x-t212-key'];
  const apiSecret = process.env.T212_API_SECRET || req.headers['x-t212-secret'];
  if (!apiKey || !apiSecret) return res.status(401).json({ error: 'Missing credentials.' });
  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  const path = req.query.path || '/equity/account/cash';
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) { if (k !== 'path') qs.append(k, v); }
  const upstream = `${base}${path}${qs.toString() ? '?' + qs : ''}`;
  try {
    const upRes = await fetch(upstream, { method: req.method, headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' }, body: ['GET','HEAD','DELETE'].includes(req.method) ? undefined : JSON.stringify(req.body) });
    const ct = upRes.headers.get('content-type') || '';
    res.status(upRes.status);
    if (ct.includes('json')) return res.json(await upRes.json());
    return res.send(await upRes.text());
  } catch (err) { return res.status(502).json({ error: 'Upstream failed', detail: err.message }); }
};
