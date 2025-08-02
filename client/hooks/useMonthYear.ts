import { useState, useEffect } from "react";

interface UseMonthYearReturn {
  mes: string;
  ano: string;
  setMes: (mes: string) => void;
  setAno: (ano: string) => void;
}

export const useMonthYear = (): UseMonthYearReturn => {
  const [mes, setMesState] = useState(() => {
    const stored = localStorage.getItem("mes");
    return stored || String(new Date().getMonth() + 1).padStart(2, "0");
  });

  const [ano, setAnoState] = useState(() => {
    const stored = localStorage.getItem("ano");
    return stored || String(new Date().getFullYear());
  });

  // Listen to localStorage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mes" && e.newValue) {
        setMesState(e.newValue);
      }
      if (e.key === "ano" && e.newValue) {
        setAnoState(e.newValue);
      }
    };

    // Listen to custom events for same-window updates
    const handleCustomMesChange = (e: CustomEvent) => {
      setMesState(e.detail);
    };

    const handleCustomAnoChange = (e: CustomEvent) => {
      setAnoState(e.detail);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("mesChanged" as any, handleCustomMesChange);
    window.addEventListener("anoChanged" as any, handleCustomAnoChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("mesChanged" as any, handleCustomMesChange);
      window.removeEventListener("anoChanged" as any, handleCustomAnoChange);
    };
  }, []);

  const setMes = (newMes: string) => {
    setMesState(newMes);
    localStorage.setItem("mes", newMes);
    // Dispatch custom event for same-window components
    window.dispatchEvent(new CustomEvent("mesChanged", { detail: newMes }));
  };

  const setAno = (newAno: string) => {
    setAnoState(newAno);
    localStorage.setItem("ano", newAno);
    // Dispatch custom event for same-window components
    window.dispatchEvent(new CustomEvent("anoChanged", { detail: newAno }));
  };

  return { mes, ano, setMes, setAno };
};
