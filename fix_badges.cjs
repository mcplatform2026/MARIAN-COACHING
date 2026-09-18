const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const oldTasks = `            >
              <ListTodo size={20} strokeWidth={2.5} className="anim-bounce-right" />
              <span className="flex-1">Task Tracker</span>
              {todoTasksCount > 0 && (
                <span className="bg-black text-white px-1.5 py-0.5 text-[9px] rounded-full min-w-[18px] text-center">{todoTasksCount}</span>
              )}
            </NavLink>`;

const newTasks = `            >
              {({ isActive }) => (
                <>
                  <ListTodo size={20} strokeWidth={2.5} className="anim-bounce-right" />
                  <span className="flex-1">Task Tracker</span>
                  {todoTasksCount > 0 && (
                    <span className={\`px-1.5 py-0.5 text-[9px] rounded-full min-w-[18px] text-center \${isActive ? 'bg-white text-black' : 'bg-black text-white'}\`}>{todoTasksCount}</span>
                  )}
                </>
              )}
            </NavLink>`;

const oldAppts = `            >
              <CalendarDays size={20} strokeWidth={2.5} className="anim-ring" />
              <span className="flex-1">Appointments</span>
              {upcomingAppointmentsCount > 0 && (
                <span className="bg-black text-white px-1.5 py-0.5 text-[9px] rounded-full min-w-[18px] text-center">{upcomingAppointmentsCount}</span>
              )}
            </NavLink>`;

const newAppts = `            >
              {({ isActive }) => (
                <>
                  <CalendarDays size={20} strokeWidth={2.5} className="anim-ring" />
                  <span className="flex-1">Appointments</span>
                  {upcomingAppointmentsCount > 0 && (
                    <span className={\`px-1.5 py-0.5 text-[9px] rounded-full min-w-[18px] text-center \${isActive ? 'bg-white text-black' : 'bg-black text-white'}\`}>{upcomingAppointmentsCount}</span>
                  )}
                </>
              )}
            </NavLink>`;

code = code.replace(oldTasks, newTasks);
code = code.replace(oldAppts, newAppts);

fs.writeFileSync('src/components/Sidebar.tsx', code);
console.log('Fixed badges');
