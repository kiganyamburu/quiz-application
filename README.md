# Quiz Application

A full-stack quiz application with fill-in-the-blank questions, scoring, and leaderboards built with Django, React, and PostgreSQL.

## Features

- **Multiple Question Types**: Multiple choice and fill-in-the-blank questions
- **Real-time Scoring**: Automatic answer validation and score calculation
- **Leaderboards**: Global rankings and per-quiz leaderboards
- **Timer**: Optional timed quizzes with elapsed time tracking
- **Guest Support**: Play without registration
- **Answer Review**: See correct answers with explanations after submission
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend

- **Django 4.2+**: Python web framework
- **Django REST Framework**: RESTful API
- **PostgreSQL**: Database
- **Django ORM**: Database abstraction

### Frontend

- **React 18**: UI library
- **React Router**: Client-side routing
- **Axios**: HTTP client

## Project Structure

```
quiz-application/
├── backend/
│   ├── quiz_project/          # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── quiz/                  # Quiz app
│   │   ├── models.py          # Database models (ORM)
│   │   ├── views.py           # API views
│   │   ├── serializers.py     # REST serializers
│   │   ├── urls.py            # API routes
│   │   ├── admin.py           # Admin interface
│   │   └── signals.py         # Auto-update leaderboard
│   ├── templates/             # Django templates
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/        # React components
    │   │   ├── QuizList.js
    │   │   ├── QuizTake.js
    │   │   ├── QuizResults.js
    │   │   └── Leaderboard.js
    │   ├── services/
    │   │   └── api.js         # API service
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE quiz_db;
CREATE USER quiz_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE quiz_db TO quiz_user;
```

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment:

```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create `.env` file (copy from `.env.example`):

```bash
copy .env.example .env
```

5. Update `.env` with your database credentials:

```
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=quiz_db
DB_USER=quiz_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

6. Run migrations:

```bash
python manage.py migrate
```

7. Create a superuser (optional):

```bash
python manage.py createsuperuser
```

8. Seed sample data:

```bash
python manage.py seed_quizzes
```

9. Start the development server:

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The app will be available at `http://localhost:3000`

## API Endpoints

### Quizzes

- `GET /api/quizzes/` - List all quizzes
- `GET /api/quizzes/{id}/` - Get quiz details with questions
- `POST /api/quizzes/{id}/submit/` - Submit quiz answers
- `GET /api/quizzes/{id}/leaderboard/` - Get quiz leaderboard

### Leaderboard

- `GET /api/leaderboard/` - Global leaderboard

### Attempts

- `GET /api/attempts/` - List user's attempts
- `GET /api/attempts/{id}/` - Get attempt details

## Models

### Quiz

- Title, description, time limit
- Contains multiple questions

### Question

- Multiple choice or fill-in-the-blank
- Points value
- Explanation (shown after answering)
- For fill-in-blank: supports multiple correct answers separated by `|`

### QuizAttempt

- Tracks user/guest attempts
- Score, percentage, time taken

### LeaderboardEntry

- Aggregated best scores per user/quiz
- Auto-updated via Django signals

## Fill-in-the-Blank Questions

Use `{{blank}}` in the question text to indicate where the blank should appear:

```python
Question.objects.create(
    question_text='The capital of France is {{blank}}.',
    question_type='FILL_BLANK',
    correct_blank_answer='Paris|paris',  # Multiple accepted answers
    case_sensitive=False,
)
```

## License

MIT License
