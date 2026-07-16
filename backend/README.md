# SentinelAI Backend

This repository contains the backend scaffold for the **SentinelAI** project using FastAPI.

## Features

- Python 3.12 compatible
- FastAPI application structure
- Modular architecture with `api`, `core`, and `utils`
- Environment configuration using `.env`
- Logging setup
- Health check endpoint at `/api/v1/health`
- CORS middleware enabled
- Docker and Docker Compose support

## Getting Started

### Requirements

- Python 3.12
- Docker (optional)

### Install dependencies

```bash
python -m pip install -r requirements.txt
```

### Run locally

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Docker

```bash
docker build -t sentinelai-backend .
docker run -p 8000:8000 sentinelai-backend
```

### Docker Compose

```bash
docker compose up --build
```

### Environment variables

Copy `.env.example` to `.env` and update values as needed.

## Project Structure

```
backend/
│
├── app/
│   ├── main.py
│   ├── api/
│   │   └── v1/
│   ├── core/
│   └── utils/
│
├── tests/
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```
