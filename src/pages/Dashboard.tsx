import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTransactions, Transaction } from '../hooks/useTransactions';
import { useSessions } from '../hooks/useSessions';
import { DataMigrationModal } from '../components/DataMigrationModal';
import { Clock, FileText, CheckCircle2, ArrowUpRight, Download, Upload } from 'lucide-react';
import { formatDateToMMDDYYYY } from '../utils/dateFormat';
import { AmericanDateInput } from '../components/AmericanDateInput';

const parseDateString = (dateStr: string) => {
  if (!dateStr) return null;
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed month
    const day = parseInt(parts[2], 10);
    return { year, month, day };
  }
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    let month = parseInt(parts[0], 10) - 1;
    let day = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    if (month > 11 && day <= 12) {
      const tmp = month;
      month = day - 1;
      day = tmp + 1;
    }
    return { year, month, day };
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  }
  return null;
};

export function Dashboard() {
  const { transactions, loading, addTransaction, updateTransaction, removeTransaction } = useTransactions();
  const { sessions, loading: loadingSessions } = useSessions();
  const navigate = useNavigate();

  const [dashboardBottomTab, setDashboardBottomTab] = useState<'transactions' | 'unpaidInvoices'>('transactions');
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);

  useEffect(() => {
    const loadInvoices = () => {
      try {
        const stored = localStorage.getItem('pastInvoices');
        if (stored) {
          const parsed = JSON.parse(stored) as any[];
          const unpaid = parsed.filter(inv => inv.status !== 'paid');
          setUnpaidInvoices(unpaid);
        } else {
          setUnpaidInvoices([]);
        }
      } catch (e) {
        console.error("Error loading past invoices on dashboard:", e);
      }
    };

    loadInvoices();
    window.addEventListener('storage', loadInvoices);
    window.addEventListener('focus', loadInvoices);
    return () => {
      window.removeEventListener('storage', loadInvoices);
      window.removeEventListener('focus', loadInvoices);
    };
  }, []);

  const handleMarkAsPaid = (invoiceId: string) => {
    try {
      const stored = localStorage.getItem('pastInvoices');
      if (stored) {
        const parsed = JSON.parse(stored) as any[];
        const updated = parsed.map(inv => {
          if (inv.id === invoiceId) {
            return { ...inv, status: 'paid' };
          }
          return inv;
        });
        localStorage.setItem('pastInvoices', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        
        const unpaid = updated.filter(inv => inv.status !== 'paid');
        setUnpaidInvoices(unpaid);
      }
    } catch (e) {
      console.error("Error marking invoice as paid:", e);
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    localStorage.setItem('viewInvoiceId', invoiceId);
    navigate('/invoices');
  };

  const upcomingSessions = React.useMemo(() => {
    return sessions
      .filter(s => s.status === 'Upcoming')
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [sessions]);

  const [brandName, setBrandName] = useState(() => localStorage.getItem('brandName') || 'LOREM IPSUM');

  useEffect(() => {
    const handleNameChange = () => {
      const name = localStorage.getItem('brandName') || 'LOREM IPSUM';
      setBrandName(name);
      document.title = name;
    };
    handleNameChange(); // Set initially
    window.addEventListener('brandNameChange', handleNameChange);

    return () => {
      window.removeEventListener('brandNameChange', handleNameChange);
    };
  }, []);
  
  const [viewMode, setViewMode] = useState<'Monthly' | 'Yearly' | 'AllTime'>('Monthly');
  const currency = '$';
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const location = useLocation();
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const viewParam = searchParams.get('view');
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    
    if (viewParam === 'Monthly' || viewParam === 'Yearly' || viewParam === 'AllTime') {
      setViewMode(viewParam);
    }
    
    if (yearParam && !isNaN(Number(yearParam))) {
      setSelectedYear(Number(yearParam));
    }
    
    if (monthParam) {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const mIndex = months.findIndex(m => m.toLowerCase() === monthParam.toLowerCase());
      if (mIndex !== -1) {
        setSelectedMonth(mIndex);
        setViewMode('Monthly');
      }
    }
  }, [location.search]);
  
  const years = React.useMemo(() => {
    const y = new Set<number>();
    const currentYear = new Date().getFullYear();
    
    // Add current year and the next 5 years by default so they are always selectable immediately
    for (let i = 0; i <= 5; i++) {
      y.add(currentYear + i);
    }
    
    // Also automatically add any years found in entered transactions
    transactions.forEach(t => {
      if (t.date) {
        const parsed = parseDateString(t.date);
        if (parsed && !isNaN(parsed.year)) {
          y.add(parsed.year);
        }
      }
    });
    
    return Array.from(y).sort((a, b) => a - b);
  }, [transactions]);
  
  const [type, setType] = useState<'Income' | 'Expense'>('Income');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  // Transaction editing states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editType, setEditType] = useState<'Income' | 'Expense'>('Income');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleEditClick = (t: Transaction) => {
    setEditingTransactionId(t.id);
    setEditType(t.type);
    setEditAmount(t.amount.toString());
    setEditDate(formatDateToMMDDYYYY(t.date));
    setEditDescription(t.description);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAmount || !editDate || !editDescription) {
      alert("Please fill all required fields: Amount, Date, and Description.");
      return;
    }
    const parsedAmount = parseFloat(editAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (!editingTransactionId) return;
    try {
      await updateTransaction(editingTransactionId, {
        type: editType,
        amount: Number(parsedAmount.toFixed(2)),
        date: editDate,
        description: editDescription
      });
      setIsEditModalOpen(false);
      setEditingTransactionId(null);
    } catch (err: any) {
      alert(`Error updating transaction: ${err.message || 'Unknown error'}`);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date || !description) {
      alert("Please fill all required fields: Amount, Date, and Description.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      alert("Please enter a valid amount.");
      return;
    }
    try {
      await addTransaction({
        type,
        amount: Number(parsedAmount.toFixed(2)),
        date,
        description
      });
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportTransactions = () => {
    if (transactions.length === 0) {
      alert("No transactions to export.");
      return;
    }
    const headers = "Date,Type,Description,Amount\n";
    const csvContent = transactions.map(t => `${formatDateToMMDDYYYY(t.date)},${t.type},"${t.description.replace(/"/g, '""')}",${t.amount}`).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const calculatePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const pct = ((current - previous) / previous) * 100;
    return `${pct > 0 ? '+' : ''}${Math.round(pct)}%`;
  };

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const filteredTransactions = transactions.filter(t => {
    if (!t.date) return false;
    const parsed = parseDateString(t.date);
    if (!parsed || isNaN(parsed.year) || isNaN(parsed.month)) return false;
    if (viewMode === 'Yearly') {
      return parsed.year === selectedYear;
    } else if (viewMode === 'AllTime') {
      return true;
    } else {
      return parsed.year === selectedYear && parsed.month === selectedMonth;
    }
  });

  const previousFilteredTransactions = transactions.filter(t => {
    if (!t.date) return false;
    const parsed = parseDateString(t.date);
    if (!parsed || isNaN(parsed.year) || isNaN(parsed.month)) return false;
    if (viewMode === 'Yearly') {
      return parsed.year === selectedYear - 1;
    } else if (viewMode === 'AllTime') {
      return false;
    } else {
      let prevMonth = selectedMonth - 1;
      let prevYear = selectedYear;
      if (prevMonth < 0) {
        prevMonth = 11;
        prevYear -= 1;
      }
      return parsed.year === prevYear && parsed.month === prevMonth;
    }
  });

  const totalIncome = filteredTransactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);
  const netIncome = totalIncome - totalExpense;

  const prevTotalIncome = previousFilteredTransactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0);
  const prevTotalExpense = previousFilteredTransactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);

  const incPct = calculatePercentage(totalIncome, prevTotalIncome);
  const expPct = calculatePercentage(totalExpense, prevTotalExpense);

  const prevNetIncome = prevTotalIncome - prevTotalExpense;
  const calculateNetPercentage = (current: number, previous: number) => {
    if (previous === 0) {
      if (current === 0) return '0%';
      return current > 0 ? '+100%' : '-100%';
    }
    const pct = ((current - previous) / Math.abs(previous)) * 100;
    return `${pct > 0 ? '+' : ''}${Math.round(pct)}%`;
  };
  const netPct = calculateNetPercentage(netIncome, prevNetIncome);

  const chartData = React.useMemo(() => {
    if (filteredTransactions.length === 0) return [];
    
    const buckets: Record<string, { inc: number, exp: number }> = {};
    
    filteredTransactions.forEach(t => {
      const parsed = parseDateString(t.date);
      if (!parsed || isNaN(parsed.year) || isNaN(parsed.month) || isNaN(parsed.day)) return;
      const d = new Date(parsed.year, parsed.month, parsed.day);
      let key = '';
      if (viewMode === 'Yearly') {
        key = d.toLocaleString('en-US', { month: 'short' });
      } else if (viewMode === 'AllTime') {
        key = parsed.year.toString();
      } else {
        const week = Math.ceil(parsed.day / 7);
        key = `Wk ${week > 4 ? 4 : week}`;
      }
      
      if (!buckets[key]) buckets[key] = { inc: 0, exp: 0 };
      if (t.type === 'Income') buckets[key].inc += t.amount;
      else buckets[key].exp += t.amount;
    });

    const maxVal = Math.max(...Object.values(buckets).flatMap(b => [b.inc, b.exp]), 1);
    
    return Object.keys(buckets).sort((a,b) => {
        if (viewMode === 'Yearly') {
           const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
           return months.indexOf(a) - months.indexOf(b);
        } else if (viewMode === 'AllTime') {
           return Number(a) - Number(b);
        }
        return a.localeCompare(b);
    }).map(key => ({
       label: key,
       inc: buckets[key].inc,
       exp: buckets[key].exp,
       incHeight: `${(buckets[key].inc / maxVal) * 100}%`,
       expHeight: `${(buckets[key].exp / maxVal) * 100}%`,
       labelInc: buckets[key].inc > 0 ? `${(buckets[key].inc / 1000).toFixed(1)}k` : null,
       labelExp: buckets[key].exp > 0 ? `${(buckets[key].exp / 1000).toFixed(1)}k` : null,
    }));
  }, [filteredTransactions, viewMode]);

  return (
    <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto h-full w-full text-black">
      {/* Page Header & View Toggles */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 className="font-headline font-extrabold text-xl md:text-2xl lg:text-3xl tracking-tight uppercase">
            <span className="text-primary-container">{brandName}'S</span> FINANCE TRACKING
          </h2>
        </div>
        
        <div className="flex flex-col items-stretch lg:items-end gap-3 w-full lg:w-auto">
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:gap-2.5 sm:justify-end">
            <button 
              onClick={() => {
                setIsMigrationModalOpen(true);
              }} 
              className="w-full order-first sm:order-last sm:w-auto px-3.5 py-1.5 border-2 border-black text-xs hover:bg-neutral-100 transition-colors duration-100 font-bold uppercase tracking-wide text-black bg-white neu-shadow-sm active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <div className="flex items-center">
                <Upload className="w-3.5 h-3.5" /> 
              </div>
              Export
            </button>
            
            <button 
              onClick={() => setViewMode(viewMode === 'AllTime' ? 'Monthly' : 'AllTime')} 
              className={`w-full sm:w-auto px-3.5 py-1.5 border-2 border-black text-xs font-bold uppercase tracking-wide transition-colors duration-100 neu-shadow-sm active:translate-y-0.5 active:shadow-none ${viewMode === 'AllTime' ? 'bg-primary-container text-white border-black' : 'bg-white text-black hover:bg-neutral-100'}`}
            >
              All Time
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto overflow-visible sm:items-center">
            <div className="grid grid-cols-2 border-2 border-black bg-surface-container-lowest neu-shadow w-full sm:flex sm:w-auto overflow-hidden">
              <button 
                onClick={() => setViewMode('Monthly')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 font-headline font-bold uppercase tracking-wide text-xs border-black sm:border-r-2 ${viewMode === 'Monthly' ? 'bg-primary-container text-white' : 'hover:bg-surface-container-low transition-colors text-black'}`}>
                Monthly
              </button>
              <button 
                onClick={() => setViewMode('Yearly')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 font-headline font-bold uppercase tracking-wide text-xs border-l-2 sm:border-l-0 border-black ${viewMode === 'Yearly' ? 'bg-primary-container text-white' : 'hover:bg-surface-container-low transition-colors text-black'}`}>
                Yearly
              </button>
            </div>
            
            {viewMode !== 'AllTime' && (
              <div className={`${viewMode === 'Monthly' ? 'grid grid-cols-2' : 'flex'} gap-2 w-full sm:flex sm:w-auto`}>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="flex-1 sm:flex-none w-full sm:w-auto px-3 py-1.5 font-headline font-bold uppercase tracking-wider text-xs border-2 border-black bg-white focus:outline-none cursor-pointer appearance-none text-black neu-shadow-sm pr-7 min-w-[90px] transition-all hover:bg-neutral-50"
                  style={{ WebkitAppearance: 'none', appearance: 'none', backgroundPosition: 'right 0.35rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem', backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"><path d="M7 10l5 5 5-5z"/></svg>')` }}
                >
                  {years.map((y, i) => (
                    <option key={i} value={y}>{y}</option>
                  ))}
                </select>
                
                {viewMode === 'Monthly' && (
                   <select 
                     value={selectedMonth} 
                     onChange={(e) => setSelectedMonth(Number(e.target.value))}
                     className="flex-1 sm:flex-none w-full sm:w-auto px-3 py-1.5 font-headline font-bold uppercase tracking-wider text-xs border-2 border-black bg-white focus:outline-none cursor-pointer appearance-none text-black neu-shadow-sm pr-7 min-w-[90px] transition-all hover:bg-neutral-50"
                     style={{ WebkitAppearance: 'none', appearance: 'none', backgroundPosition: 'right 0.35rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem', backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"><path d="M7 10l5 5 5-5z"/></svg>')` }}
                   >
                     {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                       <option key={i} value={i}>{m}</option>
                     ))}
                   </select>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 pb-2">
        <div className="bg-surface-container-lowest border-2 border-black neu-shadow p-5 relative overflow-hidden group w-full">
          <div className="absolute top-0 right-0 w-12 h-12 bg-green-100 border-l-2 border-b-2 border-black flex items-center justify-center -mr-2 -mt-2">
            <span className="material-symbols-outlined text-green-700 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              arrow_upward
            </span>
          </div>
          <p className="font-body font-bold text-outline uppercase tracking-widest text-xs mb-1.5">Total Income</p>
          <h3 className="font-numbers font-extrabold text-2xl md:text-3xl mb-3 text-black">{currency}{totalIncome.toLocaleString()}</h3>
          <div className="flex items-center gap-2 text-xs font-body font-medium">
            {viewMode === 'AllTime' ? (
              <span className="text-on-surface-variant">All Time recorded income</span>
            ) : (
              <>
                <span className={`px-1.5 py-0.5 border-2 border-black text-[10px] font-bold ${incPct.startsWith('+') ? 'bg-green-100 text-green-800' : incPct === '0%' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>{incPct}</span>
                <span className="text-on-surface-variant text-[11px]">vs last {viewMode === 'Monthly' ? 'month' : 'year'}</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-surface-container-lowest border-2 border-black neu-shadow p-5 relative overflow-hidden group w-full">
          <div className="absolute top-0 right-0 w-12 h-12 bg-red-100 border-l-2 border-b-2 border-black flex items-center justify-center -mr-2 -mt-2">
            <span className="material-symbols-outlined text-red-700 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              arrow_downward
            </span>
          </div>
          <p className="font-body font-bold text-outline uppercase tracking-widest text-xs mb-1.5">Total Expenses</p>
          <h3 className="font-numbers font-extrabold text-2xl md:text-3xl mb-3 text-black">{currency}{totalExpense.toLocaleString()}</h3>
          <div className="flex items-center gap-2 text-xs font-body font-medium">
            {viewMode === 'AllTime' ? (
              <span className="text-on-surface-variant">All Time recorded expenses</span>
            ) : (
              <>
                <span className={`px-1.5 py-0.5 border-2 border-black text-[10px] font-bold ${expPct.startsWith('+') ? 'bg-red-100 text-red-800' : expPct === '0%' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>{expPct}</span>
                <span className="text-on-surface-variant text-[11px]">vs last {viewMode === 'Monthly' ? 'month' : 'year'}</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-primary-container text-white border-2 border-black neu-shadow p-5 relative overflow-hidden w-full">
          <div className="absolute top-0 right-0 w-12 h-12 bg-white border-l-2 border-b-2 border-black flex items-center justify-center -mr-2 -mt-2">
            <span className="material-symbols-outlined text-primary-container text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
          </div>
          <p className="font-body font-bold text-primary-fixed uppercase tracking-widest text-xs mb-1.5">Net Income</p>
          <h3 className="font-numbers font-extrabold text-2xl md:text-3xl mb-3 text-white">{currency}{netIncome.toLocaleString()}</h3>
          <div className="flex items-center gap-2 text-[11px] md:text-xs font-body font-medium whitespace-nowrap overflow-hidden">
            {viewMode === 'AllTime' ? (
              <span className="text-primary-fixed truncate">All Time recorded net income</span>
            ) : (
              <>
                <span className={`px-1.5 py-0.5 border-2 border-black text-[9px] md:text-[10px] font-bold shrink-0 ${
                  netIncome > prevNetIncome ? 'bg-green-100 text-green-800' : netIncome === prevNetIncome ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                }`}>{netPct}</span>
                <span className="text-primary-fixed truncate select-none">
                  vs last {viewMode === 'Monthly' ? 'month' : 'year'}
                  {totalIncome > 0 && ` (${Math.round((netIncome / totalIncome) * 100)}% margin)`}
                  {totalIncome === 0 && totalExpense > 0 && ' (deficit)'}
                  {totalIncome === 0 && totalExpense === 0 && ' (no activity)'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Split: Add Entry Form & Chart/Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Add Entry Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-container-lowest border-2 border-black neu-shadow">
            <div className="bg-secondary-container border-b-2 border-black p-4 text-black">
              <h3 className="font-headline font-bold text-lg uppercase tracking-tight">Quick Entry</h3>
            </div>
            <div className="p-4 md:p-6 overflow-hidden min-w-0">
              <form onSubmit={handleAdd} className="flex flex-col gap-4 pb-4 md:pb-0 min-w-0">
                <div className="w-full flex flex-col justify-end min-w-0">
                  <label className="block font-body font-bold text-sm mb-2 uppercase tracking-wide">Type</label>
                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer relative">
                      <input checked={type === 'Income'} onChange={() => setType('Income')} className="peer sr-only" name="entry_type" type="radio" />
                      <div className="border-2 border-black p-3 text-center font-headline font-bold uppercase text-sm peer-checked:bg-primary-container peer-checked:text-white transition-colors bg-white text-black flex items-center justify-center">
                        Income
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer relative">
                      <input checked={type === 'Expense'} onChange={() => setType('Expense')} className="peer sr-only" name="entry_type" type="radio" />
                      <div className="border-2 border-black p-3 text-center font-headline font-bold uppercase text-sm peer-checked:bg-red-500 peer-checked:text-white transition-colors bg-white text-black flex items-center justify-center">
                        Expense
                      </div>
                    </label>
                  </div>
                </div>
                <div className="w-full flex flex-col justify-end">
                  <label className="block font-body font-bold text-sm mb-2 uppercase tracking-wide">Amount ({currency})</label>
                  <input
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow empty or decimal numbers with up to 2 decimal places (e.g. "456", "456.", "456.6", "456.62")
                      if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
                        setAmount(val);
                      }
                    }}
                    className="w-full box-border min-w-0 appearance-none rounded-none border-2 border-black p-3 font-body font-medium bg-surface-container-low focus:bg-white focus:outline-none focus:ring-0 focus:border-primary-container transition-colors"
                    placeholder="0.00"
                    type="text"
                    inputMode="decimal"
                  />
                </div>
                <div className="w-full flex flex-col justify-end">
                  <label className="block font-body font-bold text-sm mb-2 uppercase tracking-wide">Date (MM/DD/YYYY)</label>
                  <AmericanDateInput
                    value={date}
                    onChange={(val) => setDate(val)}
                    className="w-full box-border min-w-0 appearance-none rounded-none border-2 border-black p-3 font-body font-medium bg-surface-container-low focus:bg-white focus:outline-none focus:ring-0 focus:border-primary-container transition-colors"
                    placeholder="MM/DD/YYYY"
                  />
                </div>
                <div className="w-full flex flex-col justify-end">
                  <label className="block font-body font-bold text-sm mb-2 uppercase tracking-wide">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full box-border min-w-0 appearance-none rounded-none border-2 border-black p-3 font-body font-medium bg-surface-container-low focus:bg-white focus:outline-none focus:ring-0 focus:border-primary-container transition-colors"
                    placeholder="Brief details..."
                    rows={2}
                  ></textarea>
                </div>
                <div className="w-full flex flex-col justify-end pt-1">
                  <button
                    className="w-full bg-primary-container text-white border-2 border-black p-4 font-headline font-bold uppercase tracking-widest neu-shadow-sm hover:translate-y-1 hover:shadow-none transition-all block text-center hover:bg-blue-700"
                    type="submit"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Upcoming Appointments Widget */}
          <div className="bg-surface-container-lowest border-2 border-black neu-shadow">
            <div className="bg-secondary-container border-b-2 border-black p-4 text-black flex justify-between items-center">
              <h3 className="font-headline font-bold text-base uppercase tracking-tight">Upcoming Appointments</h3>
              <button 
                onClick={() => navigate('/appointments')}
                className="text-xs font-bold uppercase hover:underline text-primary-container"
              >
                View All
              </button>
            </div>
            <div className="p-4 space-y-3">
              {loadingSessions ? (
                <p className="text-xs text-neutral-500 font-medium">Loading appointments...</p>
              ) : upcomingSessions.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-neutral-500 italic">No upcoming appointments.</p>
                  <button 
                    onClick={() => navigate('/appointments')}
                    className="mt-2 text-[10px] font-bold uppercase tracking-wider border-2 border-black px-2 py-1 bg-white hover:bg-neutral-100"
                  >
                    Book Appointment
                  </button>
                </div>
              ) : (
                upcomingSessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="border-2 border-black p-3 bg-surface-container-low flex flex-col gap-1 text-black">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-headline font-black text-xs uppercase truncate max-w-[130px]">
                        {session.clientName}
                      </span>
                      <span className="font-mono text-[10px] bg-[#ebf8ff] text-blue-800 border border-black px-1.5 py-0.5 font-bold uppercase whitespace-nowrap">
                        {formatDateToMMDDYYYY(session.date)}
                      </span>
                    </div>
                    <p className="font-body font-bold text-xs uppercase text-neutral-800 truncate">
                      {session.title}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      {session.time && (
                        <p className="font-mono text-[10px] text-neutral-500 flex items-center gap-1">
                          🕒 {session.time}
                        </p>
                      )}
                      
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chart & Data Table */}
        <div className="lg:col-span-2 space-y-8">
          {/* Visualization Chart Area */}
          <div className="bg-surface-container-lowest border-2 border-black neu-shadow">
            <div className="bg-secondary-container border-b-2 border-black p-4 flex justify-between items-center text-black">
              <h3 className="font-headline font-bold text-lg uppercase tracking-tight">Cash Flow Overview</h3>
            </div>
            <div className="p-4 md:p-6 h-64 border-b-2 border-black border-opacity-20 pb-0 overflow-x-auto hide-scrollbar">
              <div className="w-full min-w-[600px] h-48 px-2 md:px-4 flex items-end justify-around gap-2 md:gap-4 lg:gap-6">
                {chartData.length === 0 ? (
                   <div className="w-full text-center font-bold text-on-surface-variant font-body h-full flex items-center justify-center">No data for selected {viewMode.toLowerCase()}</div>
                ) : chartData.map((buck, i) => (
                  <div key={i} className="flex flex-col items-center justify-end h-full w-16 md:w-20 lg:w-24 shrink-0">
                    <div className="flex gap-0.5 md:gap-1 items-end h-full group w-full justify-center">
                      <div className="w-6 md:w-8 lg:w-10 bg-red-500 border-2 border-black relative transition-all" style={{ height: buck.expHeight || '2px' }}>
                         {buck.labelExp && <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity text-black z-10 bg-white px-1 border-2 border-black whitespace-nowrap">{buck.labelExp}</span>}
                      </div>
                      <div className="w-6 md:w-8 lg:w-10 bg-blue-600 border-2 border-black relative transition-all" style={{ height: buck.incHeight || '2px' }}>
                        {buck.labelInc && <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity text-black z-10 bg-white px-1 border-2 border-black whitespace-nowrap">{buck.labelInc}</span>}
                      </div>
                    </div>
                    <span className="font-body font-bold text-[10px] md:text-xs uppercase mt-2">{buck.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 flex justify-center gap-6 font-body font-bold text-sm uppercase tracking-wide text-black">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 border-2 border-black"></div> Income
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 border-2 border-black"></div> Expense
              </div>
            </div>
          </div>

          {/* Data Table / Tab Container */}
          <div className="bg-surface-container-lowest border-2 border-black neu-shadow overflow-hidden">
             <div className="bg-secondary-container border-b-2 border-black p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-black">
               <div className="flex gap-2">
                 <button
                   onClick={() => setDashboardBottomTab('transactions')}
                   className={`px-3 py-1.5 border-2 border-black font-headline font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                     dashboardBottomTab === 'transactions'
                       ? 'bg-black text-white'
                       : 'bg-white text-black hover:bg-neutral-100'
                   }`}
                 >
                   Transactions
                 </button>
                 <button
                   onClick={() => setDashboardBottomTab('unpaidInvoices')}
                   className={`px-3 py-1.5 border-2 border-black font-headline font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                     dashboardBottomTab === 'unpaidInvoices'
                       ? 'bg-black text-white'
                       : 'bg-white text-black hover:bg-neutral-100'
                   }`}
                 >
                   Unpaid Invoices
                   {unpaidInvoices.length > 0 && (
                     <span className="bg-red-500 text-white text-[9px] font-black font-mono px-1.5 py-0.5 rounded-full border border-black shrink-0">
                       {unpaidInvoices.length}
                     </span>
                   )}
                 </button>
               </div>
               
               <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xs font-bold uppercase tracking-wide flex items-center gap-1 hover:underline decoration-2 underline-offset-4 self-end sm:self-auto">
                 Top <span className="material-symbols-outlined text-sm">arrow_upward</span>
               </button>
             </div>

             {dashboardBottomTab === 'transactions' ? (
               <div className="overflow-x-auto text-black">
                 <table className="w-full text-left font-body min-w-[600px]">
                   <thead>
                     <tr className="border-b-2 border-black bg-surface-container-low text-xs uppercase tracking-widest text-[#434655]">
                       <th className="text-center p-4 font-bold border-r-2 border-outline-variant w-24">Date</th>
                       <th className="text-center p-4 font-bold border-r-2 border-outline-variant w-28">Type</th>
                       <th className="text-center p-4 font-bold border-r-2 border-outline-variant">Description</th>
                       <th className="text-center p-4 font-bold border-r-2 border-outline-variant w-32">Amount ({currency})</th>
                       <th className="p-4 font-bold text-center w-28">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {loading && <tr><td colSpan={5} className="p-4 text-center font-bold">Loading...</td></tr>}
                     {!loading && filteredTransactions.length === 0 && <tr><td colSpan={5} className="p-4 text-center font-bold">No transactions found.</td></tr>}
                     {!loading && filteredTransactions.map((t, idx) => (
                       <tr key={idx} className="border-b-2 border-outline-variant hover:bg-surface-container-low transition-colors">
                         <td className="p-4 font-medium text-sm border-r-2 border-outline-variant">{formatDateToMMDDYYYY(t.date)}</td>
                         <td className="p-4 border-r-2 border-outline-variant">
                           <span className={`inline-block px-2 py-1 text-xs font-bold uppercase border-2 border-black ${t.type === 'Income' ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'}`}>{t.type}</span>
                         </td>
                         <td className="p-4 font-medium text-sm border-r-2 border-outline-variant">
                           {t.description}
                         </td>
                         <td className="p-4 font-bold text-right font-headline text-lg border-r-2 border-outline-variant">{t.type === 'Income' ? '+' : '-'}{currency}{t.amount.toLocaleString()}</td>
                         <td className="p-4 text-center">
                           <div className="flex items-center justify-center gap-2">
                             <button 
                               onClick={() => handleEditClick(t)} 
                               className="p-1 border-2 border-black bg-white hover:bg-neutral-100 text-black font-bold text-xs uppercase transition-all flex items-center justify-center neu-shadow-xs" 
                               title="Edit"
                             >
                               <span className="material-symbols-outlined block text-sm">edit</span>
                             </button>
                             <button 
                               onClick={() => removeTransaction(t.id)} 
                               className="p-1 border-2 border-black bg-white hover:bg-red-50 text-red-500 font-bold text-xs uppercase transition-all flex items-center justify-center neu-shadow-xs" 
                               title="Delete"
                             >
                               <span className="material-symbols-outlined block text-sm">delete</span>
                             </button>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             ) : (
               <div className="overflow-x-auto text-black">
                 <table className="w-full text-left font-body min-w-[600px]">
                   <thead>
                     <tr className="border-b-2 border-black bg-surface-container-low text-[11px] uppercase tracking-wider text-[#434655]">
                       <th className="text-center px-2 py-3 font-bold border-r-2 border-outline-variant whitespace-nowrap">Invoice No.</th>
                       <th className="text-center px-2 py-3 font-bold border-r-2 border-outline-variant whitespace-nowrap">Billed To</th>
                       <th className="text-center px-2 py-3 font-bold border-r-2 border-outline-variant whitespace-nowrap">Date Issued</th>
                       <th className="text-center px-2 py-3 font-bold border-r-2 border-outline-variant whitespace-nowrap">Total Amount</th>
                       <th className="px-2 py-3 font-bold text-center whitespace-nowrap">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {unpaidInvoices.length === 0 ? (
                       <tr>
                         <td colSpan={5} className="p-8 text-center font-bold">
                           <div className="flex flex-col items-center justify-center gap-2">
                             <span className="material-symbols-outlined text-4xl text-neutral-400">check_circle</span>
                             <p className="font-headline font-black text-sm uppercase">All Invoices Paid!</p>
                             <p className="font-body text-xs text-neutral-500">There are no unpaid invoices recorded in your system.</p>
                             <button
                               onClick={() => navigate('/invoices')}
                               className="mt-2 px-3 py-1.5 bg-white text-black text-xs font-headline font-bold uppercase tracking-wider border-2 border-black hover:bg-neutral-100 transition-colors"
                             >
                               Create New Invoice
                             </button>
                           </div>
                         </td>
                       </tr>
                     ) : (
                       unpaidInvoices.map((inv) => (
                         <tr key={inv.id} className="border-b-2 border-outline-variant hover:bg-surface-container-low transition-colors">
                           <td className="p-4 border-r-2 border-outline-variant font-mono font-bold">
                             <span className="inline-block px-2 py-0.5 border border-black/30 bg-neutral-100 text-xs uppercase tracking-wide rounded-none font-bold">
                               #{inv.invoiceNo}
                             </span>
                           </td>
                           <td className="p-4 border-r-2 border-outline-variant">
                             <div className="font-bold text-sm text-black">{inv.billedToName || 'N/A'}</div>
                             <div className="text-xs text-neutral-500">{inv.billedToEmail || 'N/A'}</div>
                           </td>
                           <td className="p-4 border-r-2 border-outline-variant font-medium text-sm text-neutral-600">
                             <div className="flex items-center gap-1">
                               <Clock className="w-3.5 h-3.5 text-neutral-400" />
                               {inv.invoiceDate ? formatDateToMMDDYYYY(inv.invoiceDate) : 'N/A'}
                             </div>
                           </td>
                           <td className="p-4 font-bold text-right font-headline text-lg border-r-2 border-outline-variant text-black">
                             {inv.currencySymbol || '$'}{Number(inv.totalAmount || 0).toLocaleString()}
                           </td>
                           <td className="p-4 text-center">
                             <div className="flex items-center justify-center gap-2">
                               <button
                                 onClick={() => handleMarkAsPaid(inv.id)}
                                 className="px-2.5 py-1.5 border-2 border-black bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-headline font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95"
                                 title="Mark as Paid"
                               >
                                 <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                               </button>
                               <button
                                 onClick={() => handleViewInvoice(inv.id)}
                                 className="p-1.5 border-2 border-black bg-white hover:bg-neutral-100 text-black transition-all hover:scale-105 active:scale-95"
                                 title="View / Edit Invoice"
                               >
                                 <ArrowUpRight className="w-3.5 h-3.5" />
                               </button>
                             </div>
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest border-4 border-black w-full max-w-md neu-shadow-lg relative animate-in fade-in zoom-in-95 duration-100 max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-secondary-container border-b-2 border-black p-3 text-black flex justify-between items-center">
              <h3 className="font-headline font-extrabold text-sm uppercase tracking-tight">
                Update Transaction
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 border-2 border-black bg-white active:bg-gray-200 font-bold text-xs"
              >
                <span className="material-symbols-outlined block text-black text-sm">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} className="p-4 space-y-4 text-black">
              {/* Type */}
              <div>
                <label className="block font-body font-bold text-[10px] mb-1.5 uppercase tracking-wide">Transaction Type</label>
                <div className="flex border-2 border-black overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setEditType('Income')}
                    className={`flex-1 py-2 font-headline font-bold text-xs uppercase tracking-wider transition-colors border-r-2 border-black ${editType === 'Income' ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-neutral-50'}`}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('Expense')}
                    className={`flex-1 py-2 font-headline font-bold text-xs uppercase tracking-wider transition-colors ${editType === 'Expense' ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-neutral-50'}`}
                  >
                    Expense
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block font-body font-bold text-[10px] mb-1.5 uppercase tracking-wide">Amount ({currency})</label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  placeholder="0.00"
                  value={editAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
                      setEditAmount(val);
                    }
                  }}
                  className="w-full text-xs p-2 border-2 border-black bg-surface-container-low focus:bg-white focus:outline-none text-black"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block font-body font-bold text-[10px] mb-1.5 uppercase tracking-wide">Date (MM/DD/YYYY)</label>
                <AmericanDateInput
                  required
                  value={editDate}
                  onChange={(val) => setEditDate(val)}
                  placeholder="MM/DD/YYYY"
                  className="w-full text-xs p-2 border-2 border-black bg-surface-container-low focus:bg-white focus:outline-none text-black"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-body font-bold text-[10px] mb-1.5 uppercase tracking-wide">Description</label>
                <input
                  type="text"
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-xs p-2 border-2 border-black bg-surface-container-low focus:bg-white focus:outline-none text-black"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2 px-3 border-2 border-black bg-white hover:bg-neutral-50 text-black font-headline font-bold text-xs uppercase tracking-wider transition-colors active:translate-y-0.5 active:shadow-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 border-2 border-black bg-white hover:bg-neutral-100 text-black font-headline font-bold text-xs uppercase tracking-wider transition-colors active:translate-y-0.5 active:shadow-none"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DataMigrationModal 
        isOpen={isMigrationModalOpen} 
        onClose={() => setIsMigrationModalOpen(false)}
      />
    </main>
  );
}
