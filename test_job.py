import os
import requests
import asyncio
from livekit import rtc

async def main():
    print("Fetching token...")
    res = requests.post("http://localhost:3000/api/token?user_id=saathi_123")
    if res.status_code != 200:
        res = requests.post("http://localhost:3001/api/token?user_id=saathi_123")
    
    data = res.json()
    token = data["participantToken"]
    url = data["serverUrl"]
    
    print("Connecting to room...")
    room = rtc.Room()
    
    @room.on("data_received")
    def on_data_received(data_pkt, participant, kind, topic):
        print(f"Data received from {participant.identity}: topic={topic}")
    
    @room.on("track_subscribed")
    def on_track_subscribed(track, publication, participant):
        print(f"Track subscribed from {participant.identity}, kind: {track.kind}")
    
    await room.connect(url, token)
    print("Connected! Waiting for 10 seconds for agent to speak...")
    
    await asyncio.sleep(10)
    print("Disconnecting.")
    await room.disconnect()

asyncio.run(main())
