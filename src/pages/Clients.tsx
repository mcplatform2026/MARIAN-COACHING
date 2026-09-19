import React, { useState, useEffect } from "react";
import { useClients } from "../hooks/useClients";
import { useAgreements } from "../hooks/useAgreements";
import { useAuth } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, FileText, ExternalLink, Link, Plus, Upload, Download, Undo2 } from "lucide-react";
import { formatDateToMMDDYYYY } from "../utils/dateFormat";

export function Clients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  
  const handleResetSchema = () => {
    setConfirmAction({
      type: 'resetSchema',
      title: 'Reset to Default Schema',
      message: 'Are you sure you want to reset all fields back to their default state? Custom fields will be removed from the table view, but the underlying data will not be deleted.',
      onConfirm: () => {
        setFormSchema(defaultFormSchema);
        setColumns(defaultColumns);
        setConfirmAction(null);
      }
    });
  };

  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { clients, loading, addClient, updateClient, removeClient } = useClients();
    const { agreements } = useAgreements();

  const [brandName, setBrandName] = useState(() => localStorage.getItem('brandName') || 'LOREM IPSUM');
  const [pastInvoices, setPastInvoices] = useState<any[]>([]);

  useEffect(() => {
    const handleNameChange = () => {
      const name = localStorage.getItem('brandName') || 'LOREM IPSUM';
      setBrandName(name);
      document.title = `${name} | Database`;
    };
    handleNameChange(); // Set initially
    window.addEventListener('brandNameChange', handleNameChange);
    return () => {
      window.removeEventListener('brandNameChange', handleNameChange);
    };
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pastInvoices');
      if (stored) {
        setPastInvoices(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error reading past invoices inside clients page", e);
    }
  }, [isModalOpen]);

  // Exact Requested State Sequence
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [invoiceLinkType, setInvoiceLinkType] = useState<"url" | "app">("url");
  const [agreementLinkType, setAgreementLinkType] = useState<"url" | "app">("url");

  const handleEdit = (client: any) => {
    setFormData(client);
    if (client.invoiceUrl && client.invoiceUrl.startsWith("app-invoice:")) {
      setInvoiceLinkType("app");
    } else {
      setInvoiceLinkType("url");
    }
    setEditingId(client.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
    setInvoiceLinkType("url");
  };

  const handleViewAppInvoice = (invId: string) => {
    localStorage.setItem('viewInvoiceId', invId);
    navigate('/invoices');
  };

  const handleViewAppAgreement = (agrId: string) => {
    localStorage.setItem('viewAgreementId', agrId);
    navigate('/agreements');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Client Name is required to save.");
      return;
    }
    
    setIsUploading(true);

    try {
      if (editingId) {
        await updateClient(editingId, formData);
      } else {
        await addClient(formData);
      }

      closeModal();
    } catch (e: any) {
      console.error(e);
      alert(`Failed to save client. Error: ${e.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };




  const [lastImportBatchId, setLastImportBatchId] = useState<string | null>(() => localStorage.getItem('lastImportBatchId'));

  const handleUndoImport = () => {
    if (!lastImportBatchId) return;
    setConfirmAction({
      type: 'undoImport',
      title: 'Undo Last Import',
      message: 'Are you sure you want to undo the last import? This will delete all clients imported in the last batch.',
      onConfirm: async () => {
        setConfirmAction(null);
        setIsUploading(true);
        try {
          const clientsToDelete = clients.filter(c => c.importBatchId === lastImportBatchId);
          for (const c of clientsToDelete) {
            await removeClient(c.id);
          }
          setLastImportBatchId(null);
          localStorage.removeItem('lastImportBatchId');
        } catch (err) {
          console.error(err);
          alert("Failed to undo import.");
        } finally {
          setIsUploading(false);
        }
      }
    });
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) return;

        const parseCSVLine = (line: string) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim().replace(/^"|"$/g, ''));
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim().replace(/^"|"$/g, ''));
          return result;
        };

        const headers = parseCSVLine(lines[0]);
        const updatedSchema = [...formSchema];
        const headerMap: Record<string, string> = {};

        headers.forEach(header => {
          const existingField = updatedSchema.find(f => f.label.toLowerCase() === header.toLowerCase() || f.id.toLowerCase() === header.toLowerCase());
          if (existingField) {
            headerMap[header] = existingField.id;
          } else {
            const newFieldId = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
            headerMap[header] = newFieldId;
            updatedSchema.push({
              id: newFieldId,
              label: header.toUpperCase(),
              type: 'text',
              colSpan: 1
            });
          }
        });

        if (updatedSchema.length > formSchema.length) {
          setFormSchema(updatedSchema);
        }

        const batchId = Date.now().toString();

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const clientData: any = { importBatchId: batchId };
          
          headers.forEach((header, index) => {
            if (values[index]) {
              clientData[headerMap[header]] = values[index];
            }
          });
          
          if (!clientData.name && clientData[headerMap[headers[0]]]) {
             if (!clientData.name) {
                 clientData.name = clientData[headerMap[headers[0]]] || "Imported Client";
             }
          } else if (!clientData.name) {
              clientData.name = "Imported Client";
          }

          try {
            await addClient(clientData);
          } catch (err) {
            console.error("Failed to import row", i, err);
          }
        }
        setLastImportBatchId(batchId);
        localStorage.setItem('lastImportBatchId', batchId);
      } finally {
        setIsUploading(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const totalActive = clients.filter(c => c.status === 'Active').length;
  const totalPending = clients.filter(c => c.status === 'Paused').length;

  // Detailed Search & Filter state
  const [filterName, setFilterName] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("oldest");

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterName]);

  // Table Customization State
  const defaultFormSchema = [
    { id: 'name', label: 'CLIENT NAME', type: 'text', colSpan: 1 },
    { id: 'status', label: 'STATUS', type: 'status', colSpan: 1 },
    { id: 'onboardingDate', label: 'ONBOARDING DATE', type: 'date', colSpan: 1 },
    { id: 'amount', label: 'AMOUNT', type: 'currency', colSpan: 1 },
    { id: 'contact', label: 'CONTACT INFO', type: 'text', colSpan: 2 },
  ];

  const [formSchema, setFormSchema] = useState(() => {
    const saved = localStorage.getItem('clientsFormSchema');
    let parsed = saved ? JSON.parse(saved) : defaultFormSchema;
    // Remove number prefixes like "1. ", "2. " if they exist from previous saves
    parsed = parsed.map((f: any) => ({
      ...f,
      label: f.label.replace(/^\d+\.\s*/, '')
    }));
    return parsed;
  });

  useEffect(() => {
    localStorage.setItem('clientsFormSchema', JSON.stringify(formSchema));
  }, [formSchema]);

  const updateFormSchema = (id: string, key: string, value: any) => {
    setFormSchema((prev: any[]) => prev.map((f: any) => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeFormField = (id: string) => {
    setFormSchema((prev: any[]) => prev.filter((f: any) => f.id !== id));
  };

  const addFormField = () => {
    const newField = {
      id: `custom_${Date.now()}`,
      label: 'NEW FIELD',
      type: 'text',
      colSpan: 1,
    };
    setFormSchema((prev: any[]) => [...prev, newField]);
  };

  const moveFormField = (index: number, direction: 'up' | 'down') => {
    setFormSchema((prev: any[]) => {
      const newSchema = [...prev];
      if (direction === 'up' && index > 0) {
        [newSchema[index - 1], newSchema[index]] = [newSchema[index], newSchema[index - 1]];
      } else if (direction === 'down' && index < newSchema.length - 1) {
        [newSchema[index + 1], newSchema[index]] = [newSchema[index], newSchema[index + 1]];
      }
      return newSchema;
    });
  };

  const defaultColumns = [
    { id: "index", label: "#", width: 45 },
    { id: "name", label: "CLIENT NAME", width: 220 },
    { id: "status", label: "STATUS", width: 90 },
    { id: "onboardingDate", label: "ONBOARDING DATE", width: 140 },
    { id: "amount", label: "AMOUNT", width: 120 },
    { id: "contact", label: "CONTACT INFO", width: 200 },
    { id: "actions", label: "ACTIONS", width: 90 },
  ];

  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem('clientsTableColumns');
    return saved ? JSON.parse(saved) : defaultColumns;
  });
  
  const [isTableLocked, setIsTableLocked] = useState(() => {
    const saved = localStorage.getItem('clientsTableLocked');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('clientsTableColumns', JSON.stringify(columns));
  }, [columns]);

  // Sync table columns when form schema adds/removes fields
  useEffect(() => {
    setColumns((prev: any[]) => {
      const prevColsMap = new Map(prev.map((c: any) => [c.id, c]));
      const newCols: any[] = [];
      
      if (prevColsMap.has('index')) newCols.push(prevColsMap.get('index'));
      
      formSchema.forEach((field: any) => {
        if (prevColsMap.has(field.id)) {
          const existingCol = prevColsMap.get(field.id);
          existingCol.label = field.label; // Keep label in sync
          newCols.push(existingCol);
        } else {
          newCols.push({ id: field.id, label: field.label, width: 140 });
        }
      });
      
      if (prevColsMap.has('actions')) newCols.push(prevColsMap.get('actions'));
      
      return newCols;
    });
  }, [formSchema]);

  useEffect(() => {
    localStorage.setItem('clientsTableLocked', JSON.stringify(isTableLocked));
  }, [isTableLocked]);

  const [resizingCol, setResizingCol] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const startResize = (e: React.MouseEvent, colId: string, currentWidth: number) => {
    e.preventDefault();
    setResizingCol(colId);
    setStartX(e.clientX);
    setStartWidth(currentWidth);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingCol) {
        const diff = e.clientX - startX;
        setColumns((prev: any[]) => prev.map((c: any) => c.id === resizingCol ? { ...c, width: Math.max(45, startWidth + diff) } : c));
      }
    };
    const handleMouseUp = () => {
      if (resizingCol) {
        setResizingCol(null);
      }
    };
    if (resizingCol) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [resizingCol, startX, startWidth]);

  const filteredClients = clients.filter((c) => {
    if (filterName.trim() !== "") {
      const query = filterName.toLowerCase().trim();
      const matchesAny = Object.values(c).some(val => 
        typeof val === 'string' && val.toLowerCase().includes(query)
      );
      if (!matchesAny) return false;
    }
    return true;
  });

  const handleClearFilters = () => {
    setFilterName("");
  };

  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedClientIds(new Set(filteredClients.map(c => c.id)));
    } else {
      setSelectedClientIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedClientIds);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedClientIds(newSet);
  };

  const handleBulkDelete = () => {
    if (selectedClientIds.size === 0) return;
    setConfirmAction({
      type: 'bulkDelete',
      title: 'Delete Selected Clients',
      message: `Are you sure you want to delete ${selectedClientIds.size} selected clients?`,
      onConfirm: async () => {
        setConfirmAction(null);
        setIsUploading(true);
        try {
          const arr = Array.from(selectedClientIds);
          for (const id of arr) {
            await removeClient(id);
          }
          setSelectedClientIds(new Set());
        } catch (err) {
          console.error(err);
          alert("Failed to delete some clients.");
        } finally {
          setIsUploading(false);
        }
      }
    });
  };


  const isAnyFilterActive = filterName !== "";

  const parseDate = (dateStr: string) => {
    if (!dateStr) return 0;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [p0, p1, yyyy] = dateStr.split('/');
      const num0 = parseInt(p0, 10);
      // If p0 > 12, it's DD/MM/YYYY
      if (num0 > 12) {
        return new Date(`${yyyy}-${p1}-${p0}`).getTime();
      }
      return new Date(`${yyyy}-${p0}-${p1}`).getTime();
    }
    return new Date(dateStr).getTime() || 0;
  };

  const sortedClients = [...filteredClients].sort((a, b) => {
    const timeA = parseDate(a.onboardingDate);
    const timeB = parseDate(b.onboardingDate);
    const fallbackA = a.timestamp?.seconds || 0;
    const fallbackB = b.timestamp?.seconds || 0;
    
    if (timeA === timeB) {
      return sortOrder === "newest" ? fallbackB - fallbackA : fallbackA - fallbackB;
    }
    
    return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
  });

  const chronologicalClients = [...clients].sort((a, b) => {
    const timeA = parseDate(a.onboardingDate);
    const timeB = parseDate(b.onboardingDate);
    const fallbackA = a.timestamp?.seconds || 0;
    const fallbackB = b.timestamp?.seconds || 0;
    if (timeA === timeB) return fallbackA - fallbackB;
    return timeA - timeB;
  });

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(sortedClients.length / itemsPerPage));
  const displayedClients = sortedClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto h-full w-full text-black">
        {/* Page Header */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h2 className="font-headline font-extrabold text-xl md:text-2xl lg:text-3xl tracking-tight uppercase break-words max-w-[80vw]">
              <span className="text-primary-container">{brandName}'S</span> DATABASE
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center w-full lg:w-auto">
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImportCSV} 
            />
            {lastImportBatchId && (
              <button 
                onClick={handleUndoImport}
                disabled={isUploading}
                className="px-3.5 py-2 bg-red-100 text-red-900 neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 border-2 border-black shrink-0 active:translate-y-0.5 w-full md:w-auto hover:bg-red-200 disabled:opacity-50"
                title="Undo Last Import"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Undo
              </button>
            )}
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-2 bg-white text-black neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 border-2 border-black shrink-0 active:translate-y-0.5 w-full md:w-auto hover:bg-neutral-100 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isUploading ? "Importing..." : "Import"}
            </button>
            <button 
              onClick={() => {
                setEditingId(null);
                setFormData({});
                setInvoiceLinkType("url");
                setIsModalOpen(true);
              }}
              className="px-3.5 py-2 bg-primary-container text-white neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 border-2 border-black shrink-0 active:translate-y-0.5 w-full md:w-auto hover:opacity-90"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Client
            </button>
          </div>
        </div>

        {/* Main Table Container */}
        <div className="border-2 border-black bg-surface-container-lowest neu-shadow mb-8 md:mb-12 w-full flex flex-col">
          {/* Table Header Block */}
          <div className="bg-secondary-container border-b-2 border-black p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h3 className="font-headline font-bold text-base md:text-lg uppercase tracking-tight whitespace-nowrap">Client Profiles</h3>

            <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
              <div className="relative flex-1 md:w-64">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400 text-sm md:text-base">search</span>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="w-full h-[36px] md:h-[40px] pl-8 pr-3 py-1.5 border-2 border-black bg-white font-body text-xs outline-none focus:border-primary-container transition-colors"
                />
                {filterName && (
                  <button 
                    onClick={handleClearFilters}
                    className="absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400 hover:text-black text-sm"
                  >
                    close
                  </button>
                )}
              </div>

              <button 
                onClick={() => setIsTableLocked(!isTableLocked)}
                className={`h-[36px] w-[36px] md:h-[40px] md:w-[40px] shrink-0 p-1.5 border-2 border-black flex items-center justify-center transition-all ${isTableLocked ? 'bg-surface-container-lowest text-black hover:bg-surface-container-high' : 'bg-primary-container text-white'} `}
                title={isTableLocked ? "Unlock Table Layout" : "Lock Table Layout"}
              >
                <span className="material-symbols-outlined text-sm md:text-base">{isTableLocked ? "lock" : "lock_open_right"}</span>
              </button>

              {selectedClientIds.size > 0 && (
              <button 
                onClick={handleBulkDelete}
                disabled={isUploading}
                className="px-3.5 py-2 bg-red-500 text-white neu-shadow-sm font-headline font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 border-2 border-black shrink-0 active:translate-y-0.5 w-full md:w-auto hover:bg-red-600 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected ({selectedClientIds.size})
              </button>
            )}
            <button 
                onClick={() => setIsSchemaModalOpen(true)}
                className="h-[36px] w-[36px] md:h-[40px] md:w-[40px] shrink-0 p-1.5 border-2 border-black flex items-center justify-center transition-all bg-surface-container-lowest text-black hover:bg-surface-container-high"
                title="Customize Table & Form Fields"
              >
                <span className="material-symbols-outlined text-sm md:text-base">edit</span>
              </button>

              <button 
                onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
                className="h-[36px] w-[36px] md:h-[40px] md:w-[40px] shrink-0 p-1.5 border-2 border-black flex items-center justify-center transition-all bg-surface-container-lowest hover:bg-surface-container-high text-black"
                title={sortOrder === "newest" ? "Sort Oldest to Newest" : "Sort Newest to Oldest"}
              >
                <span className="material-symbols-outlined text-sm md:text-base">swap_vert</span>
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto w-full bg-white select-none">
            <table className="w-full text-left font-body text-xs border-collapse" style={{ tableLayout: 'fixed', minWidth: 'max-content' }}>
              <thead className="bg-neutral-100 font-headline uppercase text-[9px] md:text-[11px] tracking-wider">
                <tr className="border-b-2 border-black">
                  <th style={{ width: 40, minWidth: 40, maxWidth: 40 }} className="relative px-2 py-3 font-bold text-center border-r border-black">
                    <input type="checkbox" checked={selectedClientIds.size > 0 && selectedClientIds.size === filteredClients.length} onChange={handleSelectAll} className="w-3.5 h-3.5 accent-black cursor-pointer border-black border-2" />
                  </th>
                  {columns.map((col: any) => (
                    <th key={col.id} style={{ width: col.width, minWidth: col.width, maxWidth: col.width }} className="relative px-2 py-3 font-bold text-center border-r border-black group">
                      <span className="block truncate">{col.label}</span>
                      {!isTableLocked && (
                        <div 
                          onMouseDown={(e) => startResize(e, col.id, col.width)}
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-black/20 z-10"
                        />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white select-text">
                {loading && <tr><td colSpan={columns.length + 1} className="p-4 text-center font-bold border-b border-black">Loading clients...</td></tr>}
                {!loading && clients.length === 0 && <tr><td colSpan={columns.length + 1} className="p-4 text-center font-bold border-b border-black">No clients recorded.</td></tr>}
                {!loading && clients.length > 0 && filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="p-8 text-center border-b border-black">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-neutral-400">search_off</span>
                        <p className="font-headline font-bold text-sm uppercase">No matching clients found</p>
                        <p className="font-body text-xs text-neutral-500">Try adjusting your filter settings or clear all filters.</p>
                        <button
                          onClick={handleClearFilters}
                          className="mt-2 px-3 py-1 bg-white text-black text-xs font-headline font-bold uppercase tracking-wider border-2 border-black hover:bg-neutral-100 transition-colors"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && displayedClients.map((client, index) => (
                  <tr key={client.id} className="hover:bg-neutral-50/55 transition-colors border-b border-black last:border-b-0">
                    <td style={{ width: 40, minWidth: 40, maxWidth: 40 }} className="px-2 py-3 text-center border-r border-black overflow-hidden bg-white/50">
                      <input type="checkbox" checked={selectedClientIds.has(client.id)} onChange={(e) => handleSelectOne(client.id, e.target.checked)} className="w-3.5 h-3.5 accent-black cursor-pointer border-black border-2" />
                    </td>
                    {columns.map((col: any) => {
                      if (col.id === 'index') {
                        return (
                          <td key={col.id} style={{ width: col.width, minWidth: col.width, maxWidth: col.width }} className="px-2 py-3 font-mono font-bold text-center border-r border-black text-black truncate overflow-hidden">
                            {String(chronologicalClients.findIndex(c => c.id === client.id) + 1).padStart(2, '0')}
                          </td>
                        );
                      }
                      if (col.id === 'actions') {
                        return (
                          <td key={col.id} style={{ width: col.width, minWidth: col.width, maxWidth: col.width }} className="px-2 py-3 text-center overflow-hidden">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <button 
                                onClick={() => handleEdit(client)} 
                                className="p-1 border border-black bg-white hover:bg-neutral-100 text-black transition-all hover:scale-105 active:scale-95 shrink-0" 
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => setConfirmAction({
                                  type: 'singleDelete',
                                  title: 'Delete Client',
                                  message: 'Are you sure you want to delete this client?',
                                  onConfirm: async () => {
                                    setConfirmAction(null);
                                    try {
                                      await removeClient(client.id);
                                    } catch(err) {
                                      console.error(err);
                                    }
                                  }
                                })} 
                                className="p-1 border border-black bg-white hover:bg-red-50 text-red-600 transition-all hover:scale-105 active:scale-95 shrink-0" 
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        );
                      }

                      const field = formSchema.find((f: any) => f.id === col.id);
                      let displayVal: any = client[col.id];

                      if (field?.type === 'date') {
                        displayVal = formatDateToMMDDYYYY(displayVal);
                      } else if (field?.type === 'currency') {
                        displayVal = `$ ${Number(displayVal || 0).toLocaleString()}`;
                      } else if (field?.type === 'status') {
                        displayVal = displayVal ? (
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-headline font-black uppercase border-2 border-black tracking-wider ${
                            displayVal === 'Active' ? 'bg-green-100 text-green-800' :
                            displayVal === 'Paused' ? 'bg-amber-100 text-amber-800' :
                            displayVal === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-neutral-100 text-neutral-800'
                          }`}>
                            {displayVal}
                          </span>
                        ) : <span className="text-neutral-400">--</span>;
                      } else if (field?.type === 'url') {
                        displayVal = displayVal ? (
                          <a href={displayVal} target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold" title={displayVal}>
                            Link
                          </a>
                        ) : <span className="text-neutral-400">--</span>;
                      } else if (field?.type === 'invoice_link') {
                         const strVal = displayVal;
                         if (strVal && strVal.startsWith("app-invoice:")) {
                             const invId = strVal.substring(12);
                             const inv = pastInvoices.find((i) => i.id === invId);
                             const invName = inv?.invoiceNo || 'App Invoice';
                             displayVal = (
                               <button
                                 onClick={() => handleViewAppInvoice(invId)}
                                 className="text-red-500 underline font-bold"
                               >
                                 {invName}
                               </button>
                             );
                         } else if (strVal) {
                             displayVal = (
                               <a href={strVal} target="_blank" rel="noreferrer" className="text-red-500 underline font-bold" title={strVal}>
                                 External Invoice
                               </a>
                             );
                         } else {
                             displayVal = <span className="text-neutral-400">--</span>;
                         }
                      } else if (field?.type === 'agreement_link') {
                         const strVal = String(displayVal || '');
                         displayVal = strVal ? (
                           strVal.startsWith("app-agreement:") ? (
                             <button
                               onClick={() => handleViewAppAgreement(strVal.substring(14))}
                               className="text-blue-500 underline font-bold"
                             >
                               App Agreement
                             </button>
                           ) : (
                             <a href={strVal} target="_blank" rel="noreferrer" className="text-blue-500 underline font-bold" title={strVal}>
                               External Agreement
                             </a>
                           )
                         ) : <span className="text-neutral-400">--</span>;
                      }

                      return (
                        <td key={col.id} style={{ width: col.width, minWidth: col.width, maxWidth: col.width }} className="px-3 py-3 font-body font-medium text-left border-r border-black text-black text-xs whitespace-nowrap truncate overflow-hidden" title={typeof displayVal === 'string' ? displayVal : ''}>
                          {displayVal || <span className="text-neutral-400">--</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3 md:p-4 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-highest mt-auto">
            <span className="font-body font-bold text-xs md:text-sm uppercase tracking-tight">Showing {filteredClients.length === 0 ? 0 : Math.min(filteredClients.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredClients.length, currentPage * itemsPerPage)} of {filteredClients.length} Entries</span>
            <div className="flex flex-wrap gap-1 md:gap-2 justify-center">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-2 py-1 border border-black bg-surface-container-lowest font-bold text-xs hover:bg-surface-container-high disabled:opacity-50 transition-colors uppercase">PREV</button>
              {[...Array(totalPages)].map((_, i) => (
                 <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-2.5 py-1 border border-black font-bold text-xs transition-colors ${currentPage === i + 1 ? 'bg-neutral-200 text-black font-extrabold' : 'bg-surface-container-lowest hover:bg-surface-container-high'}`}>{i + 1}</button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-2 py-1 border border-black bg-surface-container-lowest font-bold text-xs hover:bg-surface-container-high disabled:opacity-50 transition-colors uppercase">NEXT</button>
            </div>
          </div>
        </div>
      </main>

      {/* Customize Fields Modal */}
      {isSchemaModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border-2 border-black neu-shadow w-full max-w-3xl mx-auto flex flex-col max-h-[90vh]">
            <div className="bg-secondary-container border-b-2 border-black p-4 md:p-6 flex justify-between items-center sticky top-0 text-black z-10">
              <h2 className="font-headline font-extrabold text-xl md:text-2xl uppercase tracking-tight">Customize Fields</h2>
              <button type="button" onClick={() => setIsSchemaModalOpen(false)} className="p-1 hover:bg-surface-container-high border-2 border-transparent hover:border-black transition-colors rounded-none outline-none">
                <span className="material-symbols-outlined font-bold">close</span>
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto flex-1 text-black bg-neutral-100/50">
              <p className="font-body text-xs md:text-sm text-neutral-600 mb-6 max-w-2xl">
                Add, remove, and rename fields to track custom client data. Changes made here will automatically update the "Add Client" form and the data table headers.
              </p>
              <div className="flex flex-col gap-4 w-full pb-2">
                {formSchema.map((field: any, index: number) => (
                  <div key={field.id} className="flex flex-col md:flex-row gap-4 p-4 border-2 border-black bg-white group items-start md:items-end">
                    <div className="flex-1 space-y-2 w-full">
                      <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Field Title</label>
                      <input
                        value={field.label}
                        onChange={(e) => updateFormSchema(field.id, 'label', e.target.value)}
                        className="w-full bg-surface-container-lowest border-2 border-black p-2 text-sm font-bold outline-none focus:border-primary-container transition-colors"
                        placeholder="e.g. Portfolio URL"
                      />
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Field Type</label>
                      <select
                        value={field.type}
                        onChange={(e) => updateFormSchema(field.id, 'type', e.target.value)}
                        className="w-full bg-surface-container-lowest border-2 border-black p-2 text-sm font-bold outline-none focus:border-primary-container transition-colors"
                      >
                        <option value="text">Text (Standard)</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="url">URL / Link</option>
                        <option value="currency">Currency Amount</option>
                        <option value="status">Status Dropdown</option>
                        <option value="invoice_link">App Invoice Linker</option>
                        <option value="agreement_link">App Agreement Linker</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-row gap-2 mt-4 md:mt-0 w-full md:w-auto self-end md:self-end">
                      <button onClick={() => moveFormField(index, 'up')} disabled={index === 0} className="flex-1 md:flex-none p-2 bg-neutral-100 border-2 border-black hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Move Up">
                        <span className="material-symbols-outlined text-sm block">arrow_upward</span>
                      </button>
                      <button onClick={() => moveFormField(index, 'down')} disabled={index === formSchema.length - 1} className="flex-1 md:flex-none p-2 bg-neutral-100 border-2 border-black hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Move Down">
                        <span className="material-symbols-outlined text-sm block">arrow_downward</span>
                      </button>
                      <button onClick={() => removeFormField(field.id)} className="flex-1 md:flex-none p-2 bg-red-50 border-2 border-red-500 hover:bg-red-100 text-red-600 transition-colors" title="Delete Field">
                        <span className="material-symbols-outlined text-sm block">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-center mt-6">
                  <button 
                    onClick={addFormField} 
                    type="button"
                    className="px-6 py-3 bg-primary-container text-white font-bold uppercase tracking-wider text-sm border-2 border-black hover:opacity-90 flex items-center gap-2 transition-all neu-shadow active:translate-y-0.5 active:shadow-none"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    Add New Field
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-secondary-container border-t-2 border-black p-4 flex justify-between">
              <button 
                type="button" 
                onClick={handleResetSchema}
                className="px-4 py-2 border-2 border-black bg-white hover:bg-neutral-100 font-headline font-bold text-xs md:text-sm transition-all uppercase text-red-600"
              >
                Reset to Default
              </button>
              <button 
                type="button" 
                onClick={() => setIsSchemaModalOpen(false)}
                className="px-6 py-2 border-2 border-black bg-white hover:bg-neutral-100 font-headline font-bold text-xs md:text-sm transition-all uppercase"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border-2 border-black neu-shadow w-full max-w-2xl mx-auto flex flex-col max-h-[90vh]">
            <div className="bg-secondary-container border-b-2 border-black p-4 md:p-6 flex justify-between items-center sticky top-0 text-black z-10">
              <h2 className="font-headline font-extrabold text-xl md:text-2xl uppercase tracking-tight">{editingId ? "Edit Client" : "Add New Client"}</h2>
              <div className="flex gap-2">
                <button type="button" onClick={closeModal} className="p-1 hover:bg-surface-container-high border-2 border-transparent hover:border-black transition-colors rounded-none outline-none">
                  <span className="material-symbols-outlined font-bold">close</span>
                </button>
              </div>
            </div>
            
            <div className="p-4 md:p-6 overflow-y-auto flex-1 text-black">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full pb-2">
                {formSchema.map((field: any, index: number) => {
                  let val = formData[field.id];
                  let setVal = (v: any) => setFormData(prev => ({ ...prev, [field.id]: v }));

                  let inputContent = null;
                  if (field.type === 'text' || field.type === 'url' || field.type === 'date' || field.type === 'number') {
                    inputContent = (
                      <input 
                        type={field.type} 
                        value={val || ''} 
                        onChange={e => setVal(e.target.value)} 
                        className={`w-full box-border min-w-0 appearance-none rounded-none h-11 md:h-12 bg-surface-container-lowest border-2 border-black px-3 focus:border-primary-container outline-none transition-all font-body font-medium ${field.type === 'date' ? '' : ''}`}
                        placeholder={field.type === 'url' ? 'https://...' : ''}
                      />
                    );
                  } else if (field.type === 'currency') {
                    const currencyKey = `${field.id}_currency`;
                    if (formData[currencyKey] !== '$') {
                      formData[currencyKey] = '$';
                    }
                    
                    inputContent = (
                      <div className="flex w-full">
                         <span className="bg-surface-container-lowest border-2 border-r-0 border-black px-3.5 h-11 md:h-12 flex items-center justify-center font-bold text-xs md:text-sm text-black">
                           $
                         </span>
                         <input 
                           type="number" 
                           value={val || ''} 
                           onChange={e => setVal(e.target.value)} 
                           className="w-full box-border min-w-0 appearance-none rounded-none h-11 md:h-12 bg-surface-container-lowest border-2 border-black px-3 focus:border-primary-container outline-none transition-all font-body font-medium" 
                           placeholder="0" 
                         />
                      </div>
                    );
                  } else if (field.type === 'status') {
                    inputContent = (
                      <select 
                        value={val || 'Active'} 
                        onChange={e => setVal(e.target.value)} 
                        className="w-full box-border min-w-0 rounded-none h-11 md:h-12 bg-surface-container-lowest border-2 border-black px-3 focus:border-primary-container outline-none transition-all font-body font-medium"
                      >
                        <option value="Active">Active</option>
                        <option value="Paused">Paused</option>
                        <option value="Completed">Completed</option>
                      </select>
                    );
                  } else if (field.type === 'invoice_link') {
                    if (invoiceLinkType === "url") {
                      inputContent = (
                        <input 
                          value={(val || "").startsWith("app-invoice:") ? "" : (val || "")} 
                          onChange={(e) => setVal(e.target.value)} 
                          className="w-full box-border min-w-0 appearance-none rounded-none h-11 md:h-12 bg-surface-container-lowest border-2 border-black px-3 focus:border-primary-container outline-none transition-all font-body font-medium" 
                          placeholder="https://drive.google.com/..." 
                          type="url" 
                        />
                      );
                    } else {
                      if (pastInvoices.length === 0) {
                        inputContent = (
                          <div className="w-full h-11 md:h-12 flex items-center justify-center bg-neutral-50 border-2 border-dashed border-black/30 text-center text-xs text-neutral-500 font-body px-2 leading-tight">
                            No invoices. <span className="font-bold underline cursor-pointer ml-1" onClick={() => { closeModal(); navigate('/invoices'); }}>Create one.</span>
                          </div>
                        );
                      } else {
                        inputContent = (
                          <select
                            value={(val || "").startsWith("app-invoice:") ? val : `app-invoice:${pastInvoices[0]?.id || ""}`}
                            onChange={(e) => setVal(e.target.value)}
                            className="w-full h-11 md:h-12 bg-surface-container-lowest border-2 border-black px-3 focus:border-primary-container outline-none font-body font-medium"
                          >
                            {pastInvoices.map((inv) => (
                              <option key={inv.id} value={`app-invoice:${inv.id}`}>
                                Inv #{inv.invoiceNo} - {inv.billedToName}
                              </option>
                            ))}
                          </select>
                        );
                      }
                    }
                  } else if (field.type === 'agreement_link') {
                    if (agreementLinkType === "url") {
                      inputContent = (
                        <input 
                          value={(val || "").startsWith("app-agreement:") ? "" : (val || "")} 
                          onChange={(e) => setVal(e.target.value)} 
                          className="w-full box-border min-w-0 appearance-none rounded-none h-11 md:h-12 bg-surface-container-lowest border-2 border-black px-3 focus:border-primary-container outline-none transition-all font-body font-medium" 
                          placeholder="https://drive.google.com/..." 
                          type="url" 
                        />
                      );
                    } else {
                      if (agreements.length === 0) {
                        inputContent = (
                          <div className="w-full h-11 md:h-12 flex items-center justify-center bg-neutral-50 border-2 border-dashed border-black/30 text-center text-xs text-neutral-500 font-body px-2 leading-tight">
                            No agreements. <span className="font-bold underline cursor-pointer ml-1" onClick={() => { closeModal(); navigate('/agreements'); }}>Create one.</span>
                          </div>
                        );
                      } else {
                        inputContent = (
                          <select
                            value={(val || "").startsWith("app-agreement:") ? val : `app-agreement:${agreements[0]?.id || ""}`}
                            onChange={(e) => setVal(e.target.value)}
                            className="w-full h-11 md:h-12 bg-surface-container-lowest border-2 border-black px-3 focus:border-primary-container outline-none font-body font-medium"
                          >
                            {agreements.map((agr) => (
                              <option key={agr.id} value={`app-agreement:${agr.id}`}>
                                {agr.title} - {agr.clientName}
                              </option>
                            ))}
                          </select>
                        );
                      }
                    }
                  }

                  return (
                    <div key={field.id} className="flex flex-col col-span-1 w-full gap-2">
                      <div className="flex items-end justify-between h-5">
                        <label className="font-headline font-bold text-[10px] md:text-xs uppercase tracking-wide truncate pr-2">{field.label}</label>
                        {field.type === 'invoice_link' && (
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setInvoiceLinkType("url");
                                setVal("");
                              }}
                              className={`px-1.5 py-0.5 text-[9px] font-headline font-black uppercase tracking-wider border-2 border-black transition-all ${invoiceLinkType === "url" ? "bg-neutral-200 text-black font-extrabold" : "bg-white text-black hover:bg-neutral-100"}`}
                            >
                              URL
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setInvoiceLinkType("app");
                                if (pastInvoices.length > 0 && !(val || "").startsWith("app-invoice:")) {
                                  setVal(`app-invoice:${pastInvoices[0].id}`);
                                } else if (pastInvoices.length === 0) {
                                  setVal("");
                                }
                              }}
                              className={`px-1.5 py-0.5 text-[9px] font-headline font-black uppercase tracking-wider border-2 border-black transition-all ${invoiceLinkType === "app" ? "bg-neutral-200 text-black font-extrabold" : "bg-white text-black hover:bg-neutral-100"}`}
                            >
                              APP
                            </button>
                          </div>
                        )}
                        {field.type === 'agreement_link' && (
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setAgreementLinkType("url");
                                setVal("");
                              }}
                              className={`px-1.5 py-0.5 text-[9px] font-headline font-black uppercase tracking-wider border-2 border-black transition-all ${agreementLinkType === "url" ? "bg-neutral-200 text-black font-extrabold" : "bg-white text-black hover:bg-neutral-100"}`}
                            >
                              URL
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAgreementLinkType("app");
                                if (agreements.length > 0 && !(val || "").startsWith("app-agreement:")) {
                                  setVal(`app-agreement:${agreements[0].id}`);
                                } else if (agreements.length === 0) {
                                  setVal("");
                                }
                              }}
                              className={`px-1.5 py-0.5 text-[9px] font-headline font-black uppercase tracking-wider border-2 border-black transition-all ${agreementLinkType === "app" ? "bg-neutral-200 text-black font-extrabold" : "bg-white text-black hover:bg-neutral-100"}`}
                            >
                              APP
                            </button>
                          </div>
                        )}
                      </div>
                      {inputContent}
                    </div>
                  );
                })}
                
              </div>
            </div>
            
            <div className="border-t-2 border-black p-4 md:p-6 bg-surface-container-high flex justify-end gap-3 md:gap-4 sticky bottom-0">
              <button 
                type="button"
                onClick={closeModal}
                className="px-4 md:px-6 py-2 md:py-3 border-2 border-black bg-surface-container-lowest font-headline font-bold uppercase tracking-wide text-sm hover:bg-surface-container-highest transition-colors text-black"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button 
                onClick={(e) => handleSave(e)} 
                disabled={isUploading} 
                className="px-6 md:px-8 py-2 md:py-3 bg-primary-container text-on-primary border-2 border-black neu-shadow neu-button font-headline font-bold uppercase tracking-wide text-sm transition-all text-white hover:translate-y-0.5 hover:shadow-none disabled:opacity-75 disabled:cursor-wait"
              >
                {isUploading ? 'UPLOADING...' : (editingId ? 'UPDATE CLIENT' : 'SAVE CLIENT')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Action Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border-2 border-black neu-shadow w-full max-w-sm flex flex-col">
            <div className="bg-secondary-container border-b-2 border-black p-4 text-black">
              <h3 className="font-headline font-extrabold text-lg uppercase tracking-tight">{confirmAction.title}</h3>
            </div>
            <div className="p-4 bg-white text-black font-body text-sm">
              {confirmAction.message}
            </div>
            <div className="bg-neutral-100 border-t-2 border-black p-4 flex justify-end gap-3">
              <button 
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border-2 border-black bg-white hover:bg-neutral-100 font-headline font-bold text-xs uppercase transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction.onConfirm}
                className="px-4 py-2 border-2 border-black bg-red-500 hover:bg-red-600 text-white font-headline font-bold text-xs uppercase transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};
export default Clients;
