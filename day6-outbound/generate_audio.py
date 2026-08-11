import os
import requests
import time
from dotenv import load_dotenv

load_dotenv()

MURF_API_KEY = os.environ.get("MURF_API_KEY")

PROMPTS = {
    "opening": "Hi, this is an automated health reminder call from City Clinic. I'm calling because you have a Metformin 500 milligram dose due at 8 PM today. If you'd like to stop these reminder calls, just say 'stop' at any time. To continue, please say the last four digits of your registered mobile number.",
    "ask_identity": "Please say the last four digits of your registered mobile number.",
    "identity_failed": "I'm sorry, that doesn't match our records. For your privacy, I cannot continue this call. Goodbye.",
    "ask_status": "Thank you. Have you taken your Metformin dose today? You can say 'I took it', 'I will take it later', or 'I haven't taken it'.",
    "confirm_taken": "Great. I've recorded that you took your dose. Have a good evening. Goodbye.",
    "confirm_later": "Understood. Please remember to take it when you can. Have a good evening. Goodbye.",
    "confirm_stop": "I understand. I have removed you from the reminder list. You won't receive these calls anymore. Goodbye.",
    "confirm_hardship": "I'm sorry to hear that. I am escalating this to our care team, and a nurse will call you back shortly. If this is a medical emergency, please hang up and call emergency services immediately. Goodbye.",
    "confirm_wrong_person": "I sincerely apologize for the inconvenience. I will remove this number from our records. Goodbye.",
    "confirm_human_handoff": "I understand. I will have a care team member call you back as soon as possible. Goodbye.",
    "didnt_catch": "I'm sorry, I didn't catch that. Could you please repeat yourself?"
}

def generate_murf_audio(text, filename):
    audio_dir = os.path.join(os.path.dirname(__file__), "static", "audio")
    os.makedirs(audio_dir, exist_ok=True)
    filepath = os.path.join(audio_dir, f"{filename}.mp3")
    
    if not MURF_API_KEY:
        print(f"No MURF_API_KEY. Creating empty file for {filename}.mp3 (Provide key to generate real audio)")
        with open(filepath, "wb") as f:
            f.write(b"")
        return
        
    print(f"Calling Murf API for {filename}...")
    headers = {
        "Content-Type": "application/json",
        "api-key": MURF_API_KEY
    }
    payload = {
        "voiceId": "en-US-marcus",
        "text": text,
        "format": "MP3"
    }
    
    url = "https://api.murf.ai/v1/speech/generate"
    try:
        import requests
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            # Assuming Murf returns an audioUrl in JSON or raw audio
            # Check content-type
            if 'application/json' in response.headers.get('Content-Type', ''):
                data = response.json()
                if 'audioFile' in data:
                    audio_url = data['audioFile']
                    audio_res = requests.get(audio_url)
                    with open(filepath, "wb") as f:
                        f.write(audio_res.content)
            else:
                with open(filepath, "wb") as f:
                    f.write(response.content)
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Exception calling Murf API: {e}")

if __name__ == "__main__":
    for filename, text in PROMPTS.items():
        generate_murf_audio(text, filename)
        import time
        time.sleep(1)
    print("Done generating audio.")
