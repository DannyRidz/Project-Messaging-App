import { useContext, useState } from "react";

import { AuthContext } from "../context/AuthContext.js";
import FormError from "../components/FormError.jsx";
import { api } from "../lib/api.js";

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);

  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio ?? "");
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError(null);
    setMessage("");
    setPending(true);

    try {
      const data = await api("/users/me", {
        method: "PATCH",
        body: { displayName, bio },
      });

      setUser(data.user);
      setDisplayName(data.user.displayName);
      setBio(data.user.bio ?? "");
      setMessage("Profile saved.");
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
      } else {
        setError(error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <h1>Profile</h1>

      <p>
        Username: <strong>{user.username}</strong>
      </p>

      <p>Email: {user.email}</p>

      <FormError error={error} />

      {message && <p role="status">{message}</p>}

      <form className="form" onSubmit={handleSubmit}>
        <fieldset disabled={pending}>
          <legend>Edit your public profile</legend>

          <label htmlFor="profile-display-name">Display name</label>
          <input
            id="profile-display-name"
            name="displayName"
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value);
              setMessage("");
            }}
            maxLength={50}
            required
          />

          <label htmlFor="profile-bio">Bio</label>
          <textarea
            id="profile-bio"
            name="bio"
            value={bio}
            onChange={(event) => {
              setBio(event.target.value);
              setMessage("");
            }}
            maxLength={500}
            rows={5}
          />

          <p className="hint">
            Your display name and bio are visible to other users.
          </p>

          <button type="submit">
            {pending ? "Saving..." : "Save profile"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
