import os
import uuid

from dotenv import load_dotenv
from twilio.rest import Client

from guardrails import is_blocked
from outcome_log import write_outcome
from state_machine import Outcome

load_dotenv()

account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
twilio_number = os.environ.get("TWILIO_FROM_NUMBER")
target_number = os.environ.get("TARGET_NUMBER")
public_base_url = os.environ.get("PUBLIC_BASE_URL")
PATIENT_NAME = "John Doe"

def trigger():
    """Trigger the outbound call."""
    if is_blocked(target_number):
        print(f"Call to {target_number} blocked pre-call.")
        fake_sid = f"blocked_{uuid.uuid4().hex[:8]}"
        write_outcome(fake_sid, PATIENT_NAME, Outcome.OPTED_OUT.value, "blocked pre-call")
        return

    client = Client(account_sid, auth_token)
    print(f"Placing outbound call to {target_number}...")
    call = client.calls.create(
        to=target_number,
        from_=twilio_number,
        url=f"{public_base_url}/voice/twiml",
    )
    
    print(f"Call placed. SID: {call.sid}")

if __name__ == "__main__":
    if not all([account_sid, auth_token, twilio_number, target_number, public_base_url]):
        print("Missing required environment variables.")
    else:
        trigger()
