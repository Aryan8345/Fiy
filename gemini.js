export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GENERATIVE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GENERATIVE_API_KEY environment variable' });
  }

  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // Always use a known-supported model for this API key.
  // This avoids issues if Vercel env vars are misconfigured.
  const model = 'gemini-2.5-flash';
  const apiVersion = 'v1';

  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;
  console.log('Calling Gemini endpoint:', url);
  const googleRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (googleRes.status === 404) {
    const errText = await googleRes.text();
    return res.status(404).json({
      error: 'Model not found',
      model,
      apiVersion,
      detail: errText,
    });
  }

  const text = await googleRes.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return res.status(googleRes.status).send(text || 'Invalid response from Gemini API');
  }

  return res.status(googleRes.status).json(data);
}
