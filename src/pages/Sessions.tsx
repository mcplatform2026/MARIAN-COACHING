import React, { useState, useEffect } from "react";
import { useClients } from "../hooks/useClients";
import { useSessions, Session } from "../hooks/useSessions";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { db } from "../lib/firebase";
import { collection, addDoc, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Pencil, 
  Check, 
  Search, 
  FileText, 
  FilePlus, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  XCircle,
  CheckCircle,
  ChevronRight,
  Link,
  ExternalLink,
  RefreshCw,
  Settings,
  Share2,
  LockOpen,
  User
} from "lucide-react";
import { formatDateToMMDDYYYY } from "../utils/dateFormat";

export function Sessions() {
  const navigate = useNavigate();
  const { clients, loading: loadingClients } = useClients();
  const { sessions, loading: loadingSessions, addSession, updateSession, removeSession } = useSessions();

  const [brandName, setBrandName] = useState(() => localStorage.getItem('brandName') || 'LOREM IPSUM');
  const [brandColor, setBrandColor] = useState(() => localStorage.getItem('brandColor') || '#6933ff');

  useEffect(() => {
    const handleNameChange = () => {
      const name = localStorage.getItem('brandName') || 'LOREM IPSUM';
      setBrandName(name);
      document.title = `${name} | Appointment Tracker`;
    };
    handleNameChange();
    window.addEventListener('brandNameChange', handleNameChange);

    const handleColorChange = () => {
      setBrandColor(localStorage.getItem('brandColor') || '#6933ff');
    };
    window.addEventListener('brandColorChange', handleColorChange);

    return () => {
      window.removeEventListener('brandNameChange', handleNameChange);
      window.removeEventListener('brandColorChange', handleColorChange);
    };
  }, []);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('All');
  const [clientFilter, setClientFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [selectedClientId, setSelectedClientId] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [sessionRate, setSessionRate] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionStatus, setSessionStatus] = useState<'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');
  const [saving, setSaving] = useState(false);
  const [currency, setCurrency] = useState(() => localStorage.getItem('app_currency') || '$');

  const { user, dbUid } = useAuth();

  // Calendar Sync & Integration states
  const [showCalendarSettings, setShowCalendarSettings] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [hasSyncedOnInit, setHasSyncedOnInit] = useState(false);
  const [showEmbedPanel, setShowEmbedPanel] = useState(false);
  
  const [calendarProvider, setCalendarProvider] = useState<'calendly' | 'calcom'>('calendly');
  const [calendarMethod, setCalendarMethod] = useState<'embed' | 'api'>('api');
  const [publicUrl, setPublicUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [savedSettings, setSavedSettings] = useState<{
    provider: 'calendly' | 'calcom';
    method: 'embed' | 'api';
    publicUrl: string;
    apiKey: string;
  } | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  // Dynamic sync states
  const [syncedEvents, setSyncedEvents] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  
  // New on-the-fly client register form states
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");

  // Live Embed vs Manual scheduling tabs
  const [bookingMode, setBookingMode] = useState<'live' | 'manual'>('live');
  const [embedUrl, setEmbedUrl] = useState(() => localStorage.getItem("myEmbedUrl") || "");
  const [tempEmbedUrl, setTempEmbedUrl] = useState("");

  useEffect(() => {
    if (!user) return;
    
    setLoadingSettings(true);
    const loadSettings = async () => {
      try {
        const settingsDocRef = doc(db, `users/${dbUid || user.uid}/calendar_settings`, "config");
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          if (data && data.provider) {
            setSavedSettings(data as any);
            setCalendarProvider(data.provider || 'calendly');
            setCalendarMethod(data.method || 'embed');
            setPublicUrl(data.publicUrl || "");
            setApiKey(data.apiKey || "");
            setShowCalendarSettings(false);
          } else {
            setSavedSettings(null);
            setShowCalendarSettings(true);
          }
        } else {
          setSavedSettings(null);
          setShowCalendarSettings(true);
        }
      } catch (err) {
        console.error("Error loading calendar settings:", err);
        setShowCalendarSettings(true);
      } finally {
        setLoadingSettings(false);
      }
    };
    loadSettings();
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    if (!user) {
      alert("You must be logged in to save settings.");
      return;
    }

    try {
      const data = {
        provider: calendarProvider,
        method: calendarMethod,
        publicUrl: publicUrl.trim(),
        apiKey: apiKey.trim()
      };

      const settingsDocRef = doc(db, `users/${dbUid || user.uid}/calendar_settings`, "config");
      await setDoc(settingsDocRef, data);
      setSavedSettings(data);
      setShowCalendarSettings(false);
      setHasSyncedOnInit(false); // Trigger automatic sync with the new credentials
      alert("Calendar integration settings saved successfully!");
    } catch (err: any) {
      console.error("Error saving calendar settings:", err);
      alert(`Error saving calendar settings: ${err.message || 'Unknown error'}`);
    }
  };

  const handleClearSettings = async () => {
    if (!user) return;
    if (confirm("Are you sure you want to delete your calendar integration settings?")) {
      try {
        const settingsDocRef = doc(db, `users/${dbUid || user.uid}/calendar_settings`, "config");
        await setDoc(settingsDocRef, {});
        setSavedSettings(null);
        setPublicUrl("");
        setApiKey("");
        setSyncedEvents([]);
        setLastSynced(null);
        setHasSyncedOnInit(false);
        setShowCalendarSettings(true);
        alert("Calendar integration cleared.");
      } catch (err: any) {
        console.error("Error clearing calendar settings:", err);
        alert(`Error clearing calendar settings: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const saveSyncedEventsToFirestore = async (events: any[]) => {
    if (!user) return;
    for (const evt of events) {
      try {
        const sessionDocRef = doc(db, `users/${dbUid || user.uid}/sessions`, evt.id);
        const existingDoc = await getDoc(sessionDocRef);
        let existingRate = 0;
        let existingNotes = evt.notes || "";
        
        if (existingDoc.exists()) {
          const existingData = existingDoc.data();
          if (existingData.rate !== undefined) {
            existingRate = existingData.rate;
          }
          if (existingData.notes !== undefined) {
            existingNotes = existingData.notes;
          }
        }

        await setDoc(sessionDocRef, {
          clientId: "external",
          clientName: evt.clientName || 'Calendar Client',
          clientEmail: evt.clientEmail || '',
          title: evt.title || 'Consultation Session',
          date: evt.date,
          time: evt.time || '',
          rate: existingRate,
          notes: existingNotes,
          status: evt.status,
          source: evt.source,
          createdAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error("Error upserting synced event:", evt, err);
      }
    }
  };

  const handleSyncCalendar = async () => {
    if (!savedSettings || !savedSettings.apiKey) {
      alert("Please configure and save your API Key/Token first to sync bookings.");
      return;
    }

    const fetchWithCheck = async (url: string, options?: RequestInit) => {
      const res = await fetch(url, options);
      const contentType = res.headers.get('content-type') || '';
      
      if (contentType.includes('text/html')) {
        throw new Error("HandshakeRequired");
      }
      
      const cloned = res.clone();
      try {
        const text = await cloned.text();
        if (text.trim().startsWith('<') || text.includes('__cookie_check')) {
          throw new Error("HandshakeRequired");
        }
      } catch (e) {
        // ignore clone read errors
      }
      
      return res;
    };

    // Resilient fallback fetchers to handle 405/Proxy restrictions on different browsers
    const fetchCalBookingsWithFallback = async (): Promise<any> => {
      // 1. Try GET proxy (highly compatible with same-origin proxies under IAP/Vite fallback)
      try {
        const res = await fetchWithCheck(`/api/proxy/cal/bookings?apiKey=${encodeURIComponent(savedSettings.apiKey)}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn("Cal.com GET proxy failed, trying next fallback:", e);
      }

      // 2. Try POST proxy (standard method)
      try {
        const res = await fetchWithCheck('/api/proxy/cal/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: savedSettings.apiKey })
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn("Cal.com POST proxy failed, trying next fallback:", e);
      }

      // 3. Try direct V2 browser-to-API fetch (CORS allowed on Cal.com developer keys)
      try {
        const apiKeyClean = savedSettings.apiKey.replace('Bearer ', '').trim();
        const res = await fetch('https://api.cal.com/v2/bookings', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKeyClean}`,
            'cal-api-version': '2026-05-01'
          }
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn("Cal.com direct browser V2 fetch failed, trying next fallback:", e);
      }

      // 4. Try direct V1 browser-to-API fetch
      try {
        const apiKeyClean = savedSettings.apiKey.replace('Bearer ', '').trim();
        const res = await fetch(`https://api.cal.com/v1/bookings?apiKey=${apiKeyClean}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn("Cal.com direct browser V1 fetch failed:", e);
      }

      throw new Error("Could not sync from Cal.com. Both backend proxy paths and direct browser-to-API connections were rejected. Please double check that your API Key is valid.");
    };

    const fetchCalendlyUserWithFallback = async (): Promise<any> => {
      // 1. Try GET proxy
      try {
        const res = await fetchWithCheck(`/api/proxy/calendly/user?apiKey=${encodeURIComponent(savedSettings.apiKey)}`);
        if (res.ok) return await res.json();
      } catch (e) { console.warn("Calendly user GET proxy failed, trying next fallback:", e); }

      // 2. Try POST proxy
      try {
        const res = await fetchWithCheck('/api/proxy/calendly/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: savedSettings.apiKey })
        });
        if (res.ok) return await res.json();
      } catch (e) { console.warn("Calendly user POST proxy failed, trying next fallback:", e); }

      // 3. Try direct browser-to-API fetch
      try {
        const authHeader = savedSettings.apiKey.startsWith('Bearer ') ? savedSettings.apiKey : `Bearer ${savedSettings.apiKey}`;
        const res = await fetch('https://api.calendly.com/users/me', {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) return await res.json();
      } catch (e) { console.warn("Calendly user direct browser fetch failed:", e); }

      throw new Error("Could not authorize with Calendly. Ensure your personal access token is active and entered correctly.");
    };

    const fetchCalendlyEventsWithFallback = async (userUri: string): Promise<any> => {
      // 1. Try GET proxy
      try {
        const res = await fetchWithCheck(`/api/proxy/calendly/events?apiKey=${encodeURIComponent(savedSettings.apiKey)}&user=${encodeURIComponent(userUri)}`);
        if (res.ok) return await res.json();
      } catch (e) { console.warn("Calendly events GET proxy failed, trying next fallback:", e); }

      // 2. Try POST proxy
      try {
        const res = await fetchWithCheck('/api/proxy/calendly/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: savedSettings.apiKey, user: userUri })
        });
        if (res.ok) return await res.json();
      } catch (e) { console.warn("Calendly events POST proxy failed, trying next fallback:", e); }

      // 3. Try direct browser-to-API fetch
      try {
        const authHeader = savedSettings.apiKey.startsWith('Bearer ') ? savedSettings.apiKey : `Bearer ${savedSettings.apiKey}`;
        const res = await fetch(`https://api.calendly.com/scheduled_events?count=20&user=${encodeURIComponent(userUri)}`, {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) return await res.json();
      } catch (e) { console.warn("Calendly events direct browser fetch failed:", e); }

      throw new Error("Failed to fetch Calendly events.");
    };

    const fetchCalendlyInviteesWithFallback = async (eventUri: string): Promise<any> => {
      // 1. Try GET proxy
      try {
        const res = await fetchWithCheck(`/api/proxy/calendly/invitees?apiKey=${encodeURIComponent(savedSettings.apiKey)}&event=${encodeURIComponent(eventUri)}`);
        if (res.ok) return await res.json();
      } catch (e) { console.warn("Calendly invitees GET proxy failed, trying next fallback:", e); }

      // 2. Try POST proxy
      try {
        const res = await fetchWithCheck('/api/proxy/calendly/invitees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: savedSettings.apiKey, event: eventUri })
        });
        if (res.ok) return await res.json();
      } catch (e) { console.warn("Calendly invitees POST proxy failed, trying next fallback:", e); }

      // 3. Try direct browser-to-API fetch
      try {
        const authHeader = savedSettings.apiKey.startsWith('Bearer ') ? savedSettings.apiKey : `Bearer ${savedSettings.apiKey}`;
        const res = await fetch(`https://api.calendly.com/scheduled_event_invitees?event=${encodeURIComponent(eventUri)}`, {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) return await res.json();
      } catch (e) { console.warn("Calendly invitees direct browser fetch failed:", e); }

      return { collection: [] };
    };

    setSyncing(true);
    setSyncError(null);
    try {
      if (savedSettings.provider === 'calcom') {
        const data = await fetchCalBookingsWithFallback();
        
        // Robust list extraction for V1 / V2 schemas
        let bookingsList = [];
        if (data) {
          if (Array.isArray(data)) {
            bookingsList = data;
          } else if (data.data && Array.isArray(data.data.bookings)) {
            bookingsList = data.data.bookings;
          } else if (data.bookings && Array.isArray(data.bookings)) {
            bookingsList = data.bookings;
          } else if (data.data && Array.isArray(data.data)) {
            bookingsList = data.data;
          } else {
            bookingsList = data.collection || data.results || [];
          }
        }
        
        const mapped = bookingsList.map((b: any) => {
          const rawStart = b.startTime || b.start;
          const rawEnd = b.endTime || b.end;

          const startDate = rawStart ? new Date(rawStart) : new Date();
          const isValidDate = !isNaN(startDate.getTime());
          
          const dateStr = isValidDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          const timeStr = isValidDate ? startDate.toTimeString().split(' ')[0].slice(0, 5) : '00:00';
          
          const attendee = b.attendees?.[0] || b.attendee || { name: 'Cal.com Client', email: '' };
          
          let st: 'Upcoming' | 'Completed' | 'Cancelled' = 'Upcoming';
          const bStatus = (b.status || '').toUpperCase();
          if (bStatus === 'CANCELLED' || bStatus === 'REJECTED' || bStatus === 'CANCELED') {
            st = 'Cancelled';
          } else if (rawEnd) {
            const endDate = new Date(rawEnd);
            if (!isNaN(endDate.getTime()) && new Date() > endDate) {
              st = 'Completed';
            }
          }

          return {
            id: `cal-${b.id}`,
            title: b.title || b.description || 'Consultation Session',
            clientName: attendee.name || 'Cal.com Client',
            clientEmail: attendee.email || '',
            date: dateStr,
            time: timeStr,
            notes: b.description || '',
            status: st,
            source: 'calcom'
          };
        });

        setSyncedEvents(mapped);
        await saveSyncedEventsToFirestore(mapped);
        setLastSynced(new Date().toLocaleTimeString());
      } else {
        const userData = await fetchCalendlyUserWithFallback();
        const userUri = userData.resource?.uri;
        if (!userUri) throw new Error("Could not retrieve Calendly User URI.");

        const eventsData = await fetchCalendlyEventsWithFallback(userUri);
        const eventsList = eventsData.collection || [];

        const recentEvents = eventsList.slice(0, 10);
        
        const eventsWithInvitees = await Promise.all(
          recentEvents.map(async (event: any) => {
            try {
              const inviteeData = await fetchCalendlyInviteesWithFallback(event.uri);
              return { event, invitees: inviteeData.collection || [] };
            } catch (e) {
              console.error("Error fetching invitees for event:", event.uri, e);
              return { event, invitees: [] };
            }
          })
        );

        const mapped = eventsWithInvitees.map(({ event, invitees }) => {
          const startDate = new Date(event.start_time);
          const dateStr = startDate.toISOString().split('T')[0];
          const timeStr = startDate.toTimeString().split(' ')[0].slice(0, 5);
          
          const mainInvitee = invitees?.[0] || { name: 'Calendly Client', email: '' };
          
          let st: 'Upcoming' | 'Completed' | 'Cancelled' = 'Upcoming';
          if (event.status === 'canceled') {
            st = 'Cancelled';
          } else if (new Date() > new Date(event.end_time)) {
            st = 'Completed';
          }

          return {
            id: `calendly-${event.uri.split('/').pop()}`,
            title: event.name,
            clientName: mainInvitee.name || 'Calendly Guest',
            clientEmail: mainInvitee.email || '',
            date: dateStr,
            time: timeStr,
            notes: mainInvitee.questions_and_answers?.map((qa: any) => `${qa.question}: ${qa.answer}`).join(' | ') || '',
            status: st,
            source: 'calendly'
          };
        });

        setSyncedEvents(mapped);
        await saveSyncedEventsToFirestore(mapped);
        setLastSynced(new Date().toLocaleTimeString());
      }
    } catch (err: any) {
      console.error("Sync error:", err);
      if (err.message === "HandshakeRequired") {
        setAuthRequired(true);
        setSyncError("Secure communication restricted. Click 'Authorize & Sync Calendar' to link your browser session.");
      } else {
        setSyncError(err.message || 'Unknown error syncing calendar bookings.');
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenAuthPopup = () => {
    setSyncError(null);
    setAuthRequired(false);
    
    // Open a popup to our application root with the close_after_auth query param
    const authWindow = window.open('/?close_after_auth=true', 'auth_handshake', 'width=500,height=600');
    
    if (authWindow) {
      const timer = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(timer);
          setTimeout(() => {
            handleSyncCalendar();
          }, 800);
        }
      }, 1000);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'handshake_complete') {
        handleSyncCalendar();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [savedSettings]);

  useEffect(() => {
    if (savedSettings && savedSettings.method === 'api' && savedSettings.apiKey && !hasSyncedOnInit) {
      setHasSyncedOnInit(true);
      const timer = setTimeout(() => {
        handleSyncCalendar();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [savedSettings, hasSyncedOnInit]);

  const handleImportSession = (event: any) => {
    resetForm();
    
    // Always default to 'external' to decouple completely from the Client Ledger
    setSelectedClientId("external");
    setNewClientName(event.clientName || "");
    setNewClientEmail(event.clientEmail || "");

    setSessionTitle(event.title || "");
    setSessionDate(event.date || "");
    setSessionTime(event.time || "");
    setSessionNotes(event.notes || "");
    setSessionStatus(event.status || 'Upcoming');
    
    const latestSessions = sessions.filter(s => s.rate && s.rate > 0);
    if (latestSessions.length > 0) {
      setSessionRate(latestSessions[0].rate.toString());
    } else {
      setSessionRate("");
    }

    setBookingMode('manual'); // Synced importing logs uses the manual form for review and confirmation
    setIsModalOpen(true);
  };

  // Stats calculation
  const totalUpcoming = sessions.filter(s => s.status === 'Upcoming').length;
  const totalCompleted = sessions.filter(s => s.status === 'Completed').length;
  const totalCancelled = sessions.filter(s => s.status === 'Cancelled').length;
  const projectedRevenue = sessions
    .filter(s => s.status !== 'Cancelled')
    .reduce((sum, s) => sum + (Number(s.rate) || 0), 0);

  // Reset form helper
  const resetForm = () => {
    setSelectedClientId("");
    setSessionTitle("");
    setSessionDate("");
    setSessionTime("");
    setSessionRate("");
    setSessionNotes("");
    setSessionStatus('Upcoming');
    setEditingId(null);
    setNewClientName("");
    setNewClientEmail("");
  };

  const handleOpenCreateModal = () => {
    resetForm();
    if (clients.length > 0) {
      setSelectedClientId(clients[0].id);
    } else {
      setSelectedClientId("external");
    }
    setBookingMode('live'); // Default to live widget
    setIsModalOpen(true);
  };

  const handleEdit = (session: Session) => {
    setSelectedClientId(session.clientId || "external");
    setSessionTitle(session.title);
    setSessionDate(session.date);
    setSessionTime(session.time || "");
    setSessionRate(session.rate ? session.rate.toString() : "");
    setSessionNotes(session.notes || "");
    setSessionStatus(session.status);
    setEditingId(session.id);
    if (session.clientId === "external") {
      setNewClientName(session.clientName || "");
      setNewClientEmail(session.clientEmail || "");
    } else {
      setNewClientName("");
      setNewClientEmail("");
    }
    setBookingMode('manual'); // Editing must be manual form
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      alert("Please select a client.");
      return;
    }
    if (!sessionTitle) {
      alert("Please enter an appointment title.");
      return;
    }
    if (!sessionDate) {
      alert("Please specify a date.");
      return;
    }

    setSaving(true);
    try {
      let finalClientId = selectedClientId;
      let finalClientName = "";
      let finalClientEmail = "";

      if (selectedClientId === 'new-client') {
        if (!newClientName.trim()) {
          alert("Please enter a name for the new client.");
          setSaving(false);
          return;
        }

        const clientCol = collection(db, `users/${dbUid || user?.uid}/clients`);
        const newClientDoc = await addDoc(clientCol, {
          name: newClientName.trim(),
          onboardingDate: new Date().toISOString().split('T')[0],
          finalPaymentDate: '',
          upfrontAmount: 0,
          finalAmount: 0,
          projectUrl: '',
          invoiceUrl: newClientEmail.trim() || '', // Store email in invoiceUrl for billing integration
          timestamp: serverTimestamp()
        });
        
        finalClientId = newClientDoc.id;
        finalClientName = newClientName.trim();
        finalClientEmail = newClientEmail.trim();
      } else if (selectedClientId === 'external') {
        if (!newClientName.trim()) {
          alert("Please enter a name for the external guest.");
          setSaving(false);
          return;
        }
        finalClientId = "external";
        finalClientName = newClientName.trim();
        finalClientEmail = newClientEmail.trim();
      } else {
        const client = clients.find(c => c.id === selectedClientId);
        if (!client) {
          alert("Client not found.");
          setSaving(false);
          return;
        }
        finalClientId = client.id;
        finalClientName = client.name;
        finalClientEmail = client.invoiceUrl && client.invoiceUrl.includes('@') ? client.invoiceUrl : "";
      }

      const payload = {
        clientId: finalClientId,
        clientName: finalClientName,
        clientEmail: finalClientEmail,
        title: sessionTitle,
        date: sessionDate,
        time: sessionTime,
        rate: Number(sessionRate) || 0,
        notes: sessionNotes,
        status: sessionStatus
      };

      if (editingId) {
        await updateSession(editingId, payload);
      } else {
        await addSession(payload);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error(err);
      alert(`Error saving appointment: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        await removeSession(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGenerateInvoice = (session: Session) => {
    // Bridges to Finance! Prefills invoice generator
    const formattedDate = formatDateToMMDDYYYY(session.date);
    const invoiceItem = {
      id: "session-item",
      title: `${session.title}`,
      subtext: `Conducted on ${formattedDate}. ${session.notes ? `Notes: ${session.notes}` : ''}`,
      price: session.rate || 0
    };

    navigate("/invoices", {
      state: {
        billedToName: session.clientName,
        billedToEmail: session.clientEmail || "",
        items: [invoiceItem],
        invoiceNo: `SES-${session.date.replace(/-/g, '')}`
      }
    });
  };

  // Filtered list
  const filteredSessions = sessions.filter(s => {
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    const matchesClient = clientFilter === 'All' || s.clientId === clientFilter;
    const matchesSearch = !searchQuery || 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesClient && matchesSearch;
  });

  // Filtered and Sorted list (newest bookings or new entries appear on top, older ones at the bottom)
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    // Primary: Sort by Date descending
    const dateCompare = (b.date || "").localeCompare(a.date || "");
    if (dateCompare !== 0) return dateCompare;
    
    // Secondary: Sort by Time descending
    const timeCompare = (b.time || "").localeCompare(a.time || "");
    if (timeCompare !== 0) return timeCompare;

    // Tertiary fallback: Sort by Firestore creation date if available
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA;
  });

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(sortedSessions.length / itemsPerPage));
  const paginatedSessions = sortedSessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto h-full w-full text-black bg-surface">
      {/* Header section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-headline font-extrabold text-xl md:text-2xl lg:text-3xl tracking-tight uppercase">
            <span className="text-primary-container">{brandName}'S</span> APPOINTMENTS
          </h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:gap-2.5 sm:justify-end items-stretch sm:items-center">
          <button
            onClick={() => setShowCalendarSettings(!showCalendarSettings)}
            className={`w-full sm:w-auto px-3.5 py-2.5 border-2 border-black font-headline font-bold text-xs uppercase tracking-wider transition-all duration-100 flex items-center justify-center gap-2 neu-shadow-sm active:translate-y-0.5 whitespace-nowrap ${
              showCalendarSettings ? 'bg-amber-200 text-black' : 'bg-white hover:bg-neutral-100 text-black'
            }`}
          >
            <Settings className="w-4 h-4" />
            {savedSettings ? 'Calendar Settings' : 'Connect Calendar'}
          </button>

          {savedSettings && savedSettings.method === 'embed' && (
            <button
              onClick={() => setShowEmbedPanel(!showEmbedPanel)}
              className="w-full sm:w-auto px-3.5 py-2.5 border-2 border-black font-headline font-bold text-xs uppercase tracking-wider transition-all duration-100 flex items-center justify-center gap-2 neu-shadow-sm active:translate-y-0.5 bg-white hover:bg-neutral-100 text-black"
            >
              <Calendar className="w-4 h-4" />
              {showEmbedPanel ? 'Hide Booking' : 'Show Booking'}
            </button>
          )}

          {savedSettings && savedSettings.method === 'api' && (
            <button
              onClick={handleSyncCalendar}
              disabled={syncing}
              className="w-full sm:w-auto px-3.5 py-2.5 border-2 border-black bg-white hover:bg-neutral-100 text-black font-headline font-bold text-xs uppercase tracking-wider transition-all duration-100 flex items-center justify-center gap-2 neu-shadow-sm active:translate-y-0.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Calendar'}
            </button>
          )}

          <button 
            onClick={handleOpenCreateModal} 
            className="w-full sm:w-auto px-4 py-2.5 border-2 border-black bg-primary-container hover:bg-blue-700 text-white font-headline font-bold text-xs uppercase tracking-wider transition-all duration-100 flex items-center justify-center gap-2 neu-shadow-sm active:translate-y-0.5 active:shadow-none whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Book a session
          </button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-container-lowest border-2 border-black neu-shadow p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-blue-100 border-l-2 border-b-2 border-black flex items-center justify-center -mr-2 -mt-2">
            <Calendar className="w-5 h-5 text-blue-700" />
          </div>
          <p className="font-body font-bold text-outline uppercase tracking-widest text-xs mb-1.5">Upcoming</p>
          <h3 className="font-numbers font-extrabold text-2xl md:text-3xl text-black">{totalUpcoming}</h3>
          <p className="text-[10px] text-on-surface-variant font-medium mt-1">Confirmed appointments</p>
        </div>

        <div className="bg-surface-container-lowest border-2 border-black neu-shadow p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-green-100 border-l-2 border-b-2 border-black flex items-center justify-center -mr-2 -mt-2">
            <CheckCircle className="w-5 h-5 text-green-700" />
          </div>
          <p className="font-body font-bold text-outline uppercase tracking-widest text-xs mb-1.5">Completed</p>
          <h3 className="font-numbers font-extrabold text-2xl md:text-3xl text-black">{totalCompleted}</h3>
          <p className="text-[10px] text-on-surface-variant font-medium mt-1">Ready to invoice</p>
        </div>

        <div className="bg-surface-container-lowest border-2 border-black neu-shadow p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-red-100 border-l-2 border-b-2 border-black flex items-center justify-center -mr-2 -mt-2">
            <XCircle className="w-5 h-5 text-red-700" />
          </div>
          <p className="font-body font-bold text-outline uppercase tracking-widest text-xs mb-1.5">Cancelled</p>
          <h3 className="font-numbers font-extrabold text-2xl md:text-3xl text-black">{totalCancelled}</h3>
          <p className="text-[10px] text-on-surface-variant font-medium mt-1">Archived logs</p>
        </div>
      </div>

      {/* Collapsible/Expandable Connection Settings panel */}
      {showCalendarSettings && (
        <div className="bg-surface-container-lowest border-2 border-black neu-shadow p-5 mb-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-dashed border-neutral-300 pb-4 mb-4 text-black">
            <div>
              <h3 className="font-headline font-extrabold text-base uppercase tracking-tight flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary-container" /> Configure Calendar Booking Integration
              </h3>
              <p className="font-body text-xs text-neutral-600 mt-1">
                Connect your custom Calendly or Cal.com booking widgets to display and synchronize bookings inside your tracker.
              </p>
            </div>
            {savedSettings && (
              <button
                type="button"
                onClick={() => setShowCalendarSettings(false)}
                className="px-2.5 py-1.5 border-2 border-black bg-white text-black font-headline font-bold text-[10px] uppercase hover:bg-neutral-100 transition-all"
              >
                Close Settings
              </button>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings(e); }} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end text-black">
            <div className="md:col-span-4">
              <label className="block font-body font-bold text-[10px] mb-1.5 uppercase tracking-wide">Calendar Provider</label>
              <select
                value={calendarProvider}
                onChange={(e) => setCalendarProvider(e.target.value as any)}
                className="w-full border-2 border-black p-2 text-xs font-body font-medium bg-surface-container-low focus:outline-none text-black"
              >
                <option value="calendly">Calendly</option>
                <option value="calcom">Cal.com</option>
              </select>
            </div>

            <div className="md:col-span-6">
              <label className="block font-body font-bold text-[10px] mb-1.5 uppercase tracking-wide">API Personal Access Token *</label>
              <input
                type="password"
                required
                placeholder={calendarProvider === 'calendly' ? 'Calendly API token' : 'Cal.com API key'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs font-body font-medium bg-surface-container-low focus:outline-none placeholder-neutral-500 text-black"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-white hover:bg-neutral-100 border-2 border-black p-2 font-headline font-bold uppercase text-[11px] tracking-wider text-black transition-all text-center"
              >
                Save settings
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t-2 border-dashed border-neutral-300 pt-4">
            <div className="p-3 bg-neutral-50 border-2 border-dashed border-neutral-300 text-[11px] text-neutral-600 flex gap-2 items-start flex-1">
              <HelpCircle className="w-4 h-4 shrink-0 text-neutral-500 mt-0.5" />
              <div>
                <p className="font-bold uppercase mb-0.5 text-neutral-700">How to get your credentials:</p>
                {calendarProvider === 'calendly' ? (
                  <p>
                    <strong>Embed Widget:</strong> Enter your full Calendly link (e.g., <code>calendly.com/your-id</code>). <br />
                    <strong>API Import:</strong> Go to <em>Calendly Admin &rarr; Integrations &rarr; API &amp; Webhooks &rarr; Generate New Token</em>. Paste it here to sync actual scheduled bookings.
                  </p>
                ) : (
                  <p>
                    <strong>Embed Widget:</strong> Enter your full Cal.com link (e.g., <code>cal.com/your-id</code>). <br />
                    <strong>API Import:</strong> Go to <em>Cal.com Settings &rarr; Developer &rarr; API Keys &rarr; Create new Key</em>. Paste it here to pull events dynamically.
                  </p>
                )}
              </div>
            </div>

            {savedSettings && (
              <button
                type="button"
                onClick={handleClearSettings}
                className="px-3.5 py-2 border-2 border-black bg-red-100 hover:bg-red-200 text-red-800 font-headline font-bold text-[11px] uppercase tracking-wider transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Disconnect Integration
              </button>
            )}
          </div>
        </div>
      )}

      {/* Embedded Live Calendar Widget */}
      {savedSettings && savedSettings.method === 'embed' && showEmbedPanel && (
        <div className="space-y-4 mb-6 animate-in slide-in-from-top-2 duration-200 text-black">
          <div className="bg-surface-container-lowest border-2 border-black p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="font-headline font-extrabold text-xs uppercase text-neutral-800 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-primary-container" /> Embedded Booking Screen Preview
              </h4>
              <p className="font-body text-[10px] text-neutral-500 mt-0.5">
                Clients can schedule appointments directly on your page. URL: <code className="text-black font-mono text-[9px]">{savedSettings.publicUrl}</code>
              </p>
            </div>
            <a
              href={`https://${savedSettings.publicUrl.replace(/^https?:\/\//i, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 border-2 border-black bg-white hover:bg-neutral-100 font-headline font-bold text-[10px] uppercase flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              Open in New Tab <Share2 className="w-3.5 h-3.5" />
            </a>
          </div>
          
          <div className="border-4 border-black bg-white w-full h-[500px] overflow-hidden neu-shadow relative">
            <iframe
              src={`https://${savedSettings.publicUrl.replace(/^https?:\/\//i, '')}`}
              title="Embedded Calendar Scheduler"
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        </div>
      )}

      {/* Calendar connection / Sync status compact bar */}
      {savedSettings && (
        <div className="bg-surface-container-lowest border-2 border-black p-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-pulse" />
            <span className="font-headline font-bold uppercase text-[10px] tracking-wide text-neutral-800">
              Calendar Sync Connected ({savedSettings.provider === 'calcom' ? 'Cal.com' : 'Calendly'})
            </span>
            {lastSynced && (
              <span className="font-mono text-neutral-500">
                • Last sync: {lastSynced}
              </span>
            )}
          </div>
          
          {(syncError || authRequired) && (
            <div className="flex items-center gap-2 flex-wrap">
              {syncError && (
                <div className="text-red-600 font-medium flex items-center gap-1 text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{syncError}</span>
                </div>
              )}
              {authRequired && (
                <button
                  onClick={handleOpenAuthPopup}
                  className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 border-2 border-black text-amber-950 font-headline font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all"
                >
                  <LockOpen className="w-3 h-3" /> Authorize Integration
                </button>
              )}
            </div>
          )}
        </div>
      )}
        <div className="bg-surface-container-lowest border-2 border-black neu-shadow mb-8 overflow-hidden">
          <div className="bg-secondary-container border-b-2 border-black p-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between text-black">
            {/* Status buttons */}
            <div className="flex flex-nowrap overflow-x-auto hide-scrollbar border-2 border-black bg-surface-container-lowest mx-auto lg:mx-0 w-full sm:w-auto">
              {(['All', 'Upcoming', 'Completed', 'Cancelled'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`whitespace-nowrap flex-1 sm:flex-none px-2 sm:px-6 py-3 font-headline font-bold text-[9px] sm:text-xs uppercase tracking-wide border-black last:border-r-0 border-r-2 text-center ${
                    statusFilter === st ? 'bg-primary-container text-white' : 'hover:bg-neutral-100 transition-colors text-black'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              {/* Search Input */}
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Search appointment title, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 font-body font-medium text-xs border-2 border-black bg-surface-container-lowest focus:outline-none text-black placeholder-neutral-500"
                />
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Sessions table or empty state */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body min-w-[700px]">
              <thead>
                <tr className="border-b-2 border-black bg-surface-container-low text-xs uppercase tracking-widest text-on-surface-variant">
                  <th className="text-center p-4 font-bold border-r-2 border-outline-variant w-32">Date & Time</th>
                  <th className="text-center p-4 font-bold border-r-2 border-outline-variant w-44">Name</th>
                  <th className="text-center p-4 font-bold border-r-2 border-outline-variant">Details</th>
                  <th className="p-4 font-bold border-r-2 border-outline-variant w-28 text-center">Status</th>
                  <th className="p-4 font-bold text-center w-48">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingSessions && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center font-bold">
                      Loading appointments...
                    </td>
                  </tr>
                )}
                
                {!loadingSessions && sortedSessions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="max-w-md mx-auto flex flex-col items-center py-6">
                        <AlertCircle className="w-10 h-10 text-neutral-400 mb-2" />
                        <p className="font-headline font-extrabold uppercase text-sm text-neutral-700">No Appointments Found</p>
                        <p className="font-body text-xs text-neutral-500 mt-1 mb-4 text-center">
                          {sessions.length === 0 
                            ? "Log your first appointment with a client to start tracking hourly consultations." 
                            : "Try adjusting your search criteria or status filters."}
                        </p>
                        {sessions.length === 0 && (
                          <button
                            onClick={handleOpenCreateModal}
                            className="px-4 py-2 border-2 border-black bg-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-100 transition-colors"
                          >
                            Log Appointment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {!loadingSessions && paginatedSessions.map((session) => (
                  <tr key={session.id} className="border-b-2 border-outline-variant hover:bg-surface-container-low transition-all">
                    {/* Date & Time */}
                    <td className="p-4 font-semibold text-xs border-r-2 border-outline-variant whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-black">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-neutral-500" />
                        <span>{formatDateToMMDDYYYY(session.date)}</span>
                      </div>
                      {session.time && (
                        <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] mt-1 font-mono">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{session.time}</span>
                        </div>
                      )}
                    </td>

                    {/* Client */}
                    <td className="p-4 font-headline text-xs font-bold border-r-2 border-outline-variant uppercase tracking-tight text-neutral-800">
                      {session.clientName}
                    </td>

                    {/* Details & Notes */}
                    <td className="p-4 border-r-2 border-outline-variant">
                      <p className="font-headline font-bold text-xs uppercase text-black">{session.title}</p>
                      {session.notes && !session.notes.toLowerCase().startsWith("synced from") ? (
                        <p className="font-body text-xs text-neutral-600 dark:text-neutral-400 mt-1 italic break-words line-clamp-2" title={session.notes}>
                          "{session.notes}"
                        </p>
                      ) : (
                        <p className="font-body text-[10px] text-neutral-400 mt-1 uppercase italic">No appointment notes added.</p>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 border-r-2 border-outline-variant text-center">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-headline font-black uppercase border-2 border-black tracking-wider ${
                        session.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : session.status === 'Upcoming' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-neutral-200 text-neutral-600'
                      }`}>
                        {session.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleEdit(session)}
                          title="Edit Appointment"
                          className="p-1 border-2 border-black bg-white hover:bg-neutral-100 text-black transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(session.id)}
                          title="Delete Log"
                          className="p-1 border-2 border-black bg-white hover:bg-red-500 hover:text-white text-black transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 md:p-5 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-lowest">
              <span className="font-body font-bold text-xs md:text-sm uppercase tracking-tight">
                Showing {sortedSessions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(sortedSessions.length, currentPage * itemsPerPage)} of {sortedSessions.length} Entries
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

      {/* Book / Edit Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest border-4 border-black w-full max-w-lg neu-shadow-lg relative animate-in fade-in zoom-in-95 duration-100 max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-secondary-container border-b-2 border-black p-3 text-black flex justify-between items-center">
              <h3 className="font-headline font-extrabold text-sm uppercase tracking-tight">
                {editingId ? "Update Session Log" : "Log / Book Session"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 border-2 border-black bg-white active:bg-gray-200 font-bold text-xs"
              >
                <span className="material-symbols-outlined block text-black text-sm">close</span>
              </button>
            </div>

                        {!editingId ? (
              <div className="p-4 space-y-4 text-black">
                {embedUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs bg-emerald-50 border-2 border-dashed border-emerald-300 p-2 text-emerald-950 font-body">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold">Live Booking Widget Active</span>
                      </div>
                      <button
                        onClick={() => {
                          setEmbedUrl("");
                          localStorage.removeItem("myEmbedUrl");
                        }}
                        className="underline hover:text-emerald-700 text-[10px] uppercase font-bold shrink-0"
                      >
                        Clear Link
                      </button>
                    </div>
                    
                    <div className="border-4 border-black bg-white w-full h-[450px] overflow-hidden relative neu-shadow-sm">
                      <iframe
                        src={embedUrl}
                        title="Embedded Calendar Scheduler"
                        className="w-full h-full border-0"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                      />
                    </div>
                    <p className="font-body text-[10px] text-neutral-500 italic text-center">
                      Appointments scheduled here will automatically sync to your session logs list if integrated.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 border-2 border-dashed border-neutral-300 bg-neutral-50/50 text-center space-y-4">
                    <div className="space-y-1">
                      <p className="font-headline font-extrabold uppercase text-xs text-neutral-700">Embed Public Calendar</p>
                      <p className="font-body text-[11px] text-neutral-500 max-w-sm mx-auto">
                        Paste your Calendly or Cal.com public link below to embed it directly in this view.
                      </p>
                    </div>
                    
                    <div className="max-w-sm mx-auto space-y-3 text-left">
                      <div>
                        <label className="block font-body font-bold text-[9px] mb-1 uppercase tracking-wide">Public URL *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. calendly.com/your-username"
                          value={tempEmbedUrl}
                          onChange={(e) => setTempEmbedUrl(e.target.value)}
                          className="w-full border-2 border-black p-2 text-xs font-body font-medium bg-white focus:outline-none placeholder-neutral-400 text-black"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (!tempEmbedUrl.trim()) return;
                          let finalUrl = tempEmbedUrl.trim();
                          if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
                            finalUrl = 'https://' + finalUrl;
                          }
                          setEmbedUrl(finalUrl);
                          localStorage.setItem("myEmbedUrl", finalUrl);
                        }}
                        className="w-full bg-black hover:bg-neutral-800 border-2 border-black py-3 font-headline font-bold uppercase text-[10px] tracking-wider text-white transition-all text-center active:translate-y-0.5"
                      >
                        Embed Calendar
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="pt-2 border-t-2 border-dashed border-neutral-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border-2 border-black bg-white font-headline font-bold text-[10px] uppercase tracking-wider hover:bg-neutral-100 text-black active:translate-y-0.5"
                  >
                    Close
                  </button>
                </div>
              </div>
) : (
              <form onSubmit={handleSave} className="p-4 space-y-3.5 text-black">
                {/* Select Client */}
                <div>
                  <label className="block font-body font-bold text-[10px] mb-1 uppercase tracking-wide">Client *</label>
                  <select
                    required
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full border-2 border-black p-2 text-xs font-body font-medium bg-surface-container-low focus:bg-white focus:outline-none text-black"
                  >
                    <option value="" disabled>Select Client...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    <option value="external">External Guest (No Client Ledger entry)</option>
                    <option value="new-client">+ Register New Client on-the-fly...</option>
                  </select>

                  {(selectedClientId === 'new-client' || selectedClientId === 'external') && (
                    <div className="mt-2.5 p-3 border-2 border-dashed border-black bg-amber-50/50 space-y-2 text-black animate-in slide-in-from-top-2 duration-150">
                      <p className="font-body font-bold text-[9px] uppercase text-amber-800">
                        {selectedClientId === 'new-client' ? 'Quick Client Registry' : 'External Guest Details'}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-body font-bold text-[9px] mb-0.5 uppercase tracking-wide">Name *</label>
                          <input
                            type="text"
                            required={selectedClientId === 'new-client' || selectedClientId === 'external'}
                            placeholder="e.g. Acme Corp / Guest"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            className="w-full border-2 border-black p-1.5 text-xs font-body font-medium bg-white focus:outline-none text-black placeholder-neutral-500"
                          />
                        </div>
                        <div>
                          <label className="block font-body font-bold text-[9px] mb-0.5 uppercase tracking-wide">Email</label>
                          <input
                            type="email"
                            placeholder="e.g. hello@acme.com"
                            value={newClientEmail}
                            onChange={(e) => setNewClientEmail(e.target.value)}
                            className="w-full border-2 border-black p-1.5 text-xs font-body font-medium bg-white focus:outline-none text-black placeholder-neutral-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Title / Objective */}
                <div>
                  <label className="block font-body font-bold text-[10px] mb-1 uppercase tracking-wide">Session Title / Deliverable *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brand Review, UI Feedback, Onboarding Session"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className="w-full border-2 border-black p-2 text-xs font-body font-medium bg-surface-container-low focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Date & Time Split */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-body font-bold text-[10px] mb-1 uppercase tracking-wide">Date *</label>
                    <input
                      type="date"
                      required
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="w-full border-2 border-black p-2 text-xs font-body font-medium bg-surface-container-low focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-body font-bold text-[10px] mb-1 uppercase tracking-wide">Time</label>
                    <input
                      type="time"
                      value={sessionTime}
                      onChange={(e) => setSessionTime(e.target.value)}
                      className="w-full border-2 border-black p-2 text-xs font-body font-medium bg-surface-container-low focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block font-body font-bold text-[10px] mb-1 uppercase tracking-wide">Status</label>
                  <select
                    value={sessionStatus}
                    onChange={(e) => setSessionStatus(e.target.value as any)}
                    className="w-full border-2 border-black p-2 text-xs font-body font-medium bg-surface-container-low focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-body font-bold text-[10px] mb-1 uppercase tracking-wide">Appointment Summary / Notes</label>
                  <textarea
                    placeholder="Summarize deliverables completed, homework, or future checklist items..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    rows={2}
                    className="w-full border-2 border-black p-2 text-xs font-body font-medium bg-surface-container-low focus:bg-white focus:outline-none resize-none"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-1 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 border-2 border-black p-2 font-headline font-bold uppercase text-[11px] tracking-wider bg-white hover:bg-neutral-100 text-black active:translate-y-0.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || clients.length === 0}
                    className="flex-1 bg-primary-container hover:bg-blue-700 border-2 border-black p-2 font-headline font-bold uppercase text-[11px] tracking-wider text-white disabled:opacity-50 active:translate-y-0.5"
                  >
                    {saving ? "Saving..." : editingId ? "Update Appointment" : "Book Appointment"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
