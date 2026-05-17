import httpx
import sys

api_key = "qO-X8Uih_HiApSR5BBwF06mYmNwViSrXvkzkwvqkFx0"

endpoints = [
    {
        "name": "OpenAI",
        "url": "https://api.openai.com/v1/chat/completions",
        "headers": {"Authorization": f"Bearer {api_key}"},
        "json": {"model": "gpt-4o-mini", "messages": [{"role": "user", "content": "test"}]}
    },
    {
        "name": "Groq",
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "headers": {"Authorization": f"Bearer {api_key}"},
        "json": {"model": "llama3-8b-8192", "messages": [{"role": "user", "content": "test"}]}
    },
    {
        "name": "OpenRouter",
        "url": "https://openrouter.ai/api/v1/chat/completions",
        "headers": {"Authorization": f"Bearer {api_key}"},
        "json": {"model": "google/gemma-2-9b-it:free", "messages": [{"role": "user", "content": "test"}]}
    },
    {
        "name": "Together AI",
        "url": "https://api.together.xyz/v1/chat/completions",
        "headers": {"Authorization": f"Bearer {api_key}"},
        "json": {"model": "meta-llama/Llama-3-8b-chat-hf", "messages": [{"role": "user", "content": "test"}]}
    },
    {
        "name": "DeepSeek",
        "url": "https://api.deepseek.com/v1/chat/completions",
        "headers": {"Authorization": f"Bearer {api_key}"},
        "json": {"model": "deepseek-chat", "messages": [{"role": "user", "content": "test"}]}
    },
    {
        "name": "Mistral AI",
        "url": "https://api.mistral.ai/v1/chat/completions",
        "headers": {"Authorization": f"Bearer {api_key}"},
        "json": {"model": "mistral-tiny", "messages": [{"role": "user", "content": "test"}]}
    },
    {
        "name": "Gemini (Google AI Studio OpenAI Compatible)",
        "url": f"https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        "headers": {"Authorization": f"Bearer {api_key}"},
        "json": {"model": "gemini-1.5-flash", "messages": [{"role": "user", "content": "test"}]}
    },
    {
        "name": "Gemini Native API",
        "url": f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}",
        "headers": {"Content-Type": "application/json"},
        "json": {"contents": [{"parts": [{"text": "test"}]}]}
    }
]

print("Starting API key tests...")
for ep in endpoints:
    print(f"\nTesting {ep['name']}...")
    try:
        resp = httpx.post(ep["url"], headers=ep.get("headers"), json=ep.get("json"), timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            print("SUCCESS!")
            print(resp.json())
            sys.exit(0)
        else:
            print(f"Failed. Response: {resp.text[:300]}")
    except Exception as exc:
        print(f"Error testing {ep['name']}: {exc}")
