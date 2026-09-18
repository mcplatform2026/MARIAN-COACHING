import re

with open('src/components/VoiceAssistantModal.tsx', 'r') as f:
    text = f.read()

target = """                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setInputText("Add a client named Alex Rivera with 200 upfront and 350 final");
                      handleSendQuery("Add a client named Alex Rivera with 200 upfront and 350 final");
                    }}
                    className="p-2 border border-black/10 hover:border-black bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left rounded-none text-[11px] font-body text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" style={{ color: brandColor }} />
                    <span>"Add client Alex Rivera..."</span>
                  </button>
                  <button
                    onClick={() => {
                      setInputText("Record a 45 dollar expense for business materials");
                      handleSendQuery("Record a 45 dollar expense for business materials");
                    }}
                    className="p-2 border border-black/10 hover:border-black bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left rounded-none text-[11px] font-body text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-red-500" />
                    <span>"Record a 45 dollar expense..."</span>
                  </button>
                  <button
                    onClick={() => {
                      setInputText("Open up the finance report of June");
                      handleSendQuery("Open up the finance report of June");
                    }}
                    className="p-2 border border-black/10 hover:border-black bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left rounded-none text-[11px] font-body text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>"Open June finance report..."</span>
                  </button>
                  <button
                    onClick={() => {
                      setInputText("Download invoice 071");
                      handleSendQuery("Download invoice 071");
                    }}
                    className="p-2 border border-black/10 hover:border-black bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left rounded-none text-[11px] font-body text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-green-600" />
                    <span>"Download invoice 071"</span>
                  </button>
                </div>"""

replacement = """                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setInputText("Add a client named Alex Rivera with 200 upfront and 350 final");
                      handleSendQuery("Add a client named Alex Rivera with 200 upfront and 350 final");
                    }}
                    className="p-2 border border-black/10 hover:border-black bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left rounded-none text-[11px] font-body text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 shrink-0" style={{ color: brandColor }} />
                    <span className="truncate">"Add client Alex Rivera..."</span>
                  </button>
                  <button
                    onClick={() => {
                      setInputText("Record a 45 dollar expense for business materials");
                      handleSendQuery("Record a 45 dollar expense for business materials");
                    }}
                    className="p-2 border border-black/10 hover:border-black bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left rounded-none text-[11px] font-body text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">"Record a 45 dollar expense..."</span>
                  </button>
                  <button
                    onClick={() => {
                      setInputText("Open up the finance report of June");
                      handleSendQuery("Open up the finance report of June");
                    }}
                    className="p-2 border border-black/10 hover:border-black bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left rounded-none text-[11px] font-body text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">"Open June finance report..."</span>
                  </button>
                  <button
                    onClick={() => {
                      setInputText("Download invoice 071");
                      handleSendQuery("Download invoice 071");
                    }}
                    className="p-2 border border-black/10 hover:border-black bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left rounded-none text-[11px] font-body text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    <span className="truncate">"Download invoice 071"</span>
                  </button>
                  <button
                    onClick={() => {
                      setInputText("Open dashboard for August 2026");
                      handleSendQuery("Open dashboard for August 2026");
                    }}
                    className="p-2 border border-black/10 hover:border-black bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left rounded-none text-[11px] font-body text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">"Open dashboard for August 2026"</span>
                  </button>
                  <button
                    onClick={() => {
                      setInputText("Schedule a new meeting for tomorrow at 10 am");
                      handleSendQuery("Schedule a new meeting for tomorrow at 10 am");
                    }}
                    className="p-2 border border-black/10 hover:border-black bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left rounded-none text-[11px] font-body text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span className="truncate">"Schedule a meeting for tomorrow..."</span>
                  </button>
                </div>"""

text = text.replace(target, replacement)

# ensure LayoutDashboard and Calendar are imported from lucide-react
if "LayoutDashboard" not in text:
    text = text.replace("User, DollarSign, Clock, Download,", "User, DollarSign, Clock, Download, LayoutDashboard, Calendar,")

with open('src/components/VoiceAssistantModal.tsx', 'w') as f:
    f.write(text)
