const fs = require('fs');

let content = fs.readFileSync('src/pages/Sessions.tsx', 'utf8');

const startMarker = "{bookingMode === 'live' && !editingId ? (";
const endMarker = ") : (\n              <form onSubmit={handleSave}";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Markers not found");
  process.exit(1);
}

const replacement = `{/* Modal Tabs (Only if not editing) */}
            {!editingId && (
              <div className="flex border-b-2 border-black bg-neutral-100">
                <button 
                  onClick={() => setBookingMode('live')} 
                  className={\`flex-1 py-3 px-2 font-headline font-bold text-[10px] uppercase tracking-wider transition-colors \${bookingMode === 'live' ? 'bg-white border-b-0 border-black' : 'border-b-2 border-black opacity-60 hover:opacity-100'}\`}
                >
                  Live Calendar
                </button>
                <button 
                  onClick={() => setBookingMode('manual')} 
                  className={\`flex-1 py-3 px-2 font-headline font-bold text-[10px] uppercase tracking-wider transition-colors border-l-2 border-black \${bookingMode === 'manual' ? 'bg-white border-b-0 border-black' : 'border-b-2 border-black opacity-60 hover:opacity-100'}\`}
                >
                  Manual Log
                </button>
              </div>
            )}

            {bookingMode === 'live' && !editingId ? (
              <div className="p-4 space-y-4 text-black">
                {embedUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs bg-emerald-50 border-2 border-dashed border-emerald-300 p-2 text-emerald-950 font-body">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold">Live Booking Widget Active</span>
                      </div>
                      <button
                        onClick={() => {
                          setEmbedUrl("");
                          localStorage.removeItem("myEmbedUrl");
                        }}
                        className="underline hover:text-emerald-700 text-[10px] uppercase font-bold shrink-0"
                      >
                        Clear Link
                      </button>
                    </div>
                    
                    <div className="border-4 border-black bg-white w-full h-[450px] overflow-hidden relative neu-shadow-sm">
                      <iframe
                        src={embedUrl}
                        title="Embedded Calendar Scheduler"
                        className="w-full h-full border-0"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                      />
                    </div>
                    <p className="font-body text-[10px] text-neutral-500 italic text-center">
                      Appointments scheduled here must be manually logged to appear in your list.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 border-2 border-dashed border-neutral-300 bg-neutral-50/50 text-center space-y-4">
                    <div className="space-y-1">
                      <p className="font-headline font-extrabold uppercase text-xs text-neutral-700">Embed Public Calendar</p>
                      <p className="font-body text-[11px] text-neutral-500 max-w-sm mx-auto">
                        Paste your Calendly or Cal.com public link below to embed it directly in this view.
                      </p>
                    </div>
                    
                    <div className="max-w-sm mx-auto space-y-3 text-left">
                      <div>
                        <label className="block font-body font-bold text-[9px] mb-1 uppercase tracking-wide">Public URL *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. calendly.com/your-username"
                          value={tempEmbedUrl}
                          onChange={(e) => setTempEmbedUrl(e.target.value)}
                          className="w-full border-2 border-black p-2 text-xs font-body font-medium bg-white focus:outline-none placeholder-neutral-400 text-black"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (!tempEmbedUrl.trim()) return;
                          let finalUrl = tempEmbedUrl.trim();
                          if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
                            finalUrl = 'https://' + finalUrl;
                          }
                          setEmbedUrl(finalUrl);
                          localStorage.setItem("myEmbedUrl", finalUrl);
                        }}
                        className="w-full bg-black hover:bg-neutral-800 border-2 border-black py-3 font-headline font-bold uppercase text-[10px] tracking-wider text-white transition-all text-center active:translate-y-0.5"
                      >
                        Embed Calendar
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="pt-2 border-t-2 border-dashed border-neutral-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border-2 border-black bg-white font-headline font-bold text-[10px] uppercase tracking-wider hover:bg-neutral-100 text-black active:translate-y-0.5"
                  >
                    Close
                  </button>
                </div>
              </div>
`;

content = content.slice(0, startIndex) + replacement + content.slice(endIndex);

fs.writeFileSync('src/pages/Sessions.tsx', content);
console.log("Success");
