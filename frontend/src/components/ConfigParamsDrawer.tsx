import { Settings, Sliders, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
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
        <button
          type="button"
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-zinc-600" />
        </button>
      </SheetTrigger>
      <SheetContent showCloseButton={false} className="flex flex-col p-0">
        <SheetHeader className="p-6 border-b border-zinc-100 flex flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-zinc-900 shrink-0" />
            <SheetTitle className="text-xl font-bold">Configuration</SheetTitle>
          </div>
          <SheetClose asChild>
            <button
              type="button"
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* AI Model - using Select as required */}
          <div className="space-y-3">
            <label
              htmlFor="ai-model"
              className="text-sm font-semibold text-zinc-700 block"
            >
              AI Model
            </label>
            <Select value={settings.model} onValueChange={(v) => setModel(v)}>
              <SelectTrigger
                id="ai-model"
                className="w-full rounded-xl border-zinc-200"
              >
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

          {/* Temperature */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label
                htmlFor="temperature"
                className="text-sm font-semibold text-zinc-700"
              >
                Temperature
              </label>
              <span className="text-xs font-mono bg-zinc-100 px-2 py-1 rounded text-zinc-600">
                {settings.temperature.toFixed(1)}
              </span>
            </div>
            <Slider
              id="temperature"
              min={TEMPERATURE_MIN}
              max={TEMPERATURE_MAX}
              step={0.1}
              value={[settings.temperature]}
              onValueChange={([v]) => setTemperature(v ?? 0.7)}
              className="**:data-[slot=slider-track]:bg-zinc-100 **:data-[slot=slider-range]:bg-zinc-900 **:data-[slot=slider-thumb]:border-zinc-300 **:data-[slot=slider-thumb]:bg-white"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Max Results */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label
                htmlFor="max-results"
                className="text-sm font-semibold text-zinc-700"
              >
                Max Results
              </label>
              <span className="text-xs font-mono bg-zinc-100 px-2 py-1 rounded text-zinc-600">
                {settings.maxResults}
              </span>
            </div>
            <Slider
              id="max-results"
              min={MAX_RESULTS_MIN}
              max={MAX_RESULTS_MAX}
              step={1}
              value={[settings.maxResults]}
              onValueChange={([v]) =>
                setMaxResults(
                  Math.min(MAX_RESULTS_MAX, Math.max(MAX_RESULTS_MIN, v ?? 20)),
                )
              }
              className="**:data-[slot=slider-track]:bg-zinc-100 **:data-[slot=slider-range]:bg-zinc-900 **:data-[slot=slider-thumb]:border-zinc-300 **:data-[slot=slider-thumb]:bg-white"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
              <span>{MAX_RESULTS_MIN}</span>
              <span>{MAX_RESULTS_MAX}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
