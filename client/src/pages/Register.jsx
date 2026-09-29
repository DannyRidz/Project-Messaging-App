import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";

import { AuthContext } from "../context/AuthContext.js";
import FormError from "../components/FormError.jsx";
import { api } from "../lib/api.js";

export default function Register() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const fields = new FormData(event.currentTarget);

    setError(null);
    setPending(true);

    try {
      await api("/auth/register", {
        method: "POST",
        body: {
          username: fields.get("username"),
          email: fields.get("email"),
          password: fields.get("password"),
          confirmPassword: fields.get("confirmPassword"),
        },
      });

      navigate("/login", {
        replace: true,
        state: { registered: true },
      });
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
      <h1>Register</h1>

      <FormError error={error} />

      <form className="form" onSubmit={handleSubmit}>
        <fieldset disabled={pending}>
          <legend>Create your account</legend>

          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            name="username"
            autoComplete="username"
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
            required
          />

          <p className="hint">Use 3–20 letters, numbers, or underscores.</p>

          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />

          <p className="hint">
            Use at least 8 characters. Passwords must fit within 72 UTF-8 bytes.
          </p>

          <label htmlFor="register-confirm">Confirm password</label>
          <input
            id="register-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />

          <button type="submit">
            {pending ? "Creating account..." : "Create account"}
          </button>
        </fieldset>
      </form>

      <p>
        Already registered? <Link to="/login">Log in</Link>.
      </p>
    </section>
  );
}
