import { useState, useMemo } from "react";

type SortDirection = "asc" | "desc";
type SortValue = string | number | Date | null | undefined;

interface UseSearchTermOptions<T> {
  sortBy?: keyof T | ((item: T) => SortValue);
  sortDirection?: SortDirection;
}

/**
 * Fonction utilitaire pour trier les éléments selon un critère et une direction
 * @param a - Premier élément à comparer
 * @param b - Second élément à comparer
 * @param sortBy - Critère de tri (clé ou fonction)
 * @param sortDirection - Direction du tri (asc/desc)
 * @returns Résultat de la comparaison (-1, 0, 1)
 */
function sortItems<T>(a: T, b: T, sortBy: keyof T | ((item: T) => SortValue), sortDirection: SortDirection): number {
  const valueA = typeof sortBy === "function" ? sortBy(a) : (a[sortBy] as unknown as SortValue);
  const valueB = typeof sortBy === "function" ? sortBy(b) : (b[sortBy] as unknown as SortValue);

  if (valueA == null && valueB == null) return 0;
  if (valueA == null) return sortDirection === "asc" ? -1 : 1;
  if (valueB == null) return sortDirection === "asc" ? 1 : -1;

  let result = 0;
  if (typeof valueA === "string" && typeof valueB === "string") {
    result = valueA.localeCompare(valueB);
  } else {
    result = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
  }

  return sortDirection === "asc" ? result : -result;
}

/**
 * Hook pour gérer la recherche par terme dans les listes de données avec tri optionnel
 * @param items - Liste d'éléments à filtrer
 * @param getSearchableText - Fonction pour extraire le texte recherchable d'un élément
 * @param options - Options de configuration (tri, etc.)
 * @returns Un objet contenant le terme de recherche, la fonction pour le mettre à jour, et les éléments filtrés et triés
 */
export function useSearchTerm<T extends object>(items: T[], getSearchableText: (item: T) => string | undefined | null, options: UseSearchTermOptions<T> = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const { sortBy = "createdAt" as keyof T, sortDirection = "desc" } = options;

  const filteredAndSortedItems = useMemo(() => {
    // Filtrer les éléments
    const filtered = items.filter((item) => {
      const searchableText = getSearchableText(item);
      return !searchTerm || (searchableText?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    });

    const draftItems = filtered.filter((item) => !("id" in item));
    const nonDraftItems = filtered.filter((item) => "id" in item);
    const sortedNonDraftItems = [...nonDraftItems].sort((a, b) => sortItems(a, b, sortBy, sortDirection));

    return [...draftItems, ...sortedNonDraftItems];
  }, [items, searchTerm, getSearchableText, sortBy, sortDirection]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems: filteredAndSortedItems,
  };
}
