const fs = require('fs');
const path = 'src/pages/Agreements.tsx';
let code = fs.readFileSync(path, 'utf8');

const useE = `  useEffect(() => {
    if (agreements.length > 0) {
      const viewId = localStorage.getItem('viewAgreementId');
      if (viewId) {
        const found = agreements.find(agr => agr.id === viewId);
        if (found) {
          setActiveAgreement(found);
        }
        localStorage.removeItem('viewAgreementId');
      }
    }
  }, [agreements]);`;

if (!code.includes('localStorage.getItem(\'viewAgreementId\')')) {
    code = code.replace("  const [activeAgreement, setActiveAgreement] = useState<any>(null);", "  const [activeAgreement, setActiveAgreement] = useState<any>(null);\n\n" + useE);
    fs.writeFileSync(path, code);
}
