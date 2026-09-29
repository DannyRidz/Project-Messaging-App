import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.js";
import { api } from "../lib/api.js";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSession() {
      try {
        const data = await api("/auth/me", {
          signal: controller.signal,
        });

        setUser(data.user);
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        if (error.status === 401) {
          setUser(null);
        } else {
          setError(error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <main className="page">
        <p role="status">Checking your session...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <p role="alert">Could not check your session: {error.message}</p>

        <button type="button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </main>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
