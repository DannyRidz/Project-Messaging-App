import { useContext, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";

import { AuthContext } from "../context/AuthContext.js";
import FormError from "../components/FormError.jsx";
import { api } from "../lib/api.js";

export default function Login() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const fields = new FormData(event.currentTarget);

    setError(null);
    setPending(true);

    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: {
          email: fields.get("email"),
          password: fields.get("password"),
        },
      });

      setUser(data.user);
      navigate("/profile", { replace: true });
    } catch (error) {
      setError(error);
    } finally {
      setPending(false);
    }
  }

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <section>
      <h1>Log in</h1>

      {location.state?.registered && (
        <p role="status">Account created. You can now log in.</p>
      )}

      <FormError error={error} />

      <form className="form" onSubmit={handleSubmit}>
        <fieldset disabled={pending}>
          <legend>Enter your account details</legend>

          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            maxLength={254}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />

          <button type="submit">{pending ? "Logging in..." : "Log in"}</button>
        </fieldset>
      </form>

      <p>
        Need an account? <Link to="/register">Register</Link>.
      </p>
    </section>
  );
}
