import React, { useState, useRef, DragEvent, useEffect } from "react";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  Upload, 
  RotateCcw, 
  Check, 
  Phone, 
  MessageCircle,
  Mail, 
  Globe, 
  FileText,
  Palette,
  Info,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  History,
  Save,
  Copy,
  PenTool,
  FilePlus,
  CheckCircle,
  Clock,
  Search,
  Lock,
  Unlock,
  Type,
  ArrowLeft
} from "lucide-react";
import { collection, addDoc, updateDoc, deleteDoc, doc, setDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { useAuth } from "../components/AuthProvider";
import { formatDateToMMDDYYYY } from "../utils/dateFormat";
import { AmericanDateInput } from "../components/AmericanDateInput";

interface InvoiceItem {
  id: string;
  title: string;
  subtext: string;
  price: number;
}

type ThemeKey = "white" | "alabaster" | "nordic" | "sage";

export interface SavedInvoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  billedToName: string;
  billedToEmail: string;
  brandNamePart1: string;
  brandNamePart2: string;
  invoiceTheme: ThemeKey;
  invoiceTypography?: string;
  thankYouMessage?: string;
  items: InvoiceItem[];
  exactTerms: string;
  paymentDetails?: string;
  signatureName: string;
  signatureWritten: string;
  signatureFontClass: string;
  signatureImage?: string | null;
  signatureImageScale?: number;
  phone: string;
  email: string;
  website: string;
  currencySymbol: string;
  subtextStyle: "light" | "mono" | "italic" | "compact";
  logoImage: string | null;
  logoImageScale?: number;
  totalAmount: number;
  status?: 'paid' | 'unpaid';
  shortShareId?: string;
  createdAt?: any;
}

const parseToDate = (dateStr: string) => {
  if (!dateStr) return null;
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  }
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    // If p0 > 12, it was DD/MM/YYYY
    if (p0 > 12) {
      return new Date(year, p1 - 1, p0);
    }
    // Otherwise MM/DD/YYYY
    return new Date(year, p0 - 1, p1);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

const getTodayISODate = () => {
  return new Date().toISOString().split('T')[0];
};

const sortInvoicesDesc = (invoices: SavedInvoice[]): SavedInvoice[] => {
  return [...invoices].sort((a, b) => {
    const getDateVal = (inv: SavedInvoice) => {
      if (!inv.invoiceDate) return 0;
      const parsed = parseToDate(inv.invoiceDate);
      return parsed ? parsed.getTime() : 0;
    };
    
    const dateA = getDateVal(a);
    const dateB = getDateVal(b);
    
    if (dateA !== dateB) {
      return dateB - dateA; // Newest invoiceDate first
    }
    
    const getCreatedTime = (inv: SavedInvoice) => {
      if (typeof inv.createdAt === 'number') return inv.createdAt;
      if (typeof inv.createdAt === 'string') return new Date(inv.createdAt).getTime();
      return 0;
    };
    
    return getCreatedTime(b) - getCreatedTime(a);
  });
};

export function Invoices() {
  const getEmailLink = (subject: string, body: string) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    return `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const { user } = useAuth();
  const [brandName, setBrandName] = useState(() => localStorage.getItem('brandName') || 'LOREM IPSUM');
  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      const s = location.state as any;
      if (s.billedToName !== undefined) setBilledToName(s.billedToName);
      if (s.billedToEmail !== undefined) setBilledToEmail(s.billedToEmail);
      if (s.invoiceNo !== undefined) setInvoiceNo(s.invoiceNo);
      if (s.items) {
        setItems(s.items);
      }
      setInvoiceDate(getTodayISODate());
    }
  }, [location.state]);
  
  // Custom Sync and Tab States
  const [activeTab, setActiveTab] = useState<"create" | "past">("create");
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const handleNameChange = () => {
      setBrandName(localStorage.getItem('brandName') || 'LOREM IPSUM');
    };
    window.addEventListener('brandNameChange', handleNameChange);
    return () => {
      window.removeEventListener('brandNameChange', handleNameChange);
    };
  }, []);

  // Fetch past invoices from local storage and handle custom changes
  useEffect(() => {
    const loadInvoices = () => {
      setLoadingInvoices(true);
      try {
        const stored = localStorage.getItem('pastInvoices');
        if (stored) {
          const parsed = JSON.parse(stored) as SavedInvoice[];
          setSavedInvoices(sortInvoicesDesc(parsed));
        } else {
          setSavedInvoices([]);
        }
        } catch (err) {
        console.error("Error fetching past invoices:", err);
      } finally {
        setLoadingInvoices(false);
      }
    };

    loadInvoices();

    // Listen to custom event for voice assistant background creation
    window.addEventListener('pastInvoicesChanged', loadInvoices);

    return () => {
      window.removeEventListener('pastInvoicesChanged', loadInvoices);
    };
  }, []);

  // Set active tab based on query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('view') === 'past') {
      setActiveTab("past");
    }
  }, [location.search]);

  // Locks for specific sections
  const [isLogoLocked, setIsLogoLocked] = useState(() => localStorage.getItem('invoiceLogoLocked') === 'true');
  const [isTermsLocked, setIsTermsLocked] = useState(() => localStorage.getItem('invoiceTermsLocked') === 'true');

  const initialLogoData = (() => {
    try {
      return JSON.parse(localStorage.getItem('invoiceLogoData') || '{}');
    } catch {
      return {};
    }
  })();
  const initialTermsData = (() => {
    try {
      return JSON.parse(localStorage.getItem('invoiceTermsData') || '{}');
    } catch {
      return {};
    }
  })();

  // Brand Logo state (image as base64 or null to fall back to text logo)
  const [logoImage, setLogoImage] = useState<string | null>(isLogoLocked ? initialLogoData.logoImage || null : null);
  const [brandNamePart1, setBrandNamePart1] = useState(isLogoLocked ? initialLogoData.brandNamePart1 || "lorem" : "lorem");
  const [brandNamePart2, setBrandNamePart2] = useState(isLogoLocked ? initialLogoData.brandNamePart2 || "ipsum." : "ipsum.");
  

  // Invoice Fields
  const [billedToName, setBilledToName] = useState("");
  const [billedToEmail, setBilledToEmail] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => getTodayISODate());
  const [invoiceNo, setInvoiceNo] = useState("");

  // Locks for theme and typography
  const [isThemeLocked, setIsThemeLocked] = useState(() => localStorage.getItem('invoiceThemeLocked') === 'true');
  const [isTypographyLocked, setIsTypographyLocked] = useState(() => localStorage.getItem('invoiceTypographyLocked') === 'true');
  
  const initialThemeData = (() => { try { return localStorage.getItem('invoiceThemeData'); } catch { return null; } })();
  const initialTypographyData = (() => { try { return localStorage.getItem('invoiceTypographyData'); } catch { return null; } })();

  // Theme selection for creative backgrounds
  const [invoiceTheme, setInvoiceTheme] = useState<ThemeKey>((isThemeLocked && initialThemeData) ? (initialThemeData as ThemeKey) : "alabaster");
  const [invoiceTypography, setInvoiceTypography] = useState<string>((isTypographyLocked && initialTypographyData) ? initialTypographyData : "modern");

  const themes = {
    white: { 
      bg: "#ffffff", 
      cardBg: "#ffffff",
      text: "#000000", 
      label: "Classic White", 
      border: "#000000",
      rowSeparator: "#e5e7eb",
      accent: "#f5f5f5"
    },
    alabaster: { 
      bg: "#FAF8F5", 
      cardBg: "#fcfbfa",
      text: "#171717", 
      label: "Warm Alabaster (Premium Off-White)", 
      border: "rgba(120, 53, 4, 0.4)",
      rowSeparator: "rgba(120, 53, 4, 0.15)",
      accent: "rgba(254, 243, 199, 0.6)"
    },
    nordic: { 
      bg: "#F0F3F6", 
      cardBg: "#f8f9fa",
      text: "#0f172a", 
      label: "Cool Nordic (Tech-Forward Slate)", 
      border: "rgba(30, 41, 59, 0.4)",
      rowSeparator: "rgba(30, 41, 59, 0.15)",
      accent: "rgba(241, 245, 249, 0.6)"
    },
    sage: { 
      bg: "#F2F5F3", 
      cardBg: "#fbfcfb",
      text: "#022c22", 
      label: "Subtle Sage (Creative Editorial)", 
      border: "rgba(2, 44, 34, 0.3)",
      rowSeparator: "rgba(2, 44, 34, 0.15)",
      accent: "rgba(236, 253, 245, 0.5)"
    }
  };

  const [isItemsLocked, setIsItemsLocked] = useState(() => localStorage.getItem('invoiceItemsLocked') === 'true');

  const initialItemsData = (() => {
    try {
      return JSON.parse(localStorage.getItem('invoiceItemsData') || 'null');
    } catch {
      return null;
    }
  })();

  const defaultItems: InvoiceItem[] = [
    {
      id: "1",
      title: "Lorem Ipsum Dolor Sit Amet",
      subtext: "(consectetur elit)",
      price: 150,
    },
    {
      id: "2",
      title: "Consectetur Adipiscing Elit Service",
      subtext: "(tempor incididunt)",
      price: 250,
    }
  ];

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>(isItemsLocked && initialItemsData ? initialItemsData : defaultItems);

  // Terms and Signature
  const [exactTerms, setExactTerms] = useState(
    isTermsLocked && initialTermsData.exactTerms !== undefined ? initialTermsData.exactTerms : "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT. SED DO EIUSMOD TEMPOR INCIDIDUNT UT LABORE ET DOLORE MAGNA ALIQUA."
  );
  
  const [paymentDetails, setPaymentDetails] = useState(isTermsLocked && initialTermsData.paymentDetails !== undefined ? initialTermsData.paymentDetails : "");
  const [signatureName, setSignatureName] = useState(isTermsLocked && initialTermsData.signatureName !== undefined ? initialTermsData.signatureName : "LOREM");
  const [signatureWritten, setSignatureWritten] = useState(isTermsLocked && initialTermsData.signatureWritten !== undefined ? initialTermsData.signatureWritten : "Lorem");
  const [signatureFontClass, setSignatureFontClass] = useState(isTermsLocked && initialTermsData.signatureFontClass !== undefined ? initialTermsData.signatureFontClass : "font-signature-2");
  const [signatureImage, setSignatureImage] = useState<string | null>(isTermsLocked && initialTermsData.signatureImage !== undefined ? initialTermsData.signatureImage : null);
  const [signatureImageScale, setSignatureImageScale] = useState<number>(isTermsLocked && initialTermsData.signatureImageScale !== undefined ? initialTermsData.signatureImageScale : 100);
  const [thankYouMessage, setThankYouMessage] = useState(isTermsLocked && initialTermsData.thankYouMessage !== undefined ? initialTermsData.thankYouMessage : "THANK YOU FOR YOUR BUSINESS");

  // Footer contact info
  const [phone, setPhone] = useState(isTermsLocked && initialTermsData.phone !== undefined ? initialTermsData.phone : "+0 000 000 0000");
  const [email, setEmail] = useState(isTermsLocked && initialTermsData.email !== undefined ? initialTermsData.email : "contact@loremipsum.com");
  const [website, setWebsite] = useState(isTermsLocked && initialTermsData.website !== undefined ? initialTermsData.website : "www.loremipsum.com");

  // Currency customization
  const [currencySymbol, setCurrencySymbol] = useState("$");

  // Custom subtext typography style selection
  const [subtextStyle, setSubtextStyle] = useState<"light" | "mono" | "italic" | "compact">("italic");

  const subtextClasses = {
    light: "font-sans font-light text-[15px] tracking-wide leading-normal mt-0.5 block",
    mono: "font-mono font-medium text-[14px] uppercase tracking-normal mt-1 block",
    italic: "font-sans italic font-normal text-[15px] mt-0.5 block leading-normal",
    compact: "font-headline font-semibold text-[14px] tracking-widest uppercase mt-1 block"
  };

  // UI state
  const [generating, setGenerating] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [signatureDragActive, setSignatureDragActive] = useState(false);
  const [fallbackImageUrl, setFallbackImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureFileInputRef = useRef<HTMLInputElement>(null);

  const formatDateForPDF = (dateStr: string) => {
    return formatDateToMMDDYYYY(dateStr);
  };

  const formatDisplayDate = (dStr: string) => {
    return formatDateToMMDDYYYY(dStr);
  };


  // Default values backup for resetting
  const handleResetToSample = () => {
    setLogoImage(null);
    setBrandNamePart1("lorem");
    setBrandNamePart2("ipsum.");
    setInvoiceTheme("alabaster");
    setBilledToName("Bert Alleyne");
    setBilledToEmail("bertalleyne@outlook.com");
    setInvoiceDate("2026-04-14");
    setInvoiceNo("071");
    setItems([
      {
        id: "1",
        title: "Lorem Ipsum Dolor Sit Amet",
        subtext: "(consectetur elit)",
        price: 150,
      },
      {
        id: "2",
        title: "Consectetur Adipiscing Elit Service",
        subtext: "(tempor incididunt)",
        price: 250,
      }
    ]);
    setExactTerms(
      "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT. SED DO EIUSMOD TEMPOR INCIDIDUNT UT LABORE ET DOLORE MAGNA ALIQUA."
    );
    setPaymentDetails("");
    setSignatureName("LOREM");
    setSignatureWritten("Lorem");
    setSignatureFontClass("font-signature-2");
    setSignatureImage(null);
    setSignatureImageScale(100);
    setPhone("+0 000 000 0000");
    setEmail("contact@loremipsum.com");
    setWebsite("www.loremipsum.com");
    setCurrencySymbol("$");
  };

  useEffect(() => {
    const handleSync = () => {
      try {
        const data = JSON.parse(localStorage.getItem('invoiceLogoData') || '{}');
        if (data.logoImage !== undefined) setLogoImage(data.logoImage);
        if (data.brandNamePart1 !== undefined) setBrandNamePart1(data.brandNamePart1);
        if (data.brandNamePart2 !== undefined) setBrandNamePart2(data.brandNamePart2);
      } catch (e) {}
    };
    window.addEventListener("invoiceLogoChange", handleSync);
    return () => window.removeEventListener("invoiceLogoChange", handleSync);
  }, []);

  useEffect(() => {
    if (isLogoLocked) {
      try {
        localStorage.setItem('invoiceLogoData', JSON.stringify({
          logoImage, brandNamePart1, brandNamePart2
        }));
        window.dispatchEvent(new Event("invoiceLogoChange"));
      } catch(e) { console.error(e) }
    }
  }, [isLogoLocked, logoImage, brandNamePart1, brandNamePart2]);

  useEffect(() => {
    if (isTermsLocked) {
      try {
        localStorage.setItem('invoiceTermsData', JSON.stringify({
          exactTerms, paymentDetails, signatureName, signatureWritten, signatureFontClass, signatureImage, signatureImageScale, phone, email, website
          , thankYouMessage
        }));
      } catch(e) { console.error(e) }
    }
  }, [isTermsLocked, exactTerms, paymentDetails, signatureName, signatureWritten, signatureFontClass, signatureImage, signatureImageScale, phone, email, website, thankYouMessage]);

  useEffect(() => {
    if (isItemsLocked) {
      try {
        localStorage.setItem('invoiceItemsData', JSON.stringify(items));
      } catch(e) { console.error(e) }
    }
  }, [isItemsLocked, items]);

  useEffect(() => {
    if (isThemeLocked) {
      try { localStorage.setItem('invoiceThemeData', invoiceTheme); } catch(e) { console.error(e) }
    }
  }, [isThemeLocked, invoiceTheme]);

  useEffect(() => {
    if (isTypographyLocked) {
      try { localStorage.setItem('invoiceTypographyData', invoiceTypography); } catch(e) { console.error(e) }
    }
  }, [isTypographyLocked, invoiceTypography]);

  const handleResetToEmpty = () => {
    // Only clear Sections 2 & 3: Client Details & Line Items
    setBilledToName("");
    setBilledToEmail("");
    setInvoiceDate("");
    
    if (isItemsLocked) {
      const data = localStorage.getItem('invoiceItemsData');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setItems(parsed || defaultItems);
        } catch(e) {
          setItems(defaultItems);
        }
      } else {
        setItems(defaultItems);
      }
    } else {
      setItems(defaultItems);
    }
  };

  // Local Storage & Copy Actions
  const handleSaveInvoice = async () => {
    setSaving(true);
    setSaveSuccess(false);

    const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    
    const newId = currentInvoiceId || `inv_${Date.now()}`;
    
    const existingStored = localStorage.getItem('pastInvoices');
    let existingStatus: 'paid' | 'unpaid' = 'unpaid';
    if (existingStored) {
      try {
        const parsedInvs = JSON.parse(existingStored) as SavedInvoice[];
        const found = parsedInvs.find(inv => inv.id === currentInvoiceId);
        if (found && found.status) {
          existingStatus = found.status;
        }
      } catch (e) {
        console.error("Error reading existing invoices status", e);
      }
    }

    const invoiceData: SavedInvoice = {
      id: newId,
      invoiceNo,
      invoiceDate,
      billedToName,
      billedToEmail,
      brandNamePart1,
      brandNamePart2,
      invoiceTheme,
      invoiceTypography,
      thankYouMessage,
      items: items.map(it => ({ id: it.id, title: it.title, subtext: it.subtext, price: Number(it.price) || 0 })),
      exactTerms,
      paymentDetails,
      signatureName,
      signatureWritten,
      signatureFontClass,
      signatureImage,
      signatureImageScale,
      phone,
      email,
      website,
      currencySymbol,
      subtextStyle,
      logoImage,
      totalAmount,
      status: existingStatus,
      createdAt: Date.now()
    };
    
    try {
      let updatedInvoices: SavedInvoice[] = [];
      const stored = localStorage.getItem('pastInvoices');
      if (stored) {
        updatedInvoices = JSON.parse(stored) as SavedInvoice[];
      }

      const existingIndex = updatedInvoices.findIndex(inv => inv.id === currentInvoiceId);
      if (existingIndex > -1) {
        // Keep original createdAt
        invoiceData.createdAt = updatedInvoices[existingIndex].createdAt || invoiceData.createdAt;
        updatedInvoices[existingIndex] = invoiceData;
      } else {
        updatedInvoices.push(invoiceData);
        setCurrentInvoiceId(newId);
      }

      localStorage.setItem('pastInvoices', JSON.stringify(updatedInvoices));
      
      // Mirror to cloud for public links
      if (user?.uid) {
        try {
          await setDoc(doc(db, `users/${user.uid}/invoices/${newId}`), invoiceData);
        } catch (e) {
          console.error("Failed to sync invoice to cloud:", e);
        }
      }
      
      // Instantly update local React state with sorted array
      const sorted = sortInvoicesDesc(updatedInvoices);
      setSavedInvoices(sorted);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
      console.error("Error saving invoice:", err);
    } finally {
      setSaving(false);
    }
  };

  
  
    const handleShareHostedLink = async (invoice: SavedInvoice, method: 'email' | 'whatsapp') => {
    let shortId = invoice.shortShareId;
    if (!shortId) {
      shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const stored = localStorage.getItem('pastInvoices');
      if (stored) {
        const parsed = JSON.parse(stored);
        const idx = parsed.findIndex((i) => i.id === invoice.id);
        if (idx > -1) {
          parsed[idx].shortShareId = shortId;
          localStorage.setItem('pastInvoices', JSON.stringify(parsed));
          setSavedInvoices(parsed);
          invoice.shortShareId = shortId;
        }
      }
    }

    if (user?.uid) {
      try {
        await setDoc(doc(db, `shared_links/${shortId}`), {
          type: 'invoice',
          data: invoice,
          ownerUid: user.uid,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.error("Cloud sync failed before sharing:", e);
      }
    }
    
    const hostedLink = `${window.location.origin}/i/${shortId}`;

    if (method === 'whatsapp') {
      const text = `Hi, you can securely view and download your invoice here: ${hostedLink}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      window.open(`mailto:?subject=Invoice from ${brandName}&body=Hi, you can securely view and download your invoice here: ${hostedLink}`);
    }
  };

  const handleDownloadSaved = (invoice: SavedInvoice) => {
    // Avoid blocking the main thread so links can navigate immediately
    setTimeout(() => {
      // Save current active tab so we can go back
      const prevTab = activeTab;
    
    // Load invoice data into the form state to render the preview
    setCurrentInvoiceId(invoice.id);
    setLogoImage(invoice.logoImage);    
    setBrandNamePart1(invoice.brandNamePart1);
    setBrandNamePart2(invoice.brandNamePart2);
    setInvoiceTheme(invoice.invoiceTheme);
    setInvoiceTypography(invoice.invoiceTypography || "modern");
    setThankYouMessage(invoice.thankYouMessage || "THANK YOU FOR YOUR BUSINESS");
    setBilledToName(invoice.billedToName);
    setBilledToEmail(invoice.billedToEmail);
    setInvoiceDate(invoice.invoiceDate);
    setInvoiceNo(invoice.invoiceNo);
    setItems(invoice.items.map(it => ({ ...it })));
    setExactTerms(invoice.exactTerms);
    setPaymentDetails(invoice.paymentDetails || "");
    setSignatureName(invoice.signatureName);
    setSignatureWritten(invoice.signatureWritten);
    setSignatureFontClass(invoice.signatureFontClass);
    setSignatureImage(invoice.signatureImage || null);
    setSignatureImageScale(invoice.signatureImageScale ?? 100);
    setPhone(invoice.phone);
    setEmail(invoice.email);
    setWebsite(invoice.website);
    setCurrencySymbol(invoice.currencySymbol);
    setSubtextStyle(invoice.subtextStyle);
    
    // Switch to create tab temporarily so DOM is rendered
    setActiveTab("create");
    
    setTimeout(async () => {
        await handleDownloadPDF();
        // Switch back to original view immediately after snapshot
        setActiveTab(prevTab);
      }, 400);
    }, 100);
  };

  const handleLoadInvoice = (invoice: SavedInvoice) => {
    setCurrentInvoiceId(invoice.id);
    setLogoImage(invoice.logoImage);
    
    setBrandNamePart1(invoice.brandNamePart1);
    setBrandNamePart2(invoice.brandNamePart2);
    setInvoiceTheme(invoice.invoiceTheme);
    setInvoiceTypography(invoice.invoiceTypography || "modern");
    setThankYouMessage(invoice.thankYouMessage || "THANK YOU FOR YOUR BUSINESS");
    setBilledToName(invoice.billedToName);
    setBilledToEmail(invoice.billedToEmail);
    setInvoiceDate(invoice.invoiceDate);
    setInvoiceNo(invoice.invoiceNo);
    setItems(invoice.items.map(it => ({ ...it })));
    setExactTerms(invoice.exactTerms);
    setPaymentDetails(invoice.paymentDetails || "");
    setSignatureName(invoice.signatureName);
    setSignatureWritten(invoice.signatureWritten);
    setSignatureFontClass(invoice.signatureFontClass);
    setSignatureImage(invoice.signatureImage || null);
    setSignatureImageScale(invoice.signatureImageScale ?? 100);
    setPhone(invoice.phone);
    setEmail(invoice.email);
    setWebsite(invoice.website);
    setCurrencySymbol(invoice.currencySymbol);
    setSubtextStyle(invoice.subtextStyle);
    
    setActiveTab("create");
    // Smooth scroll to top of the page (Section A)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (savedInvoices.length > 0) {
      const viewId = localStorage.getItem('viewInvoiceId');
      if (viewId) {
        const found = savedInvoices.find(inv => inv.id === viewId);
        if (found) {
          handleLoadInvoice(found);
          setActiveTab("create");
        }
        localStorage.removeItem('viewInvoiceId');
      }
    }
  }, [savedInvoices]);

  const handleDuplicateInvoice = async (invoice: SavedInvoice, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newId = `inv_${Date.now()}`;
    const duplicatedInvoice: SavedInvoice = {
      ...invoice,
      id: newId,
      invoiceNo: `${invoice.invoiceNo}-DUP`,
      createdAt: new Date().toISOString()
    };
    
    // Remove shortShareId so it generates a new link when shared
    delete duplicatedInvoice.shortShareId;

    const existingStored = localStorage.getItem('pastInvoices');
    let parsed: SavedInvoice[] = [];
    if (existingStored) {
      try {
        parsed = JSON.parse(existingStored) as SavedInvoice[];
      } catch(e) {}
    }
    
    parsed.push(duplicatedInvoice);
    const sorted = sortInvoicesDesc(parsed);
    localStorage.setItem('pastInvoices', JSON.stringify(sorted));
    setSavedInvoices(sorted);
    
    // Also save to firebase if user logged in
    const authUser = auth.currentUser;
    if (authUser?.uid) {
      try {
        await setDoc(doc(db, `users/${authUser.uid}/invoices/${newId}`), duplicatedInvoice);
      } catch (err) {
        console.error("Cloud sync failed for duplicate:", err);
      }
    }
  };

  const handleDeleteInvoice = async (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const stored = localStorage.getItem('pastInvoices');
      const invoices = stored ? JSON.parse(stored) as SavedInvoice[] : [];
      const updated = invoices.filter(inv => inv.id !== invoiceId);
      localStorage.setItem('pastInvoices', JSON.stringify(updated));
      setSavedInvoices(updated);
      
      if (currentInvoiceId === invoiceId) {
        setCurrentInvoiceId(null);
      }
      } catch (err) {
      console.error("Error deleting invoice:", err);
    }
  };

  const handleToggleInvoiceStatus = (invoiceId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const stored = localStorage.getItem('pastInvoices');
      if (stored) {
        const invoices = JSON.parse(stored) as SavedInvoice[];
        const updated = invoices.map(inv => {
          if (inv.id === invoiceId) {
            return {
              ...inv,
              status: inv.status === 'paid' ? 'unpaid' : 'paid'
            } as SavedInvoice;
          }
          return inv;
        });
        localStorage.setItem('pastInvoices', JSON.stringify(updated));
        
        const sorted = sortInvoicesDesc(updated);
        setSavedInvoices(sorted);
      }
      } catch (err) {
      console.error("Error toggling invoice status:", err);
    }
  };

  const handleNewInvoiceDraft = () => {
    setCurrentInvoiceId(null);
    handleResetToEmpty();
    setInvoiceNo("");
    
    // Load locked sections or reset
    if (isLogoLocked) {
      const data = localStorage.getItem('invoiceLogoData');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setLogoImage(parsed.logoImage || null);
          
          setBrandNamePart1(parsed.brandNamePart1 || "lorem");
          setBrandNamePart2(parsed.brandNamePart2 || "ipsum.");
        } catch(e) {}
      }
    } else {
      setLogoImage(null);
      setBrandNamePart1("lorem");
      setBrandNamePart2("ipsum.");
    }

    if (isTermsLocked) {
      const data = localStorage.getItem('invoiceTermsData');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setExactTerms(parsed.exactTerms !== undefined ? parsed.exactTerms : "");
          setPaymentDetails(parsed.paymentDetails !== undefined ? parsed.paymentDetails : "");
          setSignatureName(parsed.signatureName !== undefined ? parsed.signatureName : "LOREM");
          setSignatureWritten(parsed.signatureWritten !== undefined ? parsed.signatureWritten : "Lorem");
          setSignatureFontClass(parsed.signatureFontClass !== undefined ? parsed.signatureFontClass : "font-signature-2");
          setSignatureImage(parsed.signatureImage !== undefined ? parsed.signatureImage : null);
          setSignatureImageScale(parsed.signatureImageScale !== undefined ? parsed.signatureImageScale : 100);
          setPhone(parsed.phone !== undefined ? parsed.phone : "");
          setEmail(parsed.email !== undefined ? parsed.email : "");
          setWebsite(parsed.website !== undefined ? parsed.website : "");
          setThankYouMessage(parsed.thankYouMessage !== undefined ? parsed.thankYouMessage : "THANK YOU FOR YOUR BUSINESS");
        } catch(e) {}
      }
    } else {
      setExactTerms("LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT. SED DO EIUSMOD TEMPOR INCIDIDUNT UT LABORE ET DOLORE MAGNA ALIQUA.");
      setPaymentDetails("");
      setSignatureName("LOREM");
      setSignatureWritten("Lorem");
      setSignatureFontClass("font-signature-2");
      setSignatureImage(null);
      setSignatureImageScale(100);
      setPhone("+0 000 000 0000");
      setEmail("contact@loremipsum.com");
      setWebsite("www.loremipsum.com");
    }

    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Image upload handlers
  const handleLogoUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      if (file.size > 250 * 1024) { alert("Logo is too large. Please upload an image smaller than 250KB to ensure smooth saving."); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setLogoImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      if (file.size > 250 * 1024) { alert("Signature is too large. Please upload an image smaller than 250KB."); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setSignatureImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoUpload(e.dataTransfer.files[0]);
    }
  };

  const onSignatureDragOver = (e: DragEvent) => {
    e.preventDefault();
    setSignatureDragActive(true);
  };

  const onSignatureDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setSignatureDragActive(false);
  };

  const onSignatureDrop = (e: DragEvent) => {
    e.preventDefault();
    setSignatureDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSignatureUpload(e.dataTransfer.files[0]);
    }
  };

  // Item helpers
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      title: "Lorem Ipsum Item Title",
      subtext: "(lorem ipsum subtext)",
      price: 100,
    };
    setItems([...items, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Calculate Subtotal
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // Generate PDF triggering download
  const handleDownloadPDF = async () => {
    const element = document.getElementById("invoice-capture-area") || document.getElementById("monthly-report-capture-area");
    if (!element) return;

            
        // Create a robust iframe to force desktop media queries
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1024px';
    iframe.style.height = '2000px'; 
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const bg = typeof invoiceTheme !== 'undefined' ? (themes[invoiceTheme] || themes.white)?.bg || '#ffffff' : '#ffffff';
    const textCol = typeof invoiceTheme !== 'undefined' ? (themes[invoiceTheme] || themes.white)?.text || '#000000' : '#000000';
    
    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write('<html><head></head><body style="margin:0; background-color:' + bg + ';"></body></html>');
    iframeDoc.close();
    
    // Crucial: Copy all style and link tags so Tailwind and fonts work inside the iframe
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach(s => {
      iframeDoc.head.appendChild(s.cloneNode(true));
    });

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = "794px";
    clone.style.minHeight = "1123px";
    clone.style.transform = "none";
    clone.style.margin = "0";
    clone.style.boxShadow = "none"; 
    clone.style.borderRadius = "0";
    clone.style.display = "flex";
    clone.style.flexDirection = "column";
    clone.style.visibility = "visible";
    clone.style.boxSizing = "border-box";
    clone.style.padding = "64px";
    clone.style.backgroundColor = bg;
    clone.style.color = textCol;

    const footerContact = clone.querySelector('#footer-contact-row') as HTMLElement;
    if (footerContact) {
      footerContact.className = "flex flex-row items-center justify-center gap-8 w-full max-w-[500px] mx-auto font-bold font-headline uppercase tracking-wide";
      footerContact.style.fontSize = "15px";
    }

    const actionElements = clone.querySelectorAll(".no-print");
    actionElements.forEach(el => (el as HTMLElement).style.display = "none");

    iframeDoc.body.appendChild(clone);

    try {
      // Allow DOM to compute styles
      await new Promise(r => setTimeout(r, 300));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: bg,
        width: 794,
        windowWidth: 1024,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      const invoiceNoStr = typeof invoiceNo !== 'undefined' ? invoiceNo : 'report';
      const filename = element.id.includes('invoice') ? `invoice_${invoiceNoStr}.pdf` : `Monthly_Report.pdf`;
      
      pdf.save(filename);
      document.body.removeChild(iframe);

    } catch (err) {
      console.error('Failed to generate PDF:', err);
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
      alert(`Failed to download PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      
                }
  };


  // Print flow
  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn("Print dialogue blocked by sandboxed frame, showing fallback:", e);
    }
  };

  // Trigger automatic download if specified in URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('download') === 'true') {
      const timer = setTimeout(() => {
        handleDownloadPDF();
        // Remove download query parameter from url after triggering
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, '', cleanUrl);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [location.search]);

  return (
    <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto h-full w-full text-black">
      {/* Page Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pb-4">
        <div className="lg:pt-1">
          <h2 className="font-headline font-extrabold text-xl md:text-2xl lg:text-3xl tracking-tight uppercase animate-in slide-in-from-top duration-300">
            <span className="text-primary-container">{brandName}'S</span> INVOICE STUDIO
          </h2>
        </div>
        
        <div className="w-full sm:w-auto">
          {activeTab === "create" ? (
            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:gap-2.5 sm:items-center">
              <button
                onClick={handleSaveInvoice}
                disabled={saving}
                className="w-full sm:w-auto px-3.5 py-2.5 border-2 border-black bg-blue-600 text-white font-headline font-bold text-xs flex items-center justify-center gap-1.5 hover:translate-x-0.5 hover:translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none neu-shadow-sm"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> SAVING...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> {currentInvoiceId ? "SAVE CHANGES" : "SAVE INVOICE"}
                  </>
                )}
              </button>

              <button 
                onClick={handleDownloadPDF}
                disabled={generating}
                className="w-full sm:w-auto px-3.5 py-2.5 border-2 border-black bg-blue-600 text-white font-headline font-bold text-xs flex items-center justify-center gap-1.5 hover:translate-x-0.5 hover:translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none neu-shadow-sm"
              >
                <Download className="w-3.5 h-3.5 font-bold" /> {generating ? "RENDERING..." : "DOWNLOAD PDF"}
              </button>

              <button
                onClick={() => setActiveTab("past")}
                className="col-span-2 w-full sm:w-auto px-3.5 py-2.5 border-2 border-black bg-white text-neutral-950 hover:bg-neutral-100 font-headline font-bold text-xs flex items-center justify-center gap-1.5 hover:translate-x-0.5 hover:translate-y-0.5 active:scale-95 transition-all neu-shadow-sm relative"
              >
                <History className="w-3.5 h-3.5" /> PAST INVOICES
                {savedInvoices.length > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 font-mono font-bold border border-black ml-1 shrink-0 bg-black text-white">
                    {savedInvoices.length}
                  </span>
                )}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:gap-2.5 sm:items-center">
              <button
                onClick={() => setActiveTab("create")}
                className="col-span-2 w-full sm:w-auto px-3.5 py-2.5 border-2 border-black bg-white text-neutral-950 hover:bg-neutral-100 font-headline font-bold text-xs flex items-center justify-center gap-1.5 hover:translate-x-0.5 hover:translate-y-0.5 active:scale-95 transition-all neu-shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" /> BACK TO STUDIO
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline Notifications */}
      {saveSuccess && (
        <div className="mb-6 border-2 border-black bg-emerald-50 text-emerald-950 p-3.5 font-body text-xs flex items-center gap-2 animate-in fade-in duration-200 neu-shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
          <span>
            Invoice <strong className="font-headline font-black uppercase text-[10px] tracking-wider text-emerald-900">#{invoiceNo}</strong> successfully saved to your local storage.
          </span>
        </div>
      )}

      {/* SECTION A: GENERATE NEW INVOICE */}
      {activeTab === "create" && (
        <section className="mb-10 space-y-4 animate-in fade-in duration-200">
          {currentInvoiceId && (
            <div className="mb-2 flex justify-end">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-yellow-100 border border-black animate-pulse">
                Editing Draft #{invoiceNo}
              </span>
            </div>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==================== LEFT COLUMN: CUSTOMIZATION CONTROLS ==================== */}
        <section className="lg:col-span-5 space-y-5">
          
          {/* Creative Styling theme picker */}
          <div className="bg-white border-2 border-black p-4 neu-shadow-sm rounded-none">
            <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-3">
              <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5 mb-0 pb-0 border-0">
                <Palette className="w-4 h-4 text-blue-600" />
                Creative Background Theme
              </h3>
              <button
                onClick={() => {
                  const newLock = !isThemeLocked;
                  setIsThemeLocked(newLock);
                  localStorage.setItem('invoiceThemeLocked', String(newLock));
                }}
                className={`p-1.5 border-2 border-black transition-colors ${isThemeLocked ? 'bg-neutral-900 text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
                title={isThemeLocked ? "Unlock Theme Settings" : "Lock Theme Settings (Applies to new invoices)"}
              >
                {isThemeLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
            </div>
            
            <div className="space-y-3">
              <p className="text-[11px] font-body text-neutral-600">
                Choose a minimal, creative background color to elevate your brand layout beautifully:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(themes) as ThemeKey[]).map((thm) => (
                  <button
                    key={thm}
                    onClick={() => setInvoiceTheme(thm)}
                    className={`p-2 border-2 text-left font-headline font-bold text-xs flex items-center gap-2 transition-all ${
                      invoiceTheme === thm 
                        ? "border-black bg-neutral-900 text-white shadow-sm" 
                        : "border-black/20 bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
                    }`}
                  >
                    <span 
                      className="w-4 h-4 rounded-full border border-black/30 shrink-0 inline-block" 
                      style={{ backgroundColor: (themes[thm] || themes.white).bg }}
                    />
                    <span className="truncate">{thm === "white" ? "CLASSIC WHITE" : thm.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Typography Customizer */}
          <div className="bg-white border-2 border-black p-4 neu-shadow-sm rounded-none">
            <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-3">
              <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5 mb-0 pb-0 border-0">
                <Type className="w-4 h-4" />
                Invoice Typography
              </h3>
              <button
                onClick={() => {
                  const newLock = !isTypographyLocked;
                  setIsTypographyLocked(newLock);
                  localStorage.setItem('invoiceTypographyLocked', String(newLock));
                }}
                className={`p-1.5 border-2 border-black transition-colors ${isTypographyLocked ? 'bg-neutral-900 text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
                title={isTypographyLocked ? "Unlock Typography Settings" : "Lock Typography Settings (Applies to new invoices)"}
              >
                {isTypographyLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] font-body text-neutral-600 mb-3">
              Choose a font style to match your brand's character:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'modern', label: 'Modern (Space Grotesk)' },
                { id: 'classic', label: 'Classic (Inter)' },
                { id: 'minimal', label: 'Minimal (Plus Jakarta)' },
                { id: 'tech', label: 'Tech (Sora)' },].map((font) => (
                <button
                  key={font.id}
                  onClick={() => setInvoiceTypography(font.id)}
                  className={`p-2 border-2 text-left font-headline font-bold text-xs transition-all ${
                    invoiceTypography === font.id
                      ? 'border-black bg-neutral-900 text-white shadow-sm'
                      : 'border-black/20 bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand & Logo Customizer */}
          <div className="bg-white border-2 border-black p-4 neu-shadow-sm rounded-none">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                1. Custom Brand Header Logo
              </h3>
              <button
                onClick={() => {
                  const newLock = !isLogoLocked;
                  setIsLogoLocked(newLock);
                  localStorage.setItem('invoiceLogoLocked', String(newLock));
                }}
                className={`p-1.5 border-2 border-black transition-colors ${isLogoLocked ? 'bg-neutral-900 text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
                title={isLogoLocked ? "Unlock Logo Settings" : "Lock Logo Settings (Applies to new invoices)"}
              >
                {isLogoLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                    Brand Logo 1 (Regular)
                  </label>
                  <input 
                    type="text" 
                    value={brandNamePart1}
                    onChange={(e) => setBrandNamePart1(e.target.value)}
                    disabled={logoImage !== null}
                    className="w-full text-xs font-medium p-2 border-2 border-black uppercase bg-neutral-50 disabled:bg-neutral-100 placeholder-neutral-400 focus:outline-none"
                    placeholder="e.g. aryann"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                    Brand Logo 2 (Black)
                  </label>
                  <input 
                    type="text" 
                    value={brandNamePart2}
                    onChange={(e) => setBrandNamePart2(e.target.value)}
                    disabled={logoImage !== null}
                    className="w-full text-xs font-bold p-2 border-2 border-black uppercase bg-neutral-50 disabled:bg-neutral-100 placeholder-neutral-400 focus:outline-none"
                    placeholder="e.g. designs."
                  />
                </div>
              </div>

              {/* Logo Drag / Click Upload Area */}
              <div>
                <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1.5">
                  Or Upload Custom Logo Graphics (.png, .jpg)
                </label>
                
                <div 
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed p-4 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center rounded-none ${
                    logoImage 
                      ? "border-green-500 bg-green-50/10" 
                      : dragActive 
                      ? "border-blue-600 bg-blue-50/20" 
                      : "border-neutral-300 bg-neutral-50 hover:bg-neutral-100"
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => e.target.files && handleLogoUpload(e.target.files[0])}
                    className="hidden" 
                    accept="image/*"
                  />
                  {logoImage ? (
                    <div className="flex flex-col w-full gap-2 mt-1">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-16 h-8 border border-neutral-300 overflow-hidden flex items-center justify-center p-0.5 bg-white">
                          <img src={logoImage} alt="Uploaded logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <p className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Logo Active
                        </p>
                      </div>
                      
                      <div className="w-full px-2 mt-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-1">
                          
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setLogoImage(null); }}
                        className="text-[9px] uppercase font-bold text-red-500 hover:underline mt-1"
                      >
                        Remove Logo
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-5 h-5 text-neutral-400 group-hover:text-black" />
                      <p className="text-[10px] font-bold text-neutral-600">
                        Drag brand image here or <span className="text-blue-600 underline">browse</span>
                      </p>
                      <p className="text-[8.5px] text-neutral-400">Perfect fit in top-left logo partition</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recipient and Billing Meta */}
          <div className="bg-white border-2 border-black p-4 neu-shadow-sm rounded-none">
            <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider border-b-2 border-black pb-2 mb-3">
              2. Invoice & Client Details
            </h3>
            
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-neutral-100 mb-3 hover:bg-neutral-50/40 p-1">
              <div>
                <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                  Billed To Name
                </label>
                <input 
                  type="text" 
                  value={billedToName} 
                  onChange={(e) => setBilledToName(e.target.value)}
                  className="w-full text-xs p-2 border-2 border-black bg-neutral-50 focus:outline-none h-[38px]"
                  placeholder=""
                />
              </div>
              <div>
                <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                  Billed To Contact
                </label>
                <input 
                  type="text" 
                  value={billedToEmail} 
                  onChange={(e) => setBilledToEmail(e.target.value)}
                  className="w-full text-xs p-2 border-2 border-black bg-neutral-50 focus:outline-none h-[38px]"
                  placeholder=""
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 hover:bg-neutral-50/40 p-1">
              <div>
                <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                  Invoice Date (MM/DD/YYYY)
                </label>
                <AmericanDateInput
                  value={invoiceDate}
                  onChange={(val) => setInvoiceDate(val)}
                  className="w-full text-xs p-2 border-2 border-black bg-neutral-50 focus:outline-none"
                  placeholder="MM/DD/YYYY"
                />
              </div>
              <div>
                <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                  Invoice No.
                </label>
                <input 
                  type="text" 
                  value={invoiceNo} 
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="w-full text-xs p-2 border-2 border-black bg-neutral-50 focus:outline-none"
                  placeholder=""
                />
              </div>
            </div>
          </div>

          {/* Line Items Customizer */}
          <div className="bg-white border-2 border-black p-4 neu-shadow-sm rounded-none">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
                3. Invoice Line Items
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newLock = !isItemsLocked;
                    setIsItemsLocked(newLock);
                    localStorage.setItem('invoiceItemsLocked', String(newLock));
                  }}
                  className={`p-1.5 border-2 border-black transition-colors ${isItemsLocked ? 'bg-neutral-900 text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
                  title={isItemsLocked ? "Unlock Items" : "Lock Items Settings (Applies to new invoices)"}
                >
                  {isItemsLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={handleAddItem}
                  className="px-2 py-1 border-2 border-black bg-zinc-900 text-white font-headline text-[10px] font-bold flex items-center gap-1 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div key={item.id} className="border-2 border-black p-3 bg-neutral-50 space-y-2 relative group hover:border-black transition-all">
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-mono text-[9px] font-bold bg-black text-white px-1.5 py-0.5">
                      Row {index + 1}
                    </span>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={items.length <= 1}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-30"
                      title="Delete Line Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <input 
                        type="text" 
                        value={item.title} 
                        onChange={(e) => handleUpdateItem(item.id, "title", e.target.value)}
                        className="w-full text-[11px] p-1.5 border border-black font-semibold bg-white focus:outline-none"
                        placeholder="Item Title Description"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-16 text-[10px] font-headline font-extrabold text-neutral-600 uppercase text-right">
                        Price {currencySymbol}:
                      </div>
                      <input 
                        type="number" 
                        value={item.price} 
                        onChange={(e) => handleUpdateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                        className="flex-1 text-xs p-1.5 border border-black font-mono bg-white focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2.5 border-t border-black flex justify-between items-center bg-neutral-100 p-2 border-2">
              <span className="text-[10px] font-headline font-black uppercase tracking-wider">Calculated Total:</span>
              <span className="font-headline font-black text-sm text-blue-600">{currencySymbol}{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Terms, Signature & Footer Controls */}
          <div className="bg-white border-2 border-black p-4 neu-shadow-sm rounded-none">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider">
                4. Terms, Signature & Contact Info
              </h3>
              <button
                onClick={() => {
                  const newLock = !isTermsLocked;
                  setIsTermsLocked(newLock);
                  localStorage.setItem('invoiceTermsLocked', String(newLock));
                }}
                className={`p-1.5 border-2 border-black transition-colors ${isTermsLocked ? 'bg-neutral-900 text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
                title={isTermsLocked ? "Unlock Terms & Signature Settings" : "Lock Terms & Signature Settings (Applies to new invoices)"}
              >
                {isTermsLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                  Payment Details
                </label>
                <textarea 
                  rows={2}
                  value={paymentDetails} 
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  className="w-full text-[10px] p-2 border-2 border-black bg-neutral-50 font-body leading-relaxed md:leading-normal focus:outline-none"
                  placeholder="Bank Name, Account Number, etc."
                />
              </div>

              <div>
                <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                  Terms & Conditions
                </label>
                <textarea 
                  rows={2}
                  value={exactTerms} 
                  onChange={(e) => setExactTerms(e.target.value)}
                  className="w-full text-[10px] p-2 border-2 border-black bg-neutral-50 font-body leading-relaxed md:leading-normal focus:outline-none mb-3"
                  placeholder="Terms conditions..."
                />
                
                <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                  Thank You Message
                </label>
                <input 
                  type="text"
                  value={thankYouMessage} 
                  onChange={(e) => setThankYouMessage(e.target.value)}
                  className="w-full text-[10px] p-2 border-2 border-black bg-neutral-50 font-body focus:outline-none"
                  placeholder="THANK YOU FOR YOUR BUSINESS"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 pt-3">
                <div>
                  <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                    Signature Print Name
                  </label>
                  <input 
                    type="text" 
                    value={signatureName} 
                    onChange={(e) => setSignatureName(e.target.value)}
                    className="w-full text-xs p-2 border-2 border-black bg-neutral-50 focus:outline-none"
                    placeholder="A.K NANDA"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                    Signature Written Text
                  </label>
                  <input 
                    type="text" 
                    value={signatureWritten} 
                    onChange={(e) => setSignatureWritten(e.target.value)}
                    className="w-full text-xs p-2 border-2 border-black bg-neutral-50 focus:outline-none"
                    placeholder="Aryannanda"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1">
                  Signature Font Handwriting Style
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {[
                    { cl: "font-signature-1", name: "Amst 1" },
                    { cl: "font-signature-2", name: "Caveat" },
                    { cl: "font-signature-3", name: "LaDou" },
                    { cl: "font-signature-4", name: "Meow" }
                  ].map((f) => (
                    <button 
                      key={f.cl}
                      onClick={() => setSignatureFontClass(f.cl)}
                      className={`py-1 border border-black font-headline text-[10px] font-bold rounded-none uppercase transition-all ${
                        signatureFontClass === f.cl 
                          ? "bg-neutral-200 text-black font-extrabold" 
                          : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>

                {/* Signature Image Upload */}
                <label className="block text-[10px] font-headline font-bold uppercase tracking-wide text-neutral-600 mb-1.5">
                  Or Upload Signature Image (.png, .jpg)
                </label>
                
                <div 
                  onDragOver={onSignatureDragOver}
                  onDragLeave={onSignatureDragLeave}
                  onDrop={onSignatureDrop}
                  onClick={() => signatureFileInputRef.current?.click()}
                  className={`border-2 border-dashed p-3 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center rounded-none ${
                    signatureImage 
                      ? "border-green-500 bg-green-50/10" 
                      : signatureDragActive 
                      ? "border-blue-600 bg-blue-50/20" 
                      : "border-neutral-300 bg-neutral-50 hover:bg-neutral-100"
                  }`}
                >
                  <input 
                    type="file" 
                    ref={signatureFileInputRef} 
                    onChange={(e) => e.target.files && handleSignatureUpload(e.target.files[0])}
                    className="hidden" 
                    accept="image/*"
                  />
                  {signatureImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-24 border border-neutral-300 overflow-hidden flex items-center justify-center p-1 bg-white">
                        <img src={signatureImage} alt="Uploaded signature" className="max-w-full max-h-12 object-contain" referrerPolicy="no-referrer" />
                      </div>
                      
                      <div className="w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[9px] font-bold text-neutral-600 uppercase">Scale</label>
                          <span className="text-[9px] font-bold text-neutral-600">{signatureImageScale}%</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="200"
                          value={signatureImageScale}
                          onChange={(e) => setSignatureImageScale(Number(e.target.value))}
                          className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active
                        </p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSignatureImage(null); }}
                          className="text-[9px] uppercase font-bold text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-4 h-4 text-neutral-400 group-hover:text-black" />
                      <p className="text-[10px] font-bold text-neutral-600">
                        Drag signature here or <span className="text-blue-600 underline">browse</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-3 space-y-2">
                <p className="font-headline font-bold text-[9px] uppercase tracking-wider text-neutral-400">
                  Receipt Footer Details
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-[10px] p-1.5 border border-black bg-neutral-50 focus:outline-none"
                      placeholder="Phone"
                    />
                  </div>
                  <div>
                    <input 
                      type="text" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-[10px] p-1.5 border border-black bg-neutral-50 focus:outline-none"
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <input 
                      type="text" 
                      value={website} 
                      onChange={(e) => setWebsite(e.target.value)} 
                      className="w-full text-[10px] p-1.5 border border-black bg-neutral-50 focus:outline-none"
                      placeholder="Website"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== RIGHT COLUMN: EXACT REPLICATED PREVIEW SHEET ==================== */}
        <section className="lg:col-span-7 flex flex-col items-center">
          



          {/* Invoice Document Canvas Paper Outer Container */}
          <div className="w-full overflow-x-auto p-2 bg-surface-container-low border-2 border-black/10 rounded-lg flex sm:justify-center items-start py-6">
            
            {/* The sheet element captured inside screenshot/pdf */}
            <div 
              id="invoice-capture-area"
              className="px-8 pt-8 pb-8 shadow-lg border-2 w-[600px] shrink-0 flex flex-col transition-colors duration-150 relative overflow-hidden"
              style={{ 
                borderColor: (themes[invoiceTheme] || themes.white).border,
                backgroundColor: (themes[invoiceTheme] || themes.white).bg,
                color: (themes[invoiceTheme] || themes.white).text,
                '--font-headline-family': invoiceTypography === 'modern' ? "'Space Grotesk', sans-serif" :
                                         invoiceTypography === 'classic' ? "'Inter', sans-serif" :
                                         invoiceTypography === 'tech' ? "'Sora', sans-serif" :
                                         "'Plus Jakarta Sans', sans-serif",
                '--font-body-family': invoiceTypography === 'modern' ? "'Plus Jakarta Sans', sans-serif" :
                                     invoiceTypography === 'classic' ? "'Inter', sans-serif" :
                                     invoiceTypography === 'tech' ? "'Sora', sans-serif" :
                                     "'Plus Jakarta Sans', sans-serif"
              } as React.CSSProperties}
            >
              {/* Subtle creative background geometric framing element (designed digitally) */}
              <div className="absolute inset-0 border-8 border-white/40 pointer-events-none" />

              <div className="flex-1 flex flex-col">
                
                {/* 1. Header Box Section */}
                <div 
                  className="flex justify-between items-center pb-4" 
                  style={{ borderColor: (themes[invoiceTheme] || themes.white).border }}
                >
                  
                  {/* Brand logo container */}
                  <div className="min-h-[48px] flex items-center">
                    {logoImage ? (
                      <div style={{ width: "160px", display: "flex", justifyContent: "flex-start" }}>
                        <img 
                          src={logoImage} 
                          alt="Brand Custom Logo" 
                          style={{ 
                            maxHeight: '64px',
                            maxWidth: '100%',
                            objectFit: 'contain'
                          }} 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="text-left font-sans select-none tracking-tight" style={{ lineHeight: "1" }}>
                        <div className="font-headline font-bold uppercase tracking-tight" style={{ color: "#262626", fontSize: "22px" }}>
                          {brandNamePart1}
                        </div>
                        <div className="font-headline font-bold uppercase tracking-tight mt-0.5" style={{ color: (themes[invoiceTheme] || themes.white).text, fontSize: "26px" }}>
                          {brandNamePart2}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* LARGE INVOICE WORD IN BRAND FONT */}
                  <div>
                    <h1 
                      className="tracking-tight font-black font-headline leading-none uppercase text-right select-none pr-1"
                      style={{ color: (themes[invoiceTheme] || themes.white).text, fontSize: "44px" }}
                    >
                      INVOICE
                    </h1>
                  </div>

                </div>

                {/* 2. Billing & Meta information block */}
                <div className="grid grid-cols-2 pt-6 pb-6" style={{ fontSize: "18px" }}>
                  
                  {/* Left Column: Billed To / Recipient */}
                  <div className="space-y-1">
                    <p className="font-headline font-bold tracking-widest uppercase" style={{ color: "#737373", fontSize: "11px" }}>
                      BILLED TO:
                    </p>
                    <p className="font-headline font-black tracking-tight leading-tight" style={{ color: (themes[invoiceTheme] || themes.white).text, fontSize: "24px" }}>
                      {billedToName}
                    </p>
                    <p className="font-body font-medium tracking-tight truncate leading-tight" style={{ color: "#525252", fontSize: "16px" }}>
                      {billedToEmail}
                    </p>
                  </div>

                  {/* Right Column: Meta (Date / Invoice No) in Brand style */}
                  <div className="text-right flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-0.5">
                      <p className="font-headline font-bold tracking-widest text-[#5e5e5e] uppercase" style={{ fontSize: "11px" }}>
                        DATE:
                      </p>
                      <p className="font-headline font-bold tracking-tight" style={{ color: (themes[invoiceTheme] || themes.white).text, fontSize: "17px" }}>
                        {formatDateForPDF(invoiceDate)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-headline font-bold tracking-widest text-[#5e5e5e] uppercase" style={{ fontSize: "11px" }}>
                        INVOICE NO.
                      </p>
                      <p className="font-headline font-black tracking-tight pr-0.5" style={{ color: (themes[invoiceTheme] || themes.white).text, fontSize: "18px" }}>
                        {invoiceNo}
                      </p>
                    </div>
                  </div>

                </div>

                {/* 3. Description Table list formatted in brand fonts */}
                <div className="mt-2 text-left">
                         {/* Table Header Bar using brand font */}
                  <div 
                    className="grid grid-cols-12 py-2 border-t-[3px] border-b-[3px] font-headline font-bold tracking-widest uppercase"
                    style={{ borderColor: (themes[invoiceTheme] || themes.white).border, color: (themes[invoiceTheme] || themes.white).text, fontSize: "18px" }}
                  >
                    <div className="col-span-10 text-left">
                      DESCRIPTION
                    </div>
                    <div className="col-span-2 text-right">
                      PRICE
                    </div>
                  </div>

                  {/* Rows content list, crafted in brand style */}
                  <div className="" style={{ color: (themes[invoiceTheme] || themes.white).text, fontSize: items.length > 6 ? "11px" : items.length > 4 ? "13px" : items.length > 3 ? "15px" : "18px" }}>
                    {items.map((item, index) => (
                      <div 
                        key={item.id} 
                        className={`grid grid-cols-12 ${items.length > 6 ? 'py-1.5' : items.length > 4 ? 'py-2' : items.length > 3 ? 'py-2.5' : 'py-3.5'} leading-tight items-start`}
                        style={{ borderTop: index > 0 ? `1px solid ${(themes[invoiceTheme] || themes.white).rowSeparator}` : "none" }}
                      >
                        <div className="col-span-10 pr-4 flex items-center">
                          <p className="font-headline font-bold tracking-tight leading-snug flex-wrap break-words" style={{ color: (themes[invoiceTheme] || themes.white).text, fontSize: items.length > 6 ? "11px" : items.length > 4 ? "13px" : items.length > 3 ? "15px" : "18px" }}>
                            {item.title}
                          </p>
                        </div>
                        <div className="col-span-2 text-right font-headline font-black whitespace-nowrap" style={{ color: (themes[invoiceTheme] || themes.white).text, fontSize: items.length > 6 ? "11px" : items.length > 4 ? "13px" : items.length > 3 ? "15px" : "18px" }}>
                          {currencySymbol}{item.price.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            {/* Bottom Portion container */}
              <div className={`space-y-2 ${items.length > 4 ? 'pt-2 mt-2' : 'pt-8 mt-4'}`}>
                
                {/* 4. Terms, total sums and signature */}
                <div 
                  className="pt-2 flex flex-col justify-between items-stretch relative"
                  style={{ borderTop: `2px solid ${(themes[invoiceTheme] || themes.white).border}` }}
                >
                  
                  {/* Total summary Row in Brand Space Grotesk */}
                  <div className="flex justify-end items-center mb-2">
                    <div className="text-right">
                      <span className="font-headline font-black tracking-wider mr-2 uppercase" style={{ color: "#737373", fontSize: "16px" }}>
                        TOTAL
                      </span>
                      <span className="font-headline font-black pl-1" style={{ color: (themes[invoiceTheme] || themes.white).text, fontSize: items.length > 4 ? "24px" : "32px" }}>
                        {currencySymbol}{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Terms and conditions signature split */}
                  <div className="grid grid-cols-12 gap-4 items-end mt-4">
                    
                    {/* Left block for editable TERMS */}
                    <div className="col-span-8 text-left leading-relaxed pr-2 space-y-4">
                      {paymentDetails && (
                        <div>
                          <p className="font-headline font-black uppercase tracking-wider mb-1" style={{ color: "#1a1c1c", fontSize: items.length > 4 ? "12px" : "16px" }}>
                            PAYMENT DETAILS:
                          </p>
                          <p className="leading-relaxed font-semibold font-body whitespace-pre-wrap" style={{ color: "#262626", fontSize: items.length > 4 ? "12px" : "16px" }}>
                            {paymentDetails}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="font-headline font-black uppercase tracking-wider mb-0.5" style={{ color: "#1a1c1c", fontSize: "13px" }}>
                          TERMS:
                        </p>
                        <p className="leading-normal font-semibold font-body whitespace-pre-wrap" style={{ color: "#262626", fontSize: "10px" }}>
                          {exactTerms}
                        </p>
                      </div>
                    </div>

                    {/* Right block for SIGNATURE */}
                    <div className="col-span-4 text-right flex flex-col items-end justify-end">
                      
                      {signatureImage && (
                        <div className="flex justify-end mb-1 pr-2">
                          <img 
                            src={signatureImage} 
                            alt="Signature" 
                            style={{ 
                              width: `${(signatureImageScale || 100) * 0.8}px`,
                              height: "auto",
                              maxWidth: "100%",
                              
                              objectFit: 'contain'
                            }} 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Signature graphic text */}
                      {signatureWritten && (
                        <div className="h-10 flex items-center justify-end select-none pr-2">
                          <span 
                            className="text-3xl font-normal leading-none pr-1"
                            style={{ 
                              color: "#262626",
                              fontFamily: 
                                signatureFontClass === "font-signature-1" ? "'Amsterdam One', 'Amsterdam', 'Amsterdam-One', cursive" :
                                signatureFontClass === "font-signature-2" ? "'Caveat', cursive" :
                                signatureFontClass === "font-signature-3" ? "'Monsieur La Doulaise', cursive" :
                                "'Meow Script', cursive"
                            }}
                          >
                            {signatureWritten}
                          </span>
                        </div>
                      )}

                      {/* Typed capital Name */}
                      <p 
                        className="font-headline font-bold tracking-widest uppercase w-32 pt-1 text-center"
                        style={{ borderTop: "1px solid #d4d4d4", color: "#1a1c1c", fontSize: "16px" }}
                      >
                        {signatureName}
                      </p>

                    </div>

                  </div>

                </div>

                {/* 5. THANK YOU FOR YOUR BUSINESS block */}
                <div className="text-center space-y-4" style={{ paddingTop: "96px" }}>
                  
                  {/* Thank you phrase */}
                  <h2 
                    className="font-headline font-black tracking-tight uppercase leading-none select-none whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ color: (themes[invoiceTheme] || themes.white).text, fontSize: "32px" }}
                  >
                    {thankYouMessage}
                  </h2>

                  {/* Footer contact channels row */}
                  <div 
                    id="footer-contact-row"
                    className="flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2 w-full mx-auto font-bold font-headline uppercase tracking-wide"
                    style={{ color: "#262626", fontSize: "13px" }}
                  >
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <Phone size={16} className="w-4 h-4 shrink-0" style={{ color: (themes[invoiceTheme] || themes.white).text }} strokeWidth={2.5} />
                      <span className="translate-y-[1px]">{phone}</span>
                    </span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap lowercase">
                      <Mail size={16} className="w-4 h-4 shrink-0" style={{ color: (themes[invoiceTheme] || themes.white).text }} strokeWidth={2.5} />
                      <span className="translate-y-[1px]">{email}</span>
                    </span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap lowercase">
                      <Globe size={16} className="w-4 h-4 shrink-0" style={{ color: (themes[invoiceTheme] || themes.white).text }} strokeWidth={2.5} />
                      <span className="translate-y-[1px]">{website}</span>
                    </span>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </section>
      </div>
      </section>
      )}

      {/* SECTION B: PAST INVOICES HISTORY */}
      {activeTab === "past" && (
      <section className="space-y-4 animate-in fade-in duration-200">
        <div className="space-y-6">
          {loadingInvoices ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-black neu-shadow-sm animate-pulse">
              <RefreshCw className="w-8 h-8 text-neutral-600 animate-spin mb-3" />
              <p className="font-headline font-bold text-xs uppercase tracking-widest text-neutral-500">
                Synchronizing Ledger with Cloud...
              </p>
            </div>
          ) : savedInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border-2 border-black neu-shadow-sm animate-in zoom-in-95">
              <div className="w-16 h-16 bg-neutral-100 border-2 border-black flex items-center justify-center rounded-none mb-4">
                <FileText className="w-8 h-8 text-neutral-400" />
              </div>
              <h4 className="font-headline font-black text-sm uppercase tracking-wider mb-1">
                No Invoices Saved Yet
              </h4>
              <p className="font-body text-xs text-neutral-600 max-w-sm mb-5">
                Generate and save your first professional invoice statement to record it in your cloud dashboard.
              </p>
              <button
                onClick={handleNewInvoiceDraft}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 border-2 border-black font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all neu-shadow-sm"
              >
                <Plus className="w-4 h-4" /> Create First Invoice
              </button>
            </div>
          ) : (() => {
            const filteredInvoices = savedInvoices.filter((inv) => {
              const queryText = searchQuery.toLowerCase().trim();
              if (!queryText) return true;
              return (
                (inv.billedToName || "").toLowerCase().includes(queryText) ||
                (inv.billedToEmail || "").toLowerCase().includes(queryText) ||
                (inv.invoiceNo || "").toLowerCase().includes(queryText)
              );
            });

            return (
              <div className="space-y-6">
                {/* Client Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="relative max-w-md w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-black" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search clients by name, email, or invoice #..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-12 py-2.5 bg-white border-2 border-black font-body text-xs placeholder-neutral-400 focus:outline-none focus:ring-0 neu-shadow-sm transition-all focus:translate-x-[1px] focus:translate-y-[1px]"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm font-headline font-black uppercase tracking-wider text-red-600 hover:text-red-800"
                      >
                        CLEAR
                      </button>
                    )}
                  </div>
                </div>

                {filteredInvoices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white border-2 border-black neu-shadow-sm">
                    <div className="w-12 h-12 bg-neutral-100 border-2 border-black flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-neutral-400" />
                    </div>
                    <h4 className="font-headline font-black text-xs uppercase tracking-wider mb-1">
                      No Matching Invoices Found
                    </h4>
                    <p className="font-body text-[11px] text-neutral-600 max-w-xs mb-4">
                      No saved records match your search query "{searchQuery}".
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="px-3 py-1.5 bg-white text-black hover:bg-neutral-100 border-2 border-black font-headline font-bold text-sm uppercase tracking-wider transition-all neu-shadow-sm"
                    >
                      Clear Search Filter
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredInvoices.map((inv) => (
                      <div 
                        key={inv.id}
                        onClick={() => handleLoadInvoice(inv)}
                        className="bg-white border-2 border-black p-3 neu-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between group relative min-h-[170px]"
                      >
                        {/* Accent Theme Corner Banner */}
                        <div 
                          className="absolute top-0 right-0 w-3 h-full border-l-2 border-black"
                          style={{ backgroundColor: (themes[inv.invoiceTheme || "alabaster"] || themes.white).bg }}
                        />
                        
                        <div className="space-y-3 pr-3">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm text-neutral-500 uppercase tracking-widest">
                              INVOICE
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => handleToggleInvoiceStatus(inv.id, e)}
                                className={`text-[9px] font-headline font-black uppercase border border-black px-1.5 py-0.5 tracking-wider transition-all hover:scale-105 active:scale-95 ${
                                  inv.status === "paid"
                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                    : "bg-red-100 text-red-800 hover:bg-red-200"
                                }`}
                                title={inv.status === "paid" ? "Mark as Unpaid" : "Mark as Paid"}
                              >
                                {inv.status === "paid" ? "PAID" : "UNPAID"}
                              </button>
                              <span className="font-headline font-extrabold text-xs uppercase bg-neutral-100 px-2 py-0.5 border border-black/30">
                                #{inv.invoiceNo}
                              </span>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-headline font-black text-sm uppercase tracking-tight text-neutral-900 group-hover:text-blue-600 transition-colors">
                              {inv.billedToName}
                            </h4>
                            <p className="font-body text-[11px] text-neutral-500 truncate mt-0.5">
                              {inv.billedToEmail}
                            </p>
                          </div>

                          <div className="border-t border-dashed border-neutral-200 pt-3 flex items-center justify-between">
                            <div className="space-y-1">
                              <span className="text-[9px] font-headline font-bold uppercase tracking-wider text-neutral-400 block">
                                Date Issued
                              </span>
                              <div className="flex items-center gap-1 text-[11px] font-body text-neutral-700">
                                <Clock className="w-3 h-3 text-neutral-400" />
                                {formatDisplayDate(inv.invoiceDate)}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <span className="text-[9px] font-headline font-bold uppercase tracking-wider text-neutral-400 block">
                                Total Due
                              </span>
                              <div className="font-headline font-extrabold text-sm text-neutral-900">
                                {inv.currencySymbol}{Number(inv.totalAmount).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t-2 border-black pt-3 mt-4 flex justify-start gap-2.5">
                          <button
                            onClick={(e) => handleDuplicateInvoice(inv, e)}
                            className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black"
                            title="Duplicate this invoice"
                          >
                            <Copy size={14} />
                          </button>
                          


                          <button
                            onClick={() => handleDownloadSaved(inv)}
                            className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black transition-all hover:scale-105 text-black"
                            title="Download PDF"
                          >
                            <Download size={14} />
                          </button>

                          <button
                            onClick={() => handleLoadInvoice(inv)}
                            className="p-1.5 bg-white hover:bg-blue-50 border-2 border-black transition-all hover:scale-105 text-blue-600"
                            title="Edit Invoice"
                          >
                            <PenTool size={14} />
                          </button>

                          <button
                            onClick={(e) => handleDeleteInvoice(inv.id, e)}
                            title="Delete invoice permanently"
                            className="p-1.5 bg-white hover:bg-red-50 border-2 border-black transition-all hover:scale-105 text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </section>
      )}

      {/* 6. Dynamic Fail-Safe Download Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-white border-4 border-black p-6 max-w-lg w-full rounded-none neu-shadow-lg text-left space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
              <h3 className="font-headline font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="text-amber-500 w-4 h-4 animate-pulse shrink-0" />
                Invoice Download Helper
              </h3>
              <button 
                className="font-headline font-black text-sm hover:text-red-500 transition-colors uppercase border-2 border-black px-2 py-0.5 bg-neutral-100 neu-shadow-sm"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[11.5px] font-body text-neutral-800 leading-relaxed">
                We have generated a high-fidelity rendering of your customized invoice. If your browser blocks programmatical PDF saves inside sandboxed iframes, you can instantly grab your branding file here:
              </p>

              {fallbackImageUrl ? (
                <div className="border-2 border-black p-2 bg-neutral-50 flex flex-col items-center justify-center select-none">
                  <div className="w-full max-h-[160px] overflow-y-auto border border-neutral-300 bg-white p-2">
                    <img 
                      src={fallbackImageUrl} 
                      alt="Invoice mockup visual" 
                      className="max-w-full h-auto mx-auto object-contain pointer-events-auto"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[9.5px] text-neutral-500 font-bold mt-2 text-center flex items-center gap-1">
                    <span className="text-amber-600 font-extrabold font-headline uppercase">Highly Recommended:</span> 
                    Right-click / Long-press image above &amp; choose "Save Image As..."
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-neutral-300 py-6 text-center text-xs text-neutral-500 bg-neutral-50">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-neutral-400" />
                  Drawing pristine invoice print canvas ...
                </div>
              )}

              <div className="bg-blue-50 border-2 border-black p-3 text-[11px] text-neutral-800 font-body leading-relaxed">
                <strong className="font-headline font-black uppercase text-sm tracking-wide block mb-0.5 text-blue-900">100% Download &amp; Printing Solution:</strong>
                To skip Chrome sandbox blocks and generate pristine PDFs natively, open this application in a direct tab by clicking the button below. Then, click "Download PDF" again!
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {fallbackImageUrl && (
                  <a 
                    href={fallbackImageUrl} 
                    download={`invoice_${invoiceNo || "071"}.png`}
                    className="flex-1 py-2 px-3 bg-white hover:bg-neutral-100 text-black font-headline font-black text-[11px] text-center uppercase border-2 border-black neu-shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Save PNG Quality
                  </a>
                )}
                <a 
                  href={window.location.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-headline font-black text-[11px] text-center uppercase border-2 border-black neu-shadow-sm flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open In Separate Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
