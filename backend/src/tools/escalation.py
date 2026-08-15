import datetime
import json
import logging
import os
import re
import uuid

import requests

logger = logging.getLogger("escalation")

ESCALATION_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "escalations.json"))

def sanitize_summary(summary: dict) -> dict:
    """Operates on the entire summary dictionary, validating the 6 allowed fields and scrubbing any sequence of 4 or more digits."""
    allowed_fields = [
        "caller_identifier",
        "what_happened",
        "what_agent_checked",
        "urgency",
        "caller_language",
        "preferred_followup"
    ]

    sanitized = {}
    for field in allowed_fields:
        if field in summary:
            # Convert value to string and replace sequences of 4+ digits
            val = str(summary[field])
            sanitized[field] = re.sub(r'\d{4,}', '[REDACTED_NUMBER]', val)
        else:
            sanitized[field] = "Not provided"

    # Restrict urgency
    urgency_val = sanitized.get("urgency", "").lower()
    if urgency_val not in ["low", "medium", "high", "emergency"]:
        sanitized["urgency"] = "medium" # default if invalid
    else:
        sanitized["urgency"] = urgency_val

    return sanitized

def check_duplicate(caller_identifier: str) -> str | None:
    """Checks a local escalations.json file for unresolved escalations to prevent duplicates."""
    if not os.path.exists(ESCALATION_FILE):
        return None

    try:
        with open(ESCALATION_FILE, encoding="utf-8") as f:
            data = json.load(f)
            for esc in data:
                if esc.get("caller_identifier") == caller_identifier and esc.get("status") == "pending":
                    return esc.get("ref_id")
    except Exception as e:
        logger.error(f"Error checking duplicates: {e}")

    return None

def send_to_discord(summary: dict, ref_id: str):
    """Uses the webhook from .env.local to post a formatted Embed."""
    webhook_url = os.environ.get("DISCORD_WEBHOOK_URL")
    if not webhook_url:
        logger.warning("DISCORD_WEBHOOK_URL not set in .env.local. Escalation saved locally but not sent to Discord.")
        return

    urgency = summary.get("urgency", "unknown").lower()
    color = 65280 # Green
    if urgency == "emergency":
        color = 16711680 # Red
    elif urgency == "high":
        color = 16753920 # Orange
    elif urgency == "medium":
        color = 16776960 # Yellow

    embed = {
        "title": f"New Escalation: {ref_id}",
        "color": color,
        "fields": [
            {"name": "Caller", "value": summary.get("caller_identifier", "Unknown"), "inline": True},
            {"name": "Urgency", "value": urgency.upper(), "inline": True},
            {"name": "Language", "value": summary.get("caller_language", "Unknown"), "inline": True},
            {"name": "What Happened", "value": summary.get("what_happened", "None"), "inline": False},
            {"name": "What Agent Checked", "value": summary.get("what_agent_checked", "None"), "inline": False},
            {"name": "Preferred Followup", "value": summary.get("preferred_followup", "Unknown"), "inline": False}
        ],
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

    try:
        resp = requests.post(webhook_url, json={"embeds": [embed]})
        resp.raise_for_status()
    except Exception as e:
        logger.error(f"Error sending escalation to Discord: {e}")

def create_escalation_logic(summary: dict) -> str:
    """Ties the steps together, generates the ESC-XXXXXXXX UUID, and logs to escalations.json."""
    sanitized = sanitize_summary(summary)
    caller = sanitized.get("caller_identifier")

    existing_ref = check_duplicate(caller)
    if existing_ref:
        return f"An unresolved escalation request already exists for this caller with reference ID: {existing_ref}. Please share this existing reference ID with the caller and do not create a new one."

    ref_id = f"ESC-{uuid.uuid4().hex[:8].upper()}"

    # Save to file
    escalations = []
    if os.path.exists(ESCALATION_FILE):
        try:
            with open(ESCALATION_FILE, encoding="utf-8") as f:
                escalations = json.load(f)
        except Exception as e:
            logger.error(f"Error loading {ESCALATION_FILE}: {e}")

    sanitized["ref_id"] = ref_id
    sanitized["status"] = "pending"
    sanitized["timestamp"] = datetime.datetime.utcnow().isoformat() + "Z"

    escalations.append(sanitized)

    try:
        with open(ESCALATION_FILE, "w", encoding="utf-8") as f:
            json.dump(escalations, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving {ESCALATION_FILE}: {e}")
        return "Internal error: could not save escalation request."

    send_to_discord(sanitized, ref_id)

    return f"Success! The escalation was created. The reference ID is {ref_id}."
