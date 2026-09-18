const fs = require('fs');
let code = fs.readFileSync('src/pages/InvoiceView.tsx', 'utf8');

const imports = `import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { Download, AlertCircle, RefreshCw } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const themes: Record<string, any> = {
  white: { bg: '#ffffff', text: '#000000', border: '#000000', rowSeparator: '#e5e5e5' },
  alabaster: { bg: '#FAFAF8', text: '#1A1A1A', border: '#1A1A1A', rowSeparator: '#e5e5e5' },
  nordic: { bg: '#F0F4F8', text: '#2D3748', border: '#2D3748', rowSeparator: '#cbd5e0' },
  sage: { bg: '#F4F5F0', text: '#2C3329', border: '#2C3329', rowSeparator: '#d1d5db' },
  classic: { bg: "#ffffff", text: "#171717", border: "#e5e5e5", accent: "#000000" },
  dark: { bg: "#0a0a0a", text: "#f5f5f5", border: "#262626", accent: "#ffffff" },
  warm: { bg: "#fdfbf7", text: "#2c2825", border: "#e8e1d9", accent: "#d4a373" },
  cool: { bg: "#f8fafc", text: "#0f172a", border: "#e2e8f0", accent: "#3b82f6" },
  neon: { bg: "#000000", text: "#ffffff", border: "#333333", accent: "#ccff00" },
};
`;

fs.writeFileSync('src/pages/InvoiceView.tsx', imports + code);
console.log('Fixed InvoiceView imports');
