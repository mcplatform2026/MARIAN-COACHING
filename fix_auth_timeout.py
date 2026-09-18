with open('src/components/AuthProvider.tsx', 'r') as f:
    content = f.read()

# Add a timeout to force loading to false after 2 seconds
old_effect = """  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {"""

new_effect = """  useEffect(() => {
    let isMounted = true;
    
    // Fallback timeout in case Firebase Auth hangs (e.g. in strict iframe environments)
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Auth initialization timed out. Forcing load.");
        setLoading(false);
      }
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      clearTimeout(timeoutId);
      if (!isMounted) return;"""

content = content.replace(old_effect, new_effect)

content = content.replace("return () => unsubscribe();", "return () => {\n      isMounted = false;\n      clearTimeout(timeoutId);\n      unsubscribe();\n    };")

with open('src/components/AuthProvider.tsx', 'w') as f:
    f.write(content)
