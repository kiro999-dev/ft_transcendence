from app.models import Property


PROPERTIES = [
    Property(
        id="prop-1",
        city="marrakech",
        price=1800000,
        bedrooms=3,
        property_type="villa",
        available=True,
    ),
    Property(
        id="prop-2",
        city="marrakech",
        price=2200000,
        bedrooms=4,
        property_type="villa",
        available=True,
    ),
    Property(
        id="prop-3",
        city="casablanca",
        price=1500000,
        bedrooms=3,
        property_type="apartment",
        available=True,
    ),
]


def search_properties(
    city: str | None = None,
    property_type: str | None = None,
    max_price: int | None = None,
    bedrooms: int | None = None,
) -> dict:
    """
    Search available real-estate properties.

    Args:
        city: Desired city.
        property_type: Villa, apartment, house, etc.
        max_price: Maximum customer budget.
        bedrooms: Minimum number of bedrooms.
    """

    matches = []

    for prop in PROPERTIES:
        if not prop.available:
            continue

        if city and prop.city.lower() != city.lower():
            continue

        if property_type and prop.property_type.lower() != property_type.lower():
            continue

        if max_price and prop.price > max_price:
            continue

        if bedrooms and prop.bedrooms < bedrooms:
            continue

        matches.append(prop.model_dump())

    return {
        "count": len(matches),
        "properties": matches,
    }