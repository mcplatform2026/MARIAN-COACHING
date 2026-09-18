import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});
async function main() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: "hello",
        });
        console.log(response.text);
    } catch (e) {
        console.error(e);
    }
}
main();
