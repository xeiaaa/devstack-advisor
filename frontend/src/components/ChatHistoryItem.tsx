import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

export type ChatEntry = {
  id: string;
  question: string;
  response: string;
  settings: { model: string; temperature: number; maxResults: number };
};

type ChatHistoryItemProps = {
  entry: ChatEntry;
};

export function ChatHistoryItem({ entry }: ChatHistoryItemProps) {
  return (
    <div className="flex flex-col gap-3 shrink-0">
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
  );
}
