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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Available Quizzes</h1>
        <p className="page-subtitle">Choose a quiz and test your knowledge!</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "#6b7280" }}>No quizzes available yet.</p>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="card">
              <h2 className="card-title">{quiz.title}</h2>
              <p className="card-description">
                {quiz.description || "No description available"}
              </p>
              <div className="card-meta">
                <span>
                  📝 {quiz.question_count} questions • ⭐ {quiz.total_points}{" "}
                  points
                  {quiz.time_limit > 0 && ` • ⏱️ ${quiz.time_limit} min`}
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
