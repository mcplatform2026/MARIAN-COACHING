import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

correct_form = """          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                  Agreement Title
                </label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full text-sm p-2 border-2 border-black focus:outline-none"
                  placeholder="e.g. Website Redesign Proposal"
                  required
                />
              </div>
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
              <div className="md:col-span-2">
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
                  <button type="button" onClick={() => editor?.chain().focus().setParagraph().run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('paragraph') ? 'bg-neutral-200' : ''}`} title="Paragraph (Body Text)"><Pilcrow size={14}/></button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('bold') ? 'bg-neutral-200' : ''}`} title="Bold"><Bold size={14}/></button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('italic') ? 'bg-neutral-200' : ''}`} title="Italic"><Italic size={14}/></button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleStrike().run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('strike') ? 'bg-neutral-200' : ''}`} title="Strikethrough"><Strikethrough size={14}/></button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('heading', { level: 1 }) ? 'bg-neutral-200' : ''}`} title="Heading 1"><Heading1 size={14}/></button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('heading', { level: 2 }) ? 'bg-neutral-200' : ''}`} title="Heading 2"><Heading2 size={14}/></button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1.5 border-2 border-black bg-white hover:bg-neutral-100 ${editor?.isActive('bulletList') ? 'bg-neutral-200' : ''}`} title="Bullet List"><List size={14}/></button>
                  <input type="color" onInput={event => editor?.chain().focus().setColor((event.target as HTMLInputElement).value).run()} value={editor?.getAttributes('textStyle')?.color || '#000000'} className="w-8 h-8 p-0 border-2 border-black cursor-pointer bg-white ml-2" title="Text Color" />
                </div>
                <EditorContent editor={editor} className="p-4 min-h-[200px] prose-sm sm:prose-base focus:outline-none tiptap-editor" />
              </div>"""

content = re.sub(r'<form className="space-y-4">.*?</label>\n\s*<div className="border-2 border-black bg-white flex flex-col">\n\s*<div className="flex flex-wrap items-center gap-1 p-2 border-b-2 border-black bg-neutral-50">.*?<EditorContent editor={editor} className="p-4 min-h-\[200px\] prose-sm sm:prose-base focus:outline-none tiptap-editor" />\n\s*</div>', correct_form, content, flags=re.DOTALL)


# Also update initialData to include title
content = content.replace("initialData={{ templateType: 'coaching', clientName: '', clientEmail: '', fee: '', projectDetails: templates.coaching.details }}", "initialData={{ title: 'Client Agreement', clientName: '', clientEmail: '', projectDetails: templates.coaching.details }}")

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)
