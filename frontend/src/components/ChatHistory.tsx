import { useChat } from "@/contexts/ChatContext";
import { ChatHistoryItem } from "@/components/ChatHistoryItem";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, RefreshCw, Terminal } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-zinc-500">
        <Spinner className="size-8" />
        <span className="text-sm">Loading history…</span>
      </div>
    );
  }

  if (isHistoryError) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-zinc-900">Connection Error</h2>
          <p className="text-zinc-500 max-w-sm mx-auto text-sm">
            {historyError?.message ??
              "Something went wrong loading chat history."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetchHistory()}
          className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center">
          <Terminal className="w-6 h-6 text-zinc-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            How can I help you today?
          </h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            Ask me anything about your tech stack. I have access to the internal
            knowledge base to provide accurate answers.
          </p>
        </div>
        <div ref={bottomRef} className="h-4" />
      </div>
    );
  }

  return (
    <div>
      {entries.map((entry) => (
        <ChatHistoryItem key={entry.id} entry={entry} />
      ))}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
