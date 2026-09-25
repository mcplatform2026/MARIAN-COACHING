import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  UsersRound, 
  CalendarDays, 
  ReceiptText, 
  FileSignature, 
  TrendingUp,
  ListTodo,
  X,
  Check,
  Edit2,
  User,
  LogOut,
  Palette
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useTasks } from "../hooks/useTasks";
import { useSessions } from "../hooks/useSessions";
import { signOut, db } from "../lib/firebase";
import { collection, query, where, onSnapshot, setDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, isCollaborator, ownerEmail } = useAuth();
  const { tasks } = useTasks();
  const { sessions } = useSessions();
  const todoTasksCount = tasks.filter(t => t.status === "todo").length;
  const upcomingAppointmentsCount = sessions.filter(s => s.status === "Upcoming").length;
  const navigate = useNavigate();

  const [hexColor, setHexColor] = useState(() => localStorage.getItem('brandColor') || '#6933ff');
  const [brandName, setBrandName] = useState(() => localStorage.getItem('brandName') || 'LOREM IPSUM');

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(brandName);

  const [collabEmail, setCollabEmail] = useState("");
  const [addingCollab, setAddingCollab] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);

  useEffect(() => {
    if (!user || isCollaborator) return;
    const q = query(collection(db, "collaborators"), where("ownerUid", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: string[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.id);
      });
      setCollaborators(list);
    }, (error) => {
      console.error("Error listening to collaborators:", error);
    });
    return () => unsub();
  }, [user, isCollaborator]);

  useEffect(() => {
    setCollabEmail(collaborators[0] || "");
  }, [collaborators]);

  const handleSaveCollab = async (targetEmailValue: string) => {
    if (!user || isCollaborator) return;
    const cleanEmail = targetEmailValue.trim().toLowerCase();
    const currentActiveCollab = collaborators[0] || "";

    if (!cleanEmail) {
      if (currentActiveCollab) {
        try {
          await deleteDoc(doc(db, "collaborators", currentActiveCollab));
        } catch (err: any) {
          console.error("Error removing collaborator:", err);
        }
      }
      return;
    }

    if (!cleanEmail.includes("@")) {
      alert("Please enter a valid Gmail address.");
      setCollabEmail(currentActiveCollab);
      return;
    }

    if (cleanEmail === user.email?.toLowerCase().trim()) {
      alert("You cannot add yourself as a collaborator.");
      setCollabEmail(currentActiveCollab);
      return;
    }

    if (cleanEmail !== currentActiveCollab) {
      setAddingCollab(true);
      try {
        if (currentActiveCollab) {
          await deleteDoc(doc(db, "collaborators", currentActiveCollab));
        }
        await setDoc(doc(db, "collaborators", cleanEmail), {
          collaboratorEmail: cleanEmail,
          ownerUid: user.uid,
          ownerEmail: user.email || "",
          createdAt: serverTimestamp()
        });
      } catch (err: any) {
        console.error("Error updating collaborator:", err);
        alert(`Error: ${err.message || "Failed to update collaborator"}`);
        setCollabEmail(currentActiveCollab);
      } finally {
        setAddingCollab(false);
      }
    }
  };

  const handleAddCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveCollab(collabEmail);
  };

  const handleRemoveCollab = async (email: string) => {
    if (!user || isCollaborator) return;
    try {
      await deleteDoc(doc(db, "collaborators", email));
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleNameChange = () => {
      const name = localStorage.getItem('brandName') || 'LOREM IPSUM';
      setBrandName(name);
      setTempName(name);
    };
    window.addEventListener('brandNameChange', handleNameChange);

    const handleColorChangeEvt = () => {
      const color = localStorage.getItem('brandColor') || '#6933ff';
      setHexColor(color);
    };
    window.addEventListener('brandColorChange', handleColorChangeEvt);

    return () => {
      window.removeEventListener('brandNameChange', handleNameChange);
      window.removeEventListener('brandColorChange', handleColorChangeEvt);
    };
  }, []);

  const handleColorChange = (newColor: string) => {
    setHexColor(newColor);
    localStorage.setItem('brandColor', newColor || '#6933ff');
    window.dispatchEvent(new Event('brandColorChange'));
  };

  const handleBrandNameChange = (newName: string) => {
    setBrandName(newName);
    localStorage.setItem('brandName', newName || 'ARYANN DESIGNS');
    window.dispatchEvent(new Event('brandNameChange'));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <aside 
      className={`bg-neutral-50 dark:bg-neutral-900 text-blue-600 dark:text-blue-500 font-headline font-bold uppercase tracking-tight h-screen w-56 border-r-2 border-black dark:border-white fixed left-0 top-0 flex flex-col z-50 transition-transform duration-200 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="p-4 border-b-2 border-black dark:border-white flex justify-between items-center gap-2">
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleBrandNameChange(tempName);
                    setIsEditingName(false);
                  } else if (e.key === 'Escape') {
                    setTempName(brandName);
                    setIsEditingName(false);
                  }
                }}
                autoFocus
                onBlur={() => {
                  handleBrandNameChange(tempName);
                  setIsEditingName(false);
                }}
                className="text-xs font-black text-black dark:text-white uppercase leading-none tracking-tighter bg-white dark:bg-neutral-800 border-2 border-black focus:outline-none px-1 py-0.5 w-full rounded-none"
              />
              <button
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent blur before clicking
                  handleBrandNameChange(tempName);
                  setIsEditingName(false);
                }}
                className="p-1 border-2 border-black bg-white dark:bg-neutral-800 text-green-600 dark:text-green-400 hover:bg-neutral-100 transition-colors"
                title="Save Name"
              >
                <Check size={14} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <div className="group/name flex items-center gap-1 flex-wrap">
              <h1 
                className="text-lg md:text-xl font-black uppercase leading-none tracking-tighter break-all"
                style={{ color: hexColor }}
              >
                {brandName}
              </h1>
              <button
                onClick={() => {
                  setTempName(brandName);
                  setIsEditingName(true);
                }}
                className="opacity-40 group-hover/name:opacity-100 focus:opacity-100 text-neutral-500 hover:text-black dark:hover:text-white transition-opacity p-0.5 flex items-center justify-center"
                title="Edit Brand Name"
              >
                <Edit2 size={14} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
        <button className="lg:hidden p-1 border-2 border-black bg-white active:bg-gray-200 shrink-0" onClick={onClose}>
          <X size={18} strokeWidth={3} className="text-black" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto pt-0 pb-2">
        <ul className="space-y-0.5">
          <li>
            <NavLink
              to="/"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-xs font-headline font-bold transition-transform hover:translate-x-1 ${
                  isActive
                    ? "text-white bg-blue-600 dark:bg-blue-600 border-y-2 border-black dark:border-white"
                    : "text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`
              }
            >
              <LayoutDashboard size={20} strokeWidth={2.5} className="anim-float" /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/clients"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-xs font-headline font-bold transition-transform hover:translate-x-1 ${
                  isActive
                    ? "text-white bg-blue-600 dark:bg-blue-600 border-y-2 border-black dark:border-white"
                    : "text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`
              }
            >
              <UsersRound size={20} strokeWidth={2.5} className="anim-wiggle" /> Clients
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/tasks"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-xs font-headline font-bold transition-transform hover:translate-x-1 ${
                  isActive
                    ? "text-white bg-blue-600 dark:bg-blue-600 border-y-2 border-black dark:border-white"
                    : "text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <ListTodo size={20} strokeWidth={2.5} className="anim-bounce-right" />
                  <span className="flex-1">Task Tracker</span>
                  {todoTasksCount > 0 && (
                    <span className={`px-1.5 py-0.5 text-[9px] rounded-full min-w-[18px] text-center ${isActive ? 'bg-white text-black' : 'bg-black text-white'}`}>{todoTasksCount}</span>
                  )}
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/appointments"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-xs font-headline font-bold transition-transform hover:translate-x-1 ${
                  isActive
                    ? "text-white bg-blue-600 dark:bg-blue-600 border-y-2 border-black dark:border-white"
                    : "text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <CalendarDays size={20} strokeWidth={2.5} className="anim-ring" />
                  <span className="flex-1">Appointments</span>
                  {upcomingAppointmentsCount > 0 && (
                    <span className={`px-1.5 py-0.5 text-[9px] rounded-full min-w-[18px] text-center ${isActive ? 'bg-white text-black' : 'bg-black text-white'}`}>{upcomingAppointmentsCount}</span>
                  )}
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/invoices"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-xs font-headline font-bold transition-transform hover:translate-x-1 ${
                  isActive
                    ? "text-white bg-blue-600 dark:bg-blue-600 border-y-2 border-black dark:border-white"
                    : "text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`
              }
            >
              <ReceiptText size={20} strokeWidth={2.5} className="anim-pulse-slow" /> Invoices
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/agreements"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-xs font-headline font-bold transition-transform hover:translate-x-1 ${
                  isActive
                    ? "text-white bg-blue-600 dark:bg-blue-600 border-y-2 border-black dark:border-white"
                    : "text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`
              }
            >
              <FileSignature size={20} strokeWidth={2.5} className="anim-write" /> Agreements
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/report" 
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-xs font-headline font-bold transition-transform hover:translate-x-1 ${
                  isActive
                    ? "text-white bg-blue-600 dark:bg-blue-600 border-y-2 border-black dark:border-white"
                    : "text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`
              }
            >
              <TrendingUp size={20} strokeWidth={2.5} className="anim-bounce-right" /> Monthly Report
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* User Profile Block */}
      <div className="mt-auto border-t-2 border-black bg-surface-container-low p-1.5 pt-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-7 h-7 border-2 border-black rounded-full overflow-hidden shrink-0 bg-white flex items-center justify-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <User size={14} strokeWidth={2.5} className="text-black" />
            )}
          </div>
          <div className="flex-1 min-w-0">
             <p className="font-headline font-bold text-[14px] text-black truncate leading-normal">{user?.displayName || "Studio Admin"}</p>
             <p className="font-body font-medium text-[12px] text-outline truncate lowercase tracking-normal leading-normal mt-0.5">{user?.email}</p>
             {isCollaborator && ownerEmail && (
               <p className="font-headline text-[7px] bg-green-100 text-green-800 border border-black px-1 py-0 rounded-none mt-0.5 inline-block uppercase font-bold tracking-wider leading-none">
                 Collab with {ownerEmail}
               </p>
             )}
          </div>
        </div>

        {/* Collaborators section */}
        {!isCollaborator && user && (
          <div className="mb-2 pt-1 border-t border-black/10">
            <p className="font-headline font-bold text-[8px] text-neutral-500 uppercase tracking-widest mb-1">
              Collaborator
            </p>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveCollab(collabEmail);
              }}
              className="w-full flex gap-1"
            >
              <input
                type="text"
                placeholder="Add collaborator Gmail..."
                value={collabEmail}
                onChange={(e) => setCollabEmail(e.target.value)}
                disabled={addingCollab}
                className="flex-1 h-7 px-2 text-[12px] border-2 border-black bg-white focus:outline-none normal-case font-body text-black min-w-0"
              />
              <button
                type="submit"
                disabled={addingCollab}
                className="px-2 h-7 border-2 border-black bg-white text-black active:bg-gray-100 hover:bg-neutral-100 font-bold text-[10px] flex items-center justify-center shrink-0"
              >
                Save
              </button>
            </form>
          </div>
        )}

        <button 
          onClick={handleLogout}
          className="w-full px-2 py-0.5 border-2 border-black bg-white text-black font-bold text-[9px] flex items-center justify-center gap-1.5 hover:bg-red-500 hover:text-white transition-colors"
        >
          <LogOut size={12} strokeWidth={2.5} /> Sign Out
        </button>

        {/* Branding Customizer */}
        <div className="mt-3 pt-2.5 border-t border-black/20 space-y-2.5">
          {/* Custom Brand Color */}
          <div>
            <p className="font-headline font-extrabold text-[9px] uppercase tracking-wider text-black dark:text-white mb-1 flex items-center gap-1 justify-center">
              <Palette size={14} strokeWidth={2.5} /> Custom Brand Color
            </p>
            <div className="flex gap-1 items-center">
              <div className="relative flex items-center justify-center border-2 border-black w-7 h-7 shrink-0 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer rounded-none">
                <input 
                  type="color" 
                  value={hexColor.startsWith('#') ? hexColor : `#${hexColor}`} 
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                <div 
                  className="w-3.5 h-3.5 border border-black/35"
                  style={{ backgroundColor: hexColor.startsWith('#') ? hexColor : `#${hexColor}` }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="#2563EB"
                  value={hexColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  maxLength={7}
                  className="w-full h-7 px-1.5 font-mono text-[9px] border-2 border-black bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white uppercase focus:outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>
          
          
        </div>
      </div>
    </aside>
  );
}
