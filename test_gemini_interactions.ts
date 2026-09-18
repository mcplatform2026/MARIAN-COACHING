import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});
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
