import httpx

api_key = "AIzaSyD3oUGlPDQCbB9fAJx1Fizk4oObvHpFESw"
base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

payload = {
    "model": "gemini-2.5-flash",
    "messages": [
        {"role": "system", "content": "Sen bir yemek danışmanısın. Sadece geçerli JSON dön: {\"products\": [\"Tavuk Kanat Kg\"], \"reason\": \"deneme\"}"},
        {"role": "user", "content": "500 TL menü öner."}
    ],
    "temperature": 0.7
}

try:
    resp = httpx.post(
        f"{base_url}chat/completions",
        headers=headers,
        json=payload,
        timeout=15
    )
    print("Status code:", resp.status_code)
    print("Full response text:", resp.text)
except Exception as e:
    print("Error:", e)
