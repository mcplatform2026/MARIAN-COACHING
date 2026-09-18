const fs = require('fs');
let code = fs.readFileSync('src/pages/Sessions.tsx', 'utf8');

const oldTabs = `            <div className="flex flex-nowrap overflow-x-auto hide-scrollbar border-2 border-black bg-surface-container-lowest mx-auto lg:mx-0 w-full sm:w-auto">
              {(['All', 'Upcoming', 'Completed', 'Cancelled'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={\`whitespace-nowrap flex-none px-6 py-3 font-headline font-bold text-[10px] sm:text-xs uppercase tracking-wide border-black last:border-r-0 border-r-2 \${
                    statusFilter === st ? 'bg-primary-container text-white' : 'hover:bg-neutral-100 transition-colors text-black'
                  }\`}
                >`;

const newTabs = `            <div className="flex flex-nowrap overflow-x-auto hide-scrollbar border-2 border-black bg-surface-container-lowest mx-auto lg:mx-0 w-full sm:w-auto">
              {(['All', 'Upcoming', 'Completed', 'Cancelled'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={\`whitespace-nowrap flex-1 sm:flex-none px-2 sm:px-6 py-3 font-headline font-bold text-[9px] sm:text-xs uppercase tracking-wide border-black last:border-r-0 border-r-2 text-center \${
                    statusFilter === st ? 'bg-primary-container text-white' : 'hover:bg-neutral-100 transition-colors text-black'
                  }\`}
                >`;

code = code.replace(oldTabs, newTabs);

fs.writeFileSync('src/pages/Sessions.tsx', code);
console.log('Sessions fixed');
