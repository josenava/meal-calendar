# Meal Calendar

A simple, personal meal planning web application optimized for iPad.

## Features

- 📅 Weekly calendar view with navigation
- 🍳 Add/edit/delete meals for breakfast, lunch, and dinner
- 📋 Copy meals to other days
- 💾 SQLite database for persistent storage
- 🐳 Docker deployment

## Quick Start

```bash
# Start the application
docker-compose up -d --build

# Access the app
open http://localhost:5175
```

## Development

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

## Port

- Frontend: `5175`

## Tech Stack

- **Frontend**: React 18, Vite, Vanilla CSS
- **Backend**: FastAPI, SQLAlchemy, SQLite
- **Deployment**: Docker, Nginx
