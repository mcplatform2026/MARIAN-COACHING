import { useEffect, useRef } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthProvider";

export function BrandSync() {
  const { user } = useAuth();
  
  // Keep track of the last values from/to Firestore to prevent infinite feedback loops
  const lastDbName = useRef<string | null>(null);
  const lastDbColor = useRef<string | null>(null);
  const lastInvoiceLogoData = useRef<string | null>(null);
  const lastAgreementLogo = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);

    // 1. Listen for Firestore changes (Incoming updates from cloud/other devices)
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : {};
      
      const dbName = data.brandName;
      const dbColor = data.brandColor;
      const dbInvoiceLogoData = data.invoiceLogoData;
      const dbAgreementLogo = data.agreementLogo;

      const localName = localStorage.getItem("brandName");
      const localColor = localStorage.getItem("brandColor");
      const localInvoiceLogoData = localStorage.getItem("invoiceLogoData");
      const localAgreementLogo = localStorage.getItem("agreementLogo");

      let needsWrite = false;
      const writeData: any = {};

      // Handle brandName
      if (dbName) {
        if (localName !== dbName) {
          localStorage.setItem("brandName", dbName);
          window.dispatchEvent(new Event("brandNameChange"));
        }
        lastDbName.current = dbName;
      } else if (localName) {
        writeData.brandName = localName;
        lastDbName.current = localName;
        needsWrite = true;
      }

      // Handle brandColor
      if (dbColor) {
        if (localColor !== dbColor) {
          localStorage.setItem("brandColor", dbColor);
          window.dispatchEvent(new Event("brandColorChange"));
        }
        lastDbColor.current = dbColor;
      } else if (localColor) {
        writeData.brandColor = localColor;
        lastDbColor.current = localColor;
        needsWrite = true;
      }

      // Handle invoiceLogoData
      if (dbInvoiceLogoData) {
        if (localInvoiceLogoData !== dbInvoiceLogoData) {
          localStorage.setItem("invoiceLogoData", dbInvoiceLogoData);
          window.dispatchEvent(new Event("invoiceLogoChange"));
        }
        lastInvoiceLogoData.current = dbInvoiceLogoData;
      } else if (localInvoiceLogoData) {
        writeData.invoiceLogoData = localInvoiceLogoData;
        lastInvoiceLogoData.current = localInvoiceLogoData;
        needsWrite = true;
      }

      // Handle agreementLogo
      if (dbAgreementLogo) {
        if (localAgreementLogo !== dbAgreementLogo) {
          localStorage.setItem("agreementLogo", dbAgreementLogo);
          window.dispatchEvent(new Event("agreementLogoChange"));
        }
        lastAgreementLogo.current = dbAgreementLogo;
      } else if (localAgreementLogo) {
        writeData.agreementLogo = localAgreementLogo;
        lastAgreementLogo.current = localAgreementLogo;
        needsWrite = true;
      }

      if (needsWrite) {
        setDoc(userDocRef, writeData, { merge: true }).catch(err => {
          console.error("Error syncing local brand settings to Firestore:", err);
        });
      }
    });

    // 2. Listen for local change events (Outgoing updates when user edits via UI)
    let syncTimeout: any = null;
    const syncLocalToFirestore = () => {
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
      syncTimeout = setTimeout(async () => {
        const localName = localStorage.getItem("brandName") || "LOREM IPSUM";
        const localColor = localStorage.getItem("brandColor") || "#6933ff";
        const localInvoiceLogoData = localStorage.getItem("invoiceLogoData");
        const localAgreementLogo = localStorage.getItem("agreementLogo");

        // Only write to database if the local values are different from the last known database values
        if (
          localName !== lastDbName.current || 
          localColor !== lastDbColor.current ||
          localInvoiceLogoData !== lastInvoiceLogoData.current ||
          localAgreementLogo !== lastAgreementLogo.current
        ) {
          lastDbName.current = localName;
          lastDbColor.current = localColor;
          lastInvoiceLogoData.current = localInvoiceLogoData;
          lastAgreementLogo.current = localAgreementLogo;

          const updatePayload: any = {
            brandName: localName,
            brandColor: localColor,
          };
          if (localInvoiceLogoData) updatePayload.invoiceLogoData = localInvoiceLogoData;
          if (localAgreementLogo) updatePayload.agreementLogo = localAgreementLogo;

          try {
            await setDoc(userDocRef, updatePayload, { merge: true });
          } catch (err) {
            console.error("Error saving brand settings to Firestore:", err);
          }
        }
      }, 500); // 500ms debounce
    };

    window.addEventListener("brandNameChange", syncLocalToFirestore);
    window.addEventListener("brandColorChange", syncLocalToFirestore);
    window.addEventListener("invoiceLogoChange", syncLocalToFirestore);
    window.addEventListener("agreementLogoChange", syncLocalToFirestore);

    // Run initial sync check immediately
    syncLocalToFirestore();

    return () => {
      unsubscribe();
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
      window.removeEventListener("brandNameChange", syncLocalToFirestore);
      window.removeEventListener("brandColorChange", syncLocalToFirestore);
      window.removeEventListener("invoiceLogoChange", syncLocalToFirestore);
      window.removeEventListener("agreementLogoChange", syncLocalToFirestore);
    };
  }, [user]);

  return null; // This is a background synchronization component
}
