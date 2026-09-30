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
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [people, setPeople] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [opening, setOpening] = useState(null);

  const [selectedPeople, setSelectedPeople] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupError, setGroupError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadConversations() {
      try {
        const data = await api("/conversations", {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setConversations(data.conversations);
          setListError(null);
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
          setRefreshing(false);
        }
      }
    }

    loadConversations();

    return () => {
      controller.abort();
    };
  }, [refreshKey, setUser]);

  function refreshConversations() {
    setRefreshing(true);
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

  function toggleGroupMember(person) {
    setSelectedPeople((current) => {
      if (current.some((member) => member.id === person.id)) {
        return current.filter((member) => member.id !== person.id);
      }

      if (current.length >= 9) {
        return current;
      }

      return [...current, person];
    });

    setGroupError(null);
  }

  async function handleCreateGroup(event) {
    event.preventDefault();

    if (creatingGroup) {
      return;
    }

    if (selectedPeople.length < 2) {
      setGroupError(new Error("Choose at least two other users"));
      return;
    }

    setGroupError(null);
    setCreatingGroup(true);

    try {
      const data = await api("/conversations/group", {
        method: "POST",
        body: {
          name: groupName.trim(),
          memberIds: selectedPeople.map((person) => person.id),
        },
      });

      navigate(`/conversations/${data.conversation.id}`);
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
      } else {
        setGroupError(error);
      }
    } finally {
      setCreatingGroup(false);
    }
  }

  return (
    <section>
      <h1>Conversations</h1>

      <button
        type="button"
        onClick={refreshConversations}
        disabled={loading || refreshing}
      >
        {loading
          ? "Loading..."
          : refreshing
            ? "Refreshing..."
            : "Refresh conversations"}
      </button>

      <FormError error={listError} />

      {!loading &&
        (conversations.length > 0 || !listError) &&
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
        <fieldset disabled={searching || opening !== null || creatingGroup}>
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

            <div className="friend-actions">
              <button
                type="button"
                onClick={() => startConversation(person.id)}
                disabled={opening !== null || searching || creatingGroup}
              >
                {opening === person.id
                  ? "Opening..."
                  : `Message ${person.username}`}
              </button>

              <button
                type="button"
                onClick={() => toggleGroupMember(person)}
                disabled={
                  opening !== null ||
                  searching ||
                  creatingGroup ||
                  (selectedPeople.length >= 9 &&
                    !selectedPeople.some((member) => member.id === person.id))
                }
                aria-pressed={selectedPeople.some(
                  (member) => member.id === person.id,
                )}
              >
                {selectedPeople.some((member) => member.id === person.id)
                  ? `Remove ${person.username} from group`
                  : `Select ${person.username}`}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <h2>Create a group</h2>

      <p>
        Select 2 to 9 other users from the search results, then name your group.
      </p>

      {selectedPeople.length > 0 && (
        <p role="status">
          Selected:{" "}
          {selectedPeople.map((person) => person.displayName).join(", ")}
        </p>
      )}

      <FormError error={groupError} />

      <form className="form" onSubmit={handleCreateGroup}>
        <fieldset disabled={creatingGroup || opening !== null || searching}>
          <legend>Group details</legend>

          <label htmlFor="group-name">Group name</label>
          <input
            id="group-name"
            name="groupName"
            type="text"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            maxLength={60}
            required
          />

          <button
            type="submit"
            disabled={
              creatingGroup ||
              selectedPeople.length < 2 ||
              groupName.trim().length === 0
            }
          >
            {creatingGroup ? "Creating group..." : "Create group"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
