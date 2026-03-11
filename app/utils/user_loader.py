import pandas as pd
from sqlalchemy import create_engine

import os
from sqlalchemy import text

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql+psycopg2://postgres:Parth%40dots@localhost:5432/ai_travel_planner")

engine = create_engine(DATABASE_URL)


def get_user_by_id(user_id: int):
    query = text("SELECT * FROM users WHERE id = :user_id")
    df = pd.read_sql(query, engine, params={"user_id": user_id})

    if df.empty:
        raise ValueError("User not found")

    return df.iloc[0].to_dict()
