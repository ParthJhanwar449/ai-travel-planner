from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session, joinedload
import pandas as pd
import json
from io import StringIO
from datetime import time
from pydantic import BaseModel

from app.utils.database import get_db
from app.models.attraction import Attraction
from app.models.city import City
from app.schemas.attraction_schema import AttractionResponse
from app.auth.admin_dependency import admin_required


router = APIRouter(
    prefix="/admin/attractions",
    tags=["Admin - Attractions"]
)


# ---------------------------------------------------
# REQUEST MODEL FOR BULK DELETE
# ---------------------------------------------------

class BulkDeleteRequest(BaseModel):
    ids: list[int]


# ---------------------------------------------------
# GET ATTRACTIONS (SEARCH + PAGINATION)
# ---------------------------------------------------

@router.get("/", response_model=list[AttractionResponse])
def list_attractions(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=100),
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    query = db.query(Attraction).options(joinedload(Attraction.city))

    # Search by attraction name
    if search:
        query = query.filter(Attraction.name.ilike(f"%{search}%"))

    offset = (page - 1) * limit

    attractions = (
        query
        .order_by(Attraction.name)
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": a.id,
            "name": a.name,
            "city_id": a.city_id,
            "city_name": a.city.name if a.city else None,
            "latitude": a.latitude,
            "longitude": a.longitude,
            "estimated_cost": a.estimated_cost,
            "opening_time": a.opening_time,
            "closing_time": a.closing_time,
            "closed_days": a.closed_days
        }
        for a in attractions
    ]


# ---------------------------------------------------
# BULK DELETE ATTRACTIONS
# ---------------------------------------------------

@router.delete("/bulk-delete")
def bulk_delete_attractions(
    request: BulkDeleteRequest,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    attractions = db.query(Attraction).filter(
        Attraction.id.in_(request.ids)
    ).all()

    if not attractions:
        raise HTTPException(status_code=404, detail="Attractions not found")

    deleted_count = len(attractions)

    for attraction in attractions:
        db.delete(attraction)

    db.commit()

    return {
        "deleted": deleted_count
    }


# ---------------------------------------------------
# BULK UPLOAD (INSERT + UPDATE MODE)
# Accepts CSV or JSON
# Uses city_name instead of city_id
# ---------------------------------------------------

@router.post("/bulk-upload")
async def bulk_upload_attractions(
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

        for index, row in enumerate(records, start=1):

            try:
                city_name = row.get("city_name")
                attraction_name = row.get("name")

                if not city_name:
                    raise Exception("city_name missing")

                if not attraction_name:
                    raise Exception("Attraction name missing")

                duplicate_key = (
                    attraction_name.lower(),
                    city_name.lower()
                )

                if duplicate_key in seen_keys:
                    raise Exception("Duplicate entry in uploaded file")

                seen_keys.add(duplicate_key)

                city = db.query(City).filter(
                    City.name.ilike(city_name)
                ).first()

                if not city:
                    raise Exception(f"City '{city_name}' not found")

                # Convert time safely
                opening_time = row.get("opening_time")
                closing_time = row.get("closing_time")

                if opening_time:
                    opening_time = time.fromisoformat(str(opening_time))

                if closing_time:
                    closing_time = time.fromisoformat(str(closing_time))

                existing = db.query(Attraction).filter(
                    Attraction.name.ilike(attraction_name),
                    Attraction.city_id == city.id
                ).first()

                # --------------------------------
                # UPDATE
                # --------------------------------
                if existing:

                    existing.latitude = float(row.get("latitude"))
                    existing.longitude = float(row.get("longitude"))
                    existing.estimated_cost = float(row.get("estimated_cost", 0))
                    existing.opening_time = opening_time
                    existing.closing_time = closing_time
                    existing.closed_days = row.get("closed_days")

                    db.commit()
                    updated += 1

                # --------------------------------
                # INSERT
                # --------------------------------
                else:

                    new_attraction = Attraction(
                        name=attraction_name,
                        city_id=city.id,
                        latitude=float(row.get("latitude")),
                        longitude=float(row.get("longitude")),
                        estimated_cost=float(row.get("estimated_cost", 0)),
                        opening_time=opening_time,
                        closing_time=closing_time,
                        closed_days=row.get("closed_days")
                    )

                    db.add(new_attraction)
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
