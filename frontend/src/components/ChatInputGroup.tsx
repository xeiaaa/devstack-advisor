import { Send } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useChat } from "@/contexts/ChatContext";

export function ChatInputGroup() {
  const { form, isPending } = useChat();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="relative flex items-center w-full"
    >
      <form.Field
        name="question"
        validators={{
          onSubmit: ({ value }: { value: string | undefined }) =>
            !value?.trim() ? "Question is required" : undefined,
        }}
      >
        {(field: {
          state: {
            value: string;
            meta: { isValid: boolean; isTouched: boolean; errors: string[] };
          };
          handleChange: (value: string) => void;
          handleBlur: () => void;
        }) => (
          <div className="relative w-full flex flex-col gap-1">
            <textarea
              rows={1}
              placeholder="Ask about your tech stack..."
              className="w-full p-4 pr-14 bg-zinc-50 border border-zinc-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all resize-none overflow-hidden min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              disabled={isPending}
              aria-invalid={
                !field.state.meta.isValid && field.state.meta.isTouched
                  ? true
                  : undefined
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void form.handleSubmit();
                }
              }}
            />
            <button
              type="submit"
              disabled={isPending || !field.state.value.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 text-white rounded-xl transition-all flex items-center justify-center shadow-sm disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              {isPending ? (
                <Spinner className="size-5 text-white" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
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
  );
}
