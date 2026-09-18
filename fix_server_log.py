import re

with open('server.ts', 'r') as f:
    text = f.read()

target = """        if (!resDirect.ok) {
          throw new Error("Please configure your Gemini API Key in the AI Studio Settings menu. The default system token cannot be used for this API.");
        }"""

replacement = """        if (!resDirect.ok) {
          const errText = await resDirect.text();
          throw new Error(`API Error: ${resDirect.status} ${errText}`);
        }"""

text = text.replace(target, replacement)

with open('server.ts', 'w') as f:
    f.write(text)
