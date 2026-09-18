import re

with open('src/pages/Agreements.tsx', 'r') as f:
    content = f.read()

# We need to pass the existing agreement data to AgreementStudio if editing.
# So change isCreating to activeAgreement: Agreement | null | 'new'

content = content.replace("const [isCreating, setIsCreating] = useState(false);", "const [activeAgreement, setActiveAgreement] = useState<any | 'new' | null>(null);")
content = content.replace("!isCreating", "!activeAgreement")
content = content.replace("isCreating ?", "activeAgreement ?")
content = content.replace("setIsCreating(false)", "setActiveAgreement(null)")
content = content.replace("setIsCreating(true)", "setActiveAgreement('new')")

# The AgreementStudio needs initialData 
content = content.replace("<AgreementStudio \n          onCancel={() => setActiveAgreement(null)} \n          onCreate={handleCreate} \n          brandColor={brandColor} \n          templates={templates} \n          initialData={{\n            clientName: '',\n            clientEmail: '',\n            title: 'Client Agreement',\n            projectDetails: '<p>Project scope details here...</p>',\n            fee: ''\n          }}\n        />", 
"""<AgreementStudio 
          onCancel={() => setActiveAgreement(null)} 
          onCreate={handleCreate} 
          brandColor={brandColor} 
          templates={templates} 
          initialData={activeAgreement === 'new' ? {
            clientName: '',
            clientEmail: '',
            title: 'Client Agreement',
            projectDetails: '<p>Project scope details here...</p>',
            fee: ''
          } : activeAgreement}
        />""")

# Modify handleCreate to support DB saving & sending
handle_create_pattern = r"const handleCreate = async \(formData: any, isDraft: boolean, providerSignature\?: string\) => \{.*?^  \};"

new_handle_create = """const handleCreate = async (formData: any, isDraft: boolean, providerSignature?: string) => {
    if (!user) return;
    try {
      if (isDraft) {
        if (activeAgreement && activeAgreement !== 'new') {
          await updateAgreement(activeAgreement.id, {
            ...formData,
            status: 'draft',
          });
        } else {
          await addAgreement({
            ...formData,
            status: 'draft',
            sentAt: null
          });
        }
        setActiveAgreement(null);
      } else {
        // Save to DB as sent
        let docId;
        if (activeAgreement && activeAgreement !== 'new') {
          await updateAgreement(activeAgreement.id, {
             ...formData,
             providerSignature,
             status: 'sent',
             sentAt: new Date().toISOString()
          });
          docId = activeAgreement.id;
        } else {
          const newDoc = await addAgreement({
            ...formData,
            providerSignature,
            status: 'sent',
            sentAt: new Date().toISOString()
          });
          docId = newDoc.id;
        }
        
        const link = `${window.location.origin}/agreement/${user.uid}/${docId}`;
        navigator.clipboard.writeText(link);
        alert('Agreement saved and link copied to clipboard! Share this link with your client.');
        setActiveAgreement(null);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to create agreement');
    }
  };"""

content = re.sub(handle_create_pattern, new_handle_create, content, flags=re.MULTILINE | re.DOTALL)

# Add edit button to draft agreements
# Find the line: <button onClick={() => removeAgreement(agreement.id)} className="text-red-500 hover:text-red-700 ml-4 p-2 bg-red-50 rounded-full">
edit_btn = """<button onClick={() => removeAgreement(agreement.id)} className="text-red-500 hover:text-red-700 ml-4 p-2 bg-red-50 rounded-full">
                            <Trash2 size={16} />
                          </button>"""
new_edit_btn = """{agreement.status === 'draft' && (
                            <button onClick={() => setActiveAgreement(agreement)} className="text-blue-500 hover:text-blue-700 ml-2 p-2 bg-blue-50 rounded-full">
                              <PenTool size={16} />
                            </button>
                          )}
                          <button onClick={() => removeAgreement(agreement.id)} className="text-red-500 hover:text-red-700 ml-2 p-2 bg-red-50 rounded-full">
                            <Trash2 size={16} />
                          </button>"""
content = content.replace(edit_btn, new_edit_btn)

# We need to import PenTool if it's not imported
if 'PenTool' not in content:
    content = content.replace("Trash2,", "Trash2, PenTool,")

with open('src/pages/Agreements.tsx', 'w') as f:
    f.write(content)

