import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { attemptAPI } from "../services/api";

function QuizResults() {
  const { attemptId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    if (!result) {
      loadResult();
    }
  }, [attemptId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      const data = await attemptAPI.getById(attemptId);
      setResult(data);
    } catch (err) {
      setError("Failed to load results. Please try again.");
      console.error("Error loading results:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return { text: "Excellent! 🎉", color: "#10b981" };
    if (percentage >= 70) return { text: "Great job! 👏", color: "#3b82f6" };
    if (percentage >= 50) return { text: "Good effort! 👍", color: "#f59e0b" };
    return { text: "Keep practicing! 💪", color: "#ef4444" };
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
        <Link to="/" className="btn btn-primary">
          Back to Quizzes
        </Link>
      </div>
    );
  }

  if (!result) return null;

  const scoreMessage = getScoreMessage(parseFloat(result.percentage));

  return (
    <div className="quiz-container">
      {/* Results Summary */}
      <div className="card results-card">
        <h1 style={{ marginBottom: "0.5rem" }}>{result.quiz.title}</h1>
        <p
          style={{
            color: scoreMessage.color,
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "1.5rem",
          }}
        >
          {scoreMessage.text}
        </p>

        <div className="results-score">
          {result.score}/{result.total_points}
        </div>
        <div className="results-percentage">
          {parseFloat(result.percentage).toFixed(1)}%
        </div>

        <div className="results-stats">
          <div className="stat-item">
            <div className="stat-value">
              {result.answers?.filter((a) => a.is_correct).length || 0}
            </div>
            <div className="stat-label">Correct</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {result.answers?.filter((a) => !a.is_correct).length || 0}
            </div>
            <div className="stat-label">Incorrect</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatTime(result.time_taken)}</div>
            <div className="stat-label">Time Taken</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn btn-secondary"
            onClick={() => setShowAnswers(!showAnswers)}
          >
            {showAnswers ? "Hide Answers" : "Review Answers"}
          </button>
          <Link to={`/quiz/${result.quiz.id}`} className="btn btn-primary">
            Try Again
          </Link>
          <Link to="/leaderboard" className="btn btn-secondary">
            View Leaderboard
          </Link>
          <Link to="/" className="btn btn-secondary">
            More Quizzes
          </Link>
        </div>
      </div>

      {/* Answers Review */}
      {showAnswers && result.answers && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>Answer Review</h2>

          {result.answers.map((answer, index) => (
            <div
              key={index}
              className="card"
              style={{
                marginBottom: "1rem",
                borderLeft: `4px solid ${answer.is_correct ? "#10b981" : "#ef4444"}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ fontWeight: "600" }}>Question {index + 1}</span>
                <span
                  style={{
                    color: answer.is_correct ? "#10b981" : "#ef4444",
                    fontWeight: "500",
                  }}
                >
                  {answer.is_correct ? "✓ Correct" : "✗ Incorrect"}
                </span>
              </div>

              <p style={{ marginBottom: "1rem", color: "#374151" }}>
                {answer.question.display_text || answer.question.question_text}
              </p>

              {answer.question.question_type === "MULTIPLE_CHOICE" ? (
                <div>
                  {answer.question.choices.map((choice) => {
                    const isSelected = answer.selected_choice?.id === choice.id;
                    const isCorrect = choice.is_correct;

                    let bgColor = "transparent";
                    if (isCorrect) bgColor = "#d1fae5";
                    else if (isSelected && !isCorrect) bgColor = "#fee2e2";

                    return (
                      <div
                        key={choice.id}
                        style={{
                          padding: "0.75rem",
                          marginBottom: "0.5rem",
                          borderRadius: "8px",
                          background: bgColor,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        {isCorrect && <span>✓</span>}
                        {isSelected && !isCorrect && <span>✗</span>}
                        <span>{choice.choice_text}</span>
                        {isSelected && (
                          <span
                            style={{
                              marginLeft: "auto",
                              color: "#6b7280",
                              fontSize: "0.875rem",
                            }}
                          >
                            (Your answer)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <p style={{ marginBottom: "0.5rem" }}>
                    <strong>Your answer:</strong>{" "}
                    {answer.text_answer || "(No answer)"}
                  </p>
                  <p style={{ color: "#10b981" }}>
                    <strong>Correct answer:</strong>{" "}
                    {answer.question.correct_blank_answer}
                  </p>
                </div>
              )}

              {answer.question.explanation && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    background: "#f3f4f6",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    color: "#374151",
                  }}
                >
                  <strong>Explanation:</strong> {answer.question.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizResults;
