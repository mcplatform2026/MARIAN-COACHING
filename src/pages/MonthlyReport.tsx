import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTransactions, Transaction } from "../hooks/useTransactions";
import { useClients, Client } from "../hooks/useClients";
import { useSessions, Session } from "../hooks/useSessions";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  FileText, 
  Calendar, 
  Download, 
  CheckCircle,
  Briefcase,
  Layers,
  FileSpreadsheet
} from "lucide-react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { KeyMetricsSnapshot } from "../components/KeyMetricsSnapshot";
import { getCurrentDateMMDDYYYY } from "../utils/dateFormat";

const getFormattedCurrentDate = () => {
  return getCurrentDateMMDDYYYY();
};


interface SavedInvoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  billedToName: string;
  billedToEmail: string;
  totalAmount: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function MonthlyReport() {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const { transactions, loading: loadingTrans } = useTransactions();
  const { clients, loading: loadingClients } = useClients();
  const { sessions, loading: loadingSessions } = useSessions();

  const [brandName, setBrandName] = useState(() => localStorage.getItem('brandName') || 'LOREM IPSUM');
  const currency = '$';
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [downloading, setDownloading] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [autoDownloadTriggered, setAutoDownloadTriggered] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Sync from URL search params (e.g. ?month=February&year=2026)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get('month');
    if (m !== null && m.length > 0) {
      const parsed = parseInt(m, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 11) {
        setSelectedMonth(parsed);
      } else {
        const index = MONTHS.findIndex(name => name.toLowerCase() === m.toLowerCase());
        if (index !== -1) {
          setSelectedMonth(index);
        }
      }
    }
    const y = params.get('year');
    if (y !== null) {
      const parsed = parseInt(y, 10);
      if (!isNaN(parsed)) {
        setSelectedYear(parsed);
      }
    }

    if (params.get('download') === 'true') {
       setAutoDownloadTriggered(true);
    }
  }, [location.search]);

  // Load brand name dynamically
  useEffect(() => {
    const handleNameChange = () => {
      setBrandName(localStorage.getItem('brandName') || 'LOREM IPSUM');
    };
    window.addEventListener('brandNameChange', handleNameChange);
    return () => {
      window.removeEventListener('brandNameChange', handleNameChange);
    };
  }, []);

  // Fetch past invoices from local storage
  useEffect(() => {
    setLoadingInvoices(true);
    try {
      const stored = localStorage.getItem('pastInvoices');
      if (stored) {
        setSavedInvoices(JSON.parse(stored) as SavedInvoice[]);
      } else {
        setSavedInvoices([]);
      }
    } catch (e) {
      console.error("Error reading past invoices:", e);
    } finally {
      setLoadingInvoices(false);
    }
  }, []);

  // Years option based on transactions + range around current year
  const yearsOptions = useMemo(() => {
    const yearsSet = new Set<number>();
    const currentYear = new Date().getFullYear();
    for (let i = -3; i <= 3; i++) {
      yearsSet.add(currentYear + i);
    }
    transactions.forEach(t => {
      if (t.date) {
        const parts = t.date.split('-');
        if (parts.length > 0) {
          const y = parseInt(parts[0], 10);
          if (!isNaN(y)) yearsSet.add(y);
        }
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [transactions]);

  // Parse YYYY-MM-DD date format
  const isMatchMonthAndYear = (dateStr: string, targetMonth: number, targetYear: number) => {
    if (!dateStr) return false;
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed month
      return year === targetYear && month === targetMonth;
    }
    return false;
  };

  // Parse invoice date DD/MM/YYYY format
  const isMatchInvoiceMonthAndYear = (invoiceDateStr: string, targetMonth: number, targetYear: number) => {
    if (!invoiceDateStr) return false;
    
    if (invoiceDateStr.includes('-')) {
      const parts = invoiceDateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        return year === targetYear && month === targetMonth;
      }
    }
    
    const parts = invoiceDateStr.split('/');
    if (parts.length === 3) {
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      // If p0 > 12, it's DD/MM/YYYY so month is p1 - 1; otherwise MM/DD/YYYY so month is p0 - 1
      const month = p0 > 12 ? p1 - 1 : p0 - 1;
      return year === targetYear && month === targetMonth;
    }
    
    try {
      const d = new Date(invoiceDateStr);
      if (!isNaN(d.getTime())) {
         return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
      }
    } catch(e) {}
    
    return false;
  };

  // 1. FILTERED FINANCIAL TRANSACTIONS
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => isMatchMonthAndYear(t.date, selectedMonth, selectedYear));
  }, [transactions, selectedMonth, selectedYear]);

  const grossIncome = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const netProfit = grossIncome - totalExpenses;

  // 2. FILTERED CLIENTS ACQUIRED
  const filteredClients = useMemo(() => {
    return clients.filter(c => isMatchMonthAndYear(c.onboardingDate, selectedMonth, selectedYear));
  }, [clients, selectedMonth, selectedYear]);

  // 3. FILTERED SESSIONS COMPLETED
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => s.status === 'Completed' && isMatchMonthAndYear(s.date, selectedMonth, selectedYear));
  }, [sessions, selectedMonth, selectedYear]);

  // 4. FILTERED INVOICES ISSUED
  const filteredInvoices = useMemo(() => {
    return savedInvoices.filter(inv => isMatchInvoiceMonthAndYear(inv.invoiceDate, selectedMonth, selectedYear));
  }, [savedInvoices, selectedMonth, selectedYear]);


  const invoicesTotalAmount = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  }, [filteredInvoices]);

  // Previous month calculations for growth metrics
  const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

  const prevMonthTransactions = useMemo(() => {
    return transactions.filter(t => isMatchMonthAndYear(t.date, prevMonth, prevYear));
  }, [transactions, prevMonth, prevYear]);

  const prevGrossIncome = useMemo(() => {
    return prevMonthTransactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [prevMonthTransactions]);

  const prevTotalExpenses = useMemo(() => {
    return prevMonthTransactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [prevMonthTransactions]);

  const prevNetProfit = prevGrossIncome - prevTotalExpenses;

  const prevClientsAdded = useMemo(() => {
    return clients.filter(c => isMatchMonthAndYear(c.onboardingDate, prevMonth, prevYear)).length;
  }, [clients, prevMonth, prevYear]);

  const prevSessionsCompleted = useMemo(() => {
    return sessions.filter(s => s.status === 'Completed' && isMatchMonthAndYear(s.date, prevMonth, prevYear)).length;
  }, [sessions, prevMonth, prevYear]);

  const prevInvoicesIssued = useMemo(() => {
    return savedInvoices.filter(inv => isMatchInvoiceMonthAndYear(inv.invoiceDate, prevMonth, prevYear)).length;
  }, [savedInvoices, prevMonth, prevYear]);


  // Download PDF Action
  const handleDownloadPDF = async () => {
    const element = document.getElementById("invoice-capture-area") || document.getElementById("monthly-report-capture-area");
    if (!element) return;

            
        // Create a robust iframe to force desktop media queries
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1024px';
    iframe.style.height = '2000px'; 
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const bg = '#ffffff';
    const textCol = '#000000';
    
    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write('<html><head></head><body style="margin:0; background-color:' + bg + ';"></body></html>');
    iframeDoc.close();
    
    // Crucial: Copy all style and link tags so Tailwind and fonts work inside the iframe
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach(s => {
      iframeDoc.head.appendChild(s.cloneNode(true));
    });

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = "794px";
    clone.style.minHeight = "1123px";
    clone.style.transform = "none";
    clone.style.margin = "0";
    clone.style.boxShadow = "none"; 
    clone.style.borderRadius = "0";
    clone.style.display = "flex";
    clone.style.flexDirection = "column";
    clone.style.visibility = "visible";
    clone.style.boxSizing = "border-box";
    clone.style.padding = "64px";
    clone.style.backgroundColor = bg;
    clone.style.color = textCol;

    const footerContact = clone.querySelector('#footer-contact-row') as HTMLElement;
    if (footerContact) {
      footerContact.className = "flex flex-row items-center justify-center gap-8 w-full max-w-[500px] mx-auto font-bold font-headline uppercase tracking-wide";
      footerContact.style.fontSize = "15px";
    }

    const actionElements = clone.querySelectorAll(".no-print");
    actionElements.forEach(el => (el as HTMLElement).style.display = "none");

    iframeDoc.body.appendChild(clone);

    try {
      // Allow DOM to compute styles
      await new Promise(r => setTimeout(r, 300));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: bg,
        width: 794,
        windowWidth: 1024,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      
      const filename = `Monthly_Report_${typeof selectedMonth !== 'undefined' ? selectedMonth : ''}_${typeof selectedYear !== 'undefined' ? selectedYear : ''}.pdf`;
      
      pdf.save(filename);
      document.body.removeChild(iframe);

    } catch (err) {
      console.error('Failed to generate PDF:', err);
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
      alert(`Failed to download PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      
                }
  };


  const isLoading = loadingTrans || loadingClients || loadingSessions || loadingInvoices;

  // Auto trigger download if requested
  useEffect(() => {
    if (autoDownloadTriggered && !isLoading && !loadingInvoices && !downloading && reportRef.current) {
      handleDownloadPDF();
      setAutoDownloadTriggered(false); // only run once
    }
  }, [autoDownloadTriggered, isLoading, loadingInvoices, downloading]);

  return (
    <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto h-full w-full text-black bg-surface animate-in fade-in duration-300">
      {/* Header section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-headline font-black text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-tight uppercase whitespace-nowrap">
            <span className="text-primary-container">{brandName}'S</span> MONTHLY REPORT
          </h2>
        </div>
        
        {/* Controls */}
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:gap-2.5 sm:items-center">
          {/* Month selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            className="w-full sm:w-auto px-3 py-1.5 font-headline font-bold uppercase tracking-wider text-xs border-2 border-black bg-white focus:outline-none cursor-pointer appearance-none text-black neu-shadow-sm pr-7 min-w-[90px] transition-all hover:bg-neutral-50"
            style={{ WebkitAppearance: 'none', appearance: 'none', backgroundPosition: 'right 0.35rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem', backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"><path d="M7 10l5 5 5-5z"/></svg>')` }}
          >
            {MONTHS.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>

          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="w-full sm:w-auto px-3 py-1.5 font-headline font-bold uppercase tracking-wider text-xs border-2 border-black bg-white focus:outline-none cursor-pointer appearance-none text-black neu-shadow-sm pr-7 min-w-[90px] transition-all hover:bg-neutral-50"
            style={{ WebkitAppearance: 'none', appearance: 'none', backgroundPosition: 'right 0.35rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem', backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"><path d="M7 10l5 5 5-5z"/></svg>')` }}
          >
            {yearsOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Download button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isLoading || downloading}
            className="col-span-2 w-full sm:w-auto px-3.5 py-2 border-2 border-black bg-primary-container hover:bg-blue-700 text-white font-headline font-bold text-xs uppercase tracking-wider transition-all duration-100 flex items-center justify-center gap-2 neu-shadow-sm active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? "Generating..." : "Download Report PDF"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-black neu-shadow-sm animate-pulse">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-headline font-bold text-xs uppercase tracking-widest text-neutral-700">
            Gathering monthly ledger data...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Summary Dashboard widgets (Interactive & fast to scan) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border-2 border-black p-4 rounded-none neu-shadow-sm">
              <h3 className="font-headline font-extrabold text-xs uppercase tracking-wider text-neutral-500 mb-3">
                Key Metrics Snapshot
              </h3>
              
              <KeyMetricsSnapshot 
                grossIncome={grossIncome}
                totalExpenses={totalExpenses}
                netProfit={netProfit}
                clientsAdded={filteredClients.length}
                prevGrossIncome={prevGrossIncome}
                prevTotalExpenses={prevTotalExpenses}
                prevNetProfit={prevNetProfit}
                                      prevClientsAdded={prevClientsAdded}
                      sessionsCompleted={filteredSessions.length}
                      prevSessionsCompleted={prevSessionsCompleted}
                      invoicesIssued={filteredInvoices.length}
                      prevInvoicesIssued={prevInvoicesIssued}
                      currency={currency}
              />
            </div>
            </div>
          {/* Elegant Printable Ledger Sheet (The exact single page report mockup) */}
          <div className="lg:col-span-8">
            <div className="bg-white border-2 border-black p-2 rounded-none neu-shadow-md">
              {/* Document Container */}
              <div 
                ref={reportRef}
                id="monthly-report-capture-area" 
                className="bg-white text-black p-6 md:p-8 font-body text-xs relative overflow-hidden flex flex-col min-h-[800px]"
              >
                {/* Border-lined watermark badge */}
                <div className="absolute top-0 right-0 border-l-2 border-b-2 border-black bg-neutral-100 font-mono font-bold text-[9px] px-3.5 py-1.5 uppercase tracking-wider">
                  REPORT REF: PR-{selectedYear}-{String(selectedMonth + 1).padStart(2, '0')}
                </div>

                {/* Brand Header */}
                <div className="border-b-2 border-black pb-4 mb-6">
                  <h1 className="font-headline font-black text-2xl uppercase tracking-tighter text-blue-600" style={{ color: "var(--color-primary-container)" }}>
                    {brandName}
                  </h1>
                  <p className="font-headline font-bold text-xs uppercase tracking-widest text-black mt-1">
                    Practice Operations & Ledger Summary
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                    For Period: {MONTHS[selectedMonth]} {selectedYear}
                  </p>
                </div>

                {/* Executive Summary Narrative */}
                <div className="mb-10">
                  <h3 className="font-headline font-extrabold text-xs uppercase tracking-wider text-neutral-800 mb-2">
                    Executive Narrative
                  </h3>
                  <p className="text-[11px] leading-relaxed text-neutral-700 italic">
                    This automated report consolidates operational intelligence for {brandName} during the month of {MONTHS[selectedMonth]} {selectedYear}. Net earnings logged at <strong className="text-black">{currency}{netProfit.toLocaleString()}</strong> alongside <strong className="text-black">{filteredClients.length}</strong> client additions, <strong className="text-black">{filteredSessions.length}</strong> successfully delivered sessions, and <strong className="text-black">{filteredInvoices.length}</strong> invoices issued.
                  </p>
                </div>

                {/* Financial overview ledger block */}
                <div className="grid grid-cols-3 gap-3.5 mb-10">
                  <div className="border-2 border-black bg-neutral-50 p-3">
                    <p className="font-headline font-black text-[9px] uppercase tracking-wider text-neutral-500 mb-1">
                      Gross Income
                    </p>
                    <p className="font-mono font-bold text-lg text-green-600">
                      {currency}{grossIncome.toLocaleString()}
                    </p>
                  </div>
                  <div className="border-2 border-black bg-neutral-50 p-3">
                    <p className="font-headline font-black text-[9px] uppercase tracking-wider text-neutral-500 mb-1">
                      Total Overhead
                    </p>
                    <p className="font-mono font-bold text-lg text-red-600">
                      {currency}{totalExpenses.toLocaleString()}
                    </p>
                  </div>
                  <div className="border-2 border-black text-white p-3" style={{ backgroundColor: "var(--color-primary-container)" }}>
                    <p className="font-headline font-black text-[9px] uppercase tracking-wider text-white mb-1">
                      Net Position
                    </p>
                    <p className="font-mono font-bold text-lg text-white">
                      {currency}{netProfit.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Key Metrics Snapshot in PDF */}
                <div className="mb-6">
                  <h3 className="font-headline font-extrabold text-xs uppercase tracking-wider text-neutral-800 mb-3 border-b-2 border-black pb-0.5">
                    Key Metrics Snapshot
                  </h3>
                  <KeyMetricsSnapshot 
                    grossIncome={grossIncome}
                    totalExpenses={totalExpenses}
                    netProfit={netProfit}
                    clientsAdded={filteredClients.length}
                    prevGrossIncome={prevGrossIncome}
                    prevTotalExpenses={prevTotalExpenses}
                    prevNetProfit={prevNetProfit}
                    prevClientsAdded={prevClientsAdded}
                    sessionsCompleted={filteredSessions.length}
                    prevSessionsCompleted={prevSessionsCompleted}
                    invoicesIssued={filteredInvoices.length}
                    prevInvoicesIssued={prevInvoicesIssued}
                    currency={currency}
                  />
                </div>

                {/* Report Signoff Footer */}
                <div className="mt-auto pt-4 border-t border-dashed border-neutral-300 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] uppercase font-bold font-headline">Generated Legally</p>
                    <p className="text-[8px] font-mono text-neutral-500">Timestamp: {getFormattedCurrentDate()} {new Date().toLocaleTimeString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-headline font-bold text-[11px] uppercase tracking-tighter" style={{ color: "var(--color-primary-container)" }}>
                      {brandName}
                    </p>
                    <p className="text-[8px] font-mono text-neutral-400">Authenticity Validated via Local Ledger</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
