import re

with open('src/components/DataMigrationModal.tsx', 'r') as f:
    content = f.read()

# Replace the grid-cols-2 with flex wrap layout for better handling of 5 items
old_grid = """<div className="grid grid-cols-2 gap-3 mb-2">
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
                <button 
                  onClick={handleExportInvoicesCSV}
                  className="w-full px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-center gap-1.5"
                >
                  <Table className="w-3.5 h-3.5" /> Invoices CSV
                </button>
              </div>"""

new_grid = """<div className="flex flex-wrap gap-3 mb-2">
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
                  onClick={handleExportAgreementsCSV}
                  className="flex-1 min-w-[calc(50%-6px)] px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-start gap-2"
                >
                  <Table className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Agreements CSV</span>
                </button>
                <button 
                  onClick={handleExportInvoicesCSV}
                  className="flex-1 min-w-[calc(50%-6px)] px-3 py-2 bg-white text-black border-2 border-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all hover:bg-neutral-100 hover:translate-y-0.5 hover:shadow-none flex items-center justify-start gap-2"
                >
                  <Table className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Invoices CSV</span>
                </button>
              </div>"""

if old_grid in content:
    content = content.replace(old_grid, new_grid)
    with open('src/components/DataMigrationModal.tsx', 'w') as f:
        f.write(content)
    print("Fixed grid!")
else:
    print("Could not find grid to replace.")
