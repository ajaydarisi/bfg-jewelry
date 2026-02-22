"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface FilterLoadingContextValue {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const FilterLoadingContext = createContext<FilterLoadingContextValue>({
  loading: false,
  setLoading: () => {},
});

export function FilterLoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  return (
    <FilterLoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </FilterLoadingContext.Provider>
  );
}

export function useFilterLoading() {
  return useContext(FilterLoadingContext);
}
