import joblib
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "travel_ranker.pkl"


class ModelLoader:

    def __init__(self):
        self.ranking_model = None

    def load(self):

        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"ML model not found at {MODEL_PATH}"
            )

        self.ranking_model = joblib.load(MODEL_PATH)

        print("ML ranking model loaded successfully.")


# Singleton instance
model_loader = ModelLoader()