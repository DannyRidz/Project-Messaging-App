export function conversationTitle(conversation, currentUserId) {
  if (conversation.type === "group") {
    return conversation.name;
  }

  return (
    conversation.members
      .filter((member) => member.id !== currentUserId)
      .map((member) => member.displayName)
      .join(", ") || "Direct conversation"
  );
}

export function mergeMessages(current, incoming) {
  const byId = new Map();

  for (const message of [...current, ...incoming]) {
    byId.set(message.id, message);
  }

  return [...byId.values()].sort((a, b) => a.id - b.id);
}
