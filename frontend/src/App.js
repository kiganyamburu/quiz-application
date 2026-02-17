import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import QuizList from "./components/QuizList";
import QuizTake from "./components/QuizTake";
import QuizResults from "./components/QuizResults";
import Leaderboard from "./components/Leaderboard";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-content">
            <Link to="/" className="navbar-brand">
              🎯 Quiz App
            </Link>
            <div className="navbar-links">
              <Link to="/">Quizzes</Link>
              <Link to="/leaderboard">Leaderboard</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<QuizList />} />
            <Route path="/quiz/:id" element={<QuizTake />} />
            <Route path="/results/:attemptId" element={<QuizResults />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>Quiz Application © 2024 - Test your knowledge!</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
