import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import puppeteer from "puppeteer-core";

let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Log debugger helper
  const logDebug = (msg: string) => {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${msg}\n`;
    console.log(line.trim());
    try {
      fs.appendFileSync(path.join(process.cwd(), 'api-debug.log'), line);
    } catch (e) {
      // ignore
    }
  };

  // Initialize/clear log file
  try {
    fs.writeFileSync(path.join(process.cwd(), 'api-debug.log'), `--- SERVER STARTED AT ${new Date().toISOString()} ---\n`);
  } catch (e) {}

  // API Proxy Routes

  app.post('/api/voice-command', async (req: express.Request, res: express.Response) => {
    logDebug(`[VOICE] Received command request: ${JSON.stringify(req.body)}`);
    try {
      const { command, currentDate } = req.body;
      if (!command) {
        return res.status(400).json({ error: "Command is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined");
      }

      const todayStr = currentDate || new Date().toISOString().split('T')[0];

      const prompt = `You are the Voice Assistant for this business manager application.
Analyze the user's spoken command and map it to one of the following actions.

Today's date is: ${todayStr}. Use this to resolve relative dates like "previous month", "yesterday", "last week", "this month".

Available Actions & mappings:
1. ADD_TRANSACTION: Record a financial transaction (Income or Expense).
   - Parameters:
     - type: "Income" or "Expense"
     - amount: numeric value (e.g., "50 dollars" -> 50)
     - description: Concise text description describing exactly what the transaction was for (e.g., "Starbucks coffee", "Office desk", "Consulting fee").
       CRITICAL: Make the description clean, elegant, and professional. REMOVE all conversational filler words like "record expense of", "I spent", "dollars for", "yesterday", "paid me for", etc. Do NOT include price, dollar signs, or dates inside the description itself. If the user does not provide a specific description of what the transaction was for (e.g. they only say "record 10000 dollar income" or "add payment of 500 dollars for today's date"), default the description to "Business Transaction". Never generate placeholder text like "Recorded on 's date" or "for yesterday's date".
     - date: "YYYY-MM-DD" format. If not specified or relative, calculate relative to today: ${todayStr}.
2. ADD_CLIENT: Register a new client.
   - Parameters:
     - clientName: client's name (e.g., "add client John Doe" -> "John Doe")
     - upfrontAmount: (optional) upfront payment amount
     - finalAmount: (optional) final payment amount
3. ADD_INVOICE: Create or draft a new invoice for a client.
   - Parameters:
     - billedToName: (required) client name to bill to (e.g. "Bert Alleyne")
     - billedToEmail: (optional) client email to bill to (e.g. "bert@outlook.com")
     - itemTitle: (required) description of the services/goods (e.g. "Website development", "Consulting session")
     - itemPrice: (required) price of the service/goods as a numeric value (e.g., 250)
     - invoiceNo: (optional) custom invoice number (e.g., "INV-101")
4. NAVIGATE: Navigate to a different dashboard section.
   - Parameters:
     - path: "/" (for dashboard/transactions), "/clients", "/appointments", "/invoices", "/report" (monthly report)
     - monthName: (optional, for Monthly Report) full month name, e.g., "January", "February", etc.
     - yearValue: (optional, for Monthly Report) e.g., 2026
5. DOWNLOAD_INVOICE: Download/generate a PDF/statement for an invoice.
   - Parameters:
     - invoiceNo: e.g., "071", "INV-001"
     - billedTo: (optional) client name associated with the invoice

If the command does not map to any, set action: "UNKNOWN" and provide helpful feedback.

User spoken command: "${command}"`;

      let resultText: string | undefined;
      logDebug(`[VOICE] Using @google/genai SDK for API Key`);
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
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
      logDebug(`[VOICE] Gemini SDK Output: ${resultText}`);

      if (!resultText) {
        throw new Error("Invalid or empty response from Gemini content generation API");
      }

      const parsed = JSON.parse(resultText);
      res.json(parsed);
    } catch (error: any) {
      if (error.status === 401 || (error.message && error.message.includes("401"))) {
        logDebug(`[VOICE] Auth Error: API Key missing or invalid system token. Falling back to client-side local parser.`);
        res.status(401).json({ error: "Unauthorized / Missing API Key" });
      } else {
        logDebug(`[VOICE] Error: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Helper to extract authorization header or apiKey from query/body
  const getAuthToken = (req: any, provider: 'calendly' | 'calcom'): string | null => {
    let authHeader = req.headers.authorization;
    if (authHeader) {
      return authHeader;
    }
    
    // Check body or query
    const token = req.body?.apiKey || req.query?.apiKey || req.body?.token || req.query?.token;
    if (token) {
      if (provider === 'calendly') {
        return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      }
      return token; // cal.com takes raw token
    }
    return null;
  };

  // 1. Calendly - Current User (Supports GET and POST)
  const handleCalendlyUser = async (req: express.Request, res: express.Response) => {
    logDebug(`[PROXY] Calendly User request: ${req.method} ${req.url}`);
    try {
      const authHeader = getAuthToken(req, 'calendly');
      if (!authHeader) {
        logDebug(`[PROXY] Calendly User: Missing auth token`);
        return res.status(401).json({ error: 'Authorization header or apiKey is required' });
      }

      logDebug(`[PROXY] Calendly User: Fetching me from Calendly API`);
      const response = await fetch('https://api.calendly.com/users/me', {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });

      logDebug(`[PROXY] Calendly User: Calendly API response status: ${response.status}`);
      if (!response.ok) {
        const errText = await response.text();
        logDebug(`[PROXY] Calendly User API error: ${errText}`);
        return res.status(response.status).json({ error: errText });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      logDebug(`[PROXY] Calendly User Exception: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  };
  app.get('/api/proxy/calendly/user', handleCalendlyUser);
  app.post('/api/proxy/calendly/user', handleCalendlyUser);

  // 2. Calendly - Scheduled Events (Supports GET and POST)
  const handleCalendlyEvents = async (req: express.Request, res: express.Response) => {
    try {
      const authHeader = getAuthToken(req, 'calendly');
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header or apiKey is required' });
      }

      const userUri = (req.query.user as string) || req.body?.user || '';
      const count = (req.query.count as string) || req.body?.count || '20';
      const pageToken = (req.query.page_token as string) || req.body?.pageToken || req.body?.page_token || '';
      
      let url = `https://api.calendly.com/scheduled_events?count=${count}`;
      if (userUri) {
        url += `&user=${encodeURIComponent(userUri)}`;
      }
      if (pageToken) {
        url += `&page_token=${encodeURIComponent(pageToken)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: errText });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
  app.get('/api/proxy/calendly/events', handleCalendlyEvents);
  app.post('/api/proxy/calendly/events', handleCalendlyEvents);

  // 3. Calendly - Event Invitees (Supports GET and POST)
  const handleCalendlyInvitees = async (req: express.Request, res: express.Response) => {
    try {
      const authHeader = getAuthToken(req, 'calendly');
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header or apiKey is required' });
      }

      const eventUri = (req.query.event as string) || req.body?.event || '';
      if (!eventUri) {
        return res.status(400).json({ error: 'event parameter is required' });
      }

      const url = `https://api.calendly.com/scheduled_event_invitees?event=${encodeURIComponent(eventUri)}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: errText });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
  app.get('/api/proxy/calendly/invitees', handleCalendlyInvitees);
  app.post('/api/proxy/calendly/invitees', handleCalendlyInvitees);

  // 4. Cal.com - Bookings (Supports GET and POST, with automatic V1 fallback)
  const handleCalBookings = async (req: express.Request, res: express.Response) => {
    logDebug(`[PROXY] Cal.com Bookings request: ${req.method} ${req.url}`);
    try {
      const token = getAuthToken(req, 'calcom');
      if (!token) {
        logDebug(`[PROXY] Cal.com Bookings: Missing api token`);
        return res.status(401).json({ error: 'API key or token is required' });
      }

      const apiKey = token.replace('Bearer ', '').trim();
      logDebug(`[PROXY] Cal.com Bookings: Clean apiKey length: ${apiKey.length}`);

      // Direct call to Cal.com V2 API
      const urlV2 = `https://api.cal.com/v2/bookings`;
      logDebug(`[PROXY] Cal.com Bookings: Fetching v2/bookings from Cal.com API`);
      let response = await fetch(urlV2, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'cal-api-version': '2026-05-01'
        }
      });

      logDebug(`[PROXY] Cal.com Bookings: Cal.com V2 API response status: ${response.status}`);
      let usedV1 = false;

      if (!response.ok) {
        logDebug(`[PROXY] Cal.com Bookings: V2 API failed with status ${response.status}. Attempting V1 API fallback...`);
        const urlV1 = `https://api.cal.com/v1/bookings?apiKey=${apiKey}`;
        response = await fetch(urlV1, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        logDebug(`[PROXY] Cal.com Bookings: V1 Fallback response status: ${response.status}`);
        usedV1 = true;
      }

      if (!response.ok) {
        const errText = await response.text();
        logDebug(`[PROXY] Cal.com Bookings: Both V2 and V1 API calls failed. V1 Status: ${response.status}. Error: ${errText}`);
        return res.status(response.status).json({ error: `Cal.com API failed (Status: ${response.status}): ${errText}` });
      }

      const data = await response.json();
      logDebug(`[PROXY] Cal.com Bookings: Successfully retrieved data using ${usedV1 ? 'V1' : 'V2'} API`);
      res.json(data);
    } catch (error: any) {
      logDebug(`[PROXY] Cal.com Bookings Exception: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  };
  app.get('/api/proxy/cal/bookings', handleCalBookings);
  app.post('/api/proxy/cal/bookings', handleCalBookings);

  function resolveChromiumPath(): string | null {
    const candidates = [
      path.join(process.cwd(), 'chrome'),
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/opt/google/chrome/chrome',
      '/root/.cache/puppeteer'
    ];

    for (const c of candidates) {
      if (fs.existsSync(c)) {
        try {
          const stat = fs.statSync(c);
          if (stat.isFile()) return c;
          if (stat.isDirectory()) {
            const files = fs.readdirSync(c, { recursive: true }) as string[];
            const found = files.find(f => f.endsWith('/chrome') || f === 'chrome');
            if (found) {
              const full = path.join(c, found);
              if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
            }
          }
        } catch (e) {}
      }
    }
    return null;
  }

  // High-Fidelity Server-Side PDF Generation Route
  // Powered by Headless Chromium: 100% immune to mobile viewport collapses, device scaling, or OS differences.
  app.post('/api/generate-pdf', async (req: express.Request, res: express.Response) => {
    let browser: any = null;
    try {
      const { html, filename = "document.pdf", landscape = false, adaptHeight = false } = req.body;
      if (!html) {
        return res.status(400).json({ error: "Missing HTML content" });
      }

      const chromiumPath = resolveChromiumPath();
      if (!chromiumPath) {
        logDebug(`[PDF-GEN] Chromium binary not available on host. Notifying client to use off-screen sandbox fallback.`);
        return res.status(503).json({ error: "Server-side Chromium not installed. Client fallback active." });
      }

      browser = await puppeteer.launch({
        executablePath: chromiumPath,
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();
      
      // Lock viewport to exact 794px A4 coordinate system
      await page.setViewport({
        width: 794,
        height: 1123,
        deviceScaleFactor: 2
      });

      // Emulate screen media to ensure Tailwind classes, colors, and layout render with full fidelity
      await page.emulateMediaType('screen');

      // Set complete HTML with high-fidelity print styles and font loading
      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });

      // Extra check for font rendering if supported
      try {
        await page.evaluateHandle('document.fonts.ready');
      } catch (e) {}

      let pdfOptions: any = {
        landscape: !!landscape,
        printBackground: true,
        format: 'A4',
        preferCSSPageSize: false,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm'
        }
      };

      if (adaptHeight) {
        const measuredHeight = await page.evaluate(() => {
          const root = document.getElementById('print-root');
          const target = root || document.body;
          return Math.ceil(target.getBoundingClientRect().height);
        });
        delete pdfOptions.format;
        delete pdfOptions.preferCSSPageSize;
        pdfOptions.width = '794px';
        pdfOptions.height = `${Math.max(measuredHeight, 400)}px`;
      }

      const pdfBuffer = await page.pdf(pdfOptions);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.end(pdfBuffer);
    } catch (error: any) {
      logDebug(`[PDF-GEN] Server generation encountered issue: ${error.message}. Delegating to client fallback.`);
      res.status(500).json({ error: error.message || "Failed to generate PDF on server" });
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (e) {}
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
