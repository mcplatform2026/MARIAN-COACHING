import re

content = """import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, Table } from 'lucide-react';
import { useClients } from '../hooks/useClients';
import { useTransactions } from '../hooks/useTransactions';
import { useSessions } from '../hooks/useSessions';
import { useAgreements } from '../hooks/useAgreements';

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
  
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  const formatDateToDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return '--';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const formatDateFromTimestamp = (ts: any) => {
    if (!ts) return '--';
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString();
    return new Date(ts).toLocaleDateString();
  };

  const exportCSV = (filename: string, headers: string[], dataRows: any[][]) => {
    const csvContent = [
      headers.join(','),
      ...dataRows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\\n');
    
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
    const rows = transactions.map(t => [formatDateToDDMMYYYY(t.date), t.type, t.description, t.amount]);
    exportCSV('transactions', headers, rows);
  };

  const handleExportAppointmentsCSV = () => {
    const headers = ['Date', 'Time', 'Client', 'Details', 'Completed'];
    const rows = sessions.map(s => [s.date, s.time, s.clientName, s.details, s.completed ? 'Yes' : 'No']);
    exportCSV('appointments', headers, rows);
  };
  
  const handleExportAgreementsCSV = () => {
    const headers = ['Date', 'Client', 'Type', 'Status', 'Fee'];
    const rows = agreements.map(a => [formatDateFromTimestamp(a.timestamp), a.clientName, a.templateType, a.status, a.fee]);
    exportCSV('agreements', headers, rows);
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
        brandName: localStorage.getItem('brandName'),
        brandColor: localStorage.getItem('brandColor')
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
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button 
                  onClick={handleExportClientsCSV}
                  className="w-full px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-center gap-1.5"
                >
                  <Table className="w-3.5 h-3.5" /> Clients CSV
                </button>
                <button 
                  onClick={handleExportTransactionsCSV}
                  className="w-full px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-center gap-1.5"
                >
                  <Table className="w-3.5 h-3.5" /> Transactions CSV
                </button>
                <button 
                  onClick={handleExportAppointmentsCSV}
                  className="w-full px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-center gap-1.5"
                >
                  <Table className="w-3.5 h-3.5" /> Appointments CSV
                </button>
                <button 
                  onClick={handleExportAgreementsCSV}
                  className="w-full px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-center gap-1.5"
                >
                  <Table className="w-3.5 h-3.5" /> Agreements CSV
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
"""

with open('src/components/DataMigrationModal.tsx', 'w') as f:
    f.write(content)
