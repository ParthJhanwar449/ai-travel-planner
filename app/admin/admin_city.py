from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
import pandas as pd
import json
from io import StringIO
from pydantic import BaseModel

from app.utils.database import get_db
from app.models.city import City
from app.models.city_climate import CityClimate
from app.schemas.city_schema import CityResponse
from app.auth.admin_dependency import admin_required
from app.utils.weather_api import fetch_monthly_climate


router = APIRouter(
    prefix="/admin/cities",
    tags=["Admin - Cities"]
)


# ---------------------------------------------------
# REQUEST MODEL FOR BULK DELETE
# ---------------------------------------------------

class BulkDeleteRequest(BaseModel):
    ids: list[str]


# ---------------------------------------------------
# GET CITIES (SEARCH + PAGINATION)
# ---------------------------------------------------

@router.get("/", response_model=list[CityResponse])
def list_cities(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    query = db.query(City)

    # Search by name
    if search:
        query = query.filter(City.name.ilike(f"%{search}%"))

    offset = (page - 1) * limit

    cities = (
        query
        .order_by(City.name)
        .offset(offset)
        .limit(limit)
        .all()
    )

    return cities


# ---------------------------------------------------
# BULK DELETE CITIES
# ---------------------------------------------------

@router.delete("/bulk-delete")
def bulk_delete_cities(
    request: BulkDeleteRequest,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    cities = db.query(City).filter(City.id.in_(request.ids)).all()

    if not cities:
        raise HTTPException(status_code=404, detail="Cities not found")

    deleted_count = len(cities)

    try:
        for city in cities:
            db.delete(city)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete cities")

    return {
        "deleted": deleted_count
    }


# ---------------------------------------------------
# BULK UPLOAD (INSERT + UPDATE + WEATHER FETCH)
# ---------------------------------------------------

@router.post("/bulk-upload")
async def bulk_upload_cities(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    inserted = 0
    updated = 0
    failed = 0
    errors = []
    seen_names = set()

    try:
        content = await file.read()
        filename = file.filename.lower()

        if filename.endswith(".csv"):
            df = pd.read_csv(StringIO(content.decode("utf-8")))
            records = df.to_dict(orient="records")

        elif filename.endswith(".json"):
            records = json.loads(content.decode("utf-8"))

        else:
            raise HTTPException(
                status_code=400,
                detail="Only CSV and JSON supported"
            )

        for index, row in enumerate(records, start=1):

            try:
                city_name = row.get("name")

                if not city_name:
                    raise Exception("City name missing")

                if city_name.lower() in seen_names:
                    raise Exception("Duplicate city in uploaded file")

                seen_names.add(city_name.lower())

                existing = db.query(City).filter(
                    City.name.ilike(city_name)
                ).first()

                # --------------------------------
                # UPDATE EXISTING CITY
                # --------------------------------
                if existing:

                    existing.country = row.get("country")
                    existing.description = row.get("description")
                    existing.hero_image_url = row.get("hero_image_url")
                    existing.avg_daily_budget = row.get("avg_daily_budget")
                    try:
                        existing.latitude = float(row.get("latitude"))
                        existing.longitude = float(row.get("longitude"))
                    except (ValueError, TypeError):
                        raise Exception("Invalid latitude/longitude format, must be numeric")

                    db.commit()
                    updated += 1

                # --------------------------------
                # INSERT NEW CITY
                # --------------------------------
                else:

                    try:
                        lat = float(row.get("latitude"))
                        lng = float(row.get("longitude"))
                    except (ValueError, TypeError):
                        raise Exception("Invalid latitude/longitude format, must be numeric")

                    new_city = City(
                        name=city_name,
                        country=row.get("country"),
                        description=row.get("description"),
                        hero_image_url=row.get("hero_image_url"),
                        avg_daily_budget=row.get("avg_daily_budget"),
                        latitude=lat,
                        longitude=lng
                    )

                    db.add(new_city)
                    db.commit()
                    db.refresh(new_city)

                    # Fetch monthly weather data
                    monthly_data = fetch_monthly_climate(
                        latitude=new_city.latitude,
                        longitude=new_city.longitude
                    )

                    for month, avg_temp in monthly_data.items():
                        climate = CityClimate(
                            city_id=new_city.id,
                            month=month,
                            avg_temperature=avg_temp
                        )
                        db.add(climate)

                    db.commit()

                    inserted += 1

            except Exception as e:

                db.rollback()

                failed += 1
                errors.append({
                    "row": index,
                    "error": str(e)
                })

        return {
            "inserted": inserted,
            "updated": updated,
            "failed": failed,
            "errors": errors
        }

    except Exception as e:

        raise HTTPException(status_code=400, detail=str(e))
        