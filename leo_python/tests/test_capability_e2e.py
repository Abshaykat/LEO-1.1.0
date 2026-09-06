import asyncio, tempfile
from pathlib import Path
from leo_python.capabilities import CapabilityRegistry
from leo_python.capabilities.builtin import register_safe_builtins
from leo_python.runtime.capability_runner import CapabilityRunner, CapabilityRunRequest
from leo_python.governance import ApprovalStore, AuditSink

def test_approved_docx_read_runs_through_governance():
    from zipfile import ZipFile
    with tempfile.TemporaryDirectory() as d:
        p=Path(d)/"x.docx"
        with ZipFile(p,"w") as z:
            z.writestr("word/document.xml",'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>LEO DOCX OK</w:t></w:r></w:p></w:body></w:document>')
        registry=CapabilityRegistry(); register_safe_builtins(registry)
        approvals=ApprovalStore(); audit=AuditSink(); runner=CapabilityRunner(registry,approvals,audit)
        params={"path":str(p)}
        approval=approvals.issue("docx-1",{"capability":"office.docx.read","parameters":params})
        result=asyncio.run(runner.run(CapabilityRunRequest("office.docx.read",params,approval.approval_id,True,lambda v:"LEO DOCX OK" in v)))
        assert result.executed and result.verified
