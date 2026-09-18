import { GoogleGenAI } from "@google/genai";
const token = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({});
async function main() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "hello",
            config: {
                httpOptions: {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            }
        });
        console.log(response.text);
    } catch (e) {
        console.error(e);
    }
}
main();
