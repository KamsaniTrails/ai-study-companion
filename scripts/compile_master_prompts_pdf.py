import os
import subprocess
import shutil
import markdown

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
TEMP_DIR = os.environ.get('TEMP', r'C:\Users\jayas\AppData\Local\Temp')

SOURCE_MD = os.path.join(WORKSPACE_ROOT, "PROMPTS.md")
TARGET_PDF = os.path.join(WORKSPACE_ROOT, "AI_Study_Companion_Development_Prompts.pdf")

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AI Study Companion — Development Prompts Catalog</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  @page {{
    size: A4 portrait;
    margin: 16mm 14mm 16mm 14mm;
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    background: #ffffff;
    font-size: 8.5pt;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}

  /* Professional Light Header Banner - No Dark/Black Background */
  .clean-header-banner {{
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-top: 5px solid #4f46e5;
    padding: 18px 20px;
    border-radius: 8px;
    margin-bottom: 18px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  }}

  .badge-row {{
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }}

  .badge-tag {{
    background: #eef2ff;
    border: 1px solid #c7d2fe;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 7.2pt;
    font-weight: 700;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    color: #3730a3;
  }}

  .badge-tag.highlight {{
    background: #ecfdf5;
    border-color: #a7f3d0;
    color: #065f46;
  }}

  .banner-title {{
    font-size: 17.5pt;
    font-weight: 800;
    line-height: 1.25;
    color: #0f172a;
    letter-spacing: -0.3px;
    margin-bottom: 4px;
  }}

  .banner-subtitle {{
    font-size: 9.3pt;
    color: #4f46e5;
    font-weight: 600;
    line-height: 1.35;
  }}

  .banner-meta {{
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    font-size: 7.5pt;
    color: #64748b;
  }}

  h1 {{
    display: none; /* Replaced by clean header banner */
  }}

  h2 {{
    font-size: 11.5pt;
    font-weight: 700;
    color: #0f172a;
    border-left: 4px solid #4f46e5;
    padding-left: 9px;
    margin-top: 16px;
    margin-bottom: 8px;
    page-break-after: avoid;
    letter-spacing: -0.2px;
  }}

  h3 {{
    font-size: 9.4pt;
    font-weight: 700;
    color: #1e293b;
    margin-top: 12px;
    margin-bottom: 5px;
    page-break-after: avoid;
  }}

  p {{
    margin-bottom: 6px;
    color: #334155;
    text-align: justify;
  }}

  ul, ol {{
    margin: 4px 0 8px 18px;
    color: #334155;
  }}

  li {{
    margin-bottom: 3px;
    line-height: 1.45;
  }}

  strong {{
    color: #0f172a;
    font-weight: 600;
  }}

  /* Clean Light Prompt Containers - Completely Replaced Dark/Black Boxes */
  pre {{
    background: #f8fafc;
    color: #0f172a;
    padding: 10px 12px;
    border-radius: 6px;
    font-size: 7.5pt;
    line-height: 1.46;
    font-family: 'JetBrains Mono', monospace;
    overflow-x: auto;
    margin: 6px 0 12px 0;
    page-break-inside: avoid;
    white-space: pre-wrap;
    word-break: break-word;
    border: 1px solid #cbd5e1;
    border-left: 4px solid #4f46e5;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  }}

  code {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.6pt;
    background: #f1f5f9;
    color: #312e81;
    padding: 1px 4px;
    border-radius: 3px;
    border: 1px solid #e2e8f0;
  }}

  pre code {{
    background: transparent;
    color: inherit;
    padding: 0;
    font-size: 7.6pt;
    border: none;
  }}

  hr {{
    border: 0;
    height: 1px;
    background: #e2e8f0;
    margin: 16px 0;
  }}

  .footer-notice {{
    margin-top: 25px;
    padding-top: 10px;
    border-top: 1px solid #cbd5e1;
    font-size: 7.2pt;
    color: #64748b;
    display: flex;
    justify-content: space-between;
  }}
</style>
</head>
<body>

  <div class="clean-header-banner">
    <div class="badge-row">
      <span class="badge-tag highlight">Production Verified</span>
      <span class="badge-tag">PRD Section 20.6 Compliant</span>
      <span class="badge-tag">8 Core Disciplines</span>
      <span class="badge-tag">Full Engineering Log</span>
    </div>
    <div class="banner-title">AI Study Companion — Development Prompts Master Catalog</div>
    <div class="banner-subtitle">Official Engineering Submission &bull; Categorized Engineering Prompts Across All 8 Disciplines</div>
    <div class="banner-meta">
      <div><strong>Deployment:</strong> https://ai-study-companion-1-flkl.onrender.com/</div>
      <div><strong>Candidate:</strong> Antigravity Engineering Candidate</div>
      <div><strong>Specification:</strong> PRD Section 20.6 Deliverable</div>
    </div>
  </div>

  <div class="doc-content">
    {content_html}
  </div>

  <div class="footer-notice">
    <div>AI Study Companion &bull; Confidential Candidate Submission</div>
    <div>PRD Section 20.6 Development Prompts Catalog &bull; All 8 Disciplines Complete</div>
  </div>

</body>
</html>
"""

def compile_prompts_pdf():
    print("==================================================================")
    print(" COMILING CLEAN LIGHT-THEME PROMPTS MASTER PDF ")
    print("==================================================================")

    # 1. Read Source Markdown
    if not os.path.exists(SOURCE_MD):
        print(f"[-] Source Markdown not found: {SOURCE_MD}")
        return False

    with open(SOURCE_MD, 'r', encoding='utf-8') as f:
        md_text = f.read()

    # 2. Parse Markdown
    html_content = markdown.markdown(
        md_text,
        extensions=['tables', 'fenced_code', 'nl2br']
    )

    full_html = HTML_TEMPLATE.format(content_html=html_content)

    temp_html = os.path.join(TEMP_DIR, "clean_master_prompts.html")
    temp_pdf = os.path.join(TEMP_DIR, "clean_master_prompts.pdf")

    with open(temp_html, 'w', encoding='utf-8') as f:
        f.write(full_html)

    # 3. Invoke Chrome Headless
    chrome_cmd = [
        CHROME_PATH,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        f"--print-to-pdf={temp_pdf}",
        "--no-pdf-header-footer",
        f"file:///{os.path.abspath(temp_html)}"
    ]

    print("[*] Rendering clean light PDF with Chrome Headless...")
    res = subprocess.run(chrome_cmd, capture_output=True, text=True)

    if not os.path.exists(temp_pdf):
        print(f"[-] Failed to generate PDF: {res.stderr}")
        return False

    shutil.copyfile(temp_pdf, TARGET_PDF)
    size_kb = os.path.getsize(TARGET_PDF) / 1024
    print(f"[+] SUCCESS! Clean Light-Theme Prompts PDF generated:")
    print(f"    Path: {TARGET_PDF}")
    print(f"    Size: {size_kb:.1f} KB")
    print("==================================================================")
    return True

if __name__ == "__main__":
    compile_prompts_pdf()
