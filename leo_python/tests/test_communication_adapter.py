from leo_python.communication.adapter import CommunicationAdapter

def test_adapter_builds_mark_style_prompt():
    a=CommunicationAdapter()
    e=a.build("Chrome ta open koro", 3)
    assert e.user_message=="Chrome ta open koro"
    assert "Banglish" in e.system_prompt
    assert "owner approval" in e.system_prompt

def test_adapter_only_normalizes_response():
    assert CommunicationAdapter().normalize(" hi \n\n\n there ")=="hi \n\n there"
