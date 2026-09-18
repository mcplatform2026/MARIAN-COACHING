import re

with open('server.ts', 'r') as f:
    text = f.read()

target = """    } catch (error: any) {
      logDebug(`[VOICE] Exception: ${error.message}`);
      res.status(500).json({ error: error.message });
    }"""

replace = """    } catch (error: any) {
      if (error.status === 401 || (error.message && error.message.includes("401"))) {
        logDebug(`[VOICE] Auth Error: API Key missing or invalid system token. Falling back to client-side local parser.`);
        res.status(401).json({ error: "Unauthorized / Missing API Key" });
      } else {
        logDebug(`[VOICE] Error: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }"""

text = text.replace(target, replace)

with open('server.ts', 'w') as f:
    f.write(text)
