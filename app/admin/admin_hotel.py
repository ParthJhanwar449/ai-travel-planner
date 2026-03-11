from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session, joinedload
import pandas as pd
import json
from io import StringIO
from pydantic import BaseModel

from app.utils.database import get_db
from app.models.hotel import Hotel
from app.models.city import City
from app.auth.admin_dependency import admin_required


router = APIRouter(
    prefix="/admin/hotels",
    tags=["Admin - Hotels"]
)


# ---------------------------------------------------
# REQUEST MODEL FOR BULK DELETE
# ---------------------------------------------------

class BulkDeleteRequest(BaseModel):
    ids: list[int]


# ---------------------------------------------------
# GET HOTELS (SEARCH + PAGINATION + CITY NAME)
# ---------------------------------------------------

@router.get("/")
def list_hotels(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    query = db.query(Hotel).options(joinedload(Hotel.city))

    # Search by hotel name
    if search:
        query = query.filter(Hotel.name.ilike(f"%{search}%"))

    offset = (page - 1) * limit

    hotels = (
        query
        .order_by(Hotel.name)
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": h.id,
            "name": h.name,
            "city_id": h.city_id,
            "city_name": h.city.name if h.city else None,
            "latitude": h.latitude,
            "longitude": h.longitude,
            "price_per_night": h.price_per_night,
            "rating": h.rating,
            "amenities": h.amenities,
            "total_rooms": h.total_rooms,
            "image_url": h.image_url
        }
        for h in hotels
    ]


# ---------------------------------------------------
# BULK DELETE HOTELS
# ---------------------------------------------------

@router.delete("/bulk-delete")
def bulk_delete_hotels(
    request: BulkDeleteRequest,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    hotels = db.query(Hotel).filter(Hotel.id.in_(request.ids)).all()

    if not hotels:
        raise HTTPException(status_code=404, detail="Hotels not found")

    deleted_count = len(hotels)

    try:
        for hotel in hotels:
            db.delete(hotel)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete hotels")

    return {
        "deleted": deleted_count
    }


# ---------------------------------------------------
# BULK UPLOAD (INSERT + UPDATE MODE)
# Accepts CSV or JSON
# Uses city_name instead of city_id
# ---------------------------------------------------

@router.post("/bulk-upload")
async def bulk_upload_hotels(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    inserted = 0
    updated = 0
    failed = 0
    errors = []

    seen_keys = set()

    try:
        content = await file.read()
        filename = file.filename.lower()

        # -------------------------------
        # Parse File
        # -------------------------------

        if filename.endswith(".csv"):
            df = pd.read_csv(StringIO(content.decode("utf-8")))
            records = df.to_dict(orient="records")

        elif filename.endswith(".json"):
            records = json.loads(content.decode("utf-8"))

        else:
            raise HTTPException(
                status_code=400,
                detail="Only CSV and JSON files are supported"
            )

        # -------------------------------
        # Process Rows
        # -------------------------------

        for index, row in enumerate(records, start=1):

            try:
                city_name = row.get("city_name")
                hotel_name = row.get("name")

                if not city_name:
                    raise Exception("city_name missing")

                if not hotel_name:
                    raise Exception("Hotel name missing")

                # Prevent duplicates inside file
                duplicate_key = (hotel_name.lower(), city_name.lower())

                if duplicate_key in seen_keys:
                    raise Exception("Duplicate entry in uploaded file")

                seen_keys.add(duplicate_key)

                # Find city
                city = db.query(City).filter(
                    City.name.ilike(city_name)
                ).first()

                if not city:
                    raise Exception(f"City '{city_name}' not found")

                existing = db.query(Hotel).filter(
                    Hotel.name.ilike(hotel_name),
                    Hotel.city_id == city.id
                ).first()

                # --------------------------------
                # UPDATE EXISTING
                # --------------------------------

                if existing:

                    try:
                        existing.latitude = float(row.get("latitude"))
                        existing.longitude = float(row.get("longitude"))
                        existing.price_per_night = float(row.get("price_per_night"))
                    except (ValueError, TypeError) as fe:
                        raise Exception(f"Invalid numeric value: {fe}")

                    existing.rating = row.get("rating")
                    existing.amenities = row.get("amenities")
                    existing.total_rooms = row.get("total_rooms")
                    existing.image_url = row.get("image_url")

                    db.commit()
                    updated += 1

                # --------------------------------
                # INSERT NEW
                # --------------------------------

                else:

                    try:
                        lat = float(row.get("latitude"))
                        lng = float(row.get("longitude"))
                        price = float(row.get("price_per_night"))
                    except (ValueError, TypeError) as fe:
                        raise Exception(f"Invalid numeric value: {fe}")

                    new_hotel = Hotel(
                        name=hotel_name,
                        city_id=city.id,
                        latitude=lat,
                        longitude=lng,
                        price_per_night=price,
                        rating=row.get("rating"),
                        amenities=row.get("amenities"),
                        total_rooms=row.get("total_rooms"),
                        image_url=row.get("image_url")
                    )

                    db.add(new_hotel)
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
        