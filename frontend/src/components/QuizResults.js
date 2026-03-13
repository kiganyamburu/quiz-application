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
      <div className="card error-card">
        <p>{error}</p>
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
      <div className="card results-card">
        <span className="eyebrow">Final score</span>
        <h1 className="results-title">{result.quiz.title}</h1>
        <p className="results-message" style={{ color: scoreMessage.color }}>
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

        <div className="results-actions">
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

      {showAnswers && result.answers && (
        <div className="answer-review">
          <h2 className="section-title">Answer Review</h2>

          {result.answers.map((answer, index) => (
            <div
              key={index}
              className={`card review-card ${answer.is_correct ? "correct" : "incorrect"}`}
            >
              <div className="review-header">
                <span className="review-label">Question {index + 1}</span>
                <span className="review-status">
                  {answer.is_correct ? "✓ Correct" : "✗ Incorrect"}
                </span>
              </div>

              <p className="review-question">
                {answer.question.display_text || answer.question.question_text}
              </p>

              {answer.question.question_type === "MULTIPLE_CHOICE" ? (
                <div className="review-choices">
                  {answer.question.choices.map((choice) => {
                    const isSelected = answer.selected_choice?.id === choice.id;
                    const isCorrect = choice.is_correct;

                    return (
                      <div
                        key={choice.id}
                        className={`review-choice ${isCorrect ? "correct" : ""} ${isSelected && !isCorrect ? "selected-wrong" : ""}`}
                      >
                        {isCorrect && <span>✓</span>}
                        {isSelected && !isCorrect && <span>✗</span>}
                        <span>{choice.choice_text}</span>
                        {isSelected && (
                          <span className="review-note">Your answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="review-copy-block">
                  <p>
                    <strong>Your answer:</strong>{" "}
                    {answer.text_answer || "(No answer)"}
                  </p>
                  <p className="review-correct-answer">
                    <strong>Correct answer:</strong>{" "}
                    {answer.question.correct_blank_answer}
                  </p>
                </div>
              )}

              {answer.question.explanation && (
                <div className="review-explanation">
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
