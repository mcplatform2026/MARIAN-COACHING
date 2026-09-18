import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

# I want to conditionally render the header only if not creating
old_header = """      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 className="font-headline font-extrabold text-xl md:text-2xl lg:text-3xl tracking-tight uppercase">
            <span style={{ color: brandColor }}>{brandName}'S</span> AGREEMENTS & PROPOSALS
          </h2>
        </div>
        
        <div className="flex flex-col items-stretch lg:items-end gap-3 w-full lg:w-auto">
          <button 
            onClick={() => setIsCreating(true)}
            className="px-3.5 py-2 text-white neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 border-2 border-black shrink-0 active:translate-y-0.5 w-full md:w-auto hover:opacity-90"
            style={{ backgroundColor: brandColor }}
          >
            <Plus className="w-3.5 h-3.5" />
            New Agreement
          </button>
        </div>
      </div>"""

new_header = """      {!isCreating && (
        <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h2 className="font-headline font-extrabold text-xl md:text-2xl lg:text-3xl tracking-tight uppercase">
              <span style={{ color: brandColor }}>{brandName}'S</span> AGREEMENTS & PROPOSALS
            </h2>
          </div>
          
          <div className="flex flex-col items-stretch lg:items-end gap-3 w-full lg:w-auto">
            <button 
              onClick={() => setIsCreating(true)}
              className="px-3.5 py-2 text-white neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 border-2 border-black shrink-0 active:translate-y-0.5 w-full md:w-auto hover:opacity-90"
              style={{ backgroundColor: brandColor }}
            >
              <Plus className="w-3.5 h-3.5" />
              New Agreement
            </button>
          </div>
        </div>
      )}"""

content = content.replace(old_header, new_header)

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)
