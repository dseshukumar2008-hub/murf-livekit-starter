from state_machine import Outcome

def is_blocked(patient_number: str) -> bool:
    """Pre-call block check. In a real system, checks database."""
    # For testing, you could hardcode numbers to block.
    blocked_numbers = ["+10000000000"]
    return patient_number in blocked_numbers

def check(spoken_text: str) -> Outcome | None:
    """
    Checks transcribed speech against keyword lists.
    Returns the Outcome if a guardrail is tripped, else None.
    """
    if not spoken_text:
        return None
        
    text = spoken_text.lower()
    
    hardship_keywords = ["feel unwell", "dizzy", "chest pain", "emergency", "side effect", "hospital", "pain", "sick", "hurts"]
    wrong_person_keywords = ["wrong number", "who is this", "not me", "wrong person"]
    human_keywords = ["talk to a person", "nurse", "doctor", "human", "representative", "agent"]
    optout_keywords = ["stop", "don't call", "remove me", "opt out", "unsubscribe", "cancel"]
    
    for kw in hardship_keywords:
        if kw in text:
            return Outcome.HARDSHIP_ESCALATION
            
    for kw in wrong_person_keywords:
        if kw in text:
            return Outcome.WRONG_PERSON
            
    for kw in human_keywords:
        if kw in text:
            return Outcome.HUMAN_HANDOFF
            
    for kw in optout_keywords:
        if kw in text:
            return Outcome.OPTED_OUT
            
    return None
