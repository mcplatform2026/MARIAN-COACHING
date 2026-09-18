const fs = require('fs');

let code = fs.readFileSync('src/components/DataMigrationModal.tsx', 'utf8');

// Add useTasks import
if (!code.includes('import { useTasks }')) {
  code = code.replace(
    "import { useAgreements } from '../hooks/useAgreements';",
    "import { useAgreements } from '../hooks/useAgreements';\nimport { useTasks } from '../hooks/useTasks';"
  );
}

// Add tasks destructuring
if (!code.includes('const { tasks } = useTasks();')) {
  code = code.replace(
    "const { agreements } = useAgreements();",
    "const { agreements } = useAgreements();\n  const { tasks } = useTasks();"
  );
}

// Replace Agreements CSV and Invoices CSV buttons
code = code.replace(
  /onClick=\{handleExportAgreementsCSV\}[\s\S]*?<span className="truncate">Agreements CSV<\/span>[\s\S]*?<\/button>/,
  `onClick={handleExportTasksCSV}
                  className="flex-1 min-w-[calc(50%-6px)] px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-start gap-2"
                >
                  <Table className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Tasks CSV</span>
                </button>`
);

code = code.replace(
  /onClick=\{handleExportInvoicesCSV\}[\s\S]*?<span className="truncate">Invoices CSV<\/span>[\s\S]*?<\/button>/,
  `onClick={handleExportMonthlyReportsCSV}
                  className="flex-1 min-w-[calc(50%-6px)] px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-start gap-2"
                >
                  <Table className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Monthly Reports CSV</span>
                </button>`
);

// Add export function definitions for tasks and monthly reports
const newExports = `
  const handleExportTasksCSV = () => {
    const headers = ['Title', 'Status', 'Priority', 'Due Date'];
    const rows = tasks.map((t: any) => [t.title, t.status, t.priority, t.dueDate]);
    exportCSV('tasks', headers, rows);
  };

  const parseDateToMonthYear = (dateStr: string) => {
    if (!dateStr) return null;
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) return { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) - 1 };
    }
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) return { year: parseInt(parts[2], 10), month: parseInt(parts[1], 10) - 1 };
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return { year: d.getFullYear(), month: d.getMonth() };
    return null;
  };

  const handleExportMonthlyReportsCSV = () => {
    const headers = ['Year', 'Month', 'Gross Income', 'Total Expenses', 'Net Profit', 'Clients Added', 'Sessions Completed', 'Invoices Issued', 'Invoices Value'];
    
    // Collect all month-years
    const monthYearsMap = new Map<string, { year: number, month: number, grossIncome: number, totalExpenses: number, clientsAdded: number, sessionsCompleted: number, invoicesIssued: number, invoicesValue: number }>();
    
    const getStats = (year: number, month: number) => {
      const key = \`\${year}-\${month}\`;
      if (!monthYearsMap.has(key)) {
        monthYearsMap.set(key, { year, month, grossIncome: 0, totalExpenses: 0, clientsAdded: 0, sessionsCompleted: 0, invoicesIssued: 0, invoicesValue: 0 });
      }
      return monthYearsMap.get(key)!;
    };

    transactions.forEach((t: any) => {
      const parsed = parseDateToMonthYear(t.date);
      if (parsed) {
        const stats = getStats(parsed.year, parsed.month);
        const amount = Number(t.amount) || 0;
        if (t.type === 'income') stats.grossIncome += amount;
        else if (t.type === 'expense') stats.totalExpenses += amount;
      }
    });

    clients.forEach((c: any) => {
      const parsed = parseDateToMonthYear(c.onboardingDate);
      if (parsed) {
        const stats = getStats(parsed.year, parsed.month);
        stats.clientsAdded += 1;
      }
    });

    sessions.forEach((s: any) => {
      if (s.status === 'Completed') {
        const parsed = parseDateToMonthYear(s.date);
        if (parsed) {
          const stats = getStats(parsed.year, parsed.month);
          stats.sessionsCompleted += 1;
        }
      }
    });

    invoices.forEach((i: any) => {
      const parsed = parseDateToMonthYear(i.invoiceDate);
      if (parsed) {
        const stats = getStats(parsed.year, parsed.month);
        stats.invoicesIssued += 1;
        const total = i.items?.reduce((sum: number, item: any) => sum + (Number(item.qty) * Number(item.price)), 0) || 0;
        stats.invoicesValue += total;
      }
    });

    const rows = Array.from(monthYearsMap.values())
      .sort((a, b) => b.year - a.year || b.month - a.month)
      .map(s => [
        s.year, 
        s.month + 1, 
        s.grossIncome, 
        s.totalExpenses, 
        s.grossIncome - s.totalExpenses, 
        s.clientsAdded, 
        s.sessionsCompleted, 
        s.invoicesIssued, 
        s.invoicesValue
      ]);
    
    exportCSV('monthly_reports', headers, rows);
  };
`;

code = code.replace(
  /const handleExportAgreementsCSV = \(\) => \{[\s\S]*?exportCSV\('agreements', headers, rows\);\n  \};/,
  newExports
);

code = code.replace(
  /const handleExportInvoicesCSV = \(\) => \{[\s\S]*?exportCSV\('invoices', headers, rows\);\n  \};/,
  ''
);

// Add tasks to JSON backup
code = code.replace(
  "invoices,",
  "invoices,\n        tasks,"
);

fs.writeFileSync('src/components/DataMigrationModal.tsx', code);
console.log('Patched DataMigrationModal.tsx');
