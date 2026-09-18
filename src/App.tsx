/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Clients } from "./pages/Clients";
import { Dashboard } from "./pages/Dashboard";
import { Invoices } from "./pages/Invoices";
import { Sessions } from "./pages/Sessions";
import { MonthlyReport } from "./pages/MonthlyReport";
import { Agreements } from "./pages/Agreements";
import { TaskTracker } from "./pages/TaskTracker";
import { AgreementView } from "./pages/AgreementView";
import { InvoiceView } from "./pages/InvoiceView";
import { DocumentView } from "./pages/DocumentView";

import { Login } from "./pages/Login";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { CloudStorageSync } from "./components/CloudStorageSync";
import { BrandSync } from "./components/BrandSync";
import { isEmailAuthorized } from "./lib/authorizedEmails";
import { auth } from "./lib/firebase";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f2ec] flex items-center justify-center p-4">
        <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
          <p className="font-headline font-bold text-xs uppercase tracking-wider animate-pulse text-neutral-700">Verifying authorized access...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!isEmailAuthorized(user.email)) {
    return (
      <div className="min-h-screen bg-[#f4f2ec] flex items-center justify-center p-4">
        <div className="max-w-md w-full border-2 border-black bg-white p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
          <div className="w-12 h-12 border-2 border-black bg-red-100 text-red-600 font-black text-2xl flex items-center justify-center mx-auto mb-4">
            !
          </div>
          <h2 className="font-headline font-black text-lg uppercase tracking-tight text-neutral-900 mb-2">
            Access Restricted
          </h2>
          <p className="text-xs text-neutral-600 font-body mb-5 leading-relaxed">
            Your account (<strong className="text-black">{user.email || 'unknown'}</strong>) is not on the authorized administrator list for Marian Coaching.
          </p>
          <button
            onClick={() => auth.signOut()}
            className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white font-headline font-bold text-xs uppercase tracking-wider border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Sign Out / Switch Account
          </button>
        </div>
      </div>
    );
  }
  return <Layout />;
};

export default function App() {
  const [brandColor, setBrandColor] = useState(() => localStorage.getItem("brandColor") || "#6933ff");

  useEffect(() => {
    if (window.location.search.includes('close_after_auth=true')) {
      try {
        window.opener?.postMessage('handshake_complete', window.location.origin);
      } catch (e) {}
      window.close();
    }
  }, []);

  useEffect(() => {
    const handleColorChange = () => {
      setBrandColor(localStorage.getItem("brandColor") || "#6933ff");
    };
    window.addEventListener("brandColorChange", handleColorChange);
    return () => window.removeEventListener("brandColorChange", handleColorChange);
  }, []);

  return (
    <AuthProvider>
      <CloudStorageSync>
      <BrandSync />
      <style>{`
        :root {
          --color-primary-container: ${brandColor} !important;
          --color-primary: ${brandColor} !important;
          --color-surface-tint: ${brandColor} !important;
        }
        .bg-primary-container {
          background-color: ${brandColor} !important;
        }
        .text-primary-container {
          color: ${brandColor} !important;
        }
        .border-primary-container {
          border-color: ${brandColor} !important;
        }
        .focus\\:border-primary-container:focus {
          border-color: ${brandColor} !important;
        }
        .bg-blue-600 {
          background-color: ${brandColor} !important;
        }
        .text-blue-600 {
          color: ${brandColor} !important;
        }
        .border-blue-600 {
          border-color: ${brandColor} !important;
        }
        .hover\\:bg-blue-600:hover {
          background-color: ${brandColor} !important;
        }
        .hover\\:text-blue-600:hover {
          color: ${brandColor} !important;
        }
        .peer-checked\\:bg-primary-container:checked ~ div {
          background-color: ${brandColor} !important;
        }
        .group-hover\\:text-primary-container:group-hover {
          color: ${brandColor} !important;
        }
        tr:hover td.group-hover\\:text-primary-container {
          color: ${brandColor} !important;
        }
      `}</style>
      <Routes>
                <Route path="/login" element={<Login />} />
        <Route path="/agreement/:uid/:id" element={<AgreementView />} />
        <Route path="/inv/:uid/:id" element={<InvoiceView />} />
        <Route path="/i/:id" element={<InvoiceView />} />
        <Route path="/a/:id" element={<AgreementView />} />
        <Route path="/invoice/:uid/:id" element={<InvoiceView />} />
        <Route path="/document" element={<DocumentView />} />
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="appointments" element={<Sessions />} />
                    <Route path="report" element={<MonthlyReport />} />
          <Route path="agreements" element={<Agreements />} />
          <Route path="tasks" element={<TaskTracker />} />
        </Route>
      </Routes>
      </CloudStorageSync>
    </AuthProvider>
  );
}

