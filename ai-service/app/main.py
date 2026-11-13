import logging

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from app.stream_chat import stream_chat

from app.models import ChatRequest, ChatResponse
from app.gemini_service import AIServiceError, chat_with_tools
from app.conversations import create_conversation, get_messages, save_exchange
from app.protection import check_access, check_rate_limit
from app.models import ChatMessage, BookingRequest
from app.booking_client import create_visit
from app.rag_routes import router as rag_router
from app.whatsapp import router as whatsapp_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Real Estate Service", version="0.1.0")
app.include_router(rag_router)
app.include_router(whatsapp_router)


@app.get("/health")
async def health():
    logger.info("Health endpoint has been called")
    return {"status": "ok", "service": "ai-service"}


@app.post("/chat", response_model=ChatResponse, dependencies=[Depends(check_rate_limit)])
async def chat(request: ChatRequest):
    try:
        result = await chat_with_tools(request.message, request.history)
    except AIServiceError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error

    logger.info("Chat completed with %s properties", len(result.properties))
    return ChatResponse(message_received=request.message, **result.model_dump())


@app.post("/chat/stream", dependencies=[Depends(check_rate_limit)])
async def chat_stream(request: ChatRequest):
    return StreamingResponse(stream_chat(request), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache"})


@app.post("/conversations", dependencies=[Depends(check_access), Depends(check_rate_limit)])
async def new_conversation():
    return {"conversation_id": create_conversation()}


@app.get("/conversations/{conversation_id}", dependencies=[Depends(check_access), Depends(check_rate_limit)])
async def read_conversation(conversation_id: str):
    messages = get_messages(conversation_id)
    if messages is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"conversation_id": conversation_id, "messages": messages}


@app.post("/conversations/{conversation_id}/messages", response_model=ChatResponse,
          dependencies=[Depends(check_access), Depends(check_rate_limit)])
async def conversation_message(conversation_id: str, request: ChatRequest):
    messages = get_messages(conversation_id)
    if messages is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    history = [ChatMessage(**item) for item in messages[-20:]]
    try:
        result = await chat_with_tools(request.message, history)
    except AIServiceError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    save_exchange(conversation_id, request.message, result.reply)
    return ChatResponse(message_received=request.message, **result.model_dump())


@app.post("/bookings", dependencies=[Depends(check_access), Depends(check_rate_limit)])
async def book_visit(request: BookingRequest):
    data = request.model_dump(mode="json", exclude={"confirmed_by_customer"})
    result = await create_visit(data)
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return result
