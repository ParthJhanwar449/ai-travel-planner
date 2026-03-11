import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from collections import defaultdict
import math

from sqlalchemy.orm import Session

from app.ml.model_loader import model_loader
from app.utils.weather import get_season
from app.services.pricing_service import calculate_seasonal_hotel_price

from app.models import City , Trip , TripActivity , Interaction , Attraction, Hotel


# =====================================================
# DISTANCE FUNCTIONS
# =====================================================

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius km

    lat1, lon1, lat2, lon2 = map(
        math.radians,
        [lat1, lon1, lat2, lon2]
    )

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat/2)**2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlon/2)**2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    return R * c


def optimize_day_route(day_df, start_lat, start_lon):

    remaining = day_df.copy()
    route = []

    current_lat = start_lat
    current_lon = start_lon

    while not remaining.empty:

        remaining["distance"] = remaining.apply(
            lambda row: haversine(
                current_lat,
                current_lon,
                row["latitude"],
                row["longitude"]
            ),
            axis=1
        )

        next_stop = remaining.sort_values(
            "distance"
        ).iloc[0]

        route.append(next_stop)

        current_lat = next_stop["latitude"]
        current_lon = next_stop["longitude"]

        remaining = remaining.drop(next_stop.name)

    return pd.DataFrame(route)


# =====================================================
# CORE TRIP GENERATION
# =====================================================

def generate_trip(
    db: Session,
    user_row,
    city: str,
    trip_days: int,
    activities_per_day: int,
    trip_month: int
):

    if model_loader.ranking_model is None:
        model_loader.load()

    ranking_model = model_loader.ranking_model

    # --------------------------
    # Get city
    # --------------------------

    city_obj = db.query(City).filter(
        City.name.ilike(city)
    ).first()

    if not city_obj:
        raise ValueError(f"City not found: {city}")

    attractions = db.query(Attraction).filter(
        Attraction.city_id == city_obj.id
    ).all()

    if not attractions:
        raise ValueError(f"No attractions found for city: {city}")

    # --------------------------
    # Convert DB → DataFrame
    # --------------------------

    city_df = pd.DataFrame([{
        "id": attr.id,
        "name": attr.name,
        "latitude": attr.latitude,
        "longitude": attr.longitude,
        "estimated_cost": attr.estimated_cost,
        "attr_culture_score": attr.attr_culture_score or 0,
        "attr_nature_score": attr.attr_nature_score or 0,
        "attr_entertainment_score": attr.attr_entertainment_score or 0,
    } for attr in attractions])

    city_df["original_cost"] = city_df["estimated_cost"]

    # --------------------------
    # Debug
    # --------------------------

    # print(user_row.keys())
    # print("Model features:", ranking_model.feature_name_)

    # --------------------------
    # User preference features
    # --------------------------

    city_df["interest_culture"] = user_row["interest_culture"]
    city_df["interest_nature"] = user_row["interest_nature"]
    city_df["interest_food"] = user_row["interest_food"]
    city_df["interest_entertainment"] = user_row["interest_entertainment"]

    # outdoor_affinity not in DB
    city_df["outdoor_affinity"] = 0.5

    # --------------------------
    # Category placeholders
    # --------------------------

    city_df["category_attraction"] = 1
    city_df["category_museum"] = 0
    city_df["category_park"] = 0
    city_df["category_theme_park"] = 0

    # --------------------------
    # Budget scoring
    # --------------------------

    budget_mapping = {
        "Low": 130,      # Increased to fit budget hotels (~€65-80)
        "Medium": 250,
        "High": 500
    }

    user_budget_level = user_row.get("budget_level", "Medium").capitalize()

    if user_budget_level not in budget_mapping:
        user_budget_level = "Medium"

    daily_budget = budget_mapping[user_budget_level]
    hotel_budget = daily_budget * 0.6     # 60% for hotel, 40% for attractions
    attraction_budget = daily_budget * 0.4

    # Used for ML feature scaling
    user_budget_limit = daily_budget

    city_df["budget_score"] = (
        1 - (city_df["estimated_cost"] / user_budget_limit)
    ).clip(lower=0)

    # --------------------------
    # Cost ratio
    # --------------------------

    city_df["cost_ratio"] = city_df["estimated_cost"] / user_budget_limit

    # --------------------------
    # Match features
    # --------------------------

    city_df["culture_match"] = (
        city_df["interest_culture"] * city_df["attr_culture_score"]
    )

    city_df["nature_match"] = (
        city_df["interest_nature"] * city_df["attr_nature_score"]
    )

    city_df["entertainment_match"] = (
        city_df["interest_entertainment"] * city_df["attr_entertainment_score"]
    )

    # --------------------------
    # ML Prediction
    # --------------------------

    feature_cols = [
        "estimated_cost",
        "category_attraction",
        "category_museum",
        "category_park",
        "category_theme_park",
        "attr_culture_score",
        "attr_nature_score",
        "attr_entertainment_score",
        "cost_ratio",
        "budget_score",
        "interest_culture",
        "interest_nature",
        "interest_food",
        "interest_entertainment",
        "outdoor_affinity",
        "culture_match",
        "nature_match",
        "entertainment_match",
    ]

    city_df["ml_score"] = ranking_model.predict(city_df[feature_cols])
    # --------------------------
    # Weather adjustment
    # --------------------------

    season = get_season(trip_month)

    city_df["adjusted_score"] = city_df["ml_score"]

    if season in ["Cold", "Hot"]:

        penalty = 0.2

        city_df.loc[
            city_df["attr_nature_score"] == 1,
            "adjusted_score"
        ] = city_df["ml_score"] - penalty

    # --------------------------
    # Ranking
    # --------------------------

    ranked = city_df.sort_values(
        by="adjusted_score",
        ascending=False
    )

    # --------------------------
    # Budget-aware selection
    # --------------------------

    selected = []
    current_budget = 0

    for _, row in ranked.iterrows():

        dynamic_cost = calculate_seasonal_hotel_price(
            db=db,
            base_price=row["original_cost"],
            city_name=city,
            trip_month=trip_month
        )

        if current_budget + dynamic_cost <= attraction_budget * trip_days:

            row["dynamic_cost"] = dynamic_cost
            selected.append(row)

            current_budget += dynamic_cost

        if len(selected) >= trip_days * activities_per_day:
            break

    selected_df = pd.DataFrame(selected)

    if selected_df.empty:
        raise ValueError("No attractions fit within budget.")

    # --------------------------
    # Geographic clustering
    # --------------------------

    if len(selected_df) >= trip_days:

        kmeans = KMeans(
            n_clusters=trip_days,
            random_state=42,
            n_init="auto"
        )

        coords = selected_df[["latitude", "longitude"]]

        selected_df["cluster"] = kmeans.fit_predict(coords) + 1
        cluster_center = selected_df.groupby("cluster")[["latitude","longitude"]].mean().mean()

    else:
        selected_df["cluster"] = 1

    # --------------------------
    # Balanced day assignment
    # --------------------------

    selected_df = selected_df.sort_values(
        by="adjusted_score",
        ascending=False
    ).copy()

    selected_df["day"] = None

    day_counts = {d: 0 for d in range(1, trip_days + 1)}

    for idx, row in selected_df.iterrows():

        cluster_day = row["cluster"]

        if day_counts[cluster_day] < activities_per_day:

            selected_df.at[idx, "day"] = cluster_day
            day_counts[cluster_day] += 1

        else:

            min_day = min(day_counts, key=day_counts.get)

            selected_df.at[idx, "day"] = min_day
            day_counts[min_day] += 1

    # --------------------------
    # Select Best Hotel (Cluster Based)
    # --------------------------

    # Get attraction center for hotel selection
    overall_center = selected_df[["latitude", "longitude"]].mean()
    center_lat = overall_center["latitude"]
    center_lon = overall_center["longitude"]

    # Load hotels
    hotels = db.query(Hotel).filter(
        Hotel.city_id == city_obj.id
    ).all()

    hotel_data = None
    hotel_id = None

    if hotels:
        hotels_df = pd.DataFrame([{
            "id": h.id,
            "name": h.name,
            "latitude": h.latitude,
            "longitude": h.longitude,
            "price_per_night": h.price_per_night
        } for h in hotels])

        # Compute distance to attraction center
        hotels_df["distance"] = (
            (hotels_df["latitude"] - center_lat) ** 2 +
            (hotels_df["longitude"] - center_lon) ** 2
        ) ** 0.5

        # Filter by budget
        hotels_df_filtered = hotels_df[
            hotels_df["price_per_night"] <= hotel_budget
        ]

        if hotels_df_filtered.empty:
            # If no hotel fits the budget, pick the CHEAPEST one (not just closest)
            best_hotel = hotels_df.sort_values("price_per_night").iloc[0]
        else:
            # If budget hotels exist, pick the closest among them
            best_hotel = hotels_df_filtered.sort_values("distance").iloc[0]

        hotel_data = {
            "id": str(best_hotel["id"]),
            "name": best_hotel["name"],
            "price_per_night": float(best_hotel["price_per_night"]),
            "latitude": float(best_hotel["latitude"]),
            "longitude": float(best_hotel["longitude"])
        }
        hotel_id = str(best_hotel["id"])

    # --------------------------
    # Optimize daily route (Starting from Hotel)
    # --------------------------

    # Use hotel as starting point if available, otherwise use center
    start_lat = hotel_data["latitude"] if hotel_data else center_lat
    start_lon = hotel_data["longitude"] if hotel_data else center_lon

    optimized_days = []

    for day in range(1, trip_days + 1):

        day_df = selected_df[selected_df["day"] == day].copy()

        if not day_df.empty:
            optimized = optimize_day_route(
                day_df,
                start_lat,
                start_lon
            )
            optimized_days.append(optimized)

    selected_df = pd.concat(optimized_days)

    # --------------------------
    # Final Cost Calculation
    # --------------------------

    hotel_total_cost = 0
    hotel_price_per_night = 0
    if hotel_data:
        hotel_price_per_night = hotel_data["price_per_night"]
        hotel_total_cost = hotel_price_per_night * trip_days
    
    attractions_cost = float(current_budget)
    total_trip_cost = hotel_total_cost + attractions_cost

    # --------------------------
    # Return result
    # --------------------------

    return {
        "season": season,
        "hotel": hotel_data,
        "hotel_id": hotel_id,
        "daily_budget": daily_budget,
        "hotel_budget": hotel_budget,
        "attraction_budget": attraction_budget,
        "hotel_price_per_night": float(hotel_price_per_night),
        "hotel_total_cost": float(hotel_total_cost),
        "attractions_cost": float(attractions_cost),
        "total_cost": float(total_trip_cost),
        "remaining_budget": float((attraction_budget * trip_days) - attractions_cost),
        "itinerary": selected_df[
            ["id", "name", "dynamic_cost", "day"]
        ]
        .rename(columns={"dynamic_cost": "estimated_cost"})
        .sort_values(by="day")
        .to_dict(orient="records")
    }


# =====================================================
# SAVE TRIP
# =====================================================

def generate_and_save_trip(
    db: Session,
    user_id: int,
    user_row,
    city: str,
    trip_days: int,
    activities_per_day: int,
    trip_month: int
):

    result = generate_trip(
        db=db,
        user_row=user_row,
        city=city,
        trip_days=trip_days,
        activities_per_day=activities_per_day,
        trip_month=trip_month
    )

    new_trip = Trip(
        user_id=user_id,
        city=city,
        trip_days=trip_days,
        total_cost=result["total_cost"],
        season=result["season"],
        hotel_id=result.get("hotel_id")
    )

    db.add(new_trip)
    db.flush()

    for activity in result["itinerary"]:

        trip_activity = TripActivity(
            trip_id=new_trip.id,
            attraction_id=activity["id"],
            day=activity["day"],
            cost=activity["estimated_cost"]
        )

        db.add(trip_activity)

        interaction = Interaction(
            user_id=user_id,
            attraction_id=activity["id"],
            event_type="generate"
        )

        db.add(interaction)

    db.commit()
    db.refresh(new_trip)

    return {
        "trip_id": new_trip.id,
        **result
    }


# =====================================================
# USER TRIPS
# =====================================================

def get_user_trips(db: Session, user_id: int):

    return (
        db.query(Trip)
        .filter(Trip.user_id == user_id)
        .order_by(Trip.created_at.desc())
        .all()
    )


def get_trip_detail(db: Session, user_id: int, trip_id: int):

    trip = (
        db.query(Trip)
        .filter(Trip.id == trip_id, Trip.user_id == user_id)
        .first()
    )

    if not trip:
        return None

    activities = (
        db.query(TripActivity)
        .filter(TripActivity.trip_id == trip_id)
        .all()
    )

    itinerary = defaultdict(list)

    for activity in activities:

        attraction = (
            db.query(Attraction)
            .filter(Attraction.id == activity.attraction_id)
            .first()
        )

        itinerary[activity.day].append({
            "id": attraction.id,
            "name": attraction.name,
            "latitude": attraction.latitude,
            "longitude": attraction.longitude,
            "cost": activity.cost
        })

    hotel_data = None
    if trip.hotel:
        hotel_data = {
            "name": trip.hotel.name,
            "price_per_night": trip.hotel.price_per_night,
            "latitude": trip.hotel.latitude,
            "longitude": trip.hotel.longitude
        }

    attractions_cost = float(sum(activity.cost for activity in activities if activity.cost))
    total_cost = float(trip.total_cost or 0)
    hotel_total_cost = total_cost - attractions_cost

    return {
        "id": trip.id,
        "city": trip.city,
        "season": trip.season,
        "total_cost": total_cost,
        "hotel_total_cost": hotel_total_cost,
        "attractions_cost": attractions_cost,
        "trip_days": trip.trip_days,
        "created_at": trip.created_at,
        "itinerary": dict(itinerary),
        "hotel": hotel_data
    }
