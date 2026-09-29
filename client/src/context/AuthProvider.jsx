import { useEffect, useState } from "react";

import { AuthContext } from "./AuthContext.js";
import { api } from "../lib/api.js";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [presenceError, setPresenceError] = useState(null);

  const userId = user?.id;

  useEffect(() => {
    const controller = new AbortController();

    async function loadSession() {
      try {
        const data = await api("/auth/me", {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setUser(data.user);
        }
      } catch (error) {
        if (controller.signal.aborted) {
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

  useEffect(() => {
    if (!userId) {
      return;
    }

    const controller = new AbortController();
    let timer;
    let inFlight = false;

    async function reportActivity() {
      if (controller.signal.aborted || inFlight) {
        return;
      }

      if (document.visibilityState !== "visible") {
        timer = window.setTimeout(reportActivity, 30000);
        return;
      }

      inFlight = true;

      try {
        await api("/presence", {
          method: "POST",
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setPresenceError(null);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (error.status === 401) {
          setUser(null);
        } else {
          setPresenceError(error);
        }
      } finally {
        inFlight = false;

        if (!controller.signal.aborted) {
          timer = window.setTimeout(reportActivity, 30000);
        }
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        window.clearTimeout(timer);
        reportActivity();
      }
    }

    reportActivity();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      controller.abort();
      window.clearTimeout(timer);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId]);

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
      {user && presenceError && (
        <p className="presence-warning" role="alert">
          Could not update your online status: {presenceError.message}. Retrying
          automatically.
        </p>
      )}

      {children}
    </AuthContext.Provider>
  );
}
