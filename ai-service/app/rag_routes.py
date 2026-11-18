import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.protection import check_rate_limit
from app.agency_context import request_agency
from app import rag

logger = logging.getLogger(__name__)
router = APIRouter(prefix='/knowledge', dependencies=[Depends(check_rate_limit)])


class Document(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    text: str = Field(min_length=1, max_length=50000)


class Question(BaseModel):
    question: str = Field(min_length=1, max_length=4000)


@router.post('/documents')
async def add_document(document: Document, organization_id: str = Depends(request_agency)):
    try:
        return await rag.ingest(document.title, document.text, organization_id)
    except Exception as error:
        logger.warning('Document ingestion failed: %s', type(error).__name__)
        raise HTTPException(status_code=503, detail='Document ingestion unavailable.') from error


@router.post('/ask')
async def ask(question: Question, organization_id: str = Depends(request_agency)):
    try:
        return await rag.answer(question.question, organization_id)
    except Exception as error:
        logger.warning('Knowledge lookup failed: %s', type(error).__name__)
        raise HTTPException(status_code=503, detail='Knowledge lookup unavailable.') from error
