# Project Summary – AI Travel Planner

## Overview

The AI Travel Planner is a full-stack web application that generates personalized travel itineraries based on user preferences, budget constraints, and machine learning–based attraction ranking.  

The system integrates a modern frontend, a scalable backend API, and a machine learning ranking model to recommend attractions and optimize travel plans for users.

---

## Objective

The goal of this project is to demonstrate how machine learning can be integrated into a full-stack application to solve a real-world problem: planning travel itineraries that match user interests while staying within a specified budget.

---

## System Architecture

The application follows a **three-layer architecture**:

### Frontend
Built using **Next.js with TypeScript and Tailwind CSS**, the frontend provides:

- User authentication interface
- Preference selection
- Trip generation form
- Interactive map visualization
- Budget breakdown display

### Backend
The backend is implemented using **FastAPI** and handles:

- User authentication and authorization
- Trip generation logic
- Attraction ranking using a machine learning model
- Budget optimization
- Database operations

### Database
A **PostgreSQL database** stores:

- Users
- Attractions
- Hotels
- Generated trips

---

## Machine Learning Component

The system uses a **LightGBM ranking model** to rank attractions.

The model considers several features such as:

- User interest scores
- Attraction category relevance
- Estimated attraction cost
- Budget compatibility

The output ranking score is used to prioritize attractions during itinerary generation.

---

## Trip Generation Pipeline

The trip generation process follows this pipeline:

User Preferences  
↓  
Budget Level Selection  
↓  
Budget Allocation (Hotel + Attractions)  
↓  
Hotel Selection  
↓  
Machine Learning Attraction Ranking  
↓  
Budget-Constrained Attraction Selection  
↓  
Daily Itinerary Generation  
↓  
Trip Stored in Database  
↓  
Trip Displayed in Frontend

---

## Budget Allocation Strategy

Each trip follows a simple budget allocation rule:

- **60% of the daily budget → Hotel**
- **40% of the daily budget → Attractions**

This ensures the system always generates trips that stay within the user’s budget.

---

## Key Features

- User authentication and profile management
- Preference-based attraction recommendations
- Machine learning attraction ranking
- Budget-aware itinerary generation
- Smart hotel selection near attractions
- Daily budget breakdown
- Interactive map showing attractions and hotels
- Admin dashboard for managing data

---

## Technologies Used

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Leaflet Maps

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL

### Machine Learning
- LightGBM
- NumPy
- Pandas

---

## Future Improvements

Potential improvements for future development include:

- Route optimization between attractions
- Multi-city itinerary planning
- Real-time weather integration
- More advanced recommendation models
- Deployment to a cloud platform

---

## Conclusion

This project demonstrates how machine learning can be integrated with modern web technologies to build intelligent applications. The AI Travel Planner provides a practical example of combining backend APIs, frontend interfaces, and ML models to solve a real-world planning problem.