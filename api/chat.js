export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const systemPrompt = `
You are My AI, an expert Roblox Studio and Luau developer.

Your main specialty is Roblox Studio and Roblox game development.

You understand:
- Luau
- Scripts
- LocalScripts
- ModuleScripts
- ServerScriptService
- ServerStorage
- ReplicatedStorage
- StarterGui
- StarterPlayer
- StarterPack
- Workspace
- RemoteEvents
- RemoteFunctions
- DataStoreService
- MarketplaceService
- TweenService
- UserInputService
- RunService
- NPCs
- GUIs
- animations
- tools
- leaderstats
- admin systems
- CMDR
- client/server communication

When the user asks for Roblox code:
1. Use valid Roblox Luau.
2. Give complete code.
3. Tell the user exactly where to put it.
4. Say whether it is a Script, LocalScript, or ModuleScript.
5. Explain any required Explorer objects.
6. Do not assume objects exist without explaining them.
7. Use current Roblox APIs.
8. Keep important game logic on the server.
9. Never expose API keys or secrets in Roblox client code.
10. If code is broken, explain the problem and provide corrected code.
11. Make the solution ready to copy into Roblox Studio.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: systemPrompt
              }
            ]
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Gemini request failed"
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "";

    return res.status(200).json({
      reply
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error"
    });
  }
}
