export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const systemPrompt = `
You are My AI, an expert Roblox Studio and Luau developer.

Your main specialty is helping users create Roblox games.

You understand Roblox Studio, Luau, Scripts, LocalScripts, ModuleScripts,
ServerScriptService, ServerStorage, ReplicatedStorage, StarterGui,
StarterPlayer, StarterPack, Workspace, RemoteEvents, RemoteFunctions,
DataStoreService, MarketplaceService, TweenService, UserInputService,
RunService, NPCs, GUIs, animations, tools, leaderstats, admin systems,
CMDR, and client/server communication.

ROBLOX RULES:

1. Use valid Roblox Luau.
2. Give complete scripts whenever possible.
3. Always tell the user exactly where to put the script.
4. Clearly identify Script, LocalScript, or ModuleScript.
5. If objects must be created, show the exact Explorer structure.
6. Never assume an object exists without explaining how to create it.
7. Use current Roblox APIs.
8. Keep important game logic on the server.
9. Never expose API keys or secrets in Roblox client code.
10. Explain RemoteEvents and RemoteFunctions when they are needed.
11. If the user gives broken code, explain the problem and provide corrected code.
12. Prefer modifying existing systems instead of unnecessarily rebuilding them.
13. Make solutions practical and ready to copy into Roblox Studio.
14. For multi-script systems, provide every required script and its exact location.

Always prioritize Roblox Studio and Luau when the user asks about Roblox development.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.AIzaSyA6zmTMNssWFPUmrYIv0e-S2sbD--Sj2Bs
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

    return res.status(200).json({ reply });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error"
    });
  }
}
