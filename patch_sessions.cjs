const fs = require('fs');
let code = fs.readFileSync('src/pages/Sessions.tsx', 'utf8');

code = code.replace(
  'const [searchQuery, setSearchQuery] = useState("");',
  'const [searchQuery, setSearchQuery] = useState("");\n  const [currentPage, setCurrentPage] = useState(1);'
);

code = code.replace(
  'return timeB - timeA;\n  });\n\n  return (',
  'return timeB - timeA;\n  });\n\n  const itemsPerPage = 10;\n  const totalPages = Math.max(1, Math.ceil(sortedSessions.length / itemsPerPage));\n  const paginatedSessions = sortedSessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);\n\n  return ('
);

code = code.replace(
  '!loadingSessions && sortedSessions.map((session) => (',
  '!loadingSessions && paginatedSessions.map((session) => ('
);

code = code.replace(
  '              </tbody>\n            </table>\n          </div>\n        </div>\n\n      {/* Book / Edit Session Modal */}',
  `              </tbody>\n            </table>\n          </div>\n          {totalPages > 1 && (\n            <div className="p-4 md:p-5 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-lowest">\n              <span className="font-body font-bold text-xs md:text-sm uppercase tracking-tight">\n                Showing {sortedSessions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(sortedSessions.length, currentPage * itemsPerPage)} of {sortedSessions.length} Entries\n              </span>\n              <div className="flex items-center gap-2 font-body font-medium text-sm">\n                <button\n                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}\n                  disabled={currentPage === 1}\n                  className="h-10 px-3 md:px-4 border-2 border-black bg-white hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed transition-colors"\n                >\n                  Prev\n                </button>\n                <div className="h-10 px-4 border-2 border-black bg-white flex items-center justify-center min-w-[3rem]">\n                  {currentPage} / {totalPages}\n                </div>\n                <button\n                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}\n                  disabled={currentPage === totalPages}\n                  className="h-10 px-3 md:px-4 border-2 border-black bg-primary text-on-primary hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"\n                >\n                  Next\n                </button>\n              </div>\n            </div>\n          )}\n        </div>\n\n      {/* Book / Edit Session Modal */}`
);

fs.writeFileSync('src/pages/Sessions.tsx', code);
console.log('Patched Sessions.tsx');
