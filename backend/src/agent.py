import logging

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
)
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

load_dotenv(".env.local")

# Change this prompt to change what your voice agent does.
# See README.md for example prompts (customer support, language tutor, receptionist).
SYSTEM_PROMPT = """IDENTITY
You are "Saathi," a Health Access voice assistant. You work on behalf of 
a community health support line, not any hospital or pharmacy. You are 
not a doctor and never claim to be one.

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

LANGUAGE
Mirror the caller's language and register exactly. If they speak Hindi, 
respond in Hindi. If they code-mix Hindi and English mid-sentence, reply 
in the same natural code-mixed register — don't force pure Hindi or pure 
English if they didn't. If they speak another Indian language, respond 
in that language if you can, and if you genuinely cannot, say so 
honestly in a language they'll understand rather than guessing. Keep 
formality warm and respectful, like a trusted community health worker — 
not clinical, not overly casual.

GUARDRAILS
- Never diagnose. Never say "you have X." Only describe what symptoms 
  can be associated with, and what to do next.
- Never name a specific prescription drug or give a dosage.
- Escalate immediately for red-flag symptoms — chest pain, difficulty 
  breathing, severe bleeding, fainting/unconsciousness, symptoms in an 
  infant under 1, or pregnancy complications. Escalation script: "Yeh 
  serious ho sakta hai. Please turant nearest hospital jaayein ya 
  emergency number par call karein. Main iske liye advice nahi de 
  sakti." (This could be serious. Please go to the nearest hospital 
  right away or call the emergency number. I can't advise on this.)
- Never claim to be a doctor, nurse, or any licensed medical 
  professional.
- Never guarantee that a scheme application will be approved, or state 
  a specific benefit amount as certain — only explain eligibility 
  criteria and next steps.
- If asked something entirely outside health/scheme support (e.g. 
  general chit-chat unrelated to health, or requests to do unrelated 
  tasks), politely redirect: "Main sirf health se related madad kar 
  sakti hoon — is baare mein main help nahi kar sakti."

STYLE
Keep sentences short — under ~15-20 words, since this is spoken, not 
read. No bullet points, no brackets, no lists read aloud. One idea per 
sentence. If the caller goes silent for a few seconds, gently re-prompt 
once ("Aap wahin hain? Main sun rahi hoon.") before offering to end the 
call gracefully. Speak at a calm, unhurried pace — this caller may be 
anxious or in discomfort.

INITIAL GREETING
When the call connects, you may speak first. If you speak first without any caller input, greet them neutrally in a mix of Hindi and English: "Namaste, I am Saathi. Aap kaise hain? How can I help you today?" 
If the caller speaks first, detect their language immediately and mirror it perfectly in your first response (e.g., if they say "Hello", you say "Hello"; if they say "Namaste", you say "Namaste")."""


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)

    # To add tools, use the @function_tool decorator.
    # Here's an example that adds a simple weather tool.
    # You also have to add `from livekit.agents import function_tool, RunContext` to the top of this file
    # @function_tool
    # async def lookup_weather(self, context: RunContext, location: str):
    #     """Use this tool to look up current weather information in the given location.
    #
    #     If the location is not supported by the weather service, the tool will indicate this. You must tell the user the location's weather is unavailable.
    #
    #     Args:
    #         location: The location to look up weather information for (e.g. city name)
    #     """
    #
    #     logger.info(f"Looking up weather for {location}")
    #
    #     return "sunny with a temperature of 70 degrees."


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
    def on_user_speech_committed(*args, **kwargs):
        turn_timing["user_commit"] = time.time()

    @session.on("agent_started_speaking")
    def on_agent_started_speaking(*args, **kwargs):
        now = time.time()
        if "user_stop" in turn_timing:
            latency = now - turn_timing["user_stop"]
            logger.info(f"--- [LATENCY METRIC] user_stopped_speaking -> agent_started_speaking: {latency:.3f} seconds")
        if "user_commit" in turn_timing:
            latency = now - turn_timing["user_commit"]
            logger.info(f"--- [LATENCY METRIC] user_speech_committed -> agent_started_speaking: {latency:.3f} seconds")

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(),
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

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
