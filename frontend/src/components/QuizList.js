import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { quizAPI } from "../services/api";

function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizAPI.getAll();
      setQuizzes(data.results || data);
    } catch (err) {
      setError("Failed to load quizzes. Please try again.");
      console.error("Error loading quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ color: "#ef4444" }}>{error}</p>
        <button className="btn btn-primary" onClick={loadQuizzes}>
          Retry
        </button>
      </div>
    );
  }

  const totalQuestions = quizzes.reduce(
    (count, quiz) => count + (quiz.question_count || 0),
    0,
  );

  return (
    <div className="page-layout">
      <div className="page-header">
        <div>
          <span className="eyebrow">Pick your arena</span>
          <h1 className="page-title">Available Quizzes</h1>
          <p className="page-subtitle">
            Browse the catalog, find your lane, and chase a score worth posting.
          </p>
        </div>
        <div className="hero-badge-grid">
          <div className="hero-badge">
            <strong>{quizzes.length}</strong>
            <span>live quizzes</span>
          </div>
          <div className="hero-badge">
            <strong>{totalQuestions}</strong>
            <span>questions ready</span>
          </div>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="card empty-state">
          <p>No quizzes available yet.</p>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="card quiz-card">
              <div className="quiz-card-kicker">
                Round {String(quiz.id).padStart(2, "0")}
              </div>
              <h2 className="card-title">{quiz.title}</h2>
              <p className="card-description">
                {quiz.description || "No description available"}
              </p>
              <div className="quiz-card-meta">
                <span>{quiz.question_count} questions</span>
                <span>{quiz.total_points} pts</span>
                <span>
                  {quiz.time_limit > 0 ? `${quiz.time_limit} min` : "Open pace"}
                </span>
              </div>
              <div className="card-meta">
                <span className="card-caption">
                  Fast start, full scoring, instant results.
                </span>
                <Link to={`/quiz/${quiz.id}`} className="btn btn-primary">
                  Start Quiz
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizList;
