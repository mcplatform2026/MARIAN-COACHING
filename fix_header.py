import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

old_header = """      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline font-extrabold text-xl md:text-2xl lg:text-3xl tracking-tight uppercase">
            <span style={{ color: brandColor }}>{brandName}'S</span> AGREEMENTS & PROPOSALS
          </h2>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-6 py-2 md:py-3 text-white neu-shadow neu-button font-headline font-bold uppercase tracking-wide text-sm transition-all hover:translate-y-0.5 hover:shadow-none flex items-center gap-2 border-2 border-black"
          style={{ backgroundColor: brandColor }}
        >
          <Plus size={16} />
          New Agreement
        </button>
      </div>"""

new_header = """      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 className="font-headline font-extrabold text-xl md:text-2xl lg:text-3xl tracking-tight uppercase">
            <span style={{ color: brandColor }}>{brandName}'S</span> AGREEMENTS & PROPOSALS
          </h2>
        </div>
        
        <div className="flex flex-col items-stretch lg:items-end gap-3 w-full lg:w-auto">
          <button 
            onClick={() => setIsCreating(true)}
            className="px-6 py-2 md:py-3 text-white neu-shadow neu-button font-headline font-bold uppercase tracking-wide text-sm transition-all hover:translate-y-0.5 hover:shadow-none flex items-center justify-center gap-2 border-2 border-black w-full md:w-auto"
            style={{ backgroundColor: brandColor }}
          >
            <Plus size={16} />
            New Agreement
          </button>
        </div>
      </div>"""

content = content.replace(old_header, new_header)

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)
