from app.models.city import City
from app.models.city_climate import CityClimate


def get_temperature_multiplier(avg_temp: float) -> float:
    """
    Multiplier based on tourism-friendly temperature.
    """

    if 15 <= avg_temp <= 25:
        return 1.30

    if 26 <= avg_temp <= 32:
        return 1.10

    if 5 <= avg_temp < 15:
        return 1.00

    return 0.85


def calculate_seasonal_hotel_price(
    db,
    base_price: float,
    city_name: str,
    trip_month: int
) -> float:

    city = db.query(City).filter(
        City.name.ilike(city_name)
    ).first()

    if not city:
        return base_price

    climate = db.query(CityClimate).filter(
        CityClimate.city_id == city.id,
        CityClimate.month == trip_month
    ).first()

    if not climate:
        return base_price

    multiplier = get_temperature_multiplier(climate.avg_temperature)

    return round(base_price * multiplier, 2)
    