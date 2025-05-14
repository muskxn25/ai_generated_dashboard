# Student Analytics Dashboard with LLM Integration

This project is a modern web application that provides a dashboard for student analytics with LLM-powered insights. It uses FastAPI for the backend, React for the frontend, and Hugging Face's free models for LLM capabilities.

## Features
- Student performance analytics
- LLM-powered insights and recommendations
- Interactive dashboard with charts and graphs
- Real-time data updates
- Natural language query interface

## Setup Instructions

### Backend Setup
1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the backend server:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm start
```

## Environment Variables
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=sqlite:///./student_data.db
MODEL_NAME=facebook/bart-large-cnn  # or any other free model from Hugging Face
```

## API Documentation
Once the server is running, visit `http://localhost:8000/docs` for the API documentation. 