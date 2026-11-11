import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getActiveCompanyId,
  getCompanyLanguage,
  subscribeToLanguageChanges,
  translate,
} from "./languageService";

interface LanguageContextValue {
  companyId: string;
  language: string;
  t: (source: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  companyId: "default",
  language: "vi",
  t: (source) => source,
});

function getSnapshot() {
  const companyId = getActiveCompanyId();
  return `${companyId}\u0000${getCompanyLanguage(companyId)}`;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeToLanguageChanges,
    getSnapshot,
    () => "default\u0000vi",
  );
  const [companyId, language] = snapshot.split("\u0000");
  return (
    <LanguageContext.Provider
      value={{
        companyId,
        language,
        t: (source) => translate(language, source),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
