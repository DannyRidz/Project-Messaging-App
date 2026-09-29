import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { AuthContext } from "../context/AuthContext.js";
import FormError from "../components/FormError.jsx";
import { api } from "../lib/api.js";
import { conversationTitle } from "../lib/conversations.js";

export default function Conversations() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [people, setPeople] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [opening, setOpening] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadConversations() {
      try {
        const data = await api("/conversations", {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setConversations(data.conversations);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        if (error.status === 401) {
          setUser(null);
        } else {
          setListError(error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadConversations();

    return () => {
      controller.abort();
    };
  }, [refreshKey, setUser]);

  function refreshConversations() {
    setLoading(true);
    setListError(null);
    setRefreshKey((current) => current + 1);
  }

  async function handleSearch(event) {
    event.preventDefault();

    const fields = new FormData(event.currentTarget);
    const query = fields.get("q").trim();

    setSearchError(null);
    setSearching(true);
    setSearched(true);
    setPeople([]);

    try {
      const data = await api(`/users?q=${encodeURIComponent(query)}`);

      setPeople(data.users);
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
      } else {
        setSearchError(error);
      }
    } finally {
      setSearching(false);
    }
  }

  async function startConversation(recipientId) {
    setSearchError(null);
    setOpening(recipientId);

    try {
      const data = await api("/conversations/direct", {
        method: "POST",
        body: { recipientId },
      });

      navigate(`/conversations/${data.conversation.id}`);
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
      } else {
        setSearchError(error);
      }
    } finally {
      setOpening(null);
    }
  }

  return (
    <section>
      <h1>Conversations</h1>

      <button type="button" onClick={refreshConversations} disabled={loading}>
        {loading ? "Loading..." : "Refresh conversations"}
      </button>

      <FormError error={listError} />

      {!loading &&
        !listError &&
        (conversations.length === 0 ? (
          <p>You have no conversations yet.</p>
        ) : (
          <ul className="conversation-list">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <Link to={`/conversations/${conversation.id}`}>
                  {conversationTitle(conversation, user.id)}
                </Link>
              </li>
            ))}
          </ul>
        ))}

      <h2>Start a conversation</h2>

      <form className="form" onSubmit={handleSearch}>
        <fieldset disabled={searching || opening !== null}>
          <legend>Find another user</legend>

          <label htmlFor="user-search">Username or display name</label>
          <input
            id="user-search"
            name="q"
            type="search"
            maxLength={50}
            required
          />

          <button type="submit">{searching ? "Searching..." : "Search"}</button>
        </fieldset>
      </form>

      <FormError error={searchError} />

      {searched && !searching && !searchError && people.length === 0 && (
        <p>No matching users found.</p>
      )}

      <ul className="people-list">
        {people.map((person) => (
          <li key={person.id}>
            <div>
              <strong>{person.displayName}</strong>
              <span> @{person.username}</span>
              {person.bio && <p>{person.bio}</p>}
            </div>

            <button
              type="button"
              onClick={() => startConversation(person.id)}
              disabled={opening !== null || searching}
            >
              {opening === person.id
                ? "Opening..."
                : `Message ${person.username}`}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
