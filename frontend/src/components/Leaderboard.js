import React, { useState, useEffect } from "react";
import { leaderboardAPI, quizAPI } from "../services/api";

function Leaderboard() {
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [quizLeaderboard, setQuizLeaderboard] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("global");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      loadQuizLeaderboard(selectedQuiz);
    }
  }, [selectedQuiz]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leaderboardData, quizzesData] = await Promise.all([
        leaderboardAPI.getGlobal(),
        quizAPI.getAll(),
      ]);
      setGlobalLeaderboard(leaderboardData);
      setQuizzes(quizzesData.results || quizzesData);
    } catch (err) {
      setError("Failed to load leaderboard. Please try again.");
      console.error("Error loading leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizLeaderboard = async (quizId) => {
    try {
      const data = await quizAPI.getLeaderboard(quizId);
      setQuizLeaderboard(data);
    } catch (err) {
      console.error("Error loading quiz leaderboard:", err);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getRankStyle = (rank) => {
    const baseStyle = {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "700",
      fontSize: "0.875rem",
    };

    if (rank === 1) {
      return {
        ...baseStyle,
        background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
        color: "white",
      };
    }
    if (rank === 2) {
      return {
        ...baseStyle,
        background: "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
        color: "white",
      };
    }
    if (rank === 3) {
      return {
        ...baseStyle,
        background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
        color: "white",
      };
    }
    return { ...baseStyle, background: "#e5e7eb", color: "#374151" };
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
        <button className="btn btn-primary" onClick={loadData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏆 Leaderboard</h1>
        <p className="page-subtitle">
          See how you stack up against other quiz takers!
        </p>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          borderBottom: "2px solid #e5e7eb",
          paddingBottom: "0.5rem",
        }}
      >
        <button
          className={`btn ${activeTab === "global" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("global")}
        >
          Global Rankings
        </button>
        <button
          className={`btn ${activeTab === "quiz" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("quiz")}
        >
          By Quiz
        </button>
      </div>

      {activeTab === "global" ? (
        /* Global Leaderboard */
        <div className="card">
          <h2 style={{ marginBottom: "1rem" }}>Top Players</h2>

          {globalLeaderboard.length === 0 ? (
            <p
              style={{ textAlign: "center", color: "#6b7280", padding: "2rem" }}
            >
              No entries yet. Be the first to complete a quiz!
            </p>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Total Score</th>
                  <th>Quizzes Completed</th>
                  <th>Avg. Score</th>
                </tr>
              </thead>
              <tbody>
                {globalLeaderboard.map((entry) => (
                  <tr key={entry.rank}>
                    <td>
                      <span style={getRankStyle(entry.rank)}>{entry.rank}</span>
                    </td>
                    <td style={{ fontWeight: "500" }}>{entry.display_name}</td>
                    <td>{entry.total_score}</td>
                    <td>{entry.quizzes_completed}</td>
                    <td>{parseFloat(entry.average_percentage).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* Quiz-specific Leaderboard */
        <div>
          <div className="card" style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              Select a Quiz:
            </label>
            <select
              value={selectedQuiz || ""}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "2px solid #e5e7eb",
                fontSize: "1rem",
              }}
            >
              <option value="">Choose a quiz...</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>

          {selectedQuiz && (
            <div className="card">
              <h2 style={{ marginBottom: "1rem" }}>
                {quizzes.find((q) => q.id.toString() === selectedQuiz)?.title} -
                Top Scores
              </h2>

              {quizLeaderboard.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "#6b7280",
                    padding: "2rem",
                  }}
                >
                  No attempts yet for this quiz.
                </p>
              ) : (
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Player</th>
                      <th>Best Score</th>
                      <th>Best %</th>
                      <th>Best Time</th>
                      <th>Attempts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizLeaderboard.map((entry) => (
                      <tr key={entry.id}>
                        <td>
                          <span style={getRankStyle(entry.rank)}>
                            {entry.rank}
                          </span>
                        </td>
                        <td style={{ fontWeight: "500" }}>
                          {entry.display_name}
                        </td>
                        <td>{entry.best_score}</td>
                        <td>{parseFloat(entry.best_percentage).toFixed(1)}%</td>
                        <td>{formatTime(entry.best_time)}</td>
                        <td>{entry.attempts_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
