import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
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
      className="mx-auto flex w-full max-w-3xl gap-2"
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
  );
}
