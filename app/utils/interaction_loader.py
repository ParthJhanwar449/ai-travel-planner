import pandas as pd
from sqlalchemy import text
from app.utils.database import engine


def load_interactions():
    """
    Load interaction data from database
    Returns a pandas DataFrame
    """

    query = """
        SELECT
            user_id,
            attraction_id,
            event_type
        FROM interactions
    """

    df = pd.read_sql(query, engine)

    return df

def build_interaction_matrix():
    """
    Builds user-attraction interaction matrix
    Returns:
        interaction_matrix (DataFrame)
    """

    df = load_interactions()

    if df.empty:
        return pd.DataFrame()

    # Assign weight (all events = 1 for now)
    df["interaction"] = 1

    interaction_matrix = df.pivot_table(
        index="user_id",
        columns="attraction_id",
        values="interaction",
        aggfunc="sum",
        fill_value=0
    )

    return interaction_matrix

