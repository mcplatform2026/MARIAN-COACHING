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

const ProtectedRoute = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
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

