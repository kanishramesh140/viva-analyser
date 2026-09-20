import { useEffect, useState } from "react";

import AuthPage from "./components/auth/AuthPage.jsx";
import FacultyDashboard from "./pages/FacultyDashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";

import {
  getCurrentUser,
  logout,
} from "./api/auth.js";

export default function App() {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((result) => {
        setUser(
          result.user
        );
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="loading-screen">
        Loading Viva Analyser...
      </main>
    );
  }

  if (!user) {
    return (
      <AuthPage
        onAuthenticated={
          setUser
        }
      />
    );
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setUser(null);
    }
  }

  if (
    user.role ===
    "faculty"
  ) {
    return (
      <FacultyDashboard
        user={user}
        onLogout={
          handleLogout
        }
      />
    );
  }

  return (
    <StudentDashboard
      user={user}
      onLogout={
        handleLogout
      }
    />
  );
}
