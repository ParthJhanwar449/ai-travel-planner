# AI Travel Planner

An AI-powered travel planning application that generates personalized travel itineraries based on user preferences, budget, and machine learning-based attraction ranking.

---

## Features

- User authentication (Login / Register)
- Preference-based travel recommendations
- Machine learning attraction ranking
- Budget-aware itinerary planning
- Smart hotel selection near attractions
- Daily budget breakdown
- Interactive map showing attractions and hotel locations

---

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Leaflet Maps

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy

### Machine Learning
- LightGBM ranking model
- Attraction embeddings
- Personalized recommendations

---

## Project Structure

```text
ai-travel-planner
│
├── backend
│ ├── app
│ │ ├── routes
│ │ ├── services
│ │ ├── models
│ │ └── main.py
│
├── frontend
│ ├── app
│ ├── components
│ └── services
│
└── notebooks
```

---

## Running the Project Locally

### Backend

```bash
cd backend
uvicorn app.main:app --reload
```

Backend runs on:
http://localhost:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
http://localhost:3000

---

## Machine Learning Model

The application uses a LightGBM ranking model to rank attractions based on:
- user interests
- attraction category scores
- budget compatibility
- estimated attraction cost

The ranked attractions are used to generate optimized travel itineraries.

---

## Future Improvements

- Route optimization between attractions
- Multi-city trip planning
- Real-time weather integration
- Improved recommendation model

---

## Author

Parth Jhanwar
