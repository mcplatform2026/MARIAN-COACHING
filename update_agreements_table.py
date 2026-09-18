import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

# Add X to imports
content = content.replace("import { Check, Copy, FileText, Plus, Search, Trash2, Eye, Send, Clock, Bold, Italic, List, Heading1, Heading2, PaintBucket, Pilcrow, Strikethrough, ExternalLink } from 'lucide-react';", "import { Check, Copy, FileText, Plus, Search, Trash2, Eye, Send, Clock, Bold, Italic, List, Heading1, Heading2, PaintBucket, Pilcrow, Strikethrough, ExternalLink, X } from 'lucide-react';")

# Add previewId state
state_search = "const [search, setSearch] = useState('');"
content = content.replace(state_search, state_search + "\n  const [previewId, setPreviewId] = useState<string | null>(null);")

# Update table rendering
old_grid = r'<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">.*?</div>\n\s*</>\n\s*\)\}\n\s*</main>'

new_table = """<div className="bg-white border-2 border-black neu-shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-neutral-100 font-headline uppercase text-[9px] md:text-[11px] tracking-wider">
                <tr className="border-b-2 border-black">
                  <th className="px-4 py-3 font-bold border-r border-black">Status</th>
                  <th className="px-4 py-3 font-bold border-r border-black">Agreement Title</th>
                  <th className="px-4 py-3 font-bold border-r border-black">Client Name</th>
                  <th className="px-4 py-3 font-bold border-r border-black">Sent On</th>
                  <th className="px-4 py-3 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr><td colSpan={5} className="p-4 text-center font-bold border-b border-black">Loading agreements...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center font-bold border-b border-black">No agreements found.</td></tr>
                ) : (
                  filtered.map(agreement => (
                    <tr key={agreement.id} className="border-b border-black hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 border-r border-black font-body">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          agreement.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          (agreement.status === 'sent' || agreement.status === 'viewed') ? 'bg-yellow-100 text-yellow-800' :
                          'bg-neutral-200 text-neutral-800'
                        }`}>
                          {agreement.status === 'accepted' ? 'Signed' : (agreement.status === 'sent' || agreement.status === 'viewed') ? 'Pending' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-r border-black font-headline font-bold text-sm uppercase">
                        {agreement.title || templates[agreement.templateType as keyof typeof templates]?.title || 'Agreement'}
                      </td>
                      <td className="px-4 py-3 border-r border-black font-body font-semibold text-sm">
                        {agreement.clientName}
                      </td>
                      <td className="px-4 py-3 border-r border-black font-body text-xs">
                        {agreement.sentAt ? new Date(agreement.sentAt).toLocaleDateString() : 'Draft'}
                        {agreement.status === 'accepted' && <div className="text-[9px] text-emerald-600 font-bold uppercase mt-0.5">Signed {new Date(agreement.acceptedAt).toLocaleDateString()}</div>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
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
                          <button 
                            onClick={() => removeAgreement(agreement.id)}
                            className="p-1.5 bg-white hover:bg-red-50 border-2 border-black transition-all hover:scale-105 text-red-600"
                            title="Delete Agreement"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Iframe Overlay */}
      {previewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 lg:p-8 backdrop-blur-sm">
          <div className="bg-white border-2 border-black neu-shadow w-full max-w-5xl h-full max-h-[90vh] flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b-2 border-black bg-neutral-100">
              <h3 className="font-headline font-black uppercase text-lg tracking-tight">Agreement Preview</h3>
              <button 
                onClick={() => setPreviewId(null)}
                className="p-1 hover:bg-neutral-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 w-full bg-neutral-50 overflow-hidden relative">
              <iframe 
                src={`${window.location.origin}/agreement/${user?.uid}/${previewId}`} 
                className="w-full h-full border-none absolute inset-0"
                title="Agreement Preview"
              />
            </div>
          </div>
        </div>
      )}
    </main>"""

content = re.sub(old_grid, new_table, content, flags=re.DOTALL)

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)
