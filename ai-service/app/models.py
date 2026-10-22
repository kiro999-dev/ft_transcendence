from typing import Optional, Literal
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str


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