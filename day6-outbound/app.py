"""
Flask server driving the outbound medication reminder call.

Every incoming speech result is checked against guardrails.py FIRST
(hardship/wrong-person/human-request/opt-out always win). If nothing trips,
the state machine advances normally: OPENING -> IDENTITY_VERIFICATION ->
MED_CONTEXT -> OUTCOME. Every call ends with exactly one outcome_log entry.
"""

import os
from flask import Flask, request, Response
from twilio.twiml.voice_response import VoiceResponse, Gather

import guardrails
from state_machine import CallState, Outcome, verify_identity
from outcome_log import write_outcome

app = Flask(__name__)

PUBLIC_BASE_URL = os.environ.get("PUBLIC_BASE_URL", "http://localhost:5000")

# Demo patient record -- in a real system this comes from your DB, looked
# up by the number being dialed. Kept inline here so the demo is self
# contained; see mock_data.py-style pattern in the example project.
PATIENT = {
    "name": "Demo Patient",
    "medication": "Metformin 500mg",
    "dose_time": "8 PM",
    "registered_mobile_last_four": "1234",
    "do_not_call": False,
}

# in-memory per-call state; fine for a single demo call
CALL_STATE: dict[str, CallState] = {}


def audio_url(name: str) -> str:
    return f"{PUBLIC_BASE_URL}/static/audio/{name}.mp3"


def gather_response(action: str, line: str) -> VoiceResponse:
    vr = VoiceResponse()
    gather = Gather(input="speech", action=action, method="POST", speech_timeout="auto")
    gather.play(audio_url(line))
    vr.append(gather)
    vr.redirect(action.replace("handle", "retry"))
    return vr


@app.route("/voice/twiml", methods=["GET", "POST"])
def voice_twiml():
    """Pre-call guardrail check, then the opening line. Who / why / opt-out."""
    call_sid = request.values.get("CallSid", "")

    if guardrails.is_blocked(PATIENT):
        write_outcome(call_sid, PATIENT["name"], Outcome.OPTED_OUT, "blocked pre-call: do_not_call flag")
        vr = VoiceResponse()
        vr.hangup()
        return Response(str(vr), mimetype="text/xml")

    CALL_STATE[call_sid] = CallState.OPENING
    vr = VoiceResponse()
    vr.play(audio_url("opening"))  # states who, why, and how to opt out
    vr.redirect(f"{PUBLIC_BASE_URL}/voice/identity")
    return Response(str(vr), mimetype="text/xml")


@app.route("/voice/identity", methods=["GET", "POST"])
def voice_identity():
    call_sid = request.values.get("CallSid", "")
    CALL_STATE[call_sid] = CallState.IDENTITY_VERIFICATION
    return Response(
        str(gather_response(f"{PUBLIC_BASE_URL}/voice/handle-identity", "ask_identity")),
        mimetype="text/xml",
    )


@app.route("/voice/retry-identity", methods=["GET", "POST"])
def voice_retry_identity():
    vr = VoiceResponse()
    vr.play(audio_url("didnt_catch"))
    vr.hangup()
    return Response(str(vr), mimetype="text/xml")


@app.route("/voice/handle-identity", methods=["POST"])
def handle_identity():
    call_sid = request.values.get("CallSid", "")
    speech = request.values.get("SpeechResult") or ""

    guardrail_hit = guardrails.check(speech)
    if guardrail_hit:
        return _resolve_guardrail(call_sid, guardrail_hit)

    if verify_identity(PATIENT["registered_mobile_last_four"], speech):
        CALL_STATE[call_sid] = CallState.MED_CONTEXT
        vr = gather_response(f"{PUBLIC_BASE_URL}/voice/handle-response", "ask_status")
        return Response(str(vr), mimetype="text/xml")
    else:
        write_outcome(call_sid, PATIENT["name"], Outcome.IDENTITY_MISMATCH, speech)
        vr = VoiceResponse()
        vr.play(audio_url("identity_failed"))
        vr.hangup()
        return Response(str(vr), mimetype="text/xml")


@app.route("/voice/handle-response", methods=["POST"])
def handle_response():
    call_sid = request.values.get("CallSid", "")
    speech = (request.values.get("SpeechResult") or "").lower()

    guardrail_hit = guardrails.check(speech)
    if guardrail_hit:
        return _resolve_guardrail(call_sid, guardrail_hit)

    vr = VoiceResponse()
    if "taken" in speech or "already" in speech:
        vr.play(audio_url("confirm_taken"))
        write_outcome(call_sid, PATIENT["name"], Outcome.DOSE_CONFIRMED, speech)
        vr.hangup()
    elif "later" in speech or "remind" in speech:
        vr.play(audio_url("confirm_later"))
        write_outcome(call_sid, PATIENT["name"], Outcome.REMINDER_DEFERRED, speech)
        vr.hangup()
    else:
        vr.redirect(f"{PUBLIC_BASE_URL}/voice/retry-identity")  # reuses the "didn't catch" -> hangup path
    return Response(str(vr), mimetype="text/xml")


def _resolve_guardrail(call_sid: str, hit: str) -> Response:
    """Guardrail trips always win -- end the call on the matching outcome."""
    line_by_hit = {
        "hardship_escalation": "confirm_hardship",
        "wrong_person": "confirm_wrong_person",
        "human_handoff": "confirm_human_handoff",
        "opt_out": "confirm_stop",
    }
    outcome_by_hit = {
        "hardship_escalation": Outcome.HARDSHIP_ESCALATION,
        "wrong_person": Outcome.WRONG_PERSON,
        "human_handoff": Outcome.HUMAN_HANDOFF,
        "opt_out": Outcome.OPTED_OUT,
    }
    write_outcome(call_sid, PATIENT["name"], outcome_by_hit[hit], f"guardrail: {hit}")
    vr = VoiceResponse()
    vr.play(audio_url(line_by_hit[hit]))
    vr.hangup()
    return Response(str(vr), mimetype="text/xml")


@app.route("/voice/status", methods=["POST"])
def voice_status():
    """Twilio status callback -- outcome handling for no-answer/busy/voicemail."""
    call_sid = request.values.get("CallSid", "")
    status = request.values.get("CallStatus", "")
    answered_by = request.values.get("AnsweredBy", "")

    if status == "no-answer":
        write_outcome(call_sid, PATIENT["name"], Outcome.UNKNOWN, "no-answer: retry once in 15-30 min, cap 2/day")
    elif status == "busy":
        write_outcome(call_sid, PATIENT["name"], Outcome.UNKNOWN, "busy: retry in 5 min, else SMS fallback")
    elif answered_by.startswith("machine"):
        write_outcome(call_sid, PATIENT["name"], Outcome.UNKNOWN, "voicemail detected: short message left, no retry")
    elif status == "completed" and call_sid not in CALL_STATE:
        # call completed but no outcome route ever fired (e.g. hung up mid-ring)
        write_outcome(call_sid, PATIENT["name"], Outcome.UNKNOWN, "completed with no resolved outcome")

    return ("", 204)


if __name__ == "__main__":
    app.run(port=5000, debug=True)
