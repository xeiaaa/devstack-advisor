import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { askQuestion } from "@/lib/api";

function App() {
  const [configOpen, setConfigOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: askQuestion,
  });

  const form = useForm({
    defaultValues: {
      question: "",
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value.question, {
        onSuccess: () => form.reset(),
      });
    },
  });

  const isPending = mutation.isPending;

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
      <SidebarProvider className="flex min-h-0 flex-1">
        <Sidebar collapsible="none">
          <SidebarHeader>
            <span className="text-muted-foreground text-sm font-medium">
              History
            </span>
          </SidebarHeader>
          <SidebarContent>{/* Empty for now */}</SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="flex h-full flex-col">
            {/* Chat / markdown / response area */}
            <div className="flex-1 overflow-auto p-4 max-w-3xl mx-auto">
              {mutation.isError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {mutation.error instanceof Error
                      ? mutation.error.message
                      : "Something went wrong"}
                  </AlertDescription>
                </Alert>
              )}
              {mutation.isSuccess && mutation.data && (
                <div className="prose dark:prose-invert max-w-none">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {mutation.data.answer}
                  </Markdown>
                </div>
              )}
              {!mutation.isSuccess && !mutation.isError && (
                <p className="text-muted-foreground">
                  Chat, markdown, and responses will appear here.
                </p>
              )}
            </div>

            {/* Input + submit anchored to bottom */}
            <div className="shrink-0 border-t p-4 ">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void form.handleSubmit();
                }}
                className="mx-auto flex w-full max-w-3xl gap-2"
              >
                <form.Field
                  name="question"
                  validators={{
                    onSubmit: ({ value }) =>
                      !value?.trim() ? "Question is required" : undefined,
                  }}
                >
                  {(field) => (
                    <div className="flex flex-1 flex-col gap-1">
                      <InputGroup
                        className="flex-1"
                        data-disabled={isPending ? true : undefined}
                      >
                        <InputGroupInput
                          placeholder="Ask about your tech stack..."
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          disabled={isPending}
                          aria-invalid={
                            !field.state.meta.isValid &&
                            field.state.meta.isTouched
                              ? true
                              : undefined
                          }
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="submit"
                            size="sm"
                            disabled={isPending}
                            aria-disabled={isPending}
                          >
                            {isPending ? (
                              <Spinner className="size-4" />
                            ) : (
                              "Submit"
                            )}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      {!field.state.meta.isValid &&
                        field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0 && (
                          <p className="text-destructive text-sm" role="alert">
                            {field.state.meta.errors.join(", ")}
                          </p>
                        )}
                    </div>
                  )}
                </form.Field>
              </form>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default App;
