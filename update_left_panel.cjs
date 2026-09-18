const fs = require('fs');
let content = fs.readFileSync('src/components/AgreementStudio.tsx', 'utf8');

const anchor = `            <EditorContent editor={editor} className="p-4 min-h-[600px] prose-sm sm:prose-base focus:outline-none tiptap-editor" />
          </div>
        </div>
      </div>`;

const replacement = `            <EditorContent editor={editor} className="p-4 min-h-[600px] prose-sm sm:prose-base focus:outline-none tiptap-editor" />
          </div>
        </div>

        {/* SIGNATURE CONFIGURATION */}
        <div className="bg-white border-2 border-black p-4 neu-shadow-sm rounded-none">
          <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
            <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2">
              <PenTool className="w-4 h-4 text-blue-600" /> Signature Configuration
            </h3>
            <button
              onClick={() => setIsSignaturesLocked(!isSignaturesLocked)}
              className={\`p-1.5 border-2 border-black transition-colors \${isSignaturesLocked ? 'bg-neutral-900 text-white' : 'bg-white text-black hover:bg-neutral-100'}\`}
              title={isSignaturesLocked ? "Unlock Signature Settings" : "Lock Signature Settings"}
            >
              {isSignaturesLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="border-2 border-black p-4 bg-white relative">
              <input 
                type="text" 
                value={formData.providerSignatureLabel || ''} 
                onChange={(e) => setFormData({...formData, providerSignatureLabel: e.target.value})} 
                className="w-full text-xs font-bold uppercase tracking-wide p-2 border-2 border-black mb-4 focus:outline-none bg-white" 
                placeholder="Service Provider Name" 
              />
              <SignatureCanvasBlock
                label="Service Provider Name"
                initialSignature={providerSig}
                onSignatureReady={setProviderSig}
                showSaveDefault={true}
                onSaveDefault={handleSaveDefaultSignature}
              />
            </div>
            
            <div className="border-2 border-black p-4 bg-white relative">
              <input 
                type="text" 
                value={formData.clientName || ''} 
                onChange={(e) => setFormData({...formData, clientName: e.target.value})} 
                className="w-full text-xs font-bold uppercase tracking-wide p-2 border-2 border-black mb-4 focus:outline-none bg-white" 
                placeholder="Client Name" 
              />
              <SignatureCanvasBlock
                label="Client Name"
                initialSignature={clientSig}
                onSignatureReady={setClientSig}
              />
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="flex gap-4 sticky bottom-0 bg-neutral-50 p-4 border-2 border-black z-10 mt-auto shadow-2xl">
          <button 
            onClick={(e) => handleSubmit(e, true)} 
            className="flex-1 bg-white border-2 border-black text-black font-bold uppercase tracking-wider text-xs py-3 hover:bg-neutral-100 transition-colors"
          >
            Save as Draft
          </button>
          <button 
            onClick={(e) => handleSubmit(e, false)} 
            className="flex-1 border-2 border-black text-white font-bold uppercase tracking-wider text-xs py-3 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: brandColor || '#6033FF' }}
          >
            Finalize & Get Link
          </button>
        </div>
      </div>`;

content = content.replace(anchor, replacement);
fs.writeFileSync('src/components/AgreementStudio.tsx', content);
