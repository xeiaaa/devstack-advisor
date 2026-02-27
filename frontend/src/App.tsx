import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfigParamsDrawer } from "@/components/ConfigParamsDrawer";
import { ChatHistory } from "@/components/ChatHistory";
import { ChatInputGroup } from "@/components/ChatInputGroup";
import { ChatProvider, useChat } from "@/contexts/ChatContext";
import { Sparkles } from "lucide-react";

function AppContent() {
  const { isError, error } = useChat();

  return (
    <div className="flex flex-col h-screen bg-white text-zinc-900 font-sans">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="flex items-center gap-2 mx-auto max-w-3xl w-full">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
            DevStack Advisor
          </h1>
          <div className="ml-auto">
            <ConfigParamsDrawer />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full py-8 px-4">
          {isError && (
            <Alert variant="destructive" className="shrink-0 mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error?.message ?? "Something went wrong"}
              </AlertDescription>
            </Alert>
          )}
          <ChatHistory />
        </div>
      </main>

      <div className="sticky bottom-0 bg-linear-to-t from-white via-white to-transparent pb-8 pt-4">
        <div className="max-w-3xl mx-auto px-4 flex flex-col gap-2">
          <ChatInputGroup />
          <p className="text-center text-[11px] text-zinc-400">
            DevStack Advisor 2026
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;
