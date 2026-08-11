import json
import os
from datetime import datetime

LOGS_DIR = os.path.join(os.path.dirname(__file__), "logs")
if not os.path.exists(LOGS_DIR):
    os.makedirs(LOGS_DIR)

def write_outcome(call_sid: str, patient_name: str, outcome: str, detail: str = ""):
    log_file = os.path.join(LOGS_DIR, f"{call_sid}.json")
    
    if os.path.exists(log_file):
        return False
        
    data = {
        "call_sid": call_sid,
        "patient_name": patient_name,
        "outcome": outcome.value if hasattr(outcome, 'value') else outcome,
        "detail": detail,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    with open(log_file, "w") as f:
        json.dump(data, f, indent=2)
        
    return True

def has_outcome(call_sid: str) -> bool:
    log_file = os.path.join(LOGS_DIR, f"{call_sid}.json")
    return os.path.exists(log_file)
