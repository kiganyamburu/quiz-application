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
      <div className="card error-card">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <div className="page-header">
        <div>
          <span className="eyebrow">Scoreboard</span>
          <h1 className="page-title">Leaderboard</h1>
          <p className="page-subtitle">
            Track the regulars, the specialists, and the players chasing the top
            spot.
          </p>
        </div>
      </div>

      <div className="leaderboard-tabs">
        <button
          className={`tab-button ${activeTab === "global" ? "active" : ""}`}
          onClick={() => setActiveTab("global")}
        >
          Global Rankings
        </button>
        <button
          className={`tab-button ${activeTab === "quiz" ? "active" : ""}`}
          onClick={() => setActiveTab("quiz")}
        >
          By Quiz
        </button>
      </div>

      {activeTab === "global" ? (
        <div className="card leaderboard-card">
          <h2 className="section-title">Top Players</h2>

          {globalLeaderboard.length === 0 ? (
            <p className="empty-copy">
              No entries yet. Be the first to complete a quiz.
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
                      <span
                        className={`rank-badge rank-${Math.min(entry.rank, 3)} ${entry.rank > 3 ? "rank-default" : ""}`}
                        style={
                          entry.rank > 3 ? getRankStyle(entry.rank) : undefined
                        }
                      >
                        {entry.rank}
                      </span>
                    </td>
                    <td className="leaderboard-player">{entry.display_name}</td>
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
        <div>
          <div className="card leaderboard-filter-card">
            <label className="field-label">Select a Quiz</label>
            <select
              value={selectedQuiz || ""}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              className="select-input"
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
            <div className="card leaderboard-card">
              <h2 className="section-title">
                {quizzes.find((q) => q.id.toString() === selectedQuiz)?.title} -
                Top Scores
              </h2>

              {quizLeaderboard.length === 0 ? (
                <p className="empty-copy">No attempts yet for this quiz.</p>
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
                          <span
                            className={`rank-badge rank-${Math.min(entry.rank, 3)} ${entry.rank > 3 ? "rank-default" : ""}`}
                            style={
                              entry.rank > 3
                                ? getRankStyle(entry.rank)
                                : undefined
                            }
                          >
                            {entry.rank}
                          </span>
                        </td>
                        <td className="leaderboard-player">
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
