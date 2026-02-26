import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfigParamsDrawer } from "@/components/ConfigParamsDrawer";
import { ChatHistory } from "@/components/ChatHistory";
import { ChatInputGroup } from "@/components/ChatInputGroup";
import { ChatProvider, useChat } from "@/contexts/ChatContext";

function AppContent() {
  const { isError, error } = useChat();

  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
        <h1 className="text-lg font-semibold">DevStack Advisor</h1>
        <ConfigParamsDrawer />
      </header>

      <main className="px-4 pt-20 pb-28 max-w-3xl mx-auto w-full flex flex-col gap-6">
        {isError && (
          <Alert variant="destructive" className="shrink-0">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error?.message ?? "Something went wrong"}
            </AlertDescription>
          </Alert>
        )}
        <ChatHistory />
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-10 border-t bg-background p-4">
        <div className="mx-auto max-w-3xl w-full">
          <ChatInputGroup />
        </div>
      </footer>
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
