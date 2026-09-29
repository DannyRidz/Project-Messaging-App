import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { AuthContext } from "../context/AuthContext.js";
import FormError from "../components/FormError.jsx";
import { api } from "../lib/api.js";

export default function Friends() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [people, setPeople] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [pending, setPending] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [notice, setNotice] = useState("");

  const friendIds = new Set(friends.map((friend) => friend.id));

  useEffect(() => {
    const controller = new AbortController();
    let timer;

    async function loadFriends() {
      try {
        const data = await api("/friends", {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setFriends(data.friends);
          setListError(null);
        }
      } catch (error) {
        if (controller.signal.aborted) {
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
          timer = window.setTimeout(loadFriends, 10000);
        }
      }
    }

    loadFriends();

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [refreshKey, setUser]);

  function refreshFriends() {
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

  async function handleAction(action, person) {
    setActionError(null);
    setNotice("");
    setPending(`${action}:${person.id}`);

    try {
      if (action === "add") {
        const data = await api(`/friends/${person.id}`, {
          method: "PUT",
        });

        setNotice(`${data.friend.displayName} is on your friends list.`);

        refreshFriends();
      } else if (action === "remove") {
        await api(`/friends/${person.id}`, {
          method: "DELETE",
        });

        setFriends((current) =>
          current.filter((friend) => friend.id !== person.id),
        );

        setNotice(`${person.displayName} was removed from your list.`);
        refreshFriends();
      } else if (action === "message") {
        const data = await api("/conversations/direct", {
          method: "POST",
          body: { recipientId: person.id },
        });

        navigate(`/conversations/${data.conversation.id}`);
      }
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
      } else {
        setActionError(error);
      }
    } finally {
      setPending(null);
    }
  }

  return (
    <section>
      <h1>Friends</h1>

      <p>Save people to your personal friends list.</p>
      <p>
        Online means activity was received within the last 90 seconds. Statuses
        refresh automatically.
      </p>

      <button
        type="button"
        onClick={refreshFriends}
        disabled={loading || pending !== null || searching}
      >
        {loading ? "Loading..." : "Refresh friends"}
      </button>

      <FormError error={listError} />
      <FormError error={actionError} />

      {notice && <p role="status">{notice}</p>}

      {!loading &&
        (friends.length > 0 || !listError) &&
        (friends.length === 0 ? (
          <p>Your friends list is empty.</p>
        ) : (
          <ul className="people-list">
            {friends.map((friend) => (
              <li key={friend.id}>
                <div>
                  <strong>{friend.displayName}</strong>
                  <span> @{friend.username}</span>
                  {friend.bio && <p>{friend.bio}</p>}
                  <p
                    className="presence"
                    data-online={!listError && friend.isOnline}
                  >
                    {listError
                      ? "Status unavailable"
                      : friend.isOnline
                        ? "Online"
                        : "Offline"}
                  </p>

                  {!listError && !friend.isOnline && friend.lastActiveAt && (
                    <p className="last-active">
                      Last active:{" "}
                      {new Date(friend.lastActiveAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="friend-actions">
                  <button
                    type="button"
                    onClick={() => handleAction("message", friend)}
                    disabled={pending !== null || searching}
                  >
                    {pending === `message:${friend.id}`
                      ? "Opening..."
                      : `Message ${friend.username}`}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction("remove", friend)}
                    disabled={pending !== null || searching}
                  >
                    {pending === `remove:${friend.id}`
                      ? "Removing..."
                      : `Remove ${friend.username}`}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ))}

      <h2>Add a friend</h2>

      <form className="form" onSubmit={handleSearch}>
        <fieldset disabled={searching || pending !== null || loading}>
          <legend>Find another user</legend>

          <label htmlFor="friend-search">Username or display name</label>
          <input
            id="friend-search"
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
              onClick={() => handleAction("add", person)}
              disabled={
                friendIds.has(person.id) ||
                pending !== null ||
                loading ||
                searching
              }
            >
              {friendIds.has(person.id)
                ? "Already added"
                : pending === `add:${person.id}`
                  ? "Adding..."
                  : `Add ${person.username}`}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
