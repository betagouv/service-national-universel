import { useSetState } from "react-use";
import { CLASSE_IMPORT_EN_MASSE_COLUMNS, ColumnsMapping } from "snu-lib";
export const useMappingColumns = (fileColumns: string[]) => {
  const [mappings, setMappings] = useSetState<Omit<ColumnsMapping, CLASSE_IMPORT_EN_MASSE_COLUMNS.UAI>>({
    [CLASSE_IMPORT_EN_MASSE_COLUMNS.PRENOM]: fileColumns.find((fileColumn) => fileColumn === CLASSE_IMPORT_EN_MASSE_COLUMNS.PRENOM) || "",
    [CLASSE_IMPORT_EN_MASSE_COLUMNS.NOM]: fileColumns.find((fileColumn) => fileColumn === CLASSE_IMPORT_EN_MASSE_COLUMNS.NOM) || "",
    [CLASSE_IMPORT_EN_MASSE_COLUMNS.DATE_DE_NAISSANCE]: fileColumns.find((fileColumn) => fileColumn === CLASSE_IMPORT_EN_MASSE_COLUMNS.DATE_DE_NAISSANCE) || "",
    [CLASSE_IMPORT_EN_MASSE_COLUMNS.GENRE]: fileColumns.find((fileColumn) => fileColumn === CLASSE_IMPORT_EN_MASSE_COLUMNS.GENRE) || "",
  });

  const handleFieldChange = (expectedColumnName: CLASSE_IMPORT_EN_MASSE_COLUMNS, fileColumnName: string) => {
    setMappings((prev) => {
      const updatedMappings = { ...prev };
      updatedMappings[expectedColumnName] = fileColumnName;
      return updatedMappings;
    });
  };

  const mappedColumns = Object.values(mappings).filter(Boolean);
  const uniqueMappedColumns = new Set(mappedColumns);
  const isOneColumnMappedMoreThanOnce = mappedColumns.length > uniqueMappedColumns.size;

  const isButtonDisabled =
    Object.entries(mappings)
      .filter(([expectedColumnName, _]) => expectedColumnName !== CLASSE_IMPORT_EN_MASSE_COLUMNS.UAI) // TODO: à supprimer en fonction de la RG
      .some(([_, fileColumnName]) => !fileColumnName) || isOneColumnMappedMoreThanOnce;

  const isColumnAlreadyMapped = (fileColumnName: string | undefined): boolean => {
    if (!fileColumnName) return false;

    return (
      Object.entries(mappings)
        .filter(([_, fileColumnName2]) => !!fileColumnName2)
        .filter(([_, fileColumnName2]) => fileColumnName === fileColumnName2).length > 1
    );
  };

  return {
    mappings,
    handleFieldChange,
    isButtonDisabled,
    isColumnAlreadyMapped,
  };
};
