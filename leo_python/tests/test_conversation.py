from leo_python.conversation import ConversationRouter

def test_banglish_is_detected():
    r=ConversationRouter().route("Chrome ta open koro")
    assert r.language=="banglish" and r.intent.action

def test_bangla_action_is_detected():
    r=ConversationRouter().route("Chrome খুলো")
    assert r.language=="banglish" and r.intent.action

def test_question_is_not_action():
    r=ConversationRouter().route("What is LEO?")
    assert r.intent.intent=="question" and not r.intent.action
