import { createContext, useContext, useState, ReactNode } from "react";

export type CategoryId =
  | "tous"
  | "jackpot"
  | "roue"
  | "grattage"
  | "minijeux"
  | "nouveautes"
  | "populaires";

interface CategoryContextValue {
  activeCategory: CategoryId;
  setActiveCategory: (id: CategoryId) => void;
}

export const CategoryContext = createContext<CategoryContextValue>({
  activeCategory: "tous",
  setActiveCategory: () => {},
});

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("tous");
  return (
    <CategoryContext.Provider value={{ activeCategory, setActiveCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategoryCtx() {
  return useContext(CategoryContext);
}
