import { useChat } from "@/contexts/ChatContext";
import { ChatHistoryItem } from "@/components/ChatHistoryItem";

export function ChatHistory() {
  const { entries, bottomRef } = useChat();

  return (
    <>
      {entries.map((entry) => (
        <ChatHistoryItem key={entry.id} entry={entry} />
      ))}
      <div ref={bottomRef} />
    </>
  );
}
