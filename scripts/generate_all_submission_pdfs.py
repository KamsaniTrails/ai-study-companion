import os
import subprocess
import shutil
import markdown

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
TEMP_DIR = os.environ.get('TEMP', r'C:\Users\jayas\AppData\Local\Temp')

DOCS_TO_CONVERT = [
    {
        "source": "ENGINEERING_DECISIONS.md",
        "output_pdf": "AI_Study_Companion_Engineering_Decisions.pdf",
        "title": "AI Study Companion — Engineering Decisions",
        "subtitle": "Architecture Rationale, Trade-Offs, Technical Evaluation & Roadmap"
    },
    {
        "source": "FINAL_SUBMISSION.md",
        "output_pdf": "AI_Study_Companion_Final_Submission.pdf",
        "title": "AI Study Companion — Final Submission Package",
        "subtitle": "Complete PRD Deliverables, 13-Step Demo Walkthrough & Architecture Specification"
    },
    {
        "source": "PARTNER_VISION.md",
        "output_pdf": "AI_Study_Companion_Partner_Vision.pdf",
        "title": "AI Study Companion — Partner Vision & Philosophy",
        "subtitle": "Beyond the Chatbot: Active Recall, Grounded Evidence & Cognitive Science"
    },
    {
        "source": "PROMPTS.md",
        "output_pdf": "AI_Study_Companion_Development_Prompts.pdf",
        "title": "AI Study Companion — Development Prompts Log",
        "subtitle": "Categorized Engineering Prompts Across All 8 PRD Section 20.6 Disciplines"
    },
    {
        "source": os.path.join("docs", "AI_TOOLS.md"),
        "output_pdf": "AI_Study_Companion_AI_Tools_Usage.pdf",
        "title": "AI Study Companion — AI Tools Documentation",
        "subtitle": "Part A: PRD Requirements | Part B: Recommended Production Tools Stack"
    }
]

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{doc_title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  @page {{
    size: A4 portrait;
    margin: 18mm 16mm 18mm 16mm;
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    background: #ffffff;
    font-size: 8.8pt;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}

  .doc-header {{
    border-bottom: 2px solid #4f46e5;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }}

  .doc-title {{
    font-size: 20pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.5px;
    line-height: 1.2;
  }}

  .doc-subtitle {{
    font-size: 9.8pt;
    color: #4f46e5;
    font-weight: 600;
    margin-top: 5px;
  }}

  .doc-meta {{
    font-size: 7.8pt;
    color: #64748b;
    margin-top: 6px;
    font-weight: 500;
  }}

  h1 {{
    display: none; /* Replaced by header */
  }}

  h2 {{
    font-size: 12.5pt;
    font-weight: 700;
    color: #0f172a;
    border-left: 3.5px solid #4f46e5;
    padding-left: 9px;
    margin-top: 22px;
    margin-bottom: 10px;
    page-break-after: avoid;
  }}

  h3 {{
    font-size: 10pt;
    font-weight: 600;
    color: #1e293b;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }}

  h4 {{
    font-size: 9pt;
    font-weight: 600;
    color: #334155;
    margin-top: 10px;
    margin-bottom: 4px;
    page-break-after: avoid;
  }}

  p {{
    margin-bottom: 8px;
    color: #334155;
  }}

  ul, ol {{
    margin: 6px 0 10px 18px;
    color: #334155;
  }}

  li {{
    margin-bottom: 4px;
    line-height: 1.5;
  }}

  strong {{
    color: #0f172a;
    font-weight: 600;
  }}

  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 16px 0;
    font-size: 8pt;
    page-break-inside: avoid;
  }}

  th {{
    background: #3730a3;
    color: #ffffff;
    text-align: left;
    padding: 6px 9px;
    font-weight: 600;
    font-size: 7.8pt;
    border: 1px solid #312e81;
  }}

  td {{
    padding: 5px 9px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
    line-height: 1.4;
  }}

  tr:nth-child(even) {{
    background: #f8fafc;
  }}

  pre {{
    background: #0f172a;
    color: #f1f5f9;
    padding: 10px 12px;
    border-radius: 5px;
    font-size: 7.6pt;
    line-height: 1.45;
    font-family: 'JetBrains Mono', monospace;
    overflow-x: auto;
    margin: 10px 0 14px 0;
    page-break-inside: avoid;
    white-space: pre-wrap;
    word-break: break-word;
  }}

  code {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.8pt;
    background: #f1f5f9;
    color: #0f172a;
    padding: 1px 4px;
    border-radius: 3px;
  }}

  pre code {{
    background: transparent;
    color: inherit;
    padding: 0;
    font-size: 7.6pt;
  }}

  blockquote {{
    border-left: 3px solid #3b82f6;
    background: #eff6ff;
    padding: 8px 12px;
    border-radius: 3px;
    margin: 10px 0 12px 0;
    color: #1e40af;
    font-size: 8.4pt;
    line-height: 1.45;
  }}

  hr {{
    border: 0;
    height: 1px;
    background: #e2e8f0;
    margin: 18px 0;
  }}

  .badge {{
    display: inline-block;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 7.2pt;
    font-weight: 600;
  }}
</style>
</head>
<body>
  <div class="doc-header">
    <div class="doc-title">{header_title}</div>
    <div class="doc-subtitle">{header_subtitle}</div>
    <div class="doc-meta">Author: Engineering Candidate &bull; Project: AI Study Companion &bull; Standard Technical Documentation</div>
  </div>

  <div class="doc-content">
    {content_html}
  </div>
</body>
</html>
"""

def convert_md_to_pdf(doc_info):
    source_path = os.path.join(WORKSPACE_ROOT, doc_info["source"])
    output_pdf_path = os.path.join(WORKSPACE_ROOT, doc_info["output_pdf"])
    
    if not os.path.exists(source_path):
        print(f"[-] Source file not found: {source_path}")
        return False

    with open(source_path, 'r', encoding='utf-8') as f:
        md_text = f.read()

    # Parse markdown to HTML
    html_content = markdown.markdown(
        md_text,
        extensions=['tables', 'fenced_code', 'nl2br']
    )

    full_html = HTML_TEMPLATE.format(
        doc_title=doc_info["title"],
        header_title=doc_info["title"],
        header_subtitle=doc_info["subtitle"],
        content_html=html_content
    )

    # Temporary HTML and PDF paths
    base_name = os.path.splitext(doc_info["output_pdf"])[0]
    temp_html = os.path.join(TEMP_DIR, f"{base_name}.html")
    temp_pdf = os.path.join(TEMP_DIR, f"{base_name}.pdf")

    with open(temp_html, 'w', encoding='utf-8') as f:
        f.write(full_html)

    # Run Chrome headless to render PDF
    chrome_cmd = [
        CHROME_PATH,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        f"--print-to-pdf={temp_pdf}",
        "--no-pdf-header-footer",
        f"file:///{os.path.abspath(temp_html)}"
    ]

    res = subprocess.run(chrome_cmd, capture_output=True, text=True)
    if not os.path.exists(temp_pdf):
        print(f"[-] Failed to generate PDF for {doc_info['title']}: {res.stderr}")
        return False

    shutil.copyfile(temp_pdf, output_pdf_path)
    file_size_kb = os.path.getsize(output_pdf_path) / 1024
    print(f"[+] Generated: {doc_info['output_pdf']} ({file_size_kb:.1f} KB)")
    return True

def main():
    print("=======================================================")
    print(" GENERATING ALL COMPANY SUBMISSION PDFs FOR PROJECT ")
    print("=======================================================\n")

    success_count = 0
    for doc in DOCS_TO_CONVERT:
        if convert_md_to_pdf(doc):
            success_count += 1

    print("\n=======================================================")
    print(f" FINISHED: {success_count} / {len(DOCS_TO_CONVERT)} PDFs SUCCESSFULLY GENERATED")
    print("=======================================================")

if __name__ == "__main__":
    main()
