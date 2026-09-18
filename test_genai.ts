import { GoogleGenAI } from "@google/genai";
const apiKey = process.env.GEMINI_API_KEY;
console.log("Key prefix:", apiKey?.substring(0, 5));
const ai = new GoogleGenAI({ apiKey });
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
