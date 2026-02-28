export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Safely parse body (important for Vercel)
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { message } = body;

    if (!message) {
      return res.status(400).json({ error: "Message payload is missing." });
    }

    // FIXED: Updated to gemini-2.5-flash (the 1.5 series is retired)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              { text: "You are Nova, HR assistant for Yogiji Digi. Reply under 60 words." }
            ]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: message }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // Catch Gemini errors properly
    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini API failed"
      });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(200).json({
        generated_text: "Nova couldn't generate a response."
      });
    }

    return res.status(200).json({ generated_text: reply });

  } catch (error) {
    console.error("Serverless Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
}
