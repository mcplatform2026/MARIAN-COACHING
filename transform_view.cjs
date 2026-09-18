const fs = require('fs');
let code = fs.readFileSync('src/pages/InvoiceView.tsx', 'utf8');

// Update imports
code = code.replace('import { useLocation } from "react-router-dom";', 'import { useParams, Link } from "react-router-dom";');
code = code.replace('export function Invoices() {', 'export function InvoiceView() {\n  const { uid, id } = useParams<{ uid: string; id: string }>();\n  const [loading, setLoading] = useState(true);\n  const [notFound, setNotFound] = useState(false);\n');

// Find and replace the load logic
code = code.replace(/useEffect\(\(\) => \{\n    const loadInvoices = \(\) => \{[\s\S]*?loadInvoices\(\);\n  \}, \[\]\);/, `
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!uid || !id) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        const { getDoc } = await import('firebase/firestore');
        const docRef = doc(db, \`users/\${uid}/invoices/\${id}\`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as SavedInvoice;
          
          setLogoImage(data.logoImage || null);
          setBrandNamePart1(data.brandNamePart1 || "");
          setBrandNamePart2(data.brandNamePart2 || "");
          setInvoiceTheme(data.invoiceTheme || "classic");
          setInvoiceTypography(data.invoiceTypography || "modern");
          setThankYouMessage(data.thankYouMessage || "THANK YOU FOR YOUR BUSINESS");
          setBilledToName(data.billedToName || "");
          setBilledToEmail(data.billedToEmail || "");
          setInvoiceDate(data.invoiceDate || "");
          setInvoiceNo(data.invoiceNo || "");
          setItems(data.items || []);
          setExactTerms(data.exactTerms || "");
          setPaymentDetails(data.paymentDetails || "");
          setSignatureName(data.signatureName || "");
          setSignatureWritten(data.signatureWritten || "");
          setSignatureFontClass(data.signatureFontClass || "font-writing-1");
          setSignatureImage(data.signatureImage || null);
          setSignatureImageScale(data.signatureImageScale ?? 100);
          setPhone(data.phone || "");
          setEmail(data.email || "");
          setWebsite(data.website || "");
          setCurrencySymbol(data.currencySymbol || "$");
          setSubtextStyle(data.subtextStyle || "opacity-60");
          
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [uid, id]);
`);

// Now replace the main return statement
const mainReturnRegex = /return \([\s\S]*?\n\);/g;
const returnMatches = code.match(mainReturnRegex);

// Oh wait, there are multiple returns.
fs.writeFileSync('src/pages/InvoiceView.tsx', code);
