import { useChat } from "@/contexts/ChatContext";
import { ChatHistoryItem } from "@/components/ChatHistoryItem";
import { Spinner } from "@/components/ui/spinner";

export function ChatHistory() {
  const { entries, bottomRef, isHistoryLoading } = useChat();

  if (isHistoryLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
        <Spinner className="size-8" />
        <span className="text-sm">Loading history…</span>
      </div>
    );
  }

  return (
    <>
      {entries.map((entry) => (
        <ChatHistoryItem key={entry.id} entry={entry} />
      ))}
      <div ref={bottomRef} />
    </>
  );
}
