const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// The items we need to match and reorder
const dashboardLi = code.substring(code.indexOf('          <li>\n            <NavLink\n              to="/"'), code.indexOf('          <li>\n            <NavLink\n              to="/clients"'));
const clientsLi = code.substring(code.indexOf('          <li>\n            <NavLink\n              to="/clients"'), code.indexOf('          <li>\n            <NavLink\n              to="/appointments"'));
const appointmentsLi = code.substring(code.indexOf('          <li>\n            <NavLink\n              to="/appointments"'), code.indexOf('          <li>\n            <NavLink\n              to="/invoices"'));
const invoicesLi = code.substring(code.indexOf('          <li>\n            <NavLink\n              to="/invoices"'), code.indexOf('          <li>\n            <NavLink\n              to="/agreements"'));
const agreementsLi = code.substring(code.indexOf('          <li>\n            <NavLink\n              to="/agreements"'), code.indexOf('          <li>\n            <NavLink\n              to="/tasks"'));
const tasksLi = code.substring(code.indexOf('          <li>\n            <NavLink\n              to="/tasks"'), code.indexOf('          <li>\n            <NavLink\n              to="/report"'));
const reportLi = code.substring(code.indexOf('          <li>\n            <NavLink\n              to="/report"'), code.indexOf('        </ul>\n      </nav>'));

// Combine in the new order:
// Dashboard, Clients, Task Tracker, Appointments, Invoices, Agreements, Monthly Report
const newUlContent = 
  dashboardLi +
  clientsLi +
  tasksLi +
  appointmentsLi +
  invoicesLi +
  agreementsLi +
  reportLi;

const oldUlContent = 
  dashboardLi +
  clientsLi +
  appointmentsLi +
  invoicesLi +
  agreementsLi +
  tasksLi +
  reportLi;

if (code.includes(oldUlContent)) {
  code = code.replace(oldUlContent, newUlContent);
  fs.writeFileSync('src/components/Sidebar.tsx', code);
  console.log('Successfully reordered!');
} else {
  console.log('Failed to match old content exactly.');
}
