const apiKey = process.env.GEMINI_API_KEY || "";
async function main() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "hello" }] }]
            })
        });
        const text = await response.text();
        console.log(response.status, text);
    } catch (e) {
        console.error(e);
    }
}
main();
