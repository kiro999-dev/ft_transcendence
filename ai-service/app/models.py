from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)

    @field_validator("message")
    @classmethod
    def message_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Message cannot be blank")
        return value


class PropertyRequirements(BaseModel):
    intent: Literal[
        "search_property",
        "book_visit",
        "general_question",
        "unknown"
    ]

    city: Optional[str] = None
    neighborhood: Optional[str] = None
    property_type: Optional[str] = None
    listing_type: Optional[Literal["sale", "rent"]] = None
    max_price: Optional[int] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None


class Property(BaseModel):
    id: str
    city: str
    price: int
    bedrooms: int
    property_type: str
    available: bool

class VisitSlot(BaseModel):
    starts_at: datetime
    ends_at: datetime
    agent_id: str
    agent_name: str


class Availability(BaseModel):
    property_id: str
    date: str
    slots: list[VisitSlot]


class ChatResult(BaseModel):
    reply: str
    properties: list[Property] = Field(default_factory=list)
    property_source: Literal["mock"] = "mock"
    availability: list[Availability] = Field(default_factory=list)
    tool_errors: list[str] = Field(default_factory=list)


class ChatResponse(ChatResult):
    message_received: str
