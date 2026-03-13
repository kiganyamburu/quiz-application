import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import QuizList from "./components/QuizList";
import QuizTake from "./components/QuizTake";
import QuizResults from "./components/QuizResults";
import Leaderboard from "./components/Leaderboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import "./index.css";

function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-mark">Q</span>
          <span>
            <span className="navbar-brand-name">Quiz Atlas</span>
            <span className="navbar-brand-tag">
              Playful quizzes, sharper bragging rights
            </span>
          </span>
        </Link>
        <div className="navbar-links">
          <Link to="/">Quizzes</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          {isAuthenticated ? (
            <>
              <span className="navbar-user">Hi, {user?.username}</span>
              <button onClick={logout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="app">
      <div className="app-backdrop app-backdrop-left" />
      <div className="app-backdrop app-backdrop-right" />
      <NavBar />

      <div className="main-shell">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<QuizList />} />
            <Route path="/quiz/:id" element={<QuizTake />} />
            <Route path="/results/:attemptId" element={<QuizResults />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </div>

      <footer className="footer">
        <p>Quiz Atlas © 2026</p>
        <span>
          Built for quick matches, loud scoreboards, and repeat rounds.
        </span>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
