import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfigParamsDrawer } from "@/components/ConfigParamsDrawer";
import { ChatHistory } from "@/components/ChatHistory";
import { ChatInputGroup } from "@/components/ChatInputGroup";
import { ChatProvider, useChat } from "@/contexts/ChatContext";

function AppContent() {
  const { isError, error } = useChat();

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <h1 className="text-lg font-semibold">DevStack Advisor</h1>
        <ConfigParamsDrawer />
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-auto p-4 max-w-3xl mx-auto w-full flex flex-col gap-6">
          {isError && (
            <Alert variant="destructive" className="shrink-0">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error?.message ?? "Something went wrong"}
              </AlertDescription>
            </Alert>
          )}
          <ChatHistory />
        </div>

        <div className="shrink-0 border-t p-4">
          <ChatInputGroup />
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
