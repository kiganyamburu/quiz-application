import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizAPI } from "../services/api";

function QuizTake() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [guestName, setGuestName] = useState("");
  const [showNameInput, setShowNameInput] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  // Timer
  useEffect(() => {
    let interval;
    if (quizStarted && !submitting) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, submitting]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await quizAPI.getById(id);
      setQuiz(data);
    } catch (err) {
      setError("Failed to load quiz. Please try again.");
      console.error("Error loading quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setShowNameInput(false);
    setQuizStarted(true);
  };

  const handleChoiceSelect = (questionId, choiceId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { choice_id: choiceId },
    }));
  };

  const handleBlankAnswer = (questionId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { text_answer: text },
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    setSubmitting(true);

    try {
      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, answer]) => ({
          question_id: parseInt(questionId),
          ...answer,
        }),
      );

      const result = await quizAPI.submit(id, {
        guest_name: guestName,
        time_taken: timeElapsed,
        answers: formattedAnswers,
      });

      navigate(`/results/${result.id}`, { state: { result } });
    } catch (err) {
      setError("Failed to submit quiz. Please try again.");
      console.error("Error submitting quiz:", err);
      setSubmitting(false);
    }
  }, [answers, guestName, id, navigate, submitting, timeElapsed]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderBlankQuestion = (question) => {
    const parts = question.question_text.split("{{blank}}");
    const answer = answers[question.id]?.text_answer || "";

    return (
      <div className="question-text">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <input
                type="text"
                className="blank-input"
                value={answer}
                onChange={(e) => handleBlankAnswer(question.id, e.target.value)}
                placeholder="Type your answer"
                autoFocus
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
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
        <button className="btn btn-primary" onClick={loadQuiz}>
          Retry
        </button>
      </div>
    );
  }

  if (!quiz) return null;

  // Name input screen
  if (showNameInput) {
    return (
      <div className="quiz-container">
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <h1 style={{ marginBottom: "1rem" }}>{quiz.title}</h1>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
            {quiz.description}
          </p>

          <div style={{ marginBottom: "2rem", color: "#374151" }}>
            <p>📝 {quiz.question_count} Questions</p>
            <p>⭐ {quiz.total_points} Total Points</p>
            {quiz.time_limit > 0 && <p>⏱️ {quiz.time_limit} Minutes</p>}
          </div>

          <div className="guest-input">
            <input
              type="text"
              placeholder="Enter your name (optional)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
          </div>

          <button className="btn btn-primary btn-lg" onClick={handleStartQuiz}>
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const hasAnsweredCurrent = !!answers[currentQuestion.id];

  return (
    <div className="quiz-container">
      {/* Header */}
      <div className="quiz-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2>{quiz.title}</h2>
          <div className="timer">⏱️ {formatTime(timeElapsed)}</div>
        </div>

        {/* Progress bar */}
        <div className="quiz-progress">
          <div
            className="quiz-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </p>
      </div>

      {/* Question Card */}
      <div className="question-card">
        <div className="question-number">
          Question {currentQuestionIndex + 1} • {currentQuestion.points} point
          {currentQuestion.points > 1 ? "s" : ""}
        </div>

        {currentQuestion.question_type === "FILL_BLANK" ? (
          renderBlankQuestion(currentQuestion)
        ) : (
          <>
            <p className="question-text">{currentQuestion.question_text}</p>

            <div className="choices">
              {currentQuestion.choices.map((choice, index) => {
                const isSelected =
                  answers[currentQuestion.id]?.choice_id === choice.id;
                const letter = String.fromCharCode(65 + index);

                return (
                  <div
                    key={choice.id}
                    className={`choice ${isSelected ? "selected" : ""}`}
                    onClick={() =>
                      handleChoiceSelect(currentQuestion.id, choice.id)
                    }
                  >
                    <span className="choice-marker">{letter}</span>
                    <span>{choice.choice_text}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="question-nav">
          <button
            className="btn btn-secondary"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            ← Previous
          </button>

          {isLastQuestion ? (
            <button
              className="btn btn-success btn-lg"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleNext}>
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {quiz.questions.map((q, index) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = index === currentQuestionIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: isCurrent ? "2px solid #3b82f6" : "2px solid #e5e7eb",
                  background: isAnswered ? "#3b82f6" : "white",
                  color: isAnswered ? "white" : "#374151",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <p
          style={{
            marginTop: "0.5rem",
            color: "#6b7280",
            fontSize: "0.875rem",
          }}
        >
          {Object.keys(answers).length} of {quiz.questions.length} answered
        </p>
      </div>
    </div>
  );
}

export default QuizTake;
