from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree
def extract_docx_text(path:str)->str:
    p=Path(path)
    if p.suffix.lower()!=".docx": raise ValueError("expected .docx")
    with ZipFile(p) as z: root=ElementTree.fromstring(z.read("word/document.xml"))
    ns={"w":"http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    return "\n".join("".join(t.text or "" for t in para.findall(".//w:t",ns)) for para in root.findall(".//w:p",ns))
