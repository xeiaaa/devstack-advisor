import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { askQuestionStream, getHistory } from "@/lib/api";
import { useSettings } from "@/contexts/SettingsContext";
import type { ChatEntry } from "@/components/ChatHistoryItem";

type ChatContextValue = {
  configOpen: boolean;
  setConfigOpen: (open: boolean) => void;
  entries: ChatEntry[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TanStack Form's FormApi has complex generics
  form: any;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  bottomRef: React.RefObject<HTMLDivElement | null>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [configOpen, setConfigOpen] = useState(false);
  const [streamedAnswer, setStreamedAnswer] = useState("");
  const [inFlightQuestion, setInFlightQuestion] = useState<string | null>(null);
  const { settings } = useSettings();
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

  const bottomRef = useRef<HTMLDivElement>(null);
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

  const entries: ChatEntry[] = [
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
          },
        ]
      : []),
  ];

  const value: ChatContextValue = {
    configOpen,
    setConfigOpen,
    entries,
    form,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error instanceof Error ? mutation.error : null,
    bottomRef,
  };

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook, standard pattern
export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return ctx;
}
