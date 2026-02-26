import { useChat } from "@/contexts/ChatContext";
import { ChatHistoryItem } from "@/components/ChatHistoryItem";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ChatHistory() {
  const {
    entries,
    bottomRef,
    isHistoryLoading,
    isHistoryError,
    historyError,
    refetchHistory,
  } = useChat();

  if (isHistoryLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
        <Spinner className="size-8" />
        <span className="text-sm">Loading history…</span>
      </div>
    );
  }

  if (isHistoryError) {
    return (
      <Alert variant="destructive" className="shrink-0">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <span>
            {historyError?.message ??
              "Something went wrong loading chat history."}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => refetchHistory()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
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
