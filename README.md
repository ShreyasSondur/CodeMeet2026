# CodeMeet 2026

Full-stack application with Next.js frontend and FastAPI backend.

## Project Structure

```
CODEMEET2026/
├── backend/                # FastAPI Backend
│   ├── venv/               # Python virtual environment
│   ├── main.py             # FastAPI entrypoint & CORS configuration
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Backend environment configuration
└── frontend/               # Next.js Frontend
    ├── src/
    │   ├── app/            # App router pages & layouts
    │   └── lib/api.ts      # Backend API connection helper
    ├── .env.local          # Frontend environment variables
    ├── package.json
    └── tsconfig.json
```

## Running the Backend

```bash
cd backend
# Windows:
.\venv\Scripts\uvicorn main:app --reload --port 8000
# macOS/Linux:
# ./venv/bin/uvicorn main:app --reload --port 8000
```
Backend API docs will be accessible at: `http://localhost:8000/docs`

## Running the Frontend

```bash
cd frontend
npm run dev
```
Frontend will be accessible at: `http://localhost:3000`
