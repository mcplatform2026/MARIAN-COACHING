import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r'<div className="flex items-center justify-center gap-2">.*?</div>', re.DOTALL)
match = pattern.search(content)

if match:
    old_div = match.group(0)
    
    new_div = """<div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setPreviewId(agreement.id)}
                            className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black"
                            title="View & Download PDF"
                          >
                            <ExternalLink size={14} />
                          </button>
                          
                          <button 
                            onClick={() => handleCopyLink(agreement.id)}
                            className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black"
                            title="Copy Public Link"
                          >
                            <Copy size={14} />
                          </button>
                          
                          <a 
                            href={`https://wa.me/?text=${encodeURIComponent(`Here is the link to the agreement: ${window.location.origin}/agreement/${user?.uid}/${agreement.id}`)}`}
                            target="_blank"
                            className="p-1.5 bg-white hover:bg-green-50 border-2 border-black transition-all hover:scale-105 text-green-600 font-bold"
                            title="Send via WhatsApp"
                          >
                            W
                          </a>
                          
                          <a 
                            href={`mailto:?subject=${encodeURIComponent(agreement.title || 'Agreement')}&body=${encodeURIComponent(`Here is the link to the agreement: ${window.location.origin}/agreement/${user?.uid}/${agreement.id}`)}`}
                            target="_blank"
                            className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black"
                            title="Send via Email"
                          >
                            <Send size={14} />
                          </a>
                          
                          {agreement.status === 'draft' && (
                            <button 
                              onClick={() => setActiveAgreement(agreement)}
                              className="p-1.5 bg-white hover:bg-blue-50 border-2 border-black transition-all hover:scale-105 text-blue-600"
                              title="Edit Draft"
                            >
                              <PenTool size={14} />
                            </button>
                          )}
                          
                          <button 
                            onClick={() => removeAgreement(agreement.id)}
                            className="p-1.5 bg-white hover:bg-red-50 border-2 border-black transition-all hover:scale-105 text-red-600"
                            title="Delete Agreement"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>"""
    
    content = content.replace(old_div, new_div)
    
    with open('src/pages/Agreements.tsx', 'w') as f:
        f.write(content)

