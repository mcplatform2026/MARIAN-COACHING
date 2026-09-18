import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

actions_html = """                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-headline font-bold uppercase text-neutral-500">
                      {agreement.status === 'accepted' ? (
                        <><Check size={12} className="text-emerald-500" /> Signed on {new Date(agreement.acceptedAt).toLocaleDateString()}</>
                      ) : agreement.status === 'viewed' ? (
                        <><Eye size={12} className="text-yellow-600" /> Viewed on {new Date(agreement.viewedAt).toLocaleDateString()}</>
                      ) : (
                        <><Clock size={12} /> Pending Signature</>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {agreement.status !== 'accepted' && (
                        <button 
                          onClick={() => updateAgreement(agreement.id, { status: 'accepted', acceptedAt: new Date().toISOString() })}
                          className="px-2 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-[9px] font-headline font-bold uppercase tracking-wide border border-emerald-300 transition-colors"
                          title="Manually Mark as Accepted"
                        >
                          Mark Accepted
                        </button>
                      )}
                      <button 
                        onClick={() => handleCopyLink(agreement.id)}
                        className="p-1.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black transition-colors text-black"
                        title="Copy Public Link"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>"""

content = re.sub(r'<div className="flex items-center justify-between mt-auto pt-2">.*?Copy Link"\n\s*>\n\s*<Copy size={14} />\n\s*</button>\n\s*</div>', actions_html, content, flags=re.DOTALL)

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)
