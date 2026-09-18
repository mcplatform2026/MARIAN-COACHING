import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    text = f.read()

target = """  const [viewMode, setViewMode] = useState<'Monthly' | 'Yearly' | 'AllTime'>('Monthly');
  const [currency, setCurrency] = useState(() => localStorage.getItem('dashboardCurrency') || '$');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());"""

replace = """  const [viewMode, setViewMode] = useState<'Monthly' | 'Yearly' | 'AllTime'>('Monthly');
  const [currency, setCurrency] = useState(() => localStorage.getItem('dashboardCurrency') || '$');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const location = window.location;
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const viewParam = searchParams.get('view');
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    
    if (viewParam === 'Monthly' || viewParam === 'Yearly' || viewParam === 'AllTime') {
      setViewMode(viewParam);
    }
    
    if (yearParam && !isNaN(Number(yearParam))) {
      setSelectedYear(Number(yearParam));
    }
    
    if (monthParam) {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const mIndex = months.findIndex(m => m.toLowerCase() === monthParam.toLowerCase());
      if (mIndex !== -1) {
        setSelectedMonth(mIndex);
        setViewMode('Monthly');
      }
    }
  }, [location.search]);"""
text = text.replace(target, replace)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(text)
