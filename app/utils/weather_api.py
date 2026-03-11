import requests
from datetime import datetime


def fetch_monthly_climate(latitude: float, longitude: float):
    """
    Fetch monthly average temperature from Open-Meteo archive API.
    Returns: { month: avg_temp }
    """

    url = "https://archive-api.open-meteo.com/v1/archive"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": "2023-01-01",
        "end_date": "2023-12-31",
        "daily": "temperature_2m_mean",
        "timezone": "auto"
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        raise Exception("Weather API request failed")

    data = response.json()

    if "daily" not in data or "time" not in data["daily"] or "temperature_2m_mean" not in data["daily"]:
        raise ValueError("Invalid API response structure")

    daily_dates = data["daily"]["time"]
    daily_temps = data["daily"]["temperature_2m_mean"]

    monthly_data = {}

    for date_str, temp in zip(daily_dates, daily_temps):
        month = datetime.fromisoformat(date_str).month
        monthly_data.setdefault(month, []).append(temp)

    monthly_avg = {
        month: round(sum(temps) / len(temps), 1)
        for month, temps in monthly_data.items()
    }

    return monthly_avg
    