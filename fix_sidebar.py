import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

sidebar_item = """            <NavLink
              to="/agreements"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-xs font-headline font-bold transition-transform hover:translate-x-1 ${
                  isActive
                    ? "text-white bg-blue-600 dark:bg-blue-600 border-y-2 border-black dark:border-white"
                    : "text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`
              }
            >
              <span className="material-symbols-outlined text-sm">contract</span> Agreements
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/report" """

if "/agreements" not in content:
    content = content.replace('<li>\n            <NavLink\n              to="/report"', '<li>\n' + sidebar_item)

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)
