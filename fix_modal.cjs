const fs = require('fs');

const path = 'src/components/DataMigrationModal.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetContent = `            <div className="bg-neutral-50 border-2 border-black p-4">
              <h3 className="font-headline font-bold text-sm uppercase mb-3 text-black flex items-center gap-2">
                <Table className="w-4 h-4" /> CSV Exports
              </h3>
              <p className="text-sm font-medium text-neutral-600 leading-relaxed mb-4">
                Download individual sections as spreadsheet-compatible CSV files.
              </p>
              <div className="flex flex-wrap gap-3 mb-2">
                <button 
                  onClick={handleExportClientsCSV}
                  className="flex-1 min-w-[calc(50%-6px)] px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-start gap-2"
                >
                  <Table className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Clients CSV</span>
                </button>
                <button 
                  onClick={handleExportTransactionsCSV}
                  className="flex-1 min-w-[calc(50%-6px)] px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-start gap-2"
                >
                  <Table className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Transactions CSV</span>
                </button>
                <button 
                  onClick={handleExportAppointmentsCSV}
                  className="flex-1 min-w-[calc(50%-6px)] px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-start gap-2"
                >
                  <Table className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Appointments CSV</span>
                </button>
                <button 
                  onClick={handleExportTasksCSV}
                  className="flex-1 min-w-[calc(50%-6px)] px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-start gap-2"
                >
                  <Table className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Tasks CSV</span>
                </button>
                <button 
                  onClick={handleExportMonthlyReportsCSV}
                  className="flex-1 min-w-[calc(50%-6px)] px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-start gap-2"
                >
                  <Table className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Monthly Reports CSV</span>
                </button>
              </div>
            </div>`;

const replacementContent = `            <div className="bg-neutral-50 border-2 border-black p-4">
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
            </div>`;

if (code.includes(targetContent)) {
    code = code.replace(targetContent, replacementContent);
    fs.writeFileSync(path, code);
    console.log("Successfully updated modal structure.");
} else {
    console.log("Target content not found.");
}
