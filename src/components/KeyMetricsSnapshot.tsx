import React from 'react';
import { DollarSign, TrendingDown, TrendingUp, Users } from 'lucide-react';

interface KeyMetricsSnapshotProps {
  grossIncome: number;
  totalExpenses: number;
  netProfit: number;
  clientsAdded: number;
  prevGrossIncome: number;
  prevTotalExpenses: number;
  prevNetProfit: number;
  prevClientsAdded: number;
  sessionsCompleted: number;
  prevSessionsCompleted: number;
  invoicesIssued: number;
  prevInvoicesIssued: number;
  currency: string;
}

const getGrowthText = (current: number, previous: number) => {
  if (previous === 0) {
    if (current === 0) return "No change compared to previous month";
    return "100% increase compared to previous month";
  }
  const diff = current - previous;
  const percentage = (diff / previous) * 100;
  if (percentage > 0) return `${percentage.toFixed(0)}% increase compared to previous month`;
  if (percentage < 0) return `${Math.abs(percentage).toFixed(0)}% down as compared to previous month`;
  return "No change compared to previous month";
};

export const KeyMetricsSnapshot: React.FC<KeyMetricsSnapshotProps> = ({
  grossIncome,
  totalExpenses,
  netProfit,
  clientsAdded,
  prevGrossIncome,
  prevTotalExpenses,
  prevNetProfit,
  prevClientsAdded,
  sessionsCompleted,
  prevSessionsCompleted,
  invoicesIssued,
  prevInvoicesIssued,
  currency
}) => {
  return (
    <div className="space-y-3.5">
      {/* Gross Revenue */}
      <div className="pb-2 border-b border-neutral-100">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-green-100 border border-green-400 text-green-700 font-bold text-xs w-5.5 h-5.5 flex items-center justify-center">
              {currency === '₹' ? (
                <span className="font-bold text-[10px] leading-none">₹</span>
              ) : currency === '€' ? (
                <span className="font-bold text-[10px] leading-none">€</span>
              ) : currency === '£' ? (
                <span className="font-bold text-[10px] leading-none">£</span>
              ) : (
                <DollarSign className="w-3.5 h-3.5" />
              )}
            </span>
            <span className="font-headline font-bold text-xs uppercase text-black">Income</span>
          </div>
          <span className="font-mono font-bold text-sm text-green-600">{currency}{grossIncome.toLocaleString()}</span>
        </div>
        <div className="text-[10px] text-neutral-500 font-medium font-body text-right">
          {getGrowthText(grossIncome, prevGrossIncome)}
        </div>
      </div>
      
      {/* Total Expenses */}
      <div className="pb-2 border-b border-neutral-100">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-red-100 border border-red-400 text-red-700 font-bold text-xs w-5.5 h-5.5 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </span>
            <span className="font-headline font-bold text-xs uppercase text-black">Expenses</span>
          </div>
          <span className="font-mono font-bold text-sm text-red-600">{currency}{totalExpenses.toLocaleString()}</span>
        </div>
        <div className="text-[10px] text-neutral-500 font-medium font-body text-right">
          {getGrowthText(totalExpenses, prevTotalExpenses)}
        </div>
      </div>
      
      {/* Net Profit */}
      <div className="pb-2 border-b border-neutral-100">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-blue-100 border border-blue-400 text-blue-700 font-bold text-xs w-5.5 h-5.5 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
            <span className="font-headline font-bold text-xs uppercase text-black">Net profit</span>
          </div>
          <span className="font-mono font-bold text-sm text-blue-600">{currency}{netProfit.toLocaleString()}</span>
        </div>
        <div className="text-[10px] text-neutral-500 font-medium font-body text-right">
          {getGrowthText(netProfit, prevNetProfit)}
        </div>
      </div>
      
      {/* Clients Added */}
      <div className="pb-2 border-b border-neutral-100">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-purple-100 border border-purple-400 text-purple-700 font-bold text-xs w-5.5 h-5.5 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </span>
            <span className="font-headline font-bold text-xs uppercase text-black">Clients added</span>
          </div>
          <span className="font-mono font-bold text-sm text-purple-700">{clientsAdded}</span>
        </div>
        <div className="text-[10px] text-neutral-500 font-medium font-body text-right">
          {getGrowthText(clientsAdded, prevClientsAdded)}
        </div>
      </div>

      {/* Sessions Completed */}
      <div className="pb-2 border-b border-neutral-100">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-yellow-100 border border-yellow-400 text-yellow-700 font-bold text-xs w-5.5 h-5.5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
            </span>
            <span className="font-headline font-bold text-xs uppercase text-black">Sessions Completed</span>
          </div>
          <span className="font-mono font-bold text-sm text-yellow-700">{sessionsCompleted}</span>
        </div>
        <div className="text-[10px] text-neutral-500 font-medium font-body text-right">
          {getGrowthText(sessionsCompleted, prevSessionsCompleted)}
        </div>
      </div>

      {/* Invoices Issued */}
      <div className="pb-2 border-b border-neutral-100">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-orange-100 border border-orange-400 text-orange-700 font-bold text-xs w-5.5 h-5.5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </span>
            <span className="font-headline font-bold text-xs uppercase text-black">Invoices Issued</span>
          </div>
          <span className="font-mono font-bold text-sm text-orange-700">{invoicesIssued}</span>
        </div>
        <div className="text-[10px] text-neutral-500 font-medium font-body text-right">
          {getGrowthText(invoicesIssued, prevInvoicesIssued)}
        </div>
      </div>
    </div>
  );
};
