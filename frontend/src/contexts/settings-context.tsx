import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type Settings = {
  model: string;
  temperature: number;
  maxResults: number;
};

const DEFAULT_SETTINGS: Settings = {
  model: "gpt-4o-mini-2024-07-18",
  temperature: 0.7,
  maxResults: 20,
};

type SettingsContextValue = {
  settings: Settings;
  setModel: (model: string) => void;
  setTemperature: (temperature: number) => void;
  setMaxResults: (maxResults: number) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  /*
    TODO
      - update to useReducer
      - persist with local storage (useLocalStorage)
  */
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const setModel = useCallback((model: string) => {
    setSettings((prev) => ({ ...prev, model }));
  }, []);

  const setTemperature = useCallback((temperature: number) => {
    setSettings((prev) => ({ ...prev, temperature }));
  }, []);

  const setMaxResults = useCallback((maxResults: number) => {
    setSettings((prev) => ({ ...prev, maxResults }));
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, setModel, setTemperature, setMaxResults }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook, standard pattern
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
