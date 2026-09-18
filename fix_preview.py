import re

with open('src/pages/Invoices.tsx', 'r') as f:
    content = f.read()

# 1. Modify the clone code
old_clone_code = """    clone.style.display = "flex";
    clone.style.flexDirection = "column";

    container.appendChild(clone);"""

new_clone_code = """    clone.style.display = "flex";
    clone.style.flexDirection = "column";

    const footerContact = clone.querySelector('#footer-contact-row');
    if (footerContact) {
      footerContact.className = "flex flex-row items-center justify-center gap-8 w-full max-w-[500px] mx-auto font-bold font-headline uppercase tracking-wide";
      (footerContact as HTMLElement).style.fontSize = "15px";
    }

    container.appendChild(clone);"""

content = content.replace(old_clone_code, new_clone_code)

# 2. Modify the footer render code
old_footer_code = """                  {/* Footer contact channels row */}
                  <div 
                    className="flex flex-row items-center justify-center gap-8 w-full max-w-[500px] mx-auto font-bold font-headline uppercase tracking-wide"
                    style={{ color: "#262626", fontSize: "15px" }}
                  >"""

new_footer_code = """                  {/* Footer contact channels row */}
                  <div 
                    id="footer-contact-row"
                    className="flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2 w-full mx-auto font-bold font-headline uppercase tracking-wide"
                    style={{ color: "#262626", fontSize: "12px" }}
                  >"""

content = content.replace(old_footer_code, new_footer_code)

with open('src/pages/Invoices.tsx', 'w') as f:
    f.write(content)
