import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

# First, extract the form logic
form_component = """
function CreateAgreementForm({ onCancel, onCreate, brandColor, templates, initialData }: any) {
  const [formData, setFormData] = useState(initialData);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
    ],
    content: formData.projectDetails,
    onUpdate: ({ editor }) => {
      setFormData((prev: any) => ({ ...prev, projectDetails: editor.getHTML() }));
    },
  });

  useEffect(() => {
    if (editor && formData.projectDetails !== editor.getHTML()) {
      editor.commands.setContent(formData.projectDetails);
    }
  }, [formData.projectDetails, editor]);

  const handleSubmit = (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    onCreate(formData, isDraft);
  };

  return (
        <div className="bg-white border-2 border-black p-6 w-full max-w-3xl mx-auto shadow-lg relative">
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 text-neutral-400 hover:text-black font-headline font-bold text-xs uppercase"
          >
            Cancel
          </button>
          <h2 className="text-xl font-headline font-black uppercase mb-6">Create Agreement</h2>
          
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                  Template Type
                </label>
                <select 
                  value={formData.templateType}
                  onChange={(e) => {
                    const type = e.target.value;
                    setFormData({
                      ...formData, 
                      templateType: type,
                      projectDetails: templates[type as keyof typeof templates].details
                    });
                  }}
                  className="w-full text-sm p-2 border-2 border-black focus:outline-none bg-white"
                >
                  <option value="coaching">Coaching Agreement</option>
                  <option value="consulting">Consulting Agreement</option>
                  <option value="retainer">Retainer Agreement</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                  Project Fee / Retainer
                </label>
                <input 
                  type="text" 
                  value={formData.fee}
                  onChange={(e) => setFormData({...formData, fee: e.target.value})}
                  className="w-full text-sm p-2 border-2 border-black focus:outline-none"
                  placeholder="$0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                  Client Name
                </label>
                <input 
                  type="text" 
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  className="w-full text-sm p-2 border-2 border-black focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                  Client Email
                </label>
                <input 
                  type="email" 
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                  className="w-full text-sm p-2 border-2 border-black focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                Project Scope & Details
              </label>
              
              <div className="border-2 border-black bg-white flex flex-col">
                <div className="flex flex-wrap items-center gap-1 p-2 border-b-2 border-black bg-neutral-50">
                  <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('bold') ? 'bg-neutral-200' : ''}`}><Bold size={14}/></button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('italic') ? 'bg-neutral-200' : ''}`}><Italic size={14}/></button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('heading', { level: 1 }) ? 'bg-neutral-200' : ''}`}><Heading1 size={14}/></button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('heading', { level: 2 }) ? 'bg-neutral-200' : ''}`}><Heading2 size={14}/></button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('bulletList') ? 'bg-neutral-200' : ''}`}><List size={14}/></button>
                  <input type="color" onInput={event => editor?.chain().focus().setColor((event.target as HTMLInputElement).value).run()} value={editor?.getAttributes('textStyle')?.color || '#000000'} className="w-8 h-8 p-0 border-2 border-black cursor-pointer bg-white ml-2" title="Text Color" />
                </div>
                <EditorContent editor={editor} className="p-4 min-h-[200px] prose-sm sm:prose-base focus:outline-none tiptap-editor" />
              </div>
              
              <style>{`
                .tiptap-editor .ProseMirror:focus { outline: none; }
                .tiptap-editor .ProseMirror h1 { font-size: 1.8em; font-weight: 900; margin-bottom: 0.5em; text-transform: uppercase; font-family: 'Space Grotesk', sans-serif; }
                .tiptap-editor .ProseMirror h2 { font-size: 1.5em; font-weight: 800; margin-bottom: 0.5em; text-transform: uppercase; font-family: 'Space Grotesk', sans-serif; }
                .tiptap-editor .ProseMirror p { margin-bottom: 0.8em; }
                .tiptap-editor .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.8em; }
                .tiptap-editor .ProseMirror li { margin-bottom: 0.3em; }
              `}</style>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t-2 border-neutral-100">
              <button 
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2 border-2 border-black font-headline font-bold uppercase text-xs hover:bg-neutral-50 transition-colors"
              >
                Save Draft
              </button>
              <button 
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                className="px-6 py-2 md:py-3 text-white neu-shadow neu-button font-headline font-bold uppercase tracking-wide text-sm transition-all hover:translate-y-0.5 hover:shadow-none flex items-center gap-2 border-2 border-black"
                style={{ backgroundColor: brandColor }}
              >
                <Send size={14} />
                Create & Copy Link
              </button>
            </div>
          </form>
        </div>
  );
}

"""

# Now remove the old code from the main component and use CreateAgreementForm
content = re.sub(r'  const \[formData, setFormData\] = useState.*?\}, \[formData\.projectDetails, editor\]\);', '', content, flags=re.DOTALL)
content = re.sub(r'  const handleCreate = async \(e: React\.FormEvent, isDraft: boolean\) => \{.*?alert\(\'Failed to create agreement\'\);\n\s*\}\n\s*\};', '''  const handleCreate = async (formData: any, isDraft: boolean) => {
    if (!user) return;
    try {
      const dbUid = user.uid;
      const newId = await addAgreement({
        ...formData,
        status: isDraft ? 'draft' : 'sent',
        sentAt: isDraft ? null : new Date().toISOString()
      });
      setIsCreating(false);
      if (!isDraft) {
        handleCopyLink(newId.id, dbUid);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to create agreement');
    }
  };''', content, flags=re.DOTALL)

content = re.sub(r'      \{isCreating \? \(.*?\) : \(', '''      {isCreating ? (
        <CreateAgreementForm 
          onCancel={() => setIsCreating(false)} 
          onCreate={handleCreate} 
          brandColor={brandColor} 
          templates={templates} 
          initialData={{ templateType: 'coaching', clientName: '', clientEmail: '', fee: '', projectDetails: templates.coaching.details }} 
        />
      ) : (''', content, flags=re.DOTALL)

# Insert the component before export function Agreements
content = content.replace('export function Agreements() {', form_component + '\nexport function Agreements() {')

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)
