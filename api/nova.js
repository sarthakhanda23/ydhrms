export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are Nova, HR assistant for Yogiji Digi. Reply under 60 words.\n\n${message}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
console.log("GEMINI RAW RESPONSE:", JSON.stringify(data));
    
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    return res.status(200).json({ generated_text: reply });

  } catch (error) {
    return res.status(500).json({ error: "Server error", details: error.message });
  }

}

