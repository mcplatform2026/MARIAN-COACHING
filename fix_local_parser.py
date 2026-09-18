import re

with open('src/components/VoiceAssistantModal.tsx', 'r') as f:
    text = f.read()

target = """      } else if (text.includes("report") || text.includes("finance") || text.includes("monthly")) {
        path = "/report";
        feedback = "Opening your monthly financial report.";
        
        const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        for (const m of months) {
          if (text.includes(m)) {
            monthName = m.charAt(0).toUpperCase() + m.slice(1);
            feedback = `Opening your financial report for ${monthName}.`;
            break;
          }
        }
        
        if (!monthName) {
          const shortMonths = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
          const fullMonthsMap: Record<string, string> = {
            jan: "January", feb: "February", mar: "March", apr: "April", may: "May", jun: "June",
            jul: "July", aug: "August", sep: "September", oct: "October", nov: "November", dec: "December"
          };
          for (const sm of shortMonths) {
            if (new RegExp(`\\\\b${sm}\\\\b`).test(text)) {
              monthName = fullMonthsMap[sm];
              feedback = `Opening your financial report for ${monthName}.`;
              break;
            }
          }
        }

        const yearMatch = text.match(/\\b(20\d{2})\\b/);
        if (yearMatch) {
          yearValue = parseInt(yearMatch[1], 10);
          feedback = `Opening your financial report for ${monthName || "this month"} ${yearValue}.`;
        }
      } else if (text.includes("dashboard") || text.includes("home") || text.includes("main")) {
        path = "/";
        feedback = "Navigating to your main dashboard.";
      }"""

replace = """      } else if (text.includes("report") || text.includes("finance") || text.includes("dashboard") || text.includes("home") || text.includes("main") || text.includes("monthly")) {
        if (text.includes("report") || text.includes("finance")) {
          path = "/report";
          feedback = "Opening your monthly financial report.";
        } else {
          path = "/";
          feedback = "Navigating to your main dashboard.";
        }
        
        const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        for (const m of months) {
          if (text.includes(m)) {
            monthName = m.charAt(0).toUpperCase() + m.slice(1);
            feedback = `Opening your ${path === '/' ? 'dashboard' : 'financial report'} for ${monthName}.`;
            break;
          }
        }
        
        if (!monthName) {
          const shortMonths = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
          const fullMonthsMap: Record<string, string> = {
            jan: "January", feb: "February", mar: "March", apr: "April", may: "May", jun: "June",
            jul: "July", aug: "August", sep: "September", oct: "October", nov: "November", dec: "December"
          };
          for (const sm of shortMonths) {
            if (new RegExp(`\\\\b${sm}\\\\b`).test(text)) {
              monthName = fullMonthsMap[sm];
              feedback = `Opening your ${path === '/' ? 'dashboard' : 'financial report'} for ${monthName}.`;
              break;
            }
          }
        }

        const yearMatch = text.match(/\\b(20\\d{2})\\b/);
        if (yearMatch) {
          yearValue = parseInt(yearMatch[1], 10);
          feedback = `Opening your ${path === '/' ? 'dashboard' : 'financial report'} for ${monthName || "this month"} ${yearValue}.`;
        }
      }"""

text = text.replace(target, replace)

with open('src/components/VoiceAssistantModal.tsx', 'w') as f:
    f.write(text)
