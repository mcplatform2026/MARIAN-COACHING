with open('src/pages/AgreementView.tsx', 'r') as f:
    content = f.read()

debug_ui = """
  // DEBUG OVERLAY
  const [debugLog, setDebugLog] = useState<string>('Init...');
  useEffect(() => {
    setDebugLog(prev => prev + '\\nMounted. uid=' + uid + ' id=' + id + ' hash=' + window.location.hash.substring(0, 20));
  }, [uid, id]);
"""

# Insert right after const { uid, id }
content = content.replace("const { uid, id } = useParams<{ uid: string; id: string }>();", "const { uid, id } = useParams<{ uid: string; id: string }>();" + debug_ui)

# Update render to show debug overlay
old_render = '        {/* Client Header */}'
new_render = """
        <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, background: 'black', color: 'lime', padding: '10px', fontSize: '12px' }}>
          DEBUG:<br/>
          {debugLog}<br/>
          loading: {loading ? 'true' : 'false'}<br/>
          error: {error}<br/>
          agreement: {agreement ? 'Yes' : 'No'}
        </div>
        {/* Client Header */}
"""
content = content.replace(old_render, new_render)

with open('src/pages/AgreementView.tsx', 'w') as f:
    f.write(content)
