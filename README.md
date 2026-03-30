# Stock Data Intelligence Dashboard

A full-stack mini financial data platform that collects, processes, and visualizes stock market data using a Python/FastAPI backend and a React/Vite frontend.

## Features
- **Real-time & Historical Data:** Fetches stock data using `yfinance`.
- **Metrics Computation:** Calculates 7-day Moving Averages, 52-week High/Lows, and Volatility (Standard Deviation of returns).
- **Basic ML Prediction:** Predicts the next day's closing price using Scikit-Learn Linear Regression.
- **Comparison Feature:** Compare percentage changes and trends of two different stocks.
- **Glassmorphism UI:** Modern, responsive UI built with Tailwind CSS and Recharts.

## Tech Stack
- **Backend:** Python, FastAPI, SQLite, Pandas, Scikit-Learn.
- **Frontend:** React, Vite, Tailwind CSS, Recharts, Lucide React.
- **Containerization:** Docker for Backend.

## Setup Instructions

### Backend (Python/FastAPI)
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```
   API will be available at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

### Frontend (React/Vite)
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The UI will be available at `http://localhost:5173`.

### Docker (Optional Backend Deployment)
You can run the backend using Docker:
```bash
cd backend
docker build -t stock-backend .
docker run -p 8000:8000 stock-backend
```
