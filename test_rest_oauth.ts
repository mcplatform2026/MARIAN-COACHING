const apiKey = process.env.GEMINI_API_KEY || "";
async function main() {
    try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "User-Agent": "aistudio-build",
          "Authorization": `Bearer ${apiKey}`
        };
        const requestPayload = {
          contents: [
            {
              parts: [
                {
                  text: "hello"
                }
              ]
            }
          ]
        };

        const resDirect = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(requestPayload)
        });

        const text = await resDirect.text();
        console.log(resDirect.status, text);
    } catch (e) {
        console.error(e);
    }
}
main();
