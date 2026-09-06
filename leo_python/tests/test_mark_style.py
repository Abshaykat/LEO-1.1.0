from leo_python.communication.mark_style import detect_language, build_system_prompt, CommunicationContext, normalize_response

def test_language_cases():
    assert detect_language("Open Chrome")=="english"
    assert detect_language("Chrome ta open koro")=="english"
    assert detect_language("ক্রোমটা খুলে দাও")=="bangla"
    assert detect_language("Chrome টা open koro")=="mixed"

def test_prompt_keeps_governance():
    p=build_system_prompt(CommunicationContext("Chrome ta open koro"))
    assert "permission" in p and "owner approval" in p and "MOST RECENT" in p

def test_response_normalization():
    assert normalize_response(" hi \n\n\n there ")=="hi \n\n there"
