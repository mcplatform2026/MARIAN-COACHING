import re

with open('server.ts', 'r') as f:
    text = f.read()

target = r"""      const isOAuthToken = apiKey\.startsWith\("ya29\."\) \|\| apiKey\.startsWith\("AQ\."\);.*?logDebug\(`\[VOICE\] Gemini SDK Output: \$\{resultText\}`\);\n      }"""

replacement = """      let resultText: string | undefined;
      logDebug(`[VOICE] Using @google/genai SDK for API Key`);
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action: {
                type: Type.STRING,
                description: "The action key: 'ADD_TRANSACTION', 'ADD_CLIENT', 'ADD_INVOICE', 'NAVIGATE', 'DOWNLOAD_INVOICE', or 'UNKNOWN'"
              },
              feedback: {
                type: Type.STRING,
                description: "A friendly, conversational spoken voice response. E.g., 'Okay, adding a 45 dollar expense for office supplies' or 'Navigating to your June 2026 finance report.'"
              },
              parameters: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "'Income' or 'Expense'" },
                  amount: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  date: { type: Type.STRING },
                  clientName: { type: Type.STRING },
                  upfrontAmount: { type: Type.NUMBER },
                  finalAmount: { type: Type.NUMBER },
                  path: { type: Type.STRING },
                  monthName: { type: Type.STRING },
                  yearValue: { type: Type.INTEGER },
                  invoiceNo: { type: Type.STRING },
                  billedTo: { type: Type.STRING },
                  billedToName: { type: Type.STRING },
                  billedToEmail: { type: Type.STRING },
                  itemTitle: { type: Type.STRING },
                  itemPrice: { type: Type.NUMBER }
                }
              }
            },
            required: ["action", "feedback"]
          }
        }
      });
      resultText = response.text;
      logDebug(`[VOICE] Gemini SDK Output: ${resultText}`);"""

new_text = re.sub(target, replacement, text, flags=re.DOTALL)

with open('server.ts', 'w') as f:
    f.write(new_text)
