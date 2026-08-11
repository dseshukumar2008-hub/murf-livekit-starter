# Day 6: Outbound Medication Reminder Voice Agent

This project implements an outbound voice agent using Twilio, Flask, and Murf Falcon TTS (pre-generated MP3s). It features a layered architecture with a state machine for standard call flows, guardrails for sensitive inputs, and outcome logging.

## Prerequisites
- Python 3.10+
- Twilio account (Account SID, Auth Token, and a verified Twilio Phone Number)
- Murf AI account (for TTS)
- Ngrok (to expose the local Flask server to the internet)

## Setup
1. **Install dependencies**:
   Run `uv sync` or `pip install -r requirements.txt`. (Note: use `uv add flask twilio requests python-dotenv` if setting up from scratch).
   
2. **Environment Variables**:
   Create a `.env` file in this directory with the following variables:
   ```
   MURF_API_KEY=your_murf_api_key
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_FROM_NUMBER=+1234567890
   TARGET_NUMBER=+0987654321
   PUBLIC_BASE_URL=https://your-ngrok-url.ngrok-free.app
   ```

## Running the Demo
1. **Generate Audio**:
   Generate the required voice prompts via the Murf API.
   ```bash
   python generate_audio.py
   ```
   This will create a `static/audio/` directory with the `.mp3` files.

2. **Start the Flask Server**:
   ```bash
   python app.py
   ```

3. **Start Ngrok**:
   In another terminal, expose port 5000:
   ```bash
   ngrok http 5000
   ```
   *Update `PUBLIC_BASE_URL` in your `.env` with the ngrok URL.*

4. **Trigger the Call**:
   ```bash
   python trigger_call.py
   ```
   Your `TARGET_NUMBER` will receive a call from your `TWILIO_FROM_NUMBER`.

## Test Scenarios
1. **Happy Path**: When asked for identity, say "1234" (the expected digits). Then say "I took it". Confirm a `dose_confirmed` outcome is logged in the `logs/` folder.
2. **Guardrail - Hardship**: When asked for identity, say "I feel dizzy" or "chest pain". The call will immediately terminate gracefully and log a `hardship_escalation`.
3. **No-Answer**: Call a number that won't pick up. Confirm `no_answer` is logged.
4. **Busy**: Call a number that's busy/declined. Confirm `busy` is logged.
5. **Immediate Hang-up**: Answer and hang up within ~1-2 seconds. Confirm `immediate_hangup` is logged, and ensure it does not fire if a real outcome was already logged.
