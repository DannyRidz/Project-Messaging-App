import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function Home() {
  const [status, setStatus] = useState("Checking the backend...");

  useEffect(() => {
    const controller = new AbortController();

    async function checkBackend() {
      try {
        const data = await api("/health", {
          signal: controller.signal,
        });

        setStatus(
          data.status === "ok"
            ? "Backend connected."
            : "The backend returned an unexpected status.",
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setStatus(`Connection failed: ${error.message}`);
        }
      }
    }

    checkBackend();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section>
      <h1>Messaging App</h1>
      <p>Send messages and stay connected.</p>
      <p role="status">{status}</p>
    </section>
  );
}
