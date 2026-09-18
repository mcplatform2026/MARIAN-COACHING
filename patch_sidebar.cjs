const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  'import { useAuth } from "./AuthProvider";',
  'import { useAuth } from "./AuthProvider";\nimport { useTasks } from "../hooks/useTasks";\nimport { useSessions } from "../hooks/useSessions";'
);

// 2. Add hooks to Sidebar
code = code.replace(
  'const { user, isCollaborator, ownerEmail } = useAuth();',
  'const { user, isCollaborator, ownerEmail } = useAuth();\n  const { tasks } = useTasks();\n  const { sessions } = useSessions();\n  const todoTasksCount = tasks.filter(t => t.status === "todo").length;\n  const upcomingAppointmentsCount = sessions.filter(s => s.status === "Upcoming").length;'
);

// 3. Extract the Task Tracker li and Appointments li to reorder them
// Need to carefully regex or replace.

const appointmentsLi = `          <li>
            <NavLink
              to="/appointments"
              onClick={onClose}
              className={({ isActive }) =>
                \`flex items-center gap-3 px-4 py-2 text-xs font-headline font-bold transition-transform hover:translate-x-1 \${
                  isActive
                    ? "text-white bg-blue-600 dark:bg-blue-600 border-y-2 border-black dark:border-white"
                    : "text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }\`
              }
            >
              <CalendarDays size={20} strokeWidth={2.5} className="anim-ring" /> Appointments
            </NavLink>
          </li>`;

const taskTrackerLi = `          <li>
            <NavLink
              to="/tasks"
              onClick={onClose}
              className={({ isActive }) =>
                \`flex items-center gap-3 px-4 py-2 text-xs font-headline font-bold transition-transform hover:translate-x-1 \${
                  isActive
                    ? "text-white bg-blue-600 dark:bg-blue-600 border-y-2 border-black dark:border-white"
                    : "text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }\`
              }
            >
              <ListTodo size={20} strokeWidth={2.5} className="anim-bounce-right" /> Task Tracker
            </NavLink>
          </li>`;

const newAppointmentsLi = `          <li>
            <NavLink
              to="/appointments"
              onClick={onClose}
              className={({ isActive }) =>
                \`flex items-center gap-3 px-4 py-2 text-xs font-headline font-bold transition-transform hover:translate-x-1 \${
                  isActive
                    ? "text-white bg-blue-600 dark:bg-blue-600 border-y-2 border-black dark:border-white"
                    : "text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }\`
              }
            >
              <CalendarDays size={20} strokeWidth={2.5} className="anim-ring" />
              <span className="flex-1">Appointments</span>
              {upcomingAppointmentsCount > 0 && (
                <span className="bg-black text-white px-1.5 py-0.5 text-[9px] rounded-full min-w-[18px] text-center">{upcomingAppointmentsCount}</span>
              )}
            </NavLink>
          </li>`;

const newTaskTrackerLi = `          <li>
            <NavLink
              to="/tasks"
              onClick={onClose}
              className={({ isActive }) =>
                \`flex items-center gap-3 px-4 py-2 text-xs font-headline font-bold transition-transform hover:translate-x-1 \${
                  isActive
                    ? "text-white bg-blue-600 dark:bg-blue-600 border-y-2 border-black dark:border-white"
                    : "text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }\`
              }
            >
              <ListTodo size={20} strokeWidth={2.5} className="anim-bounce-right" />
              <span className="flex-1">Task Tracker</span>
              {todoTasksCount > 0 && (
                <span className="bg-black text-white px-1.5 py-0.5 text-[9px] rounded-full min-w-[18px] text-center">{todoTasksCount}</span>
              )}
            </NavLink>
          </li>`;

code = code.replace(appointmentsLi, newAppointmentsLi);
code = code.replace(taskTrackerLi, newTaskTrackerLi);

// Wait, I also need to swap them.
// Currently it's Clients -> Appointments -> Invoices -> Agreements -> Task Tracker -> Report
// Let's replace the whole nav list contents for safety, or just swap their positions.
// Let's do a more robust replace by just matching the lis.

fs.writeFileSync('src/components/Sidebar.tsx', code);
