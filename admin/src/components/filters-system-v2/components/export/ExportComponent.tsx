import dayjs from "@/utils/dayjs.utils";
import * as FileSaver from "file-saver";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import LoadingButton from "../../../buttons/LoadingButton";
import LoadingButtonV2 from "../../../buttons/LoadingButtonV2";
import ModalConfirm from "../../../modals/ModalConfirm";
import api from "../../../../services/api";
import { Filter } from "../Filters";

interface ExportComponentProps {
  handleClick?: () => void;
  title: string;
  exportTitle: string;
  route: string;
  transform?: (data: any[]) => Promise<any[]>;
  searchType?: string;
  fieldsToExport?: string | string[];
  setIsOpen?: (isOpen: boolean) => void;
  customCss?: {
    override?: boolean;
    button?: string;
    loadingButton?: string;
  };
  icon?: React.ReactNode;
  selectedFilters: { [key: string]: Filter };
}

interface LoadingProps {
  onFinish: () => void;
  loading: boolean;
  exportTitle: string;
  transform?: (data: any[]) => Promise<any[]>;
  selectedFilters: { [key: string]: Filter };
  route: string;
  searchType: string;
  fieldsToExport: string | string[];
  customCss?: {
    override?: boolean;
    loadingButton?: string;
  };
}

interface ModalState {
  isOpen: boolean;
  onConfirm: (() => void) | null;
  title?: string;
  message?: string;
}

export default function ExportComponent({
  handleClick,
  title,
  exportTitle,
  route,
  transform,
  searchType = "export",
  fieldsToExport = "*",
  setIsOpen,
  customCss,
  icon,
  selectedFilters,
}: ExportComponentProps) {
  const [exporting, setExporting] = useState(false);
  const [modal, setModal] = useState<ModalState>({ isOpen: false, onConfirm: null });
  const loading = false;

  const onClick = () => {
    handleClick?.();
    setModal({
      isOpen: true,
      onConfirm: () => setExporting(true),
      title: "Téléchargement",
      message:
        "En téléchargeant ces informations, vous vous engagez à les supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)",
    });
  };

  if (exporting) {
    return (
      <Loading
        selectedFilters={selectedFilters}
        loading={loading}
        onFinish={() => {
          setExporting(false);
          if (setIsOpen) setIsOpen(false);
        }}
        route={route}
        exportTitle={exportTitle}
        transform={transform}
        searchType={searchType}
        fieldsToExport={fieldsToExport}
        customCss={customCss}
      />
    );
  }

  return (
    <div className={setIsOpen ? "w-full" : undefined}>
      {customCss?.override ? (
        <LoadingButtonV2 onClick={onClick} style={customCss.button} loading={false} disabled={false} loadingText={null}>
          <div className={icon ? "flex items-center gap-2" : undefined}>
            {icon ? icon : null}
            {title}
          </div>
        </LoadingButtonV2>
      ) : (
        <LoadingButton onClick={onClick} loading={false} disabled={false} loadingText={null}>
          {title}
        </LoadingButton>
      )}
      <ModalConfirm
        isOpen={modal.isOpen}
        title={modal.title!}
        message={modal.message!}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal.onConfirm?.();
          setModal({ isOpen: false, onConfirm: null });
        }}
        onChange={() => {}}
        showHeaderText={true}
        showHeaderIcon={true}
        headerText=""
        confirmText="Confirmer"
        cancelText="Annuler"
      />
    </div>
  );
}

function Loading({ onFinish, loading, exportTitle, transform, selectedFilters, route, searchType, fieldsToExport, customCss }: LoadingProps) {
  const STATUS_LOADING = "Récupération des données";
  const STATUS_TRANSFORM = "Mise en forme";
  const STATUS_EXPORT = "Création du fichier";
  const [status, setStatus] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (loading === false) setRun(true);
  }, [loading]);

  useEffect(() => {
    if (!run) return;

    if (!status) {
      setStatus(STATUS_LOADING);
    } else if (status === STATUS_LOADING) {
      getAllResults(route, selectedFilters, searchType, fieldsToExport).then((results) => {
        setData(results);
        setStatus(STATUS_TRANSFORM);
      });
    } else if (status === STATUS_TRANSFORM) {
      toArrayOfArray(data, transform).then((results) => {
        setData(results);
        setStatus(STATUS_EXPORT);
      });
    } else if (status === STATUS_EXPORT) {
      const fileName = `${exportTitle}_${dayjs().format("YYYY-MM-DD_HH[h]mm[m]ss[s]")}`;

      exportData(fileName, data);
      onFinish();
    }
  }, [run, status]);

  return (
    <div className={fieldsToExport !== "*" ? "w-full" : undefined}>
      {customCss?.override ? (
        <LoadingButtonV2 loading={loading || run} loadingText={status ? null : undefined} style={customCss.loadingButton} disabled={false}>
          {null}
        </LoadingButtonV2>
      ) : (
        <LoadingButton loading={loading || run} loadingText={status ? null : undefined} disabled={false}>
          {null}
        </LoadingButton>
      )}
    </div>
  );
}

async function toArrayOfArray(results: any[], transform?: (data: any[]) => Promise<any[]>): Promise<any[][]> {
  const data = transform ? await transform(results) : results;
  const columns = Object.keys(data[0] ?? []);
  return [columns, ...data.map((item) => Object.values(item))];
}

async function getAllResults(route: string, selectedFilters: { [key: string]: Filter }, searchType: string, fieldsToExport: string | string[]): Promise<any[]> {
  if (searchType === "_msearch") {
    throw new Error("Not implemented");
    // TODO ......
  } else {
    const { data } = await api.post(route, {
      filters: Object.entries(selectedFilters).reduce((e, [key, value]) => {
        return { ...e, [key]: value.filter };
      }, {}),
      exportFields: fieldsToExport,
    });
    if (!data?.length) return [];
    return data;
  }
}

async function exportData(fileName: string, csv: any[][]): Promise<void> {
  const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
  const ws = XLSX.utils.aoa_to_sheet(csv);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const resultData = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(resultData, fileName + fileExtension);
}
