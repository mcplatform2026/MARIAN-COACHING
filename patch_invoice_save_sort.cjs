const fs = require('fs');
let code = fs.readFileSync('src/pages/Invoices.tsx', 'utf8');

const saveLogic = `      if (existingIndex > -1) {
        // Keep original createdAt
        invoiceData.createdAt = updatedInvoices[existingIndex].createdAt || invoiceData.createdAt;
        updatedInvoices[existingIndex] = invoiceData;
      } else {
        updatedInvoices.push(invoiceData);
        setCurrentInvoiceId(newId);
      }
      localStorage.setItem('pastInvoices', JSON.stringify(updatedInvoices));`;

const newSaveLogic = `      if (existingIndex > -1) {
        // Keep original createdAt
        invoiceData.createdAt = updatedInvoices[existingIndex].createdAt || invoiceData.createdAt;
        updatedInvoices[existingIndex] = invoiceData;
      } else {
        updatedInvoices.unshift(invoiceData); // Add to the top
        setCurrentInvoiceId(newId);
      }
      
      const getSortTime = (inv) => {
        if (typeof inv.createdAt === 'number') return inv.createdAt;
        if (typeof inv.createdAt === 'string') return new Date(inv.createdAt).getTime();
        return 0;
      };
      updatedInvoices.sort((a, b) => getSortTime(b) - getSortTime(a));
      
      localStorage.setItem('pastInvoices', JSON.stringify(updatedInvoices));`;

code = code.replace(saveLogic, newSaveLogic);

fs.writeFileSync('src/pages/Invoices.tsx', code);
