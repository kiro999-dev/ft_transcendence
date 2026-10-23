import logging

from fastapi import FastAPI, HTTPException

from app.models import ChatRequest, ChatResponse
from app.gemini_service import AIServiceError, chat_with_tools

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Real Estate Service", version="0.1.0")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-service"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        result = await chat_with_tools(request.message)
    except AIServiceError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error

    logger.info("Chat completed with %s properties", len(result.properties))
    return ChatResponse(message_received=request.message, **result.model_dump())
