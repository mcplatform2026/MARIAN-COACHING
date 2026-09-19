import React, { useState, useEffect } from 'react';
import { useAgreements, Agreement } from '../hooks/useAgreements';
import { Check, Copy, FileText, Plus, Search, Trash2, PenTool, Eye, Mail, Clock, Bold, Italic, List, Heading1, Heading2, PaintBucket, Pilcrow, Strikethrough, ExternalLink, X } from 'lucide-react';
import { MessageCircle, Download } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import LZString from 'lz-string';
import { SignatureCanvasBlock } from '../components/SignatureCanvasBlock';
import { AgreementStudio } from '../components/AgreementStudio';

import { useRef } from 'react';
import { formatDateToMMDDYYYY } from '../utils/dateFormat';

const formatSignedDate = (dateString: string) => {
  return formatDateToMMDDYYYY(dateString);
};


export function Agreements() {
  const getEmailLink = (subject: string, body: string) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    return `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const { user } = useAuth();
  const { agreements, loading, addAgreement, removeAgreement, updateAgreement } = useAgreements();
  const [activeAgreement, setActiveAgreement] = useState<any | 'new' | null>(null);
  const [search, setSearch] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all'|'draft'|'sent'|'viewed'|'accepted'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [brandName, setBrandName] = useState(() => localStorage.getItem('brandName') || 'LOREM IPSUM');
  const [brandColor, setBrandColor] = useState(() => localStorage.getItem('brandColor') || '#6933ff');

  useEffect(() => {
    const handleStorageChange = () => {
      setBrandName(localStorage.getItem('brandName') || 'LOREM IPSUM');
      setBrandColor(localStorage.getItem('brandColor') || '#6933ff');
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



  const handleCreate = async (formData: any, isDraft: boolean, providerSignature?: string) => {
    if (!user) return;
    try {
      if (isDraft) {
        if (activeAgreement && activeAgreement !== 'new') {
          await updateAgreement(activeAgreement.id, {
            ...formData,
            status: 'draft',
          });
        } else {
          await addAgreement({
            ...formData,
            status: 'draft',
            sentAt: null
          });
        }
        setActiveAgreement(null);
      } else {
        // Save to DB as sent
        let docId;
        if (activeAgreement && activeAgreement !== 'new') {
          await updateAgreement(activeAgreement.id, {
             ...formData,
             providerSignature,
             status: 'sent',
             sentAt: new Date().toISOString()
          });
          docId = activeAgreement.id;
        } else {
          const newDoc = await addAgreement({
            ...formData,
            providerSignature,
            status: 'sent',
            sentAt: new Date().toISOString()
          });
          docId = newDoc.id;
        }
        
        const link = `${window.location.origin}/agreement/${user.uid}/${docId}`;
        navigator.clipboard.writeText(link);
        alert('Agreement saved and link copied to clipboard! Share this link with your client.');
        setActiveAgreement(null);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to create agreement');
    }
  };

  const handleShareHostedLink = async (agreement: Agreement, method: 'email' | 'whatsapp' | 'copy') => {
    let shortId = agreement.shortShareId;
    if (!shortId) {
      shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
      // We don't necessarily need to save shortId back to agreements here, 
      // but if we do, we need an updateDoc. We can just use the agreement.id as part of it or just generate a new one each time.
      // Actually, let's just generate a new one if not present, and save it to the DB if we are owner.
      if (user?.uid) {
        try {
  
          await updateDoc(doc(db, `users/${user.uid}/agreements/${agreement.id}`), {
            shortShareId: shortId
          });
          agreement.shortShareId = shortId;
        } catch(e) {}
      }
    }

    if (user?.uid) {
      try {

        await setDoc(doc(db, `shared_links/${shortId}`), {
          type: 'agreement',
          data: agreement,
          ownerUid: user.uid,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.error("Cloud sync failed before sharing:", e);
      }
    }
    
    const hostedLink = `${window.location.origin}/a/${shortId}`;

    if (method === 'whatsapp') {
      const text = `Here is the link to the agreement: ${hostedLink}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else if (method === 'email') {
      window.open(getEmailLink(agreement.title || "Agreement", `Here is the link to the agreement: ${hostedLink}`));
    } else if (method === 'copy') {
      navigator.clipboard.writeText(hostedLink);
      alert('Shareable short link copied to clipboard!');
    }
  };

  const handleCopyLink = (id: string, customDbUid?: string) => {
    const uidToUse = customDbUid || user?.uid;
    if (!uidToUse) return;
    
    // Find the agreement data to encode as fallback
    const agreement = agreements.find(a => a.id === id);
    let link = `${window.location.origin}/agreement/${uidToUse}/${id}`;
    
    if (agreement) {
      const dataToEncode = {
        ...agreement,
        timestamp: undefined // remove timestamp to avoid serialization issues
      };
      import('lz-string').then(LZString => {
         const encoded = LZString.default.compressToEncodedURIComponent(JSON.stringify(dataToEncode));
         link = `${link}#data=${encoded}`;
         navigator.clipboard.writeText(link);
         alert('Shareable link copied to clipboard!');
      });
      return;
    }
    
    navigator.clipboard.writeText(link);
    alert('Shareable link copied to clipboard!');
  };

  const filtered = agreements.filter(a => {
    const matchSearch = a.clientName.toLowerCase().includes(search.toLowerCase()) || 
                        a.clientEmail.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || a.status === filter;
    return matchSearch && matchFilter;
  });

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedAgreements = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusColors = {
    draft: 'bg-neutral-200 text-neutral-800',
    sent: 'bg-blue-100 text-blue-800',
    viewed: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-emerald-100 text-emerald-800'
  };

  return (
    <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto h-full w-full text-black">
      {!activeAgreement && (
        <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h2 className="font-headline font-extrabold text-xl md:text-2xl lg:text-3xl tracking-tight uppercase">
              <span style={{ color: brandColor }}>{brandName}'S</span> AGREEMENTS & PROPOSALS
            </h2>
          </div>
          
          <div className="flex flex-col items-stretch lg:items-end gap-3 w-full lg:w-auto">
            <button 
              onClick={() => setActiveAgreement('new')}
              className="px-3.5 py-2 text-white neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 border-2 border-black shrink-0 active:translate-y-0.5 w-full md:w-auto hover:opacity-90"
              style={{ backgroundColor: brandColor }}
            >
              <Plus className="w-3.5 h-3.5" />
              New Agreement
            </button>
          </div>
        </div>
      )}

      {activeAgreement ? (
        <AgreementStudio 
          onCancel={() => setActiveAgreement(null)} 
          onCreate={handleCreate} 
          brandColor={brandColor} 
          templates={templates} 
          initialData={activeAgreement === 'new' ? {
            clientName: '',
            clientEmail: '',
            title: 'Client Agreement',
            projectDetails: '<p>Project scope details here...</p>',
            fee: '',
            clientSignatureLabel: ''
          } : activeAgreement} 
        />
      ) : (
        <div className="border-2 border-black bg-surface-container-lowest neu-shadow mb-8 md:mb-12 w-full flex flex-col mt-4">
          <div className="bg-secondary-container border-b-2 border-black p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 w-full max-w-sm">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400 text-sm md:text-base">search</span>
              <input 
                type="text" 
                placeholder="Search by client name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border-2 border-black bg-white font-body text-xs outline-none focus:border-primary-container transition-colors"
              />
              {search && (
                <button
                   onClick={() => setSearch("")}
                   className="absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400 hover:text-black text-sm"
                >
                  close
                </button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 md:pb-0">
              {['all', 'draft', 'accepted'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1.5 text-[10px] font-headline font-bold uppercase whitespace-nowrap transition-colors border-2 border-black ${
                    filter === f ? 'bg-primary-container text-white' : 'bg-surface-container-lowest text-black hover:bg-surface-container-high'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto w-full bg-white select-none">
            <table className="w-full text-left font-body text-xs border-collapse min-w-[700px]">
              <thead className="bg-neutral-100 font-headline uppercase text-[9px] md:text-[11px] tracking-wider">
                <tr className="border-b-2 border-black">
                  <th className="px-4 py-3 font-bold border-r border-black">Status</th>
                  <th className="px-4 py-3 font-bold border-r border-black">Agreement Title</th>
                  <th className="px-4 py-3 font-bold border-r border-black">Client Name</th>
                  <th className="px-4 py-3 font-bold border-r border-black">Signed On</th>
                  <th className="px-4 py-3 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white select-text">
                {loading ? (
                  <tr><td colSpan={5} className="p-4 text-center font-bold border-b border-black">Loading agreements...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center font-bold border-b border-black">No agreements found.</td></tr>
                ) : (
                  paginatedAgreements.map(agreement => (
                    <tr key={agreement.id} className="border-b border-black hover:bg-neutral-50/55 transition-colors last:border-b-0">
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
                        {agreement.status === 'accepted' && agreement.acceptedAt ? (
                          formatSignedDate(agreement.acceptedAt)
                        ) : (
                          '--'
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setPreviewId(agreement.id)}
                            className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black"
                            title="View Agreement"
                          >
                            <ExternalLink size={14} />
                          </button>
                          
                          {agreement.status === 'accepted' && (
                            <a 
                              href={`/agreement/${user?.uid}/${agreement.id}?download=true`}
                              target="_blank"
                              className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black"
                              title="Download PDF"
                            >
                              <Download size={14} />
                            </a>
                          )}
                          
                          <button 
                            onClick={(e) => { e.preventDefault(); handleShareHostedLink(agreement, 'whatsapp'); }}
                            className="p-1.5 bg-white hover:bg-green-50 border-2 border-black transition-all hover:scale-105 text-green-600 font-bold flex items-center justify-center"
                            title="Send via WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </button>
                          
                          <button 
                            onClick={(e) => { e.preventDefault(); handleShareHostedLink(agreement, 'email'); }}
                            className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black flex items-center justify-center"
                            title="Send via Email"
                          >
                            <Mail size={14} />
                          </button>
                          
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 md:p-5 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-lowest">
              <span className="font-body font-bold text-xs md:text-sm uppercase tracking-tight">
                Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(filtered.length, currentPage * itemsPerPage)} of {filtered.length} Entries
              </span>
              <div className="flex items-center gap-2 font-body font-medium text-sm">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-10 px-3 md:px-4 border-2 border-black bg-white hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                <div className="h-10 px-4 border-2 border-black bg-white flex items-center justify-center min-w-[3rem]">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-10 px-3 md:px-4 border-2 border-black bg-primary text-on-primary hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
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
                src={previewId ? `/agreement/${user?.uid}/${previewId}` : ''} 
                className="w-full h-full border-none absolute inset-0 bg-white"
                title="Agreement Preview"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}