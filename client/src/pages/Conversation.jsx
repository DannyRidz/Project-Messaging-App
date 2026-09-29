import { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";

import { AuthContext } from "../context/AuthContext.js";
import FormError from "../components/FormError.jsx";
import { api } from "../lib/api.js";
import { conversationTitle, mergeMessages } from "../lib/conversations.js";

function Chat({ conversationId }) {
  const { user, setUser } = useContext(AuthContext);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [pollError, setPollError] = useState(null);

  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  const [image, setImage] = useState(null);
  const imageInput = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    let active = true;
    let timer;
    let newestId = 0;

    async function pollMessages() {
      try {
        let page;

        do {
          page = await api(
            `/conversations/${conversationId}/messages` +
              `?afterId=${newestId}&limit=100`,
            { signal: controller.signal },
          );

          if (!active) {
            return;
          }

          if (page.messages.length > 0) {
            newestId = page.messages.at(-1).id;

            setMessages((current) => mergeMessages(current, page.messages));
          }
        } while (page.hasMore);

        setPollError(null);
      } catch (error) {
        if (!active || error.name === "AbortError") {
          return;
        }

        if (error.status === 401) {
          setUser(null);
        } else {
          setPollError(error);
        }
      } finally {
        if (active) {
          timer = setTimeout(pollMessages, 2000);
        }
      }
    }

    async function loadConversation() {
      try {
        const [conversationData, messageData] = await Promise.all([
          api(`/conversations/${conversationId}`, {
            signal: controller.signal,
          }),

          api(`/conversations/${conversationId}/messages`, {
            signal: controller.signal,
          }),
        ]);

        if (!active) {
          return;
        }

        setConversation(conversationData.conversation);
        setMessages(messageData.messages);
        setHasOlder(messageData.hasMore);

        newestId = messageData.messages.at(-1)?.id ?? 0;
        timer = setTimeout(pollMessages, 2000);
      } catch (error) {
        if (!active || error.name === "AbortError") {
          return;
        }

        if (error.status === 401) {
          setUser(null);
        } else {
          setLoadError(error);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadConversation();

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [conversationId, setUser]);

  async function loadOlderMessages() {
    const oldestId = messages[0]?.id;

    if (!oldestId) {
      return;
    }

    setHistoryError(null);
    setLoadingOlder(true);

    try {
      const data = await api(
        `/conversations/${conversationId}/messages` +
          `?beforeId=${oldestId}&limit=50`,
      );

      setMessages((current) => mergeMessages(current, data.messages));

      setHasOlder(data.hasMore);
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
      } else {
        setHistoryError(error);
      }
    } finally {
      setLoadingOlder(false);
    }
  }

  async function handleSend(event) {
    event.preventDefault();

    const text = body.trim();

    if ((!text && !image) || sending) {
      return;
    }

    if (image && image.size > 5 * 1024 * 1024) {
      setSendError(new Error("Image must be no larger than 5 MiB"));
      return;
    }

    setSendError(null);
    setSending(true);

    try {
      let payload;
      let endpoint;

      if (image) {
        payload = new FormData();
        payload.append("image", image);
        payload.append("body", text);

        endpoint = `/conversations/${conversationId}/images`;
      } else {
        payload = { body: text };

        endpoint = `/conversations/${conversationId}/messages`;
      }

      const data = await api(endpoint, {
        method: "POST",
        body: payload,
      });

      setMessages((current) => mergeMessages(current, [data.message]));

      setBody("");
      setImage(null);

      if (imageInput.current) {
        imageInput.current.value = "";
      }
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
      } else {
        setSendError(error);
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <p role="status">Loading conversation...</p>;
  }

  if (loadError) {
    return (
      <section>
        <h1>Could not open conversation</h1>
        <FormError error={loadError} />

        <Link to="/conversations">Back to conversations</Link>

        <p>
          <button type="button" onClick={() => window.location.reload()}>
            Try again
          </button>
        </p>
      </section>
    );
  }

  return (
    <section>
      <Link to="/conversations">Back to conversations</Link>

      <h1>{conversationTitle(conversation, user.id)}</h1>

      {conversation.type === "group" && (
        <p>
          Members:{" "}
          {conversation.members.map((member) => member.displayName).join(", ")}
        </p>
      )}

      {pollError && (
        <div role="status">
          <p>
            New messages could not be checked: {pollError.message} Retrying
            automatically.
          </p>
        </div>
      )}

      <FormError error={historyError} />

      {hasOlder && (
        <button
          type="button"
          onClick={loadOlderMessages}
          disabled={loadingOlder}
        >
          {loadingOlder ? "Loading older messages..." : "Load older messages"}
        </button>
      )}

      {messages.length === 0 && (
        <p>No messages yet. Start the conversation below.</p>
      )}

      <ol
        className="message-list"
        role="log"
        aria-label="Messages"
        aria-live="polite"
      >
        {messages.map((message) => (
          <li
            key={message.id}
            className={
              message.senderId === user.id ? "message own-message" : "message"
            }
          >
            <div className="message-meta">
              <strong>{message.sender.displayName}</strong>

              <time dateTime={message.createdAt}>
                {new Date(message.createdAt).toLocaleString()}
              </time>
            </div>

            {message.body && <p className="message-body">{message.body}</p>}

            {message.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="message-image-link"
              >
                <img
                  src={attachment.url}
                  alt={`Image sent by ${message.sender.displayName}`}
                  loading="lazy"
                  className="message-image"
                />
              </a>
            ))}
          </li>
        ))}
      </ol>

      <FormError error={sendError} />

      <form className="form" onSubmit={handleSend}>
        <fieldset disabled={sending}>
          <legend>Send a message</legend>

          <label htmlFor="message-body">Message or image caption</label>
          <textarea
            id="message-body"
            name="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={4000}
            rows={3}
            required={!image}
          />

          <label htmlFor="message-image">Image (optional)</label>
          <input
            id="message-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            ref={imageInput}
            onChange={(event) => {
              setImage(event.target.files?.[0] ?? null);
              setSendError(null);
            }}
          />

          <p className="hint">
            JPEG, PNG, or WebP. Maximum upload size: 5 MiB.
          </p>

          {image && (
            <>
              <p>Selected: {image.name}</p>

              <button
                type="button"
                onClick={() => {
                  setImage(null);

                  if (imageInput.current) {
                    imageInput.current.value = "";
                  }
                }}
              >
                Remove image
              </button>
            </>
          )}

          <button
            type="submit"
            disabled={sending || (!image && body.trim().length === 0)}
          >
            {sending ? "Sending..." : "Send message"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}

export default function Conversation() {
  const { conversationId } = useParams();

  return <Chat key={conversationId} conversationId={conversationId} />;
}
