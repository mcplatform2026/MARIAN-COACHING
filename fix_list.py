import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

# Update title display
content = content.replace("{templates[agreement.templateType as keyof typeof templates]?.title || 'Agreement'}", "{agreement.title || templates[agreement.templateType as keyof typeof templates]?.title || 'Agreement'}")

# Remove fee from display
fee_display = """                  <div className="grid grid-cols-2 gap-2 text-xs font-body border-y-2 border-neutral-100 py-3">
                    <div>
                      <span className="block text-neutral-500 uppercase font-headline font-bold tracking-widest text-[9px] mb-0.5">Fee</span>
                      <span className="font-bold">{agreement.fee}</span>
                    </div>
                    <div>
                      <span className="block text-neutral-500 uppercase font-headline font-bold tracking-widest text-[9px] mb-0.5">Sent On</span>
                      <span className="font-bold">{agreement.sentAt ? new Date(agreement.sentAt).toLocaleDateString() : '-'}</span>
                    </div>
                  </div>"""

new_display = """                  <div className="grid grid-cols-1 gap-2 text-xs font-body border-y-2 border-neutral-100 py-3">
                    <div>
                      <span className="block text-neutral-500 uppercase font-headline font-bold tracking-widest text-[9px] mb-0.5">Sent On</span>
                      <span className="font-bold">{agreement.sentAt ? new Date(agreement.sentAt).toLocaleDateString() : 'Draft'}</span>
                    </div>
                  </div>"""

content = content.replace(fee_display, new_display)

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)

