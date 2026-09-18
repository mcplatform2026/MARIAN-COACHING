import { GoogleGenAI } from "@google/genai";
const apiKey = process.env.GEMINI_API_KEY || "";
delete process.env.GEMINI_API_KEY; 
const ai = new GoogleGenAI({ 
    httpOptions: {
        headers: {
            "Authorization": `Bearer ${apiKey}`
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
