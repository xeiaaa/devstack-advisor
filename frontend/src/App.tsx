import { useEffect, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Info, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { askQuestionStream, getHistory } from "@/lib/api";
import { useSettings } from "@/contexts/settings-context";
import { OPENAI_MODELS } from "@/lib/constants";

const TEMPERATURE_MIN = 0;
const TEMPERATURE_MAX = 2;
const MAX_RESULTS_MIN = 5;
const MAX_RESULTS_MAX = 100;

function App() {
  const [configOpen, setConfigOpen] = useState(false);
  const [streamedAnswer, setStreamedAnswer] = useState("");
  const [inFlightQuestion, setInFlightQuestion] = useState<string | null>(null);
  const { settings, setModel, setTemperature, setMaxResults } = useSettings();
  const queryClient = useQueryClient();

  const { data: history = [] } = useQuery({
    queryKey: ["history"],
    queryFn: getHistory,
  });

  const mutation = useMutation({
    mutationFn: ({
      question,
      onDelta,
      signal,
      settings: reqSettings,
    }: {
      question: string;
      onDelta: (delta: string) => void;
      signal?: AbortSignal;
      settings?: { model?: string; temperature?: number; maxResults?: number };
    }) =>
      askQuestionStream(question, onDelta, signal, {
        model: reqSettings?.model,
        temperature: reqSettings?.temperature,
        maxResults: reqSettings?.maxResults,
      }),
  });

  const form = useForm({
    defaultValues: {
      question: "",
    },
    onSubmit: async ({ value }) => {
      setStreamedAnswer("");
      setInFlightQuestion(value.question);
      mutation.mutate(
        {
          question: value.question,
          onDelta: (delta) => setStreamedAnswer((prev) => prev + delta),
          settings: {
            model: settings.model,
            temperature: settings.temperature,
            maxResults: settings.maxResults,
          },
        },
        {
          onSuccess: async () => {
            form.reset();
            await queryClient.invalidateQueries({ queryKey: ["history"] });
            setInFlightQuestion(null);
          },
          onError: () => setInFlightQuestion(null),
        },
      );
    },
  });

  const isPending = mutation.isPending;
  const bottomRef = useRef<HTMLDivElement>(null);

  // TODO: if the user scrolls up while receiving chunks, disable this (for better user experience like in chatGPT)
  const hasInitiallyScrolled = useRef(false);
  useEffect(() => {
    if (history.length > 0 && !hasInitiallyScrolled.current) {
      hasInitiallyScrolled.current = true;
      bottomRef.current?.scrollIntoView();
    }
    if (inFlightQuestion || streamedAnswer) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, inFlightQuestion, streamedAnswer]);

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
            <div className="mt-6 flex flex-col gap-6 px-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="ai-model"
                  className="text-sm font-medium leading-none"
                >
                  AI Model
                </label>
                <Select
                  value={settings.model}
                  onValueChange={(v) => setModel(v)}
                >
                  <SelectTrigger id="ai-model" className="w-full">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPENAI_MODELS.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="temperature"
                  className="text-sm font-medium leading-none"
                >
                  Temperature ({settings.temperature})
                </label>
                <Slider
                  id="temperature"
                  min={TEMPERATURE_MIN}
                  max={TEMPERATURE_MAX}
                  step={0.1}
                  value={[settings.temperature]}
                  onValueChange={([v]) => setTemperature(v ?? 0.7)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="max-results"
                  className="text-sm font-medium leading-none"
                >
                  Max Results
                </label>
                <Input
                  id="max-results"
                  type="number"
                  min={MAX_RESULTS_MIN}
                  max={MAX_RESULTS_MAX}
                  value={settings.maxResults}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (!Number.isNaN(n)) {
                      setMaxResults(
                        Math.min(MAX_RESULTS_MAX, Math.max(MAX_RESULTS_MIN, n)),
                      );
                    }
                  }}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main content */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-auto p-4 max-w-3xl mx-auto w-full flex flex-col gap-6">
          {mutation.isError && (
            <Alert variant="destructive" className="shrink-0">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "Something went wrong"}
              </AlertDescription>
            </Alert>
          )}
          {[
            ...history,
            ...(inFlightQuestion
              ? [
                  {
                    id: "in-flight",
                    question: inFlightQuestion,
                    response: streamedAnswer,
                    settings: {
                      model: settings.model,
                      temperature: settings.temperature,
                      maxResults: settings.maxResults,
                    },
                    completedAt: undefined,
                  },
                ]
              : []),
          ].map((entry) => (
            <div key={entry.id} className="flex flex-col gap-3 shrink-0">
              <div
                className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3"
                data-user-question
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-primary/80 uppercase tracking-wider">
                      You asked
                    </span>
                    <p className="text-foreground mt-1">{entry.question}</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 size-8"
                        aria-label="View request settings"
                      >
                        <Info className="size-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request settings</DialogTitle>
                      </DialogHeader>
                      <dl className="grid gap-2 text-sm">
                        <div>
                          <dt className="text-muted-foreground font-medium">
                            Model
                          </dt>
                          <dd>{entry.settings.model}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground font-medium">
                            Temperature
                          </dt>
                          <dd>{entry.settings.temperature}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground font-medium">
                            Max results
                          </dt>
                          <dd>{entry.settings.maxResults}</dd>
                        </div>
                      </dl>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              {entry.response ? (
                <div className="prose dark:prose-invert max-w-none pl-1">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {entry.response}
                  </Markdown>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground pl-1">
                  <Spinner className="size-4" />
                  <span>Thinking...</span>
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

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
                        !field.state.meta.isValid && field.state.meta.isTouched
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
                        {isPending ? <Spinner className="size-4" /> : "Submit"}
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
    </div>
  );
}

export default App;
