from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class CustomerContext(BaseModel):
    organization_id: str
    lead_id: str
    contact_id: str

    @field_validator('organization_id', 'lead_id', 'contact_id')
    @classmethod
    def valid_uuid(cls, value: str) -> str:
        from uuid import UUID
        return str(UUID(value))


class BookingConfirmation(BaseModel):
    property_id: str
    agent_id: str
    starts_at: datetime
    confirmed_by_customer: Literal[True]
    customer_notes: Optional[str] = Field(default=None, max_length=1000)

    @field_validator('property_id', 'agent_id')
    @classmethod
    def valid_uuid(cls, value: str) -> str:
        from uuid import UUID
        return str(UUID(value))

    @field_validator('starts_at')
    @classmethod
    def timezone_required(cls, value: datetime) -> datetime:
        if value.utcoffset() is None:
            raise ValueError('Timezone is required')
        return value


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)
    context: Optional[CustomerContext] = None
    booking_confirmation: Optional[BookingConfirmation] = None

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
    price: float
    bedrooms: Optional[int] = None
    property_type: str
    available: Optional[bool] = None
    status: Optional[str] = None
    title: Optional[str] = None
    images: list = Field(default_factory=list)

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
    property_source: Literal["mock", "backend"] = "mock"
    availability: list[Availability] = Field(default_factory=list)
    tool_errors: list[str] = Field(default_factory=list)
    knowledge_sources: list[dict] = Field(default_factory=list)
    booking: Optional[dict] = None


class ChatResponse(ChatResult):
    message_received: str


class BookingRequest(BookingConfirmation):
    context: CustomerContext
