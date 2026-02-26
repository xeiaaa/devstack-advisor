import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from "@/components/ui/sidebar";

function App() {
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <h1 className="text-lg font-semibold">DevStack Advisor</h1>
        <Sheet open={configOpen} onOpenChange={setConfigOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Settings">
              <Settings />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Configuration</SheetTitle>
            </SheetHeader>
            {/* Empty for now */}
          </SheetContent>
        </Sheet>
      </header>

      {/* Main: Sidebar + Chat area */}
      <SidebarProvider className="flex flex-1 min-h-0">
        <Sidebar collapsible="none">
          <SidebarHeader>
            <span className="text-sm font-medium text-muted-foreground">
              History
            </span>
          </SidebarHeader>
          <SidebarContent>{/* Empty for now */}</SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="flex h-full flex-col">
            {/* Chat / markdown / response area */}
            <div className="flex-1 overflow-auto p-4">
              <p className="text-muted-foreground">
                Chat, markdown, and responses will appear here.
              </p>
            </div>

            {/* Input + submit anchored to bottom */}
            <div className="shrink-0 border-t p-4">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex w-full max-w-3xl mx-auto gap-2"
              >
                <InputGroup className="flex-1">
                  <InputGroupInput placeholder="Ask about your tech stack..." />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton type="submit" size="sm">
                      Submit
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </form>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default App;
