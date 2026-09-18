import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function main() {
    try {
        const interaction = await ai.interactions.create({
            model: "gemini-3.6-flash",
            input: "hello",
        });
        console.log(interaction.output_text);
    } catch (e) {
        console.error(e);
    }
}
main();
