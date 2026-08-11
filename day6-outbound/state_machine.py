from enum import Enum

class CallState(Enum):
    OPENING = "opening"
    IDENTITY_VERIFICATION = "identity_verification"
    MED_CONTEXT = "med_context"
    OUTCOME = "outcome"

class Outcome(Enum):
    DOSE_CONFIRMED = "dose_confirmed"
    REMINDER_DEFERRED = "reminder_deferred"
    OPTED_OUT = "opted_out"
    WRONG_PERSON = "wrong_person"
    HARDSHIP_ESCALATION = "hardship_escalation"
    HUMAN_HANDOFF = "human_handoff"
    IDENTITY_MISMATCH = "identity_mismatch"
    UNKNOWN = "unknown"
    NO_ANSWER = "no_answer"
    BUSY = "busy"
    VOICEMAIL = "voicemail"
    IMMEDIATE_HANGUP = "immediate_hangup"

def verify_identity(expected_digits: str, spoken_text: str) -> bool:
    """Verifies if the spoken text contains the expected 4 digits."""
    if not spoken_text:
        return False
    import re
    numbers = re.sub(r'\D', '', spoken_text)
    return expected_digits in numbers
