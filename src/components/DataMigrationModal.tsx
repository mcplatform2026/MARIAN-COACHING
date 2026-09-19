import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, Table } from 'lucide-react';
import { useClients } from '../hooks/useClients';
import { useTransactions } from '../hooks/useTransactions';
import { useSessions } from '../hooks/useSessions';
import { useAgreements } from '../hooks/useAgreements';
import { useTasks } from '../hooks/useTasks';
import { formatDateToMMDDYYYY } from '../utils/dateFormat';

interface DataMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataMigrationModal({ 
  isOpen, 
  onClose
}: DataMigrationModalProps) {
  const { clients } = useClients();
  const { transactions } = useTransactions();
  const { sessions } = useSessions();
  const { agreements } = useAgreements();
  const { tasks } = useTasks();
  
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  const [invoices, setInvoices] = useState<any[]>([]);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('pastInvoices');
      if (stored) {
        setInvoices(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse invoices from localStorage');
    }
  }, []);

  const formatDateFromTimestamp = (ts: any) => {
    return formatDateToMMDDYYYY(ts);
  };

  const exportCSV = (filename: string, headers: string[], dataRows: any[][]) => {
    const csvContent = [
      headers.join(','),
      ...dataRows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportClientsCSV = () => {
    const headers = ['Name', 'Contact', 'Description', 'Last Paid'];
    const rows = clients.map(c => [c.name, c.contact, c.description, c.lastPaid]);
    exportCSV('clients', headers, rows);
  };

  const handleExportTransactionsCSV = () => {
    const headers = ['Date', 'Type', 'Description', 'Amount'];
    const rows = transactions.map(t => [formatDateToMMDDYYYY(t.date), t.type, t.description, t.amount]);
    exportCSV('transactions', headers, rows);
  };

  const handleExportAppointmentsCSV = () => {
    const headers = ['Date', 'Time', 'Client', 'Title', 'Status'];
    const rows = sessions.map(s => [formatDateToMMDDYYYY(s.date), s.time, s.clientName, s.title, s.status]);
    exportCSV('appointments', headers, rows);
  };
  
  
  const handleExportTasksCSV = () => {
    const headers = ['Title', 'Status', 'Priority', 'Due Date'];
    const rows = tasks.map((t: any) => [t.title, t.status, t.priority, formatDateToMMDDYYYY(t.dueDate)]);
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
      if (parts.length === 3) {
        let year = parseInt(parts[2], 10);
        if (year < 100) year += 2000;
        const p0 = parseInt(parts[0], 10);
        const p1 = parseInt(parts[1], 10);
        const month = p0 > 12 ? p1 - 1 : p0 - 1;
        return { year, month };
      }
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
      const key = `${year}-${month}`;
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


  

  const handleExportJSON = () => {
    setExporting(true);
    setExportSuccess(false);

    try {
      const data = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        clients,
        transactions,
        sessions,
        agreements,
        invoices,
        tasks,
        settings: {
          brandName: localStorage.getItem('brandName'),
          brandColor: localStorage.getItem('brandColor'),
          dashboardCurrency: localStorage.getItem('dashboardCurrency'),
          appCurrency: localStorage.getItem('app_currency'),
          invoiceLogoData: localStorage.getItem('invoiceLogoData'),
          invoiceTermsData: localStorage.getItem('invoiceTermsData'),
          invoiceThemeData: localStorage.getItem('invoiceThemeData'),
          invoiceTypographyData: localStorage.getItem('invoiceTypographyData'),
          invoiceItemsData: localStorage.getItem('invoiceItemsData'),
          invoiceLogoLocked: localStorage.getItem('invoiceLogoLocked'),
          invoiceTermsLocked: localStorage.getItem('invoiceTermsLocked'),
          invoiceThemeLocked: localStorage.getItem('invoiceThemeLocked'),
          invoiceTypographyLocked: localStorage.getItem('invoiceTypographyLocked'),
          invoiceItemsLocked: localStorage.getItem('invoiceItemsLocked'),
          clientsFormSchema: localStorage.getItem('clientsFormSchema'),
          clientsTableColumns: localStorage.getItem('clientsTableColumns'),
          clientsTableLocked: localStorage.getItem('clientsTableLocked')
        }
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border-2 border-black neu-shadow w-full max-w-lg flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-secondary-container border-b-2 border-black p-4 flex justify-between items-center text-black">
          <h2 className="font-headline font-extrabold text-lg uppercase tracking-tight flex items-center gap-2">
            <Upload className="w-5 h-5" /> Export Data
          </h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-black/10 transition-colors rounded-none outline-none">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 bg-white text-black font-body text-sm space-y-6 max-h-[80vh] overflow-y-auto">
          
          <div className="space-y-4">
            <div className="bg-neutral-50 border-2 border-black p-4">
              <h3 className="font-headline font-bold text-sm uppercase mb-3 text-black flex items-center gap-2">
                <Table className="w-4 h-4" /> CSV Exports
              </h3>
              <p className="text-sm font-medium text-neutral-600 leading-relaxed mb-4">
                Download individual sections as spreadsheet-compatible CSV files.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <button 
                  onClick={handleExportClientsCSV}
                  className="px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-start gap-2"
                >
                  <Table className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Clients CSV</span>
                </button>
                <button 
                  onClick={handleExportTransactionsCSV}
                  className="px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-start gap-2"
                >
                  <Table className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Transactions CSV</span>
                </button>
                <button 
                  onClick={handleExportAppointmentsCSV}
                  className="px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-start gap-2"
                >
                  <Table className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Appointments CSV</span>
                </button>
                <button 
                  onClick={handleExportTasksCSV}
                  className="px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-start gap-2"
                >
                  <Table className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Tasks CSV</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-neutral-50 border-2 border-black p-4">
              <h3 className="font-headline font-bold text-sm uppercase mb-3 text-black">Master JSON Backup</h3>
              <p className="text-sm font-medium text-neutral-600 leading-relaxed mb-4">
                Download a complete backup of your workspace. The JSON file contains all 
                clients, transactions, appointments, agreements, and settings.
              </p>

              <button 
                onClick={handleExportJSON}
                disabled={exporting}
                className="w-full px-6 py-4 bg-primary-container text-white border-2 border-black neu-shadow font-headline font-black uppercase tracking-wider text-sm transition-all hover:translate-y-0.5 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {exportSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Downloaded Successfully
                  </>
                ) : exporting ? (
                  'Preparing File...'
                ) : (
                  <>
                    <FileText className="w-5 h-5" /> 
                    Download JSON Backup
                  </>
                )}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
