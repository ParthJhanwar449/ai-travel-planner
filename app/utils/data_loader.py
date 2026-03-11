import pandas as pd
from sqlalchemy import create_engine


# 🔥 Replace password with yours
DATABASE_URL = "postgresql+psycopg2://postgres:Parth%40dots@localhost:5432/ai_travel_planner"
engine = create_engine(DATABASE_URL)

def load_attractions():
    query = "SELECT * FROM attractions;"
    df = pd.read_sql(query, engine)
    return df
