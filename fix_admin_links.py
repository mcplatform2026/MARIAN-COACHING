import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

# Add ExternalLink
content = content.replace("import { Check, Copy, FileText, Plus, Search, Trash2, Eye, Send, Clock, Bold, Italic, List, Heading1, Heading2, PaintBucket, Pilcrow, Strikethrough } from 'lucide-react';", "import { Check, Copy, FileText, Plus, Search, Trash2, Eye, Send, Clock, Bold, Italic, List, Heading1, Heading2, PaintBucket, Pilcrow, Strikethrough, ExternalLink } from 'lucide-react';")

# Add View Link button
view_btn = """                      <button 
                        onClick={() => window.open(`${window.location.origin}/agreement/${user?.uid}/${agreement.id}`, '_blank')}
                        className="p-1.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black transition-colors text-black"
                        title="View & Download PDF"
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button 
                        onClick={() => handleCopyLink(agreement.id)}
                        className="p-1.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black transition-colors text-black"
                        title="Copy Public Link"
                      >"""

content = content.replace("""                      <button 
                        onClick={() => handleCopyLink(agreement.id)}
                        className="p-1.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black transition-colors text-black"
                        title="Copy Public Link"
                      >""", view_btn)

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)
