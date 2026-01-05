# JournalApp Backend

FastAPI backend for the JournalApp digital creative journaling application.

## Features

- RESTful API for journal entries, calendar events, and sync services
- SQLite database (can be upgraded to PostgreSQL/MySQL)
- CORS enabled for React Native mobile app
- FastAPI automatic API documentation
- Structured project layout

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate  # On Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Run the Server

```bash
# Development mode (with auto-reload)
python -m app.main

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py        # Configuration settings
│   └── api/
│       ├── __init__.py
│       └── v1/
│           ├── __init__.py
│           └── endpoints/
│               ├── __init__.py
│               ├── journal.py    # Journal entry endpoints
│               ├── calendar.py   # Calendar event endpoints
│               └── sync.py       # Sync service endpoints
├── requirements.txt
├── .env.example
└── README.md
```

## API Endpoints

### Journal Entries
- `GET /api/v1/journal/entries` - Get all journal entries
- `POST /api/v1/journal/entries` - Create journal entry
- `GET /api/v1/journal/entries/{entry_id}` - Get specific entry
- `PUT /api/v1/journal/entries/{entry_id}` - Update entry
- `DELETE /api/v1/journal/entries/{entry_id}` - Delete entry
- `POST /api/v1/journal/entries/{entry_id}/images` - Upload image

### Calendar Events
- `GET /api/v1/calendar/events` - Get all events
- `POST /api/v1/calendar/events` - Create event
- `GET /api/v1/calendar/events/{event_id}` - Get specific event
- `PUT /api/v1/calendar/events/{event_id}` - Update event
- `DELETE /api/v1/calendar/events/{event_id}` - Delete event

### Sync Services
- `POST /api/v1/sync/notion` - Sync with Notion
- `POST /api/v1/sync/google-calendar` - Sync with Google Calendar
- `POST /api/v1/sync/apple-calendar` - Sync with Apple Calendar
- `GET /api/v1/sync/status` - Get sync status

## Development

### Run in Development Mode

```bash
uvicorn app.main:app --reload
```

### Run Tests

```bash
pytest
```

### Database Migrations (when using SQLAlchemy)

```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migration
alembic upgrade head
```

## Configuration

Edit `.env` file to configure:
- Server host and port
- Database URL
- Secret keys
- CORS origins
- API keys (Notion, Google Calendar)
- File upload settings

## Next Steps

1. Implement database models (SQLAlchemy)
2. Add authentication (JWT tokens)
3. Implement file upload handling
4. Add Notion API integration
5. Add Google Calendar API integration
6. Add database migrations
7. Add unit tests


