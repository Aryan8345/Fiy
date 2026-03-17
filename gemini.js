export default async function handler(req, res) {
  // ✅ Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ✅ Get API key
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ Missing GEMINI_API_KEY");
    return res.status(500).json({
      error: "Missing GEMINI_API_KEY environment variable",
    });
  }

  try {
    // ✅ Gemini API endpoint (STABLE WORKING)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

    console.log("🚀 Calling Gemini API...");

    const googleRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const text = await googleRes.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ Invalid JSON from Gemini:", text);
      return res.status(500).send(text);
    }

    // ✅ Handle Gemini API errors cleanly
    if (!googleRes.ok) {
      console.error("❌ Gemini API Error:", data);
      return res.status(googleRes.status).json({
        error: "Gemini API failed",
        details: data,
      });
    }

    // ✅ Success response
    return res.status(200).json(data);

  } catch (error) {
    console.error("🔥 Server Error:", error);

    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}
