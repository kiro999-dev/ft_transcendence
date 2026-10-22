from fastapi import FastAPI
from app.models import ChatRequest
from app.gemini_service import chat_with_tools
from app.gemini_service import chat_with_tools
app = FastAPI(
    title="AI Real Estate Service",
    version="0.1.0"
)

# @app.post("/extract")
# async def extract(request: ChatRequest):
#     requirements = await extract_requirements(request.message)
#     return requirements

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "ai-service"
    }


@app.post("/chat")
async def chat(request: ChatRequest):
    reply = await chat_with_tools(request.message)

    return {
        "message_received": request.message,
        "reply": reply
    }