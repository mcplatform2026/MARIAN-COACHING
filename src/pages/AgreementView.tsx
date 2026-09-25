import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { CheckCircle2, Check, Download, AlertCircle } from "lucide-react";
import { SignatureCanvasBlock } from "../components/SignatureCanvasBlock";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import html2pdf from "html2pdf.js";
import { formatDateToMMDDYYYY } from "../utils/dateFormat";
import { generateUniversalPDF } from "../utils/pdfGenerator";

const themes: any = {
  white: {
    bg: "#ffffff",
    cardBg: "#ffffff",
    text: "#000000",
    border: "#000000",
  },
  alabaster: {
    bg: "#FAF8F5",
    cardBg: "#fcfbfa",
    text: "#171717",
    border: "rgba(120, 53, 4, 0.4)",
  },
  nordic: {
    bg: "#F0F3F6",
    cardBg: "#f8f9fa",
    text: "#0F172A",
    border: "rgba(30, 58, 138, 0.4)",
  },
  sage: {
    bg: "#F2F6F4",
    cardBg: "#f9fbf9",
    text: "#064E3B",
    border: "rgba(6, 78, 59, 0.3)",
  },
};

const typographyFonts = [
  {
    id: "modern",
    primary: "'Space Grotesk', sans-serif",
    secondary: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: "classic",
    primary: "'Inter', sans-serif",
    secondary: "'Inter', sans-serif",
  },
  {
    id: "tech",
    primary: "'Sora', sans-serif",
    secondary: "'Sora', sans-serif",
  },
  {
    id: "elegant",
    primary: "'Plus Jakarta Sans', sans-serif",
    secondary: "'Plus Jakarta Sans', sans-serif",
  },
];

export function AgreementView() {
  const { uid, id } = useParams<{ uid: string; id: string }>();

  // DEBUG OVERLAY
  const [debugLog, setDebugLog] = useState<string>("Init...");
  useEffect(() => {
    setDebugLog(
      (prev) =>
        prev +
        "\nMounted. uid=" +
        uid +
        " id=" +
        id +
        " hash=" +
        window.location.hash.substring(0, 20),
    );
  }, [uid, id]);

  const [agreement, setAgreement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const pdfRef = useRef<HTMLDivElement>(null);
      
  
  const [clientSig, setClientSig] = useState<string | null>(null);
  const [resolvedUid, setResolvedUid] = useState<string | null>(uid || null);
  const [resolvedId, setResolvedId] = useState<string | null>(id || null);
  const autoDownloadTriggered = useRef(false);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setDownloading(true);

    try {
      await generateUniversalPDF({
        element: pdfRef.current,
        filename: `Agreement_${agreement?.clientName || "Document"}.pdf`,
        widthPx: 794,
        minHeightPx: 1123,
        padding: "48px 40px",
        backgroundColor: themes.white?.bg || "#ffffff",
        textColor: themes.white?.text || "#000000",
        scale: 2,
        multiPage: true,
      });
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert(
        `Failed to download PDF: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const fetchAgreement = async () => {
      if (!id) return;

      // 1. Try to load from URL Hash first (Serverless Fallback)
      const hash = window.location.hash;
      if (hash && hash.startsWith("#data=")) {
        try {
          const encoded = hash.replace("#data=", "");
          import("lz-string").then((LZString) => {
            const decoded =
              LZString.default.decompressFromEncodedURIComponent(encoded);
            if (decoded) {
              const data = JSON.parse(decoded);
              setAgreement(data);
              if (data.status === "accepted") setAccepted(true);
              setLoading(false);
            }
          });

          // Optionally still try to update DB status to viewed in background
          try {
            const docRef = doc(db, `users/${resolvedUid || uid}/agreements/${resolvedId || id}`);
            updateDoc(docRef, {
              status: "viewed",
              viewedAt: new Date().toISOString(),
            }).catch(() => {});
          } catch (e) {}

          return; // Skip DB fetch if hash succeeds
        } catch (e) {
          console.error("Failed to parse hash", e);
        }
      }

      try {
        let docSnap;
        let docRef;
        
        if (!uid && id) {
          // Short link
          docRef = doc(db, `shared_links/${id}`);
          docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
             const docData = docSnap.data();
             if (docData.type === 'agreement' && docData.data) {
                let data = docData.data;
                const ownerUid = docData.ownerUid;
                const agrId = data.id;
                setResolvedUid(ownerUid);
                setResolvedId(agrId);

                // Fetch latest live status directly from the user's agreements subcollection
                if (ownerUid && agrId) {
                  try {
                    const freshDocRef = doc(db, `users/${ownerUid}/agreements/${agrId}`);
                    const freshSnap = await getDoc(freshDocRef);
                    if (freshSnap.exists()) {
                      data = { ...data, ...freshSnap.data(), id: agrId };
                    }
                  } catch (e) {
                    console.log("Using cached agreement data from short link");
                  }
                }

                setAgreement({ id: data.id, ...data });
                if (data.status === "accepted") setAccepted(true);
                setLoading(false);
                return;
             } else {
                setError("Agreement not found");
                setLoading(false);
                return;
             }
          }
        }
        
        // Direct user link with UID fallback
        const effectiveLookupUid = (uid && uid !== "undefined") ? uid : (auth.currentUser?.uid || resolvedUid);
        if (effectiveLookupUid) {
          docRef = doc(db, `users/${effectiveLookupUid}/agreements/${id}`);
          docSnap = await getDoc(docRef);
        }

        // Secondary fallback if user is logged in under their own account
        if ((!docSnap || !docSnap.exists()) && auth.currentUser?.uid && auth.currentUser.uid !== effectiveLookupUid) {
          try {
            const fallbackRef = doc(db, `users/${auth.currentUser.uid}/agreements/${id}`);
            const fallbackSnap = await getDoc(fallbackRef);
            if (fallbackSnap.exists()) {
              docRef = fallbackRef;
              docSnap = fallbackSnap;
            }
          } catch (e) {
            // ignore fallback error
          }
        }

        if (docSnap && docSnap.exists()) {
          const data = docSnap.data();
          setAgreement({ id: docSnap.id, ...data });

          if (data.status === "sent") {
            try {
              await updateDoc(docRef, {
                status: "viewed",
                viewedAt: new Date().toISOString(),
              });
            } catch (dbErr) {
              console.warn("Database update failed:", dbErr);
            } 
          }
          if (data.status === "accepted") {
            setAccepted(true);
            localStorage.setItem(`agreement_${id}_status`, "Signed");
          }
        } else {
          setError("Agreement not found");
        }
      } catch (err) {
        console.error(err);
        setError(
          "You do not have permission to view this agreement. Ensure you are signed in or rules are updated.",
        );
      } finally {
        setLoading(false);
      }
    };

    // Wait for auth state to initialize before fetching
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      fetchAgreement();
    });

    return () => unsubscribe();
  }, [uid, id]);

  useEffect(() => {
    // If the URL has ?download=true and the agreement is loaded, trigger download
    if (!loading && agreement) {
      const isDownloadRequested =
        new URLSearchParams(window.location.search).get("download") === "true";
      if (isDownloadRequested && !autoDownloadTriggered.current) {
        autoDownloadTriggered.current = true;
        // Clean the URL query immediately so it cannot re-trigger on reload or state update
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("download");
          window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : "") + url.hash);
        } catch (e) {
          // ignore
        }
        const timer = setTimeout(() => {
          handleDownloadPDF();
        }, 800); // give 800ms for assets/fonts to load
        return () => clearTimeout(timer);
      }
    }
  }, [loading, agreement]);

  const handleAgree = async () => {
    const finalUid = resolvedUid || (uid && uid !== "undefined" ? uid : auth.currentUser?.uid);
    const finalId = resolvedId || id;
    if (!finalUid || !finalId) return;

    if (!clientSig && !agreement.clientSignature) {
      alert("Please provide your signature to accept the agreement.");
      return;
    }

    try {
      setLoading(true);

      // Update localStorage as requested
      localStorage.setItem(`agreement_${finalId}_status`, "Signed");

      const docRef = doc(db, `users/${finalUid}/agreements/${finalId}`);
      try {
        await updateDoc(docRef, {
          status: "accepted",
          clientSignature: clientSig,
          acceptedAt: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn("Database update failed, but proceeding locally:", dbErr);
      }

      // Also update shared_links document if accessed via short link
      if (!uid && id) {
        try {
          const sharedDocRef = doc(db, `shared_links/${id}`);
          await updateDoc(sharedDocRef, {
            "data.status": "accepted",
            "data.clientSignature": clientSig,
            "data.acceptedAt": new Date().toISOString(),
          });
        } catch (sharedErr) {
          console.warn("Shared link update optional sync:", sharedErr);
        }
      }

      setAgreement((prev: any) => ({
        ...prev,
        clientSignature: clientSig || agreement.clientSignature,
        status: "accepted",
        acceptedAt: new Date().toISOString(),
      }));
      setAccepted(true);

      // Explicitly NO auto-download on signature! Client can click "Download PDF Copy" whenever they choose.
    } catch (err) {
      console.error(err);
      alert("Failed to sign the agreement. Permissions issue.");
    } finally {
      setLoading(false);
    }
  };

      if (loading && !agreement) {
    return (
      <div className="min-h-screen flex items-center justify-center font-headline font-bold uppercase text-neutral-500 tracking-wider">
        Loading Agreement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-100">
        <div className="bg-white border-2 border-red-500 p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-red-700 font-headline font-black uppercase text-xl mb-2">
            Error
          </h2>
          <p className="text-neutral-600 font-body text-sm font-medium leading-relaxed">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!agreement) return null;

  const currentTheme = themes.white;
  const currentFont =
    typographyFonts.find((f) => f.id === agreement.invoiceTypography) ||
    typographyFonts[0];

  return (
    <>
      <style>{`
        .pdf-clone .pdf-flex-row, .pdf-flex-row, .signatures-row { display: flex !important; flex-direction: row !important; }
        .pdf-clone .pdf-items-end { align-items: flex-end !important; }
        .pdf-clone .pdf-w-half, .pdf-w-half { width: 50% !important; flex: 1 1 50% !important; }
        .pdf-clone .pdf-pr-4 { padding-right: 1rem !important; }
        .pdf-clone .pdf-pl-4 { padding-left: 1rem !important; }
        .agreement-prose h1, .agreement-prose h2, .agreement-prose h3 {
          page-break-after: avoid !important;
          break-after: avoid !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          font-family: var(--font-headline-family);
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
        className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-body text-black flex flex-col items-center overflow-x-hidden bg-[#F4F4F5]"
      >
        <div
          ref={pdfRef}
          className="w-full max-w-[800px] bg-white border border-[#d4d4d8] shadow-2xl relative shrink-0 p-8 sm:p-12 md:p-14"
          style={
            {
              backgroundColor: "#ffffff",
              minHeight: "297mm",
              color: "#18181b",
              "--font-headline-family": currentFont.primary,
              "--font-body-family": currentFont.secondary,
            } as React.CSSProperties
          }
        >
          <div style={{ fontFamily: "var(--font-body-family)" }}>
            {/* Header Block */}
            <div className="flex flex-row justify-between items-start pb-6 border-b-2 border-neutral-900 mb-6 gap-6 header-block">
              <div>
                {agreement.logoImage ? (
                  <div style={{ maxWidth: "220px", display: "flex", justifyContent: "flex-start" }}>
                    <img
                      src={agreement.logoImage}
                      alt="Brand Logo"
                      style={{
                        maxHeight: "64px",
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    <div
                      className="font-headline font-black text-2xl uppercase tracking-tight text-neutral-950"
                      style={{ fontFamily: "var(--font-headline-family)" }}
                    >
                      {agreement.brandColor ? (
                        <span style={{ color: agreement.brandColor }}>MARIAN</span>
                      ) : (
                        "MARIAN"
                      )}{" "}
                      COACHING
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
                {accepted || agreement.status === 'accepted' ? (
                  <div className="text-xs font-headline font-bold text-emerald-700 flex items-center justify-end gap-1.5 uppercase">
                    <Check size={14} className="stroke-[3]" /> EXECUTED & SIGNED
                  </div>
                ) : (
                  <div className="text-xs font-headline font-bold text-amber-700 flex items-center justify-end gap-1.5 uppercase">
                    • PENDING SIGNATURE
                  </div>
                )}
              </div>
            </div>

            {/* Document Title */}
            <div className="mb-6">
              <h1
                className="text-2xl sm:text-3xl font-headline font-black uppercase tracking-tight text-neutral-950 mb-1"
                style={{ fontFamily: "var(--font-headline-family)" }}
              >
                {agreement.title || "CLIENT SERVICES AGREEMENT"}
              </h1>
              <p className="text-xs text-neutral-500 font-body">
                Legally binding contract between the parties identified below.
              </p>
            </div>

            {/* Executive Agreement Metadata Grid */}
            <div className="border border-neutral-300 bg-neutral-50/70 p-5 mb-8 metadata-card">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 font-body">
                <div>
                  <span className="text-[10px] font-headline font-black uppercase tracking-wider text-neutral-500 block mb-0.5">
                    CLIENT LEGAL NAME
                  </span>
                  <span className="text-sm font-bold text-neutral-950 block">
                    {agreement.clientName || "Client Name"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-headline font-black uppercase tracking-wider text-neutral-500 block mb-0.5">
                    SERVICE PROVIDER
                  </span>
                  <span className="text-sm font-bold text-neutral-950 block">
                    {agreement.providerSignatureLabel || "Marian Coaching, LLC"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-headline font-black uppercase tracking-wider text-neutral-500 block mb-0.5">
                    CLIENT CONTACT EMAIL
                  </span>
                  <span className="text-sm font-medium text-neutral-800 block">
                    {agreement.clientEmail || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-headline font-black uppercase tracking-wider text-neutral-500 block mb-0.5">
                    TOTAL INVESTMENT / FEE
                  </span>
                  <span className="text-sm font-black text-emerald-800 block">
                    {agreement.fee || "As specified in project scope"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-headline font-black uppercase tracking-wider text-neutral-500 block mb-0.5">
                    AGREEMENT EFFECTIVE DATE
                  </span>
                  <span className="text-sm font-bold text-neutral-900 block">
                    {formatDateToMMDDYYYY(agreement.agreementDate || agreement.createdAt || Date.now())}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-headline font-black uppercase tracking-wider text-neutral-500 block mb-0.5">
                    EXECUTION STATUS
                  </span>
                  <span className="text-sm font-bold uppercase text-neutral-900 block">
                    {accepted || agreement.status === 'accepted' ? "Signed & Legally Binding" : "Awaiting Client Acceptance"}
                  </span>
                </div>
              </div>
            </div>

            {/* Agreement Content (Rich Text) */}
            <div className="agreement-prose mb-12">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    agreement.projectDetails ||
                    '<p className="italic opacity-50">Project details and scope will appear here...</p>',
                }}
              />
            </div>

            {/* Signatures & Execution Section */}
            <div className="mt-14 pt-8 border-t-2 border-neutral-900 signatures-block">
              <h3
                className="font-headline font-black uppercase text-base tracking-wider mb-1"
                style={{ fontFamily: "var(--font-headline-family)" }}
              >
                SIGNATURES & EXECUTION
              </h3>
              <p className="text-xs text-neutral-600 mb-6 font-body leading-relaxed">
                IN WITNESS WHEREOF, the Service Provider and the Client have duly executed and delivered this Client Agreement as of the dates set forth below.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full signatures-row">
                {/* Service Provider Box */}
                <div className="flex flex-col border border-neutral-300 bg-neutral-50/40 p-4">
                  <span className="text-[10px] font-headline font-black uppercase tracking-wider text-neutral-500 mb-2">
                    SERVICE PROVIDER SIGNATURE
                  </span>
                  <div className="w-full h-28 border-b-2 border-neutral-900 flex items-center justify-center bg-white px-2 py-1 mb-3">
                    {agreement.providerSignature ? (
                      <img
                        src={agreement.providerSignature}
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
                    {agreement.providerSignatureLabel || "Service Provider"}
                  </span>
                  <span className="text-[11px] font-body text-neutral-500 mt-0.5">
                    Date: {formatDateToMMDDYYYY(agreement.agreementDate || agreement.createdAt || Date.now())}
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
                  <div className="w-full min-h-[7rem] border-b-2 border-neutral-900 flex items-center justify-center bg-white px-2 py-1 mb-3">
                    {accepted || agreement.clientSignature ? (
                      <img
                        src={agreement.clientSignature || clientSig}
                        alt="Client Signature"
                        className="max-h-20 max-w-full object-contain"
                      />
                    ) : (
                      <div className="w-full" data-html2pdf-ignore="true">
                        <SignatureCanvasBlock
                          onSignatureReady={setClientSig}
                          label="Draw Client Signature"
                        />
                      </div>
                    )}
                  </div>
                  <span className="font-headline font-bold text-xs uppercase text-neutral-950 truncate">
                    {agreement.clientName || "Client Name"}
                  </span>
                  <span className="text-[11px] font-body text-neutral-500 mt-0.5">
                    Date: {accepted && agreement.acceptedAt ? formatDateToMMDDYYYY(agreement.acceptedAt) : (accepted ? formatDateToMMDDYYYY(Date.now()) : "Pending Client Acceptance")}
                  </span>
                  <span className="text-[10px] font-headline font-bold mt-1 uppercase text-emerald-700">
                    {accepted ? "✓ Verified Digital Signature" : "• Pending Signature"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions Outside Document Canvas */}
        <div
          className="mt-8 mb-16 flex flex-col items-center justify-center w-full max-w-3xl mx-auto"
          data-html2pdf-ignore="true"
        >
          {!accepted ? (
            <button
              onClick={handleAgree}
              className="px-10 py-4 bg-primary-container text-white border-2 border-black neu-shadow font-headline font-black uppercase tracking-wider text-sm transition-all hover:translate-y-0.5 hover:shadow-none"
            >
              I Agree & Accept Agreement
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-2 border-2 border-emerald-600 font-headline font-bold uppercase text-xs">
                <Check size={16} /> Agreement has been successfully accepted & signed
              </div>
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="px-8 py-3.5 bg-neutral-950 text-white border-2 border-black neu-shadow font-headline font-black uppercase tracking-wider text-xs transition-all hover:translate-y-0.5 hover:shadow-none disabled:opacity-50 flex items-center gap-2"
              >
                <Download size={16} />{" "}
                {downloading ? "Generating PDF..." : "Download Signed PDF Copy"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
