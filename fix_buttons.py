import re

with open('src/components/VoiceAssistantModal.tsx', 'r') as f:
    text = f.read()

target = """                  <button
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

replace = """                  <button
                    onClick={() => {
                      setInputText("Schedule a new meeting for tomorrow at 10 am");
                      handleSendQuery("Schedule a new meeting for tomorrow at 10 am");
                    }}
                    className="p-2 border border-black/10 hover:border-black bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left rounded-none text-[11px] font-body text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span className="truncate">"Schedule a meeting for tomorrow..."</span>
                  </button>
                  <button
                    onClick={() => {
                      setInputText("Create an invoice for John Doe for 500 dollars");
                      handleSendQuery("Create an invoice for John Doe for 500 dollars");
                    }}
                    className="p-2 border border-black/10 hover:border-black bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left rounded-none text-[11px] font-body text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="truncate">"Create an invoice for John Doe..."</span>
                  </button>
                  <button
                    onClick={() => {
                      setInputText("Show me my appointments");
                      handleSendQuery("Show me my appointments");
                    }}
                    className="p-2 border border-black/10 hover:border-black bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left rounded-none text-[11px] font-body text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span className="truncate">"Show me my appointments..."</span>
                  </button>
                </div>"""

text = text.replace(target, replace)

if "FileText" not in text:
    text = text.replace("Calendar\n} from", "Calendar,\n  FileText\n} from")

with open('src/components/VoiceAssistantModal.tsx', 'w') as f:
    f.write(text)
