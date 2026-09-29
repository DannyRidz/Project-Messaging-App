import { useContext, useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router";

import { AuthContext } from "./context/AuthContext.js";
import RequireAuth from "./components/RequireAuth.jsx";
import FormError from "./components/FormError.jsx";

import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";

import { api } from "./lib/api.js";

import Conversations from "./pages/Conversations.jsx";
import Conversation from "./pages/Conversation.jsx";

import Friends from "./pages/Friends.jsx";

function Page({ title, description }) {
  return (
    <section>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export default function App() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [logoutError, setLogoutError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLogoutError(null);
    setLoggingOut(true);

    try {
      await api("/auth/logout", {
        method: "POST",
      });

      setUser(null);
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(error);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <header className="site-header">
        <span className="brand">Messaging App</span>

        {user && <p>Signed in as {user.displayName}</p>}

        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>

          {user ? (
            <>
              <NavLink to="/profile">Profile</NavLink>

              <NavLink to="/conversations">Conversations</NavLink>

              <NavLink to="/friends">Friends</NavLink>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/register">Register</NavLink>
              <NavLink to="/login">Log in</NavLink>
            </>
          )}
        </nav>

        <FormError error={logoutError} />
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/register" element={<Register />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />

          <Route
            path="/conversations"
            element={
              <RequireAuth>
                <Conversations />
              </RequireAuth>
            }
          />

          <Route
            path="/conversations/:conversationId"
            element={
              <RequireAuth>
                <Conversation />
              </RequireAuth>
            }
          />

          <Route
            path="*"
            element={
              <Page
                title="Page not found"
                description="Choose a page from the navigation."
              />
            }
          />

          <Route
            path="/friends"
            element={
              <RequireAuth>
                <Friends />
              </RequireAuth>
            }
          />
        </Routes>
      </main>
    </>
  );
}
