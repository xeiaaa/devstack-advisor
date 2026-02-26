import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useSettings } from "@/contexts/SettingsContext";
import { useChat } from "@/contexts/ChatContext";
import { OPENAI_MODELS } from "@/lib/constants";
import {
  TEMPERATURE_MIN,
  TEMPERATURE_MAX,
  MAX_RESULTS_MIN,
  MAX_RESULTS_MAX,
} from "@/config/constants";

export function ConfigParamsDrawer() {
  const { settings, setModel, setTemperature, setMaxResults } = useSettings();
  const { configOpen, setConfigOpen } = useChat();

  return (
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
  );
}
