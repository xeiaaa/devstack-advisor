import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Cpu,
  Hash,
  Info,
  Sparkles,
  Thermometer,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

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
    <div className="space-y-8">
      {/* User message */}
      <div
        className={cn(
          "flex gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 flex-row-reverse"
        )}
      >
        <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 space-y-2 text-right">
          <div className="group inline-flex items-end gap-2 max-w-full">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 size-6 text-zinc-400 hover:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="View request settings"
                >
                  <Info className="size-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent
                showCloseButton={false}
                className="max-w-sm rounded-3xl overflow-hidden p-0 gap-0"
              >
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                  <DialogTitle className="text-lg font-bold flex items-center gap-2 m-0">
                    <Info className="w-5 h-5 text-zinc-900 shrink-0" />
                    Configuration Params
                  </DialogTitle>
                  <DialogClose asChild>
                    <button
                      type="button"
                      className="p-1.5 hover:bg-zinc-200 rounded-full transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5 text-zinc-500" />
                    </button>
                  </DialogClose>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-zinc-100 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">
                        Model
                      </p>
                      <p className="text-sm font-semibold text-zinc-900">
                        {entry.settings.model}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-zinc-100 flex items-center justify-center">
                      <Thermometer className="w-5 h-5 text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">
                        Temperature
                      </p>
                      <p className="text-sm font-semibold text-zinc-900">
                        {entry.settings.temperature.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-zinc-100 flex items-center justify-center">
                      <Hash className="w-5 h-5 text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">
                        Max Results
                      </p>
                      <p className="text-sm font-semibold text-zinc-900">
                        {entry.settings.maxResults}
                      </p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <span
              className="inline-block text-sm leading-relaxed bg-zinc-100 px-4 py-2 rounded-2xl text-zinc-800"
              data-user-question
            >
              {entry.question}
            </span>
          </div>
        </div>
      </div>

      {/* Assistant message */}
      <div
        className={cn(
          "flex gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 flex-row"
        )}
      >
        <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 space-y-2 text-left">
          {entry.response ? (
            <div className="prose prose-zinc max-w-none text-sm leading-relaxed">
              <Markdown remarkPlugins={[remarkGfm]}>{entry.response}</Markdown>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-500">
              <Spinner className="size-4" />
              <span>Thinking...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
