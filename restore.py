import re

content = """import React, { useState, useEffect } from 'react';
import { useAgreements, Agreement } from '../hooks/useAgreements';
import { Check, Copy, FileText, Plus, Search, Trash2, Eye, Send, Clock, Bold, Italic, List, Heading1, Heading2, PaintBucket } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';

export function Agreements() {
  const { user } = useAuth();
  const { agreements, loading, addAgreement, removeAgreement, updateAgreement } = useAgreements();
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'|'draft'|'sent'|'viewed'|'accepted'>('all');
  
  const [brandName, setBrandName] = useState(() => localStorage.getItem('brandName') || 'LOREM IPSUM');
  const [brandColor, setBrandColor] = useState(() => localStorage.getItem('brandColor') || '#00a390');

  useEffect(() => {
    const handleStorageChange = () => {
      setBrandName(localStorage.getItem('brandName') || 'LOREM IPSUM');
      setBrandColor(localStorage.getItem('brandColor') || '#00a390');
    };
    window.addEventListener('brandNameChange', handleStorageChange);
    window.addEventListener('brandColorChange', handleStorageChange);
    return () => {
      window.removeEventListener('brandNameChange', handleStorageChange);
      window.removeEventListener('brandColorChange', handleStorageChange);
    };
  }, []);

  const templates = {
    coaching: { title: 'Coaching Agreement', details: '1. 4x monthly 60-min sessions.\n2. Email support between sessions.\n3. 3-month commitment required.' },
    consulting: { title: 'Consulting Agreement', details: '1. Discovery phase.\n2. Strategy development.\n3. Implementation support.' },
    retainer: { title: 'Retainer Agreement', details: '1. Up to 20 hours per month.\n2. Priority response.\n3. Monthly strategy call.' }
  };

  const [formData, setFormData] = useState({
    templateType: 'coaching',
    clientName: '',
    clientEmail: '',
    fee: '',
    projectDetails: templates.coaching.details
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
    ],
    content: formData.projectDetails || templates[formData.templateType as keyof typeof templates].details,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, projectDetails: editor.getHTML() }));
    },
  });

  useEffect(() => {
    if (editor && formData.projectDetails !== editor.getHTML()) {
      editor.commands.setContent(formData.projectDetails);
    }
  }, [formData.projectDetails, editor]);

  const handleCreate = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const dbUid = user.uid; // Always save in the owner's database
      
      const newId = await addAgreement({
        ...formData,
        status: isDraft ? 'draft' : 'sent',
        sentAt: isDraft ? null : new Date().toISOString()
      }, dbUid);
      
      setIsCreating(false);
      setFormData({ templateType: 'coaching', clientName: '', clientEmail: '', fee: '', projectDetails: templates.coaching.details });
      
      if (!isDraft) {
        handleCopyLink(newId, dbUid);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to create agreement');
    }
  };

  const handleCopyLink = (id: string, customDbUid?: string) => {
    const uidToUse = customDbUid || user?.uid;
    if (!uidToUse) return;
    const link = `${window.location.origin}/agreement/${uidToUse}/${id}`;
    navigator.clipboard.writeText(link);
    alert('Shareable link copied to clipboard!');
  };

  const filtered = agreements.filter(a => {
    const matchSearch = a.clientName.toLowerCase().includes(search.toLowerCase()) || 
                        a.clientEmail.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || a.status === filter;
    return matchSearch && matchFilter;
  });

  const statusColors = {
    draft: 'bg-neutral-200 text-neutral-800',
    sent: 'bg-blue-100 text-blue-800',
    viewed: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-emerald-100 text-emerald-800'
  };

  return (
    <div className="w-full h-full p-4 lg:p-8 flex flex-col gap-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
      </div>

      {isCreating ? (
        <div className="bg-white border-2 border-black p-6 w-full max-w-3xl mx-auto shadow-lg relative">
          <button 
            onClick={() => setIsCreating(false)}
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
                  <input type="color" onInput={event => editor?.chain().focus().setColor((event.target as HTMLInputElement).value).run()} value={editor?.getAttributes('textStyle').color || '#000000'} className="w-8 h-8 p-0 border-2 border-black cursor-pointer bg-white ml-2" title="Text Color" />
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
                onClick={(e) => handleCreate(e, true)}
                className="px-4 py-2 border-2 border-black font-headline font-bold uppercase text-xs hover:bg-neutral-50 transition-colors"
              >
                Save Draft
              </button>
              <button 
                type="button"
                onClick={(e) => handleCreate(e, false)}
                className="px-6 py-2 md:py-3 text-white neu-shadow neu-button font-headline font-bold uppercase tracking-wide text-sm transition-all hover:translate-y-0.5 hover:shadow-none flex items-center gap-2 border-2 border-black"
                style={{ backgroundColor: brandColor }}
              >
                <Send size={14} />
                Create & Copy Link
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-3 border-2 border-black">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by client name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 p-2 text-sm focus:outline-none font-body font-medium"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
              {['all', 'draft', 'sent', 'viewed', 'accepted'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1.5 text-xs font-headline font-bold uppercase whitespace-nowrap transition-colors border-2 border-black ${
                    filter === f ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-neutral-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full py-12 text-center text-neutral-500 font-headline font-bold uppercase text-sm">
                Loading agreements...
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full py-12 text-center text-neutral-500 font-headline font-bold uppercase text-sm">
                No agreements found.
              </div>
            ) : (
              filtered.map(agreement => (
                <div key={agreement.id} className="bg-white border-2 border-black p-5 flex flex-col gap-4 relative group hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 ${statusColors[agreement.status]}`}>
                        {agreement.status}
                      </span>
                      <h3 className="font-headline font-black text-lg uppercase tracking-tight leading-none mb-1">
                        {templates[agreement.templateType as keyof typeof templates]?.title || 'Agreement'}
                      </h3>
                      <p className="font-body text-sm font-semibold text-neutral-600">{agreement.clientName}</p>
                    </div>
                    <button 
                      onClick={() => removeAgreement(agreement.id)}
                      className="text-neutral-400 hover:text-red-500 transition-colors"
                      title="Delete Agreement"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs font-body border-y-2 border-neutral-100 py-3">
                    <div>
                      <span className="block text-neutral-500 uppercase font-headline font-bold tracking-widest text-[9px] mb-0.5">Fee</span>
                      <span className="font-bold">{agreement.fee}</span>
                    </div>
                    <div>
                      <span className="block text-neutral-500 uppercase font-headline font-bold tracking-widest text-[9px] mb-0.5">Sent On</span>
                      <span className="font-bold">{agreement.sentAt ? new Date(agreement.sentAt).toLocaleDateString() : '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2">
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
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
"""
with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)
