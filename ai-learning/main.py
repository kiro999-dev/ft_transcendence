from fastapi import FastAPI
from properties import get_propeties
from pydantic import BaseModel

class PropertySummary(BaseModel):
    name: str
    city: str
    bedrooms: int
class PropertyCreate(BaseModel):
    name: str
    city: str
    bedrooms: int
    price: int
app = FastAPI()
@app.get("/properties", response_model = list[PropertySummary])
async def show_property(bedrooms: int | None = None, price_wanted: int | None = None):
    matches = []

    dyor = get_propeties()
    for dar in dyor:
        if bedrooms is not None and dar["bedrooms"] < bedrooms:
            continue
        if price_wanted is not None and dar["price"] > price_wanted:
            continue
        matches.append({"name" : dar["name"],
            "city": dar["city"], "bedrooms":dar["bedrooms"]})
    return matches
@app.post("/properties")
async def create_property(property : PropertyCreate):
    message = "property received"
    return {"message":message,"property_name" : property.name}