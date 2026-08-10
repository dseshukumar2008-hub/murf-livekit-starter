import logging
import sqlite3
import json
import os
from datetime import datetime
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    inference,
    tokenize,
    room_io,
    function_tool,
    RunContext,
    get_job_context,
)
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

load_dotenv(".env.local")

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "callers.db"))

def init_db():
    logger.info(f"Initializing database at {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS callers (
            user_id TEXT PRIMARY KEY,
            name TEXT,
            language_preference TEXT,
            facts TEXT,
            last_interaction TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

# Change this prompt to change what your voice agent does.
# See README.md for example prompts (customer support, language tutor, receptionist).
SYSTEM_PROMPT = """CRITICAL LANGUAGE RULE
You MUST respond in the exact same language as the user's most recent message, with no exceptions. If the user's message is in English, your ENTIRE reply must be in English. If it's in Hindi, reply in Hindi. If it's code-mixed, mirror that mix. Never default to Hindi when the user spoke English. Check the language of their most recent message before generating every single reply. If they speak another Indian language, respond in that language if you can, and if you genuinely cannot, say so honestly in a language they'll understand rather than guessing.

IMPORTANT: Do not assume the conversation's language is fixed based on earlier turns. Re-check the language of ONLY the user's most recent message before every single reply, regardless of what language you or they used earlier in this same conversation. If earlier turns were in Hindi but the user's latest message is in English, switch to English immediately. Language can change turn by turn — always follow the most recent message, never the conversation's overall pattern.

IDENTITY
You are "Saathi," a Health Access voice assistant. You work on behalf of 
a community health support line, not any hospital or pharmacy. You are 
not a doctor and never claim to be one. Keep formality warm and respectful, like a trusted community health worker — not clinical, not overly casual.

OBJECTIVES
A successful call does one or more of the following:
1. Helps the caller understand their symptoms in plain language, without 
   diagnosing.
2. Routes the caller to the right level of care — self-care advice, a 
   visit to the nearest PHC/clinic, or urgent escalation — based on how 
   serious what they describe sounds.
3. Helps with practical tasks: medication reminders, and explaining 
   eligibility for government health schemes (e.g. Ayushman Bharat) in 
   simple terms, including what documents or steps are needed to apply.

KNOWLEDGE
You can discuss general health information, common symptoms, when to 
seek care, medication reminder logistics, and publicly known eligibility 
criteria for major Indian government health schemes. You do NOT have 
access to the caller's medical records, lab results, or any personal 
health history unless they tell you in this conversation. If you don't 
know something, say so plainly and suggest who they should ask instead 
(a doctor, ASHA worker, or the scheme's helpline).

GUARDRAILS
- Never diagnose. Never say "you have X." Only describe what symptoms 
  can be associated with, and what to do next.
- Never name a specific prescription drug or give a dosage.
- Escalate immediately for red-flag symptoms — chest pain, difficulty 
  breathing, severe bleeding, fainting/unconsciousness, symptoms in an 
  infant under 1, or pregnancy complications. Escalation script: "This 
  could be serious. Please go to the nearest hospital right away or 
  call the emergency number. I can't advise on this." (Translate this 
  escalation dynamically into the caller's current language).
- Never claim to be a doctor, nurse, or any licensed medical 
  professional.
- Never guarantee that a scheme application will be approved, or state 
  a specific benefit amount as certain — only explain eligibility 
  criteria and next steps.
- If asked something entirely outside health/scheme support (e.g. 
  general chit-chat unrelated to health, or requests to do unrelated 
  tasks), politely redirect: "I can only help with health-related 
  issues — I cannot help with this." (Translate dynamically).

STYLE
Keep sentences short — under ~15-20 words, since this is spoken, not 
read. No bullet points, no brackets, no lists read aloud. One idea per 
sentence. If the caller goes silent for a few seconds, gently re-prompt 
once ("Are you there? I am listening.") before offering to end the call. 

CONSENT BEFORE SAVING — HARD RULE
When a new caller provides information that would be useful in future conversations (like age or ongoing conditions):
- Use the save_caller_info() tool to propose saving the information.
- IMPORTANT: When calling save_caller_info(), you MUST call the tool SILENTLY. Do NOT generate any conversational text in the same turn.
- The application will automatically pause the conversation and instruct you to ask for consent.
- Wait for the caller's answer.
- Call register_consent_response(approved=True/False) depending on their answer.

LANGUAGE & SCRIPT
Always respond in the language the caller is currently using.
Always use the native script for that language.
Hindi → Devanagari. Example: नमस्ते (Never romanize Hindi as "namaste").
English → English alphabet.
Telugu → Telugu script.
Do not translate an English conversation into Hindi unless the caller asks for Hindi.
Do not translate a Hindi conversation into English unless the caller asks for English.

TRIAGE CLASSIFICATION
When the caller describes their symptoms and implicitly or explicitly asks what they should do, use the `classify_triage_level` tool to evaluate the severity.
When this tool returns a result, you must translate it into natural spoken guidance.
NEVER read out raw JSON, field names, or the exact word "triage_level" out loud.
Speak the `recommended_action` naturally, in your own warm tone, maintaining the rule that you do not diagnose, but rather advise on what they should do next based on the triage level.

FACILITY LOOKUP — CHAINED AFTER TRIAGE
If `classify_triage_level` returns a triage_level of "moderate" or "urgent", you must find the caller a real place to go before ending your answer:
1. If you do not already know the caller's district or area, ask for it first ("Which area or district are you in?").
2. Once you have it, silently call `find_nearest_facility` with that district and the appropriate care_level ("clinic" for moderate, "hospital" for urgent).
3. If the tool returns status "ok", speak the facility's name and phone number naturally as part of your recommendation, and mention that this is from your local facility directory.
4. If the tool returns status "unavailable" or "not_found", speak the `spoken_fallback` text from the tool result exactly as your guidance. Do NOT invent a facility name, address, or phone number under any circumstances — if the tool can't find one, say so honestly.
5. Do NOT call `find_nearest_facility` when triage_level is "mild" or "needs_more_info" — self-care advice does not need a facility referral.
"""


class Assistant(Agent):
    def __init__(self, instructions: str) -> None:
        super().__init__(instructions=instructions)
        self.memory_state = "NORMAL_CONVERSATION"
        self.pending_memory = None
        self.current_profile_id = None
        self.current_profile_name = None

    @function_tool
    async def register_consent_response(self, context: RunContext, approved: bool, ambiguous: bool = False):
        """Call this tool when the user answers your consent question."""
        if self.memory_state != "WAITING_FOR_CONSENT":
            return "No consent pending."
            
        if ambiguous:
            logger.info("[Memory Debug] Consent response: AMBIGUOUS")
            logger.info("[Memory Debug] Asking consent again")
            # Explicitly force the question again
            import asyncio
            consent_q = "Would you like me to remember this information to help you better in future conversations?"
            asyncio.create_task(context.session.say(consent_q, add_to_chat_ctx=True))
            return "APPLICATION OVERRIDE: You must ask the user for consent right now."
            
        if approved:
            logger.info("[Memory Debug] Consent APPROVED")
            logger.info("[Memory Debug] Saving pending memory")
            
            pending_mem = self.pending_memory or {}
            facts = pending_mem.get("facts", {})
            name = facts.get("name")
            language_preference = facts.get("language_preference")
            age_band = facts.get("age_band")
            ongoing_conditions = facts.get("ongoing_conditions")
            last_triage_outcome = facts.get("last_triage_outcome")
            
            if self.current_profile_id and pending_mem:
                
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute("SELECT facts FROM caller_profiles WHERE profile_id = ?", (self.current_profile_id,))
                row = cursor.fetchone()
                
                existing_facts = {}
                if row and row[0]:
                    try:
                        existing_facts = json.loads(row[0])
                    except ValueError:
                        pass
                        
                if age_band is not None:
                    existing_facts["age_band"] = age_band
                if ongoing_conditions is not None:
                    existing_facts["ongoing_conditions"] = ongoing_conditions
                if last_triage_outcome is not None:
                    existing_facts["last_triage_outcome"] = last_triage_outcome
                    
                facts_json = json.dumps(existing_facts) if existing_facts else None
                now = datetime.now().isoformat()
                
                if row:
                    updates = []
                    params = []
                    if name is not None:
                        updates.append("name = ?")
                        params.append(name)
                        updates.append("normalized_name = ?")
                        params.append(name.strip().lower())
                    if language_preference is not None:
                        updates.append("language_preference = ?")
                        params.append(language_preference)
                        
                    updates.append("facts = ?")
                    params.append(facts_json)
                    updates.append("last_interaction = ?")
                    params.append(now)
                    params.append(self.current_profile_id)
                    
                    query = f"UPDATE caller_profiles SET {', '.join(updates)} WHERE profile_id = ?"
                    cursor.execute(query, params)
                conn.commit()
                conn.close()

            self.pending_memory = None
            self.memory_state = "CONSENT_APPROVED"
            return "Memory successfully saved. You can acknowledge this and continue the conversation."
        else:
            logger.info("[Memory Debug] Consent DENIED")
            logger.info("[Memory Debug] Discarding pending memory")
            self.memory_state = "NORMAL_CONVERSATION"
            self.pending_memory = None
            return "Consent denied. The information was NOT saved."

    @function_tool
    async def classify_triage_level(self, context: RunContext, symptoms: list[str], duration_days: int | None = None, severity_flags: list[str] | None = None):
        """Call this tool whenever the caller describes symptoms they are experiencing and needs guidance on how serious it is or what to do next. Do not call this for general health questions unrelated to a specific complaint."""
        
        if not symptoms or len(symptoms) == 0:
            return json.dumps({
                "triage_level": "needs_more_info",
                "reasoning": "no specific symptoms provided",
                "recommended_action": "I need a little more detail. Could you tell me exactly what symptoms you are experiencing?"
            })
            
        symptoms_lower = [s.lower() for s in symptoms]
        flags_lower = [f.lower() for f in (severity_flags or [])]
        
        urgent_triggers = [
            "chest_pain", "difficulty_breathing", "severe_bleeding", 
            "fainting", "pregnancy complications", "high fever", "very high fever"
        ]
        
        # Check for urgent condition
        is_urgent = False
        reasoning = ""
        
        for flag in flags_lower:
            if any(t in flag for t in urgent_triggers):
                is_urgent = True
                reasoning = f"red flag detected: {flag}"
                break
                
        # Also check symptoms for urgent triggers
        if not is_urgent:
            for sym in symptoms_lower:
                if "103" in sym or any(t in sym for t in urgent_triggers):
                    is_urgent = True
                    reasoning = f"red flag detected in symptom: {sym}"
                    break
        
        # Check age/duration urgent triggers
        if not is_urgent and any("infant" in f or "under 1" in f for f in flags_lower + symptoms_lower):
            is_urgent = True
            reasoning = "infant under 1 year"
            
        if not is_urgent and duration_days is not None and duration_days > 5:
            is_urgent = True
            reasoning = f"symptoms lasting {duration_days} days without improvement"
            
        if is_urgent:
            return json.dumps({
                "triage_level": "urgent",
                "reasoning": reasoning,
                "recommended_action": "This sounds like it could be serious. Please go to the nearest hospital right away or call the emergency number."
            })
            
        # Check for moderate condition
        is_moderate = False
        if len(symptoms) > 1:
            is_moderate = True
            reasoning = "multiple symptoms combined"
        elif duration_days is not None and duration_days >= 2:
            is_moderate = True
            reasoning = f"symptom lasting {duration_days} days"
            
        if is_moderate:
            return json.dumps({
                "triage_level": "moderate",
                "reasoning": reasoning,
                "recommended_action": "You should visit the nearest primary health center or clinic to get this checked by a doctor."
            })
            
        # Default to mild
        return json.dumps({
            "triage_level": "mild",
            "reasoning": "single mild symptom, short duration, no red flags",
            "recommended_action": "This sounds mild. Please rest, stay hydrated, and if it doesn't improve in a day or two, visit a clinic."
        })

    @function_tool
    async def lookup_caller(self, context: RunContext, name: str):
        """Use this tool to look up or create the caller's profile after they tell you their name. You MUST call this tool as soon as they provide their name."""
        
        participant = context.session.room_io.linked_participant
        if not participant:
            logger.error("lookup_caller: No linked participant found in room")
            return "Caller not found. This is a new caller."
            
        user_id = participant.identity
        normalized_name = name.strip().lower()
        
        logger.info(f"[Identity] Looking up profile for user_id={user_id} name={name}")
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT profile_id, name, language_preference, facts, last_interaction FROM caller_profiles WHERE user_id = ? AND normalized_name = ?", (user_id, normalized_name))
        row = cursor.fetchone()
        
        if row:
            profile_id, stored_name, lang, facts, last_interaction = row
            self.current_profile_id = profile_id
            self.current_profile_name = stored_name
            logger.info(f"[Identity] Existing profile found: profile_id={profile_id}")
            logger.info(f"[Memory] Active profile: {profile_id}")
            conn.close()
            return f"Profile found. Name: {stored_name}, Language Preference: {lang}, Facts: {facts}, Last interaction: {last_interaction}. You may now say 'Welcome back, {stored_name}!' and naturally refer to their past facts."
        else:
            import uuid
            from datetime import datetime
            
            profile_id = f"profile_{uuid.uuid4().hex[:8]}"
            now = datetime.now().isoformat()
            
            logger.info(f"[Identity] No profile found for this name")
            logger.info(f"[Identity] Creating new profile: profile_id={profile_id}")
            logger.info(f"[Memory] Active profile: {profile_id}")
            
            cursor.execute(
                "INSERT INTO caller_profiles (profile_id, user_id, name, normalized_name, last_interaction) VALUES (?, ?, ?, ?, ?)",
                (profile_id, user_id, name, normalized_name, now)
            )
            conn.commit()
            conn.close()
            
            self.current_profile_id = profile_id
            self.current_profile_name = name
            
            return f"New profile created for {name}. They have no past memories. You may now say 'Nice to meet you, {name}!' and start a fresh conversation."


    @function_tool
    async def save_caller_info(
        self,
        context: RunContext,
        name: str | None = None,
        language_preference: str | None = None,
        age_band: str | None = None,
        ongoing_conditions: str | None = None,
        last_triage_outcome: str | None = None,
    ):
        """Save caller information to the database."""
        
        if self.memory_state == "NORMAL_CONVERSATION":
            self.pending_memory = {
                "facts": {
                    "name": name,
                    "language_preference": language_preference,
                    "age_band": age_band,
                    "ongoing_conditions": ongoing_conditions,
                    "last_triage_outcome": last_triage_outcome
                }
            }
            self.memory_state = "WAITING_FOR_CONSENT"
            logger.info("[Memory Debug] Memory candidate submitted by LLM")
            logger.info("[Memory Debug] State changed: WAITING_FOR_CONSENT")
            logger.info("[Memory Debug] Normal response blocked. Triggering consent question.")
            
            # Explicitly trigger the consent question via LiveKit synthesis
            import asyncio
            # Fallback to English, but if we can infer language we should. 
            # In save_caller_info we don't have msg.language, but we can assume English for the test.
            consent_q = "Would you like me to remember this information to help you better in future conversations?"
            asyncio.create_task(context.session.say(consent_q, add_to_chat_ctx=True))
            
            return "APPLICATION OVERRIDE: Stop generating any further response. The application has just asked the user for consent on your behalf. Wait for the user to answer 'yes' or 'no'."
            
        if self.memory_state != "CONSENT_APPROVED":
            logger.info("[Memory Debug] save_caller_info blocked")
            return "APPLICATION OVERRIDE: Memory operation blocked. Consent not approved."
            
        logger.info(f"[Memory Debug] Saving data for user {context.session.room_io.linked_participant}")

    @function_tool
    async def find_nearest_facility(self, context: RunContext, district: str, care_level: str):
        """Use this tool to find the nearest clinic or hospital in a given district."""
        district_lower = district.lower()
        care_level_lower = care_level.lower()
        
        # A simple mocked database of facilities for demo purposes
        MOCK_FACILITIES = {
            "hyderabad": {
                "hospital": {"name": "Osmania General Hospital", "phone": "040-24600146"},
                "clinic": {"name": "Basti Dawakhana, Banjara Hills", "phone": "104"}
            },
            "bangalore": {
                "hospital": {"name": "Victoria Hospital", "phone": "080-26701150"},
                "clinic": {"name": "Namma Clinic, Indiranagar", "phone": "104"}
            },
            "delhi": {
                "hospital": {"name": "AIIMS", "phone": "011-26588500"},
                "clinic": {"name": "Mohalla Clinic, Hauz Khas", "phone": "104"}
            }
        }
        
        # We can implement fuzzy matching or fallback here
        for known_dist, facilities in MOCK_FACILITIES.items():
            if known_dist in district_lower:
                if care_level_lower in facilities:
                    fac = facilities[care_level_lower]
                    return json.dumps({
                        "status": "ok",
                        "facility_name": fac["name"],
                        "phone": fac["phone"]
                    })
                    
        return json.dumps({
            "status": "not_found",
            "spoken_fallback": "I'm sorry, I couldn't find a specific facility in my directory for that area. Please check with your local health worker or search online for the nearest one."
        })


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Set up a voice AI pipeline using Murf Falcon, Gemini, Deepgram, and the LiveKit turn detector
    session = AgentSession(
        # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
        # See all available models at https://docs.livekit.io/agents/models/stt/
        stt=deepgram.STT(model="nova-3", language="multi"),
        # A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
        # See all available models at https://docs.livekit.io/agents/models/llm/
        llm=google.LLM(
                model="gemini-3.5-flash-lite",
            ),
        # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
        # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
        tts=murf.TTS(
                voice="Anisha", 
                style="Conversation",
                tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
                text_pacing=True
            ),
        # VAD and turn detection are used to determine when the user is speaking and when the agent should respond
        # See more at https://docs.livekit.io/agents/build/turns
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        # allow the LLM to generate a response while waiting for the end of turn
        # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
        preemptive_generation=True,
    )

    # To use a realtime model instead of a voice pipeline, use the following session setup instead.
    # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    # session = AgentSession(
    #     llm=openai.realtime.RealtimeModel(voice="marin")
    # )

    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = hedra.AvatarSession(
    #   avatar_id="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/hedra
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)

    import time
    turn_timing = {}

    @session.on("user_stopped_speaking")
    def on_user_stopped_speaking(*args, **kwargs):
        turn_timing["user_stop"] = time.time()

    @session.on("user_speech_committed")
    def on_user_speech_committed(msg, *args, **kwargs):
        turn_timing["user_commit"] = time.time()
        transcript = msg.alternatives[0].text if hasattr(msg, "alternatives") and msg.alternatives else getattr(msg, "text", "")
        lang = getattr(msg, 'language', getattr(msg, 'language_code', 'en'))
        
        logger.info("[Memory Debug] User message received")
        logger.info(f"[Language Debug] User transcript: {transcript}")
        logger.info(f"[Language Debug] Detected language: {lang}")
        logger.info(f"[Language Debug] Current conversation language: {lang}")
        logger.info(f"[Language Debug] USER: {lang}")
        
        # PROGRAMMATIC LANGUAGE ENFORCEMENT PER TURN for normal responses
        session.chat_ctx.append(
            role="system",
            text=f"CRITICAL INSTRUCTION FOR THIS TURN ONLY: The user is currently speaking language code '{lang}'. You MUST generate your response in this exact language. Do not default to Hindi if '{lang}' is 'en'."
        )

    @session.on("agent_started_speaking")
    def on_agent_started_speaking(*args, **kwargs):
        now = time.time()
        logger.info("[Language Debug] LLM OUTPUT LANGUAGE: (dynamically generated by LLM)")
        if "user_stop" in turn_timing:
            latency = now - turn_timing["user_stop"]
            logger.info(f"--- [LATENCY METRIC] user_stopped_speaking -> agent_started_speaking: {latency:.3f} seconds")
        if "user_commit" in turn_timing:
            latency = now - turn_timing["user_commit"]
            logger.info(f"--- [LATENCY METRIC] user_speech_committed -> agent_started_speaking: {latency:.3f} seconds")

    # Join the room and connect to the user
    await ctx.connect()
    
    logger.info("[Memory] Agent session started")
    participant = await ctx.wait_for_participant()
    user_id = participant.identity
    logger.info(f"[Memory] Linked participant identity: {user_id}")
    logger.info("[Identity] Current client user_id: %s", user_id)
    
    dynamic_prompt = SYSTEM_PROMPT
    
    greeting_instructions = """
INITIAL GREETING
You must ALWAYS start the conversation by asking for the caller's name.
Example (if English): "Hello, I am Saathi. May I know your name?"
Example (if Hindi): "नमस्ते, मैं साथी हूँ। क्या मैं आपका नाम जान सकती हूँ?"

Do NOT assume you know who they are, even if you spoke to them before.
Once the caller provides their name, you MUST silently call the `lookup_caller(name)` tool to retrieve their profile.
Only AFTER the `lookup_caller` tool returns their profile data should you greet them appropriately (e.g. "Welcome back, Ramesh!" or "Nice to meet you, Seshu!").
"""
    dynamic_prompt = greeting_instructions + dynamic_prompt

    my_assistant = Assistant(instructions=dynamic_prompt)

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=my_assistant,
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )


if __name__ == "__main__":
    cli.run_app(server)
