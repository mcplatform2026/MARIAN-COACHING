import React, { useState, useEffect } from 'react';
import { useAgreements, Agreement } from '../hooks/useAgreements';
import { Check, Copy, FileText, Plus, Search, Trash2, PenTool, Eye, Mail, Clock, Bold, Italic, List, Heading1, Heading2, PaintBucket, Pilcrow, Strikethrough, ExternalLink, X } from 'lucide-react';
import { MessageCircle, Download, Loader2 } from 'lucide-react';
import { generateUniversalPDF } from '../utils/pdfGenerator';
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

  const { user, dbUid } = useAuth();
  const effectiveUid = dbUid || user?.uid;
  const { agreements, loading, addAgreement, removeAgreement, updateAgreement } = useAgreements();
  const [activeAgreement, setActiveAgreement] = useState<any | 'new' | null>(null);
  const [search, setSearch] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all'|'draft'|'sent'|'viewed'|'accepted'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [brandName, setBrandName] = useState(() => localStorage.getItem('brandName') || 'LOREM IPSUM');
  const [brandColor, setBrandColor] = useState(() => localStorage.getItem('brandColor') || '#6933ff');

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeDownloadAgreement, setActiveDownloadAgreement] = useState<Agreement | null>(null);
  const hiddenPdfRef = useRef<HTMLDivElement>(null);

  const handleInstantDownload = (agr: Agreement) => {
    if (downloadingId) return;
    setDownloadingId(agr.id);
    setActiveDownloadAgreement(agr);
  };

  useEffect(() => {
    if (activeDownloadAgreement && hiddenPdfRef.current) {
      const doDownload = async () => {
        try {
          await generateUniversalPDF({
            element: hiddenPdfRef.current!,
            filename: `Agreement_${activeDownloadAgreement.clientName || 'Document'}.pdf`,
            widthPx: 794,
            minHeightPx: 1123,
            backgroundColor: "#ffffff",
            textColor: "#18181b",
            scale: 2,
            multiPage: true,
          });
        } catch (err) {
          console.error("Instant PDF download failed:", err);
          alert("Failed to download PDF. Please try again.");
        } finally {
          setDownloadingId(null);
          setActiveDownloadAgreement(null);
        }
      };
      const timer = setTimeout(doDownload, 120);
      return () => clearTimeout(timer);
    }
  }, [activeDownloadAgreement]);

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
        
        const link = `${window.location.origin}/agreement/${effectiveUid}/${docId}`;
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
      if (effectiveUid) {
        try {
          await updateDoc(doc(db, `users/${effectiveUid}/agreements/${agreement.id}`), {
            shortShareId: shortId
          });
          agreement.shortShareId = shortId;
        } catch(e) {}
      }
    }

    if (effectiveUid) {
      try {
        await setDoc(doc(db, `shared_links/${shortId}`), {
          type: 'agreement',
          data: agreement,
          ownerUid: effectiveUid,
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
                          <a 
                            href={`/agreement/${effectiveUid}/${agreement.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black flex items-center justify-center"
                            title="View Agreement"
                          >
                            <ExternalLink size={14} />
                          </a>
                          
                          <button 
                            type="button"
                            onClick={() => handleInstantDownload(agreement)}
                            disabled={downloadingId === agreement.id}
                            className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black flex items-center justify-center disabled:opacity-50"
                            title="Download Agreement PDF"
                          >
                            {downloadingId === agreement.id ? (
                              <Loader2 size={14} className="animate-spin text-primary-container" />
                            ) : (
                              <Download size={14} />
                            )}
                          </button>
                          
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
                src={previewId ? `/agreement/${effectiveUid}/${previewId}` : ''} 
                className="w-full h-full border-none absolute inset-0 bg-white"
                title="Agreement Preview"
              />
            </div>
          </div>
        </div>
      )}
      {/* Hidden container for instant background PDF generation */}
      {activeDownloadAgreement && (
        <div style={{ position: "fixed", left: "-9999px", top: 0, width: "800px", zIndex: -9999, opacity: 0, pointerEvents: "none" }}>
          <div
            ref={hiddenPdfRef}
            className="w-[800px] bg-white p-12 text-[#18181b]"
            style={{ minHeight: "297mm", backgroundColor: "#ffffff" }}
          >
            {/* Header Block */}
            <div className="flex flex-row justify-between items-start pb-6 border-b-2 border-neutral-900 mb-6 gap-6 header-block">
              <div>
                {activeDownloadAgreement.logoImage ? (
                  <div style={{ maxWidth: "220px", display: "flex", justifyContent: "flex-start" }}>
                    <img
                      src={activeDownloadAgreement.logoImage}
                      alt="Brand Logo"
                      style={{ maxHeight: "64px", maxWidth: "100%", objectFit: "contain" }}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="font-headline font-black text-2xl uppercase tracking-tight text-neutral-950">
                      {brandName || "MARIAN COACHING"}
                    </div>
                    <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-neutral-500 mt-0.5">
                      Professional Coaching & Consulting
                    </p>
                  </div>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block text-[10px] font-headline font-black tracking-widest uppercase px-3 py-1 bg-neutral-100 border border-neutral-300 text-neutral-800 mb-2">
                  OFFICIAL CLIENT AGREEMENT
                </span>
                {activeDownloadAgreement.status === "accepted" ? (
                  <div className="text-xs font-headline font-bold text-emerald-700 flex items-center justify-end gap-1.5 uppercase">
                    <Check size={14} className="stroke-[3]" /> EXECUTED & SIGNED
                  </div>
                ) : (
                  <div className="text-xs font-headline font-bold text-amber-700 flex items-center justify-end gap-1.5 uppercase">
                    • {activeDownloadAgreement.status === "sent" ? "PENDING SIGNATURE" : "OFFICIAL DRAFT"}
                  </div>
                )}
              </div>
            </div>

            {/* Document Title */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-headline font-black uppercase tracking-tight text-neutral-950 mb-1">
                {activeDownloadAgreement.title || "CLIENT SERVICES AGREEMENT"}
              </h1>
              <p className="text-xs text-neutral-500 font-body">
                Legally binding contract between the parties identified below.
              </p>
            </div>

            {/* Executive Agreement Metadata Grid */}
            <div className="border border-neutral-300 bg-neutral-50/70 p-5 mb-8 metadata-card">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3.5 font-body">
                <div>
                  <span className="text-[10px] font-headline font-black uppercase tracking-wider text-neutral-500 block mb-0.5">
                    CLIENT LEGAL NAME
                  </span>
                  <span className="text-sm font-bold text-neutral-950 block">
                    {activeDownloadAgreement.clientName || "Client Name"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-headline font-black uppercase tracking-wider text-neutral-500 block mb-0.5">
                    SERVICE PROVIDER
                  </span>
                  <span className="text-sm font-bold text-neutral-950 block">
                    {activeDownloadAgreement.providerSignatureLabel || "Marian Coaching, LLC"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-headline font-black uppercase tracking-wider text-neutral-500 block mb-0.5">
                    CLIENT CONTACT EMAIL
                  </span>
                  <span className="text-sm font-medium text-neutral-800 block">
                    {activeDownloadAgreement.clientEmail || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-headline font-black uppercase tracking-wider text-neutral-500 block mb-0.5">
                    TOTAL INVESTMENT / FEE
                  </span>
                  <span className="text-sm font-black text-emerald-800 block">
                    {activeDownloadAgreement.fee || "As specified in project scope"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-headline font-black uppercase tracking-wider text-neutral-500 block mb-0.5">
                    AGREEMENT EFFECTIVE DATE
                  </span>
                  <span className="text-sm font-bold text-neutral-900 block">
                    {formatDateToMMDDYYYY(activeDownloadAgreement.agreementDate || activeDownloadAgreement.createdAt || Date.now())}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-headline font-black uppercase tracking-wider text-neutral-500 block mb-0.5">
                    EXECUTION STATUS
                  </span>
                  <span className="text-sm font-bold uppercase text-neutral-900 block">
                    {activeDownloadAgreement.status === "accepted" ? "Signed & Legally Binding" : "Official Agreement"}
                  </span>
                </div>
              </div>
            </div>

            {/* Agreement Content (Rich Text) */}
            <div className="agreement-prose mb-12">
              <style>{`
                .agreement-prose h1, .agreement-prose h2, .agreement-prose h3 {
                  page-break-after: avoid !important;
                  break-after: avoid !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  font-weight: 800;
                  text-transform: uppercase;
                  color: #09090b;
                  margin-top: 1.5rem !important;
                  margin-bottom: 0.5rem !important;
                }
                .agreement-prose h1 { font-size: 1.45rem; border-bottom: 1.5px solid #e4e4e7; padding-bottom: 0.3rem; }
                .agreement-prose h2 { font-size: 1.25rem; }
                .agreement-prose h3 { font-size: 1.05rem; }
                .agreement-prose p, .agreement-prose li {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  line-height: 1.65;
                  color: #18181b;
                }
                .agreement-prose p { margin-bottom: 0.75rem; }
                .agreement-prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.85rem; }
                .agreement-prose ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.85rem; }
                .header-block { page-break-inside: avoid !important; break-inside: avoid !important; }
                .metadata-card { page-break-inside: avoid !important; break-inside: avoid !important; }
                .signatures-block { page-break-inside: avoid !important; break-inside: avoid !important; }
              `}</style>
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    activeDownloadAgreement.projectDetails ||
                    '<p className="italic opacity-50">Project details and scope will appear here...</p>',
                }}
              />
            </div>

            {/* Signatures & Execution Section */}
            <div className="mt-14 pt-8 border-t-2 border-neutral-900 signatures-block">
              <h3 className="font-headline font-black uppercase text-base tracking-wider mb-1">
                SIGNATURES & EXECUTION
              </h3>
              <p className="text-xs text-neutral-600 mb-6 font-body leading-relaxed">
                IN WITNESS WHEREOF, the Service Provider and the Client have duly executed and delivered this Client Agreement as of the dates set forth below.
              </p>
              
              <div className="grid grid-cols-2 gap-6 w-full signatures-row">
                {/* Service Provider Box */}
                <div className="flex flex-col border border-neutral-300 bg-neutral-50/40 p-4">
                  <span className="text-[10px] font-headline font-black uppercase tracking-wider text-neutral-500 mb-2">
                    SERVICE PROVIDER SIGNATURE
                  </span>
                  <div className="w-full h-28 border-b-2 border-neutral-900 flex items-center justify-center bg-white px-2 py-1 mb-3">
                    {activeDownloadAgreement.providerSignature ? (
                      <img
                        src={activeDownloadAgreement.providerSignature}
                        alt="Service Provider Signature"
                        className="max-h-20 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-neutral-400 font-headline uppercase italic">
                        Signature on File
                      </span>
                    )}
                  </div>
                  <span className="font-headline font-bold text-xs uppercase text-neutral-950 truncate">
                    {activeDownloadAgreement.providerSignatureLabel || "Service Provider"}
                  </span>
                  <span className="text-[11px] font-body text-neutral-500 mt-0.5">
                    Date: {formatDateToMMDDYYYY(activeDownloadAgreement.agreementDate || activeDownloadAgreement.createdAt || Date.now())}
                  </span>
                  <span className="text-[10px] font-headline font-bold text-emerald-700 mt-1 uppercase">
                    ✓ Authorized Representative
                  </span>
                </div>

                {/* Client Box */}
                <div className="flex flex-col border border-neutral-300 bg-neutral-50/40 p-4">
                  <span className="text-[10px] font-headline font-black uppercase tracking-wider text-neutral-500 mb-2">
                    CLIENT ACCEPTANCE & SIGNATURE
                  </span>
                  <div className="w-full h-28 border-b-2 border-neutral-900 flex items-center justify-center bg-white px-2 py-1 mb-3">
                    {activeDownloadAgreement.clientSignature ? (
                      <img
                        src={activeDownloadAgreement.clientSignature}
                        alt="Client Signature"
                        className="max-h-20 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-neutral-400 font-headline uppercase italic">
                        {activeDownloadAgreement.status === "accepted" ? "Digitally Signed" : "Pending Signature"}
                      </span>
                    )}
                  </div>
                  <span className="font-headline font-bold text-xs uppercase text-neutral-950 truncate">
                    {activeDownloadAgreement.clientName || "Client Name"}
                  </span>
                  <span className="text-[11px] font-body text-neutral-500 mt-0.5">
                    Date: {activeDownloadAgreement.acceptedAt ? formatDateToMMDDYYYY(activeDownloadAgreement.acceptedAt) : "Pending Client Acceptance"}
                  </span>
                  <span className="text-[10px] font-headline font-bold mt-1 uppercase text-emerald-700">
                    {activeDownloadAgreement.status === "accepted" ? "✓ Verified Digital Signature" : "• Pending Signature"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}