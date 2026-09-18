import { GoogleGenAI } from "@google/genai";
const apiKey = process.env.GEMINI_API_KEY || "";
delete process.env.GEMINI_API_KEY; // hide it from SDK
const ai = new GoogleGenAI({ 
    apiKey: ' ', // space to bypass check?
    httpOptions: {
        headers: {
            "Authorization": `Bearer ${apiKey}`,
        }
    }
});
async function main() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "hello",
        });
        console.log(response.text);
    } catch (e) {
        console.error(e);
    }
}
main();
