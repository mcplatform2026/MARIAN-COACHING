import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useState, useEffect } from "react";

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [brandName, setBrandName] = useState(() => localStorage.getItem('brandName') || 'LOREM IPSUM');

  useEffect(() => {
    const handleNameChange = () => {
      setBrandName(localStorage.getItem('brandName') || 'LOREM IPSUM');
    };
    window.addEventListener('brandNameChange', handleNameChange);
    return () => {
      window.removeEventListener('brandNameChange', handleNameChange);
    };
  }, []);

  return (
    <div className="min-h-screen flex bg-surface text-on-surface antialiased">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen w-full overflow-hidden relative">
        {/* Mobile-only Header for Sidebar Toggle */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b-2 border-black bg-surface-container-lowest z-30 sticky top-0">
           <h1 className="text-xl font-headline font-black text-primary-container uppercase tracking-tight truncate max-w-[70%]">{brandName}</h1>
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 border-2 border-black bg-white select-none neu-shadow-sm active:translate-y-0.5 active:shadow-none transition-all">
             <span className="material-symbols-outlined block">menu</span>
           </button>
        </div>
        
        {/* Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 lg:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        <Outlet />
      </div>
    </div>
  );
}
