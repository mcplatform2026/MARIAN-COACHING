import re

with open('src/pages/Sessions.tsx', 'r') as f:
    content = f.read()

# Change the form layout
old_form = """            <div className="md:col-span-3">
              <label className="block font-body font-bold text-[10px] mb-1.5 uppercase tracking-wide">Calendar Provider</label>
              <select
                value={calendarProvider}
                onChange={(e) => setCalendarProvider(e.target.value as any)}
                className="w-full border-2 border-black p-2 text-xs font-body font-medium bg-surface-container-low focus:outline-none text-black"
              >
                <option value="calendly">Calendly</option>
                <option value="calcom">Cal.com</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block font-body font-bold text-[10px] mb-1.5 uppercase tracking-wide">Integration Type</label>
              <select
                value={calendarMethod}
                onChange={(e) => setCalendarMethod(e.target.value as any)}
                className="w-full border-2 border-black p-2 text-xs font-body font-medium bg-surface-container-low focus:outline-none text-black"
              >
                <option value="embed">Embed Live Calendar Widget</option>
                <option value="api">Dynamic API Booking Import</option>
              </select>
            </div>

            {calendarMethod === 'embed' ? (
              <div className="md:col-span-4">
                <label className="block font-body font-bold text-[10px] mb-1.5 uppercase tracking-wide">Booking URL / ID *</label>
                <input
                  type="text"
                  required
                  placeholder={calendarProvider === 'calendly' ? 'e.g. calendly.com/your-username' : 'e.g. cal.com/your-username'}
                  value={publicUrl}
                  onChange={(e) => setPublicUrl(e.target.value)}
                  className="w-full border-2 border-black p-2 text-xs font-body font-medium bg-surface-container-low focus:outline-none placeholder-neutral-500 text-black"
                />
              </div>
            ) : (
              <div className="md:col-span-4">
                <label className="block font-body font-bold text-[10px] mb-1.5 uppercase tracking-wide">API Personal Access Token *</label>
                <input
                  type="password"
                  required
                  placeholder={calendarProvider === 'calendly' ? 'Calendly API token' : 'Cal.com API key'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full border-2 border-black p-2 text-xs font-body font-medium bg-surface-container-low focus:outline-none placeholder-neutral-500 text-black"
                />
              </div>
            )}"""

new_form = """            <div className="md:col-span-4">
              <label className="block font-body font-bold text-[10px] mb-1.5 uppercase tracking-wide">Calendar Provider</label>
              <select
                value={calendarProvider}
                onChange={(e) => setCalendarProvider(e.target.value as any)}
                className="w-full border-2 border-black p-2 text-xs font-body font-medium bg-surface-container-low focus:outline-none text-black"
              >
                <option value="calendly">Calendly</option>
                <option value="calcom">Cal.com</option>
              </select>
            </div>

            <div className="md:col-span-6">
              <label className="block font-body font-bold text-[10px] mb-1.5 uppercase tracking-wide">API Personal Access Token *</label>
              <input
                type="password"
                required
                placeholder={calendarProvider === 'calendly' ? 'Calendly API token' : 'Cal.com API key'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs font-body font-medium bg-surface-container-low focus:outline-none placeholder-neutral-500 text-black"
              />
            </div>"""

if old_form in content:
    content = content.replace(old_form, new_form)
else:
    print("Old form not found!")

# Change initial state
content = content.replace("useState<'embed' | 'api'>('embed')", "useState<'embed' | 'api'>('api')")

with open('src/pages/Sessions.tsx', 'w') as f:
    f.write(content)
