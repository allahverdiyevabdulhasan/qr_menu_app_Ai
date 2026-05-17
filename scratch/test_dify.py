import httpx

api_key = "app-2r1a4FSDwyvRrKnNlgbOHYic"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

print("Testing Dify Chat-Messages API...")
try:
    resp = httpx.post(
        "https://api.dify.ai/v1/chat-messages",
        headers=headers,
        json={
            "inputs": {},
            "query": "Bugün satışlar nasıl? Bana çok kısa bir cevap ver.",
            "user": "restaurant-owner",
            "response_mode": "blocking"
        },
        timeout=15
    )
    print("Chat status:", resp.status_code)
    print("Chat response:", resp.text[:400])
except Exception as e:
    print("Chat error:", e)

print("\nTesting Dify Completion-Messages API...")
try:
    resp = httpx.post(
        "https://api.dify.ai/v1/completion-messages",
        headers=headers,
        json={
            "inputs": {},
            "query": "Bugün satışlar nasıl? Bana çok kısa bir cevap ver.",
            "user": "restaurant-owner",
            "response_mode": "blocking"
        },
        timeout=15
    )
    print("Completion status:", resp.status_code)
    print("Completion response:", resp.text[:400])
except Exception as e:
    print("Completion error:", e)
